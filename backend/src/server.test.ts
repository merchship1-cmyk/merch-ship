import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from './server.js';

describe('Zenzy backend runtime', () => {
  it('exposes a public liveness endpoint', async () => {
    const response = await request(createApp()).get('/api/healthz');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok', service: 'zenzy-backend-runtime' });
  });

  it('publishes the governed app module map', async () => {
    const response = await request(createApp()).get('/api/zenzy/modules');
    expect(response.status).toBe(200);
    expect(response.body.modules).toHaveLength(7);
    expect(response.body.modules.map((item: { module: string }) => item.module)).toEqual([
      'Home', 'Flows', 'Tasks', 'Content', 'Sync', 'Users', 'Settings',
    ]);
  });

  it('reports missing runtime configuration without exposing values', async () => {
    const response = await request(createApp()).get('/api/zenzy/health');
    expect(response.status).toBe(503);
    expect(response.body.status).toBe('blocked');
    expect(response.body.missingConfiguration).toContain('SUPABASE_URL');
  });
});
