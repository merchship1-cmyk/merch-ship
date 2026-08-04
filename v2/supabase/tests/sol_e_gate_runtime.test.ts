import { createHmac } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  verifyLinearRequest,
  verifySlackRequest,
} from '../functions/_shared/sol/crypto';
import { routeLane } from '../functions/_shared/sol/routing';

const migration = readFileSync(
  resolve('supabase/migrations/20260802222000_sol_e_gate_runtime.sql'),
  'utf8',
);
const slackFunction = readFileSync(
  resolve('supabase/functions/sol-slack/index.ts'),
  'utf8',
);
const linearFunction = readFileSync(
  resolve('supabase/functions/sol-linear/index.ts'),
  'utf8',
);

describe('SOL webhook signature verification', () => {
  it('accepts a fresh valid Slack signature and rejects a stale request', async () => {
    const nowMs = 1_800_000_000_000;
    const timestamp = String(Math.floor(nowMs / 1000));
    const rawBody = JSON.stringify({ type: 'event_callback' });
    const digest = createHmac('sha256', 'slack-secret')
      .update(`v0:${timestamp}:${rawBody}`)
      .digest('hex');

    await expect(
      verifySlackRequest({
        rawBody,
        timestamp,
        signature: `v0=${digest}`,
        signingSecret: 'slack-secret',
        nowMs,
      }),
    ).resolves.toBe(true);

    await expect(
      verifySlackRequest({
        rawBody,
        timestamp,
        signature: `v0=${digest}`,
        signingSecret: 'slack-secret',
        nowMs: nowMs + 5 * 60_000 + 1,
      }),
    ).resolves.toBe(false);
  });

  it('accepts a fresh valid Linear signature and rejects replay age', async () => {
    const nowMs = 1_800_000_000_000;
    const rawBody = JSON.stringify({ webhookTimestamp: nowMs });
    const signature = createHmac('sha256', 'linear-secret')
      .update(rawBody)
      .digest('hex');

    await expect(
      verifyLinearRequest({
        rawBody,
        signature,
        webhookTimestamp: nowMs,
        signingSecret: 'linear-secret',
        nowMs,
      }),
    ).resolves.toBe(true);

    await expect(
      verifyLinearRequest({
        rawBody,
        signature,
        webhookTimestamp: nowMs,
        signingSecret: 'linear-secret',
        nowMs: nowMs + 60_001,
      }),
    ).resolves.toBe(false);
  });
});

describe('SOL deterministic routing', () => {
  it('routes release automation work to a deterministic matched lane', () => {
    const result = routeLane('Fix the release automation regression');
    expect([2, 7, 8]).toContain(result.lane);
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.matchedRules.length).toBeGreaterThan(0);
  });

  it('falls back to lane zero when no rule matches', () => {
    expect(routeLane('hello there').lane).toBe(0);
  });
});

describe('SOL E-Gate persistence and mutation contract', () => {
  it('uses atomic claims, finalized evidence, checkpoints, and a return outbox', () => {
    expect(migration).toContain('create table if not exists public.sol_event_claims');
    expect(migration).toContain('create table if not exists public.sol_delivery_outbox');
    expect(migration).toContain('create or replace function public.sol_claim_event');
    expect(migration).toContain('create or replace function public.sol_finalize_event');
    expect(migration).toContain('primary key (source_system, source_event_id, result_hash)');
  });

  it('keeps runtime state server-only', () => {
    expect(migration).toContain('enable row level security');
    expect(migration).toContain('revoke all on table public.sol_idempotency from anon, authenticated');
    expect(migration).toContain('to service_role');
  });

  it('acks Slack through background execution and enforces the kill switch', () => {
    expect(slackFunction).toContain('EdgeRuntime.waitUntil(');
    expect(slackFunction).toContain("Deno.env.get('SOL_MUTATIONS_ENABLED') === 'true'");
    expect(slackFunction).toContain('payload.event_id?.trim()');
    expect(slackFunction).toContain('slack-issue-reference:${sourceEventId}');
  });

  it('uses Linear delivery identity, timestamp validation, and one status return leg', () => {
    expect(linearFunction).toContain("request.headers.get('linear-delivery')");
    expect(linearFunction).toContain('verifyLinearRequest');
    expect(linearFunction).toContain("hasOwnProperty.call(payload.updatedFrom, 'stateId')");
    expect(linearFunction).toContain('recordSyncCheckpoint');
  });
});
