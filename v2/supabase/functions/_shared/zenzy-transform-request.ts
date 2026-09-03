export const MAX_TRANSFORM_PROVIDER_ATTEMPTS = 2;
export const TRANSFORM_REQUEST_LEASE_MS = 120_000;

export type TransformRequestState =
  | 'processing'
  | 'retryable_failure'
  | 'completed'
  | 'exhausted';

export type TransformRequestLedgerRow = {
  request_id: string;
  user_id: string;
  input_hash: string;
  state: TransformRequestState;
  attempt_count: number;
  lease_expires_at: string;
  run_id: string | null;
  last_error_code: string | null;
};

export type TransformRequestDecision =
  | 'RETURN_COMPLETED'
  | 'WAIT_FOR_ACTIVE_LEASE'
  | 'RECLAIM_FOR_RETRY'
  | 'RETRY_EXHAUSTED';

export const nextTransformLeaseIso = (nowMs = Date.now()) =>
  new Date(nowMs + TRANSFORM_REQUEST_LEASE_MS).toISOString();

export function classifyTransformRequest(
  row: TransformRequestLedgerRow,
  nowMs = Date.now(),
): TransformRequestDecision {
  if (row.state === 'completed') return 'RETURN_COMPLETED';
  if (row.state === 'exhausted') return 'RETRY_EXHAUSTED';

  if (row.attempt_count >= MAX_TRANSFORM_PROVIDER_ATTEMPTS) {
    return row.state === 'processing' && Date.parse(row.lease_expires_at) > nowMs
      ? 'WAIT_FOR_ACTIVE_LEASE'
      : 'RETRY_EXHAUSTED';
  }

  if (row.state === 'processing' && Date.parse(row.lease_expires_at) > nowMs) {
    return 'WAIT_FOR_ACTIVE_LEASE';
  }

  return 'RECLAIM_FOR_RETRY';
}
