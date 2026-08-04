const encoder = new TextEncoder();

const toHex = (bytes: Uint8Array) =>
  Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');

export function constantTimeEqual(left: string, right: string): boolean {
  const leftBytes = encoder.encode(left);
  const rightBytes = encoder.encode(right);
  if (leftBytes.length !== rightBytes.length) return false;

  let difference = 0;
  for (let index = 0; index < leftBytes.length; index += 1) {
    difference |= leftBytes[index] ^ rightBytes[index];
  }
  return difference === 0;
}

export async function hmacSha256Hex(
  secret: string,
  value: string,
): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(value));
  return toHex(new Uint8Array(signature));
}

export async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(value));
  return toHex(new Uint8Array(digest));
}

export async function verifySlackRequest(args: {
  rawBody: string;
  timestamp: string | null;
  signature: string | null;
  signingSecret: string;
  nowMs?: number;
}): Promise<boolean> {
  const { rawBody, timestamp, signature, signingSecret } = args;
  if (!timestamp || !signature || !/^\d+$/.test(timestamp)) return false;

  const nowMs = args.nowMs ?? Date.now();
  const requestMs = Number(timestamp) * 1000;
  if (!Number.isFinite(requestMs) || Math.abs(nowMs - requestMs) > 5 * 60_000) {
    return false;
  }

  const digest = await hmacSha256Hex(
    signingSecret,
    `v0:${timestamp}:${rawBody}`,
  );
  return constantTimeEqual(`v0=${digest}`, signature);
}

export async function verifyLinearRequest(args: {
  rawBody: string;
  signature: string | null;
  webhookTimestamp: unknown;
  signingSecret: string;
  nowMs?: number;
}): Promise<boolean> {
  const { rawBody, signature, webhookTimestamp, signingSecret } = args;
  if (!signature || typeof webhookTimestamp !== 'number') return false;

  const nowMs = args.nowMs ?? Date.now();
  if (Math.abs(nowMs - webhookTimestamp) > 60_000) return false;

  const digest = await hmacSha256Hex(signingSecret, rawBody);
  return constantTimeEqual(digest, signature.toLowerCase());
}
