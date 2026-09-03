import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  classifyTransformRequest,
  MAX_TRANSFORM_PROVIDER_ATTEMPTS,
  TRANSFORM_REQUEST_LEASE_MS,
  type TransformRequestLedgerRow,
} from '../functions/_shared/zenzy-transform-request';

const BASE_ROW: TransformRequestLedgerRow = {
  request_id: '123e4567-e89b-42d3-a456-426614174000',
  user_id: '123e4567-e89b-42d3-a456-426614174001',
  input_hash: 'a'.repeat(64),
  state: 'processing',
  attempt_count: 1,
  lease_expires_at: '2026-09-03T14:42:00.000Z',
  run_id: null,
  last_error_code: null,
};

const NOW = Date.parse('2026-09-03T14:41:00.000Z');

describe('ZENZY transform idempotency contract', () => {
  it('keeps an active processing lease single-flight', () => {
    expect(classifyTransformRequest(BASE_ROW, NOW)).toBe('WAIT_FOR_ACTIVE_LEASE');
  });

  it('reclaims one expired processing lease within the bounded retry budget', () => {
    expect(classifyTransformRequest({
      ...BASE_ROW,
      lease_expires_at: '2026-09-03T14:40:59.000Z',
    }, NOW)).toBe('RECLAIM_FOR_RETRY');
  });

  it('allows one retry after a retryable provider failure', () => {
    expect(classifyTransformRequest({
      ...BASE_ROW,
      state: 'retryable_failure',
      lease_expires_at: '2026-09-03T14:40:00.000Z',
    }, NOW)).toBe('RECLAIM_FOR_RETRY');
  });

  it('stops once the two-provider-attempt budget is exhausted', () => {
    expect(MAX_TRANSFORM_PROVIDER_ATTEMPTS).toBe(2);
    expect(classifyTransformRequest({
      ...BASE_ROW,
      state: 'retryable_failure',
      attempt_count: 2,
      lease_expires_at: '2026-09-03T14:40:00.000Z',
    }, NOW)).toBe('RETRY_EXHAUSTED');
  });

  it('returns a completed canonical request without another provider attempt', () => {
    expect(classifyTransformRequest({
      ...BASE_ROW,
      state: 'completed',
      run_id: '123e4567-e89b-42d3-a456-426614174002',
    }, NOW)).toBe('RETURN_COMPLETED');
  });

  it('keeps the processing lease bounded', () => {
    expect(TRANSFORM_REQUEST_LEASE_MS).toBe(120_000);
  });

  it('installs owner-scoped request uniqueness and a server-only request ledger', async () => {
    const migration = await readFile(
      resolve(
        process.cwd(),
        'supabase/migrations/20260903143912_zenzy_transform_idempotency_v1.sql',
      ),
      'utf8',
    );
    const foreignKeyFix = await readFile(
      resolve(
        process.cwd(),
        'supabase/migrations/20260903144033_zenzy_transform_idempotency_fk_fix_v1.sql',
      ),
      'utf8',
    );

    expect(migration).toContain('zenzy_transformation_runs_user_request_uidx');
    expect(migration).toContain('(user_id, request_id)');
    expect(migration).toContain('zenzy_transformation_requests');
    expect(migration).toContain("check (attempt_count between 1 and 2)");
    expect(migration).toContain('enable row level security');
    expect(migration).toContain(
      'revoke all on public.zenzy_transformation_requests from anon, authenticated',
    );
    expect(foreignKeyFix).toContain('on delete cascade');
  });

  it('requires same-input binding and canonical recovery in the transform function', async () => {
    const source = await readFile(
      resolve(process.cwd(), 'supabase/functions/transform/index.ts'),
      'utf8',
    );

    expect(source).toContain('IDEMPOTENCY_INPUT_MISMATCH');
    expect(source).toContain('REQUEST_IN_PROGRESS');
    expect(source).toContain('REQUEST_RETRY_EXHAUSTED');
    expect(source).toContain('readCanonicalByRequest');
    expect(source).toContain('request_id: requestId');
  });
});
