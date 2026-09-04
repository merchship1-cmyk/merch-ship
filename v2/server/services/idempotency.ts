import type { IdempotencyKeyRow, JsonObject } from '../domain/contracts';

export type ClaimInput = {
  workspaceId: string;
  operationId: string;
  idempotencyKey: string;
  scope: string;
  requestHash: string;
};

export interface IdempotencyRepository {
  findByOperation(workspaceId: string, operationId: string): Promise<IdempotencyKeyRow | null>;
  findByKey(workspaceId: string, idempotencyKey: string): Promise<IdempotencyKeyRow | null>;
  insert(input: ClaimInput): Promise<IdempotencyKeyRow>;
  complete(id: string, response: JsonObject): Promise<IdempotencyKeyRow>;
  fail(id: string, response: JsonObject): Promise<IdempotencyKeyRow>;
}

export type ClaimResult =
  | { kind: 'claimed'; record: IdempotencyKeyRow }
  | { kind: 'duplicate'; record: IdempotencyKeyRow }
  | { kind: 'conflict'; record: IdempotencyKeyRow; reason: string };

export async function claimOperation(
  repository: IdempotencyRepository,
  input: ClaimInput,
): Promise<ClaimResult> {
  const existingOperation = await repository.findByOperation(
    input.workspaceId,
    input.operationId,
  );

  if (existingOperation) {
    if (
      existingOperation.idempotency_key !== input.idempotencyKey ||
      existingOperation.request_hash !== input.requestHash
    ) {
      return {
        kind: 'conflict',
        record: existingOperation,
        reason: 'The governed operation identity was reused with different request semantics.',
      };
    }

    return { kind: 'duplicate', record: existingOperation };
  }

  const existingKey = await repository.findByKey(
    input.workspaceId,
    input.idempotencyKey,
  );

  if (existingKey) {
    return {
      kind: 'conflict',
      record: existingKey,
      reason: 'The idempotency key already belongs to another governed operation.',
    };
  }

  return { kind: 'claimed', record: await repository.insert(input) };
}
