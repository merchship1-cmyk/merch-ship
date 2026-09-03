import {
  transformationResultSchema,
  type TransformationResult,
} from '../domain/transformation';

type RemoteTransformationOptions = {
  endpoint: string;
  publishableKey: string;
  accessToken: string;
  fetcher?: typeof fetch;
  requestId?: string;
  wait?: (milliseconds: number) => Promise<void>;
};

type ErrorPayload = {
  code?: string;
  retryAfterMs?: number;
  retryable?: boolean;
};

const MAX_NETWORK_REQUESTS = 4;
const DEFAULT_RETRY_DELAY_MS = 500;
const MAX_RETRY_DELAY_MS = 2_000;

const defaultWait = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

export const createTransformationRequestId = () => {
  const cryptoLike = (globalThis as {
    crypto?: { randomUUID?: () => string };
  }).crypto;
  if (cryptoLike?.randomUUID) return cryptoLike.randomUUID();

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character) => {
    const random = Math.floor(Math.random() * 16);
    const value = character === 'x' ? random : (random % 4) + 8;
    return value.toString(16);
  });
};

const asErrorPayload = (payload: unknown): ErrorPayload =>
  typeof payload === 'object' && payload !== null && !Array.isArray(payload)
    ? payload as ErrorPayload
    : {};

const retryDelay = (payload: ErrorPayload) =>
  Math.min(
    MAX_RETRY_DELAY_MS,
    Math.max(0, payload.retryAfterMs ?? DEFAULT_RETRY_DELAY_MS),
  );

const isRetryableResponse = (status: number, payload: ErrorPayload) => {
  if (payload.retryable === false) return false;
  if (payload.code === 'IDEMPOTENCY_INPUT_MISMATCH') return false;
  if (payload.code === 'REQUEST_RETRY_EXHAUSTED') return false;
  if (
    payload.code === 'REQUEST_IN_PROGRESS' ||
    payload.code === 'REQUEST_STATE_CHANGED'
  ) {
    return true;
  }
  if (payload.retryable === true) return true;
  return status === 502 || status === 503 || status === 504;
};

export async function executeRemoteTransformation(
  input: string,
  {
    endpoint,
    publishableKey,
    accessToken,
    fetcher = fetch,
    requestId = createTransformationRequestId(),
    wait = defaultWait,
  }: RemoteTransformationOptions,
): Promise<TransformationResult> {
  for (let requestNumber = 1; requestNumber <= MAX_NETWORK_REQUESTS; requestNumber += 1) {
    const response = await fetcher(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        apikey: publishableKey,
      },
      body: JSON.stringify({ input, requestId }),
    });

    const raw = await response.text();
    let payload: unknown = null;
    if (raw) {
      try {
        payload = JSON.parse(raw);
      } catch {
        payload = null;
      }
    }

    if (response.ok) {
      return transformationResultSchema.parse(payload);
    }

    if (response.status === 401) {
      throw new Error('Your session expired. Sign in and try again.');
    }

    const errorPayload = asErrorPayload(payload);
    if (
      requestNumber < MAX_NETWORK_REQUESTS &&
      isRetryableResponse(response.status, errorPayload)
    ) {
      await wait(retryDelay(errorPayload));
      continue;
    }

    if (errorPayload.code === 'REQUEST_RETRY_EXHAUSTED') {
      throw new Error('Zenzy could not complete this transformation after its bounded retry limit.');
    }

    throw new Error('Zenzy transformation service is currently unavailable.');
  }

  throw new Error('Zenzy transformation service is currently unavailable.');
}
