import { describe, expect, it } from 'vitest';

import type { IdempotencyKeyRow, JsonObject } from '../domain/contracts';
import {
  claimOperation,
  type ClaimInput,
  type IdempotencyRepository,
} from '../services/idempotency';
import {
  assertSyncStatusTransition,
  canTransitionSyncStatus,
  nextRetryAttempt,
} from '../sync/lifecycle';
import { domainEventSchema } from '../validators/contracts';

class MemoryIdempotencyRepository implements IdempotencyRepository {
  private readonly records: IdempotencyKeyRow[] = [];

  async findByOperation(workspaceId: string, operationId: string) {
    return (
      this.records.find(
        (record) =>
          record.workspace_id === workspaceId &&
          record.operation_id === operationId,
      ) ?? null
    );
  }

  async findByKey(workspaceId: string, idempotencyKey: string) {
    return (
      this.records.find(
        (record) =>
          record.workspace_id === workspaceId &&
          record.idempotency_key === idempotencyKey,
      ) ?? null
    );
  }

  async insert(input: ClaimInput) {
    const record: IdempotencyKeyRow = {
      id: crypto.randomUUID(),
      workspace_id: input.workspaceId,
      operation_id: input.operationId,
      idempotency_key: input.idempotencyKey,
      scope: input.scope,
      request_hash: input.requestHash,
      status: 'claimed',
      response: null,
      claimed_at: new Date().toISOString(),
      completed_at: null,
      expires_at: null,
    };
    this.records.push(record);
    return record;
  }

  async complete(id: string, response: JsonObject) {
    return this.update(id, 'completed', response);
  }

  async fail(id: string, response: JsonObject) {
    return this.update(id, 'failed', response);
  }

  private update(
    id: string,
    status: IdempotencyKeyRow['status'],
    response: JsonObject,
  ) {
    const record = this.records.find((candidate) => candidate.id === id);
    if (!record) throw new Error('Record not found.');
    record.status = status;
    record.response = response;
    record.completed_at = new Date().toISOString();
    return Promise.resolve(record);
  }
}

const claim: ClaimInput = {
  workspaceId: '11111111-1111-4111-8111-111111111111',
  operationId: 'operation-1',
  idempotencyKey: 'workspace:operation-1',
  scope: 'sync:notion',
  requestHash: 'hash-1',
};

describe('Sync Machine idempotency', () => {
  it('claims an operation once and classifies an identical replay as duplicate', async () => {
    const repository = new MemoryIdempotencyRepository();
    expect((await claimOperation(repository, claim)).kind).toBe('claimed');
    expect((await claimOperation(repository, claim)).kind).toBe('duplicate');
  });

  it('rejects operation identity reuse with changed semantics', async () => {
    const repository = new MemoryIdempotencyRepository();
    await claimOperation(repository, claim);
    const result = await claimOperation(repository, {
      ...claim,
      requestHash: 'different-hash',
    });
    expect(result.kind).toBe('conflict');
  });
});

describe('Sync job lifecycle', () => {
  it('allows governed retry without changing the operation identity', () => {
    expect(canTransitionSyncStatus('failed', 'queued')).toBe(true);
    expect(nextRetryAttempt(1)).toBe(2);
  });

  it('blocks terminal-state mutation', () => {
    expect(() => assertSyncStatusTransition('succeeded', 'running')).toThrow(
      'Invalid sync status transition',
    );
  });
});

describe('Domain event envelope', () => {
  it('validates a governed append-only event envelope', () => {
    const parsed = domainEventSchema.safeParse({
      event_id: 'event-1',
      operation_id: 'operation-1',
      idempotency_key: 'workspace:operation-1',
      correlation_id: 'correlation-1',
      workspace_id: '11111111-1111-4111-8111-111111111111',
      aggregate_type: 'workflow',
      aggregate_id: 'workflow-1',
      event_type: 'sync.queued',
      event_class: 'new',
      schema_version: 1,
      actor_ref: 'sync-machine',
      source_system: 'database',
      change_payload: {},
      record_hash: 'hash',
      is_compensating_entry: false,
      privacy_class: 'internal',
      payload: { target: 'notion' },
      occurred_at: '2026-07-23T00:00:00.000Z',
    });
    expect(parsed.success).toBe(true);
  });

  it('requires a compensation target for compensating events', () => {
    const parsed = domainEventSchema.safeParse({
      event_id: 'event-2',
      operation_id: 'operation-2',
      idempotency_key: 'workspace:operation-2',
      correlation_id: 'correlation-2',
      workspace_id: '11111111-1111-4111-8111-111111111111',
      aggregate_type: 'workflow',
      aggregate_id: 'workflow-2',
      event_type: 'sync.compensated',
      event_class: 'compensating',
      schema_version: 1,
      actor_ref: 'sync-machine',
      source_system: 'database',
      change_payload: {},
      record_hash: 'hash',
      is_compensating_entry: true,
      privacy_class: 'internal',
      payload: {},
      occurred_at: '2026-07-23T00:00:00.000Z',
    });
    expect(parsed.success).toBe(false);
  });
});
