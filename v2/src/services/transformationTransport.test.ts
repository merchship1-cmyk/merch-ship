import { describe, expect, it } from 'vitest';

import { createMockTransformation } from './mockTransformation';
import { executeRemoteTransformation } from './transformationTransport';

describe('executeRemoteTransformation', () => {
  it('sends the Supabase access token and publishable key', async () => {
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
        fetcher,
      }),
    ).resolves.toEqual(result);

    expect(requests).toHaveLength(1);
    expect(requests[0].headers).toMatchObject({
      Authorization: 'Bearer verified-user-token',
      apikey: 'sb_publishable_test',
    });
    expect(requests[0].body).toBe(
      JSON.stringify({ input: 'Protect this transformation.' }),
    );
  });

  it('turns an unauthorized response into a session-safe error', async () => {
    const fetcher: typeof fetch = async () =>
      new Response(null, { status: 401 });

    await expect(
      executeRemoteTransformation('Protect this transformation.', {
        endpoint: 'https://example.supabase.co/functions/v1/transform',
        publishableKey: 'sb_publishable_test',
        accessToken: 'expired-token',
        fetcher,
      }),
    ).rejects.toThrow('Your session expired');
  });
});
