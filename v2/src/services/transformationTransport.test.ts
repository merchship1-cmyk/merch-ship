import { describe, expect, it } from 'vitest';

import { createMockTransformation } from './mockTransformation';
import { executeRemoteTransformation } from './transformationTransport';

const REQUEST_ID = '123e4567-e89b-42d3-a456-426614174000';

describe('executeRemoteTransformation', () => {
  it('sends the Supabase access token, publishable key, and stable request id', async () => {
    const result = createMockTransformation(
      'Protect this transformation.',
      new Date('2026-08-01T12:00:00.000Z'),
    );
    const requests: RequestInit[] = [];
    const fetcher: typeof fetch = async (_input, request) => {
      requests.push(request ?? {});
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    };

    await expect(
      executeRemoteTransformation('Protect this transformation.', {
        endpoint: 'https://example.supabase.co/functions/v1/transform',
        publishableKey: 'sb_publishable_test',
        accessToken: 'verified-user-token',
        requestId: REQUEST_ID,
        fetcher,
      }),
    ).resolves.toEqual(result);

    expect(requests).toHaveLength(1);
    expect(requests[0].headers).toMatchObject({
      Authorization: 'Bearer verified-user-token',
      apikey: 'sb_publishable_test',
    });
    expect(requests[0].body).toBe(
      JSON.stringify({
        input: 'Protect this transformation.',
        requestId: REQUEST_ID,
      }),
    );
  });

  it('recovers an ambiguous 503 by retrying with the same request id', async () => {
    const result = createMockTransformation(
      'Recover this transformation.',
      new Date('2026-09-03T14:24:50.000Z'),
    );
    const requestBodies: string[] = [];
    let call = 0;
    const fetcher: typeof fetch = async (_input, request) => {
      requestBodies.push(String(request?.body ?? ''));
      call += 1;
      if (call === 1) {
        return new Response('Service unavailable', { status: 503 });
      }
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    };

    await expect(
      executeRemoteTransformation('Recover this transformation.', {
        endpoint: 'https://example.supabase.co/functions/v1/transform',
        publishableKey: 'sb_publishable_test',
        accessToken: 'verified-user-token',
        requestId: REQUEST_ID,
        fetcher,
        wait: async () => undefined,
      }),
    ).resolves.toEqual(result);

    expect(requestBodies).toHaveLength(2);
    expect(requestBodies[0]).toBe(requestBodies[1]);
    expect(JSON.parse(requestBodies[0])).toEqual({
      input: 'Recover this transformation.',
      requestId: REQUEST_ID,
    });
  });

  it('polls an active request lease without changing request identity', async () => {
    const result = createMockTransformation(
      'Resume this transformation.',
      new Date('2026-09-03T14:24:50.000Z'),
    );
    const requestBodies: string[] = [];
    let call = 0;
    const fetcher: typeof fetch = async (_input, request) => {
      requestBodies.push(String(request?.body ?? ''));
      call += 1;
      if (call === 1) {
        return new Response(JSON.stringify({
          code: 'REQUEST_IN_PROGRESS',
          retryAfterMs: 1,
        }), {
          status: 409,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    };

    await expect(
      executeRemoteTransformation('Resume this transformation.', {
        endpoint: 'https://example.supabase.co/functions/v1/transform',
        publishableKey: 'sb_publishable_test',
        accessToken: 'verified-user-token',
        requestId: REQUEST_ID,
        fetcher,
        wait: async () => undefined,
      }),
    ).resolves.toEqual(result);

    expect(requestBodies).toHaveLength(2);
    expect(requestBodies[0]).toBe(requestBodies[1]);
  });

  it('does not retry after the server marks the retry budget exhausted', async () => {
    let calls = 0;
    const fetcher: typeof fetch = async () => {
      calls += 1;
      return new Response(JSON.stringify({
        code: 'REQUEST_RETRY_EXHAUSTED',
        retryable: false,
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    };

    await expect(
      executeRemoteTransformation('Protect this transformation.', {
        endpoint: 'https://example.supabase.co/functions/v1/transform',
        publishableKey: 'sb_publishable_test',
        accessToken: 'verified-user-token',
        requestId: REQUEST_ID,
        fetcher,
        wait: async () => undefined,
      }),
    ).rejects.toThrow('bounded retry limit');

    expect(calls).toBe(1);
  });

  it('turns an unauthorized response into a session-safe error', async () => {
    const fetcher: typeof fetch = async () =>
      new Response(null, { status: 401 });

    await expect(
      executeRemoteTransformation('Protect this transformation.', {
        endpoint: 'https://example.supabase.co/functions/v1/transform',
        publishableKey: 'sb_publishable_test',
        accessToken: 'expired-token',
        requestId: REQUEST_ID,
        fetcher,
      }),
    ).rejects.toThrow('Your session expired');
  });
});
