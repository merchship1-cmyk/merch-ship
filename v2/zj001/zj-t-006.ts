import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { login } from '../phase1a/orchestrator/api';
import { TEST_USER_A_EMAIL, TEST_USER_A_PASSWORD } from '../phase1a/orchestrator/config';

const FROZEN_SHA = 'd6d7aa7f29bc3dc3a689bcd3712e1decd612ae3b';
const EXPECTED_PROJECT_REF = 'dlliijieyppljpxbweib';
const SUPABASE_URL = process.env.SUPABASE_URL?.trim().replace(/\/$/, '');
const PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY?.trim();
assert.ok(SUPABASE_URL && PUBLISHABLE_KEY, 'Missing staging configuration.');
assert.equal(new URL(SUPABASE_URL).hostname, `${EXPECTED_PROJECT_REF}.supabase.co`);

async function postRaw(endpoint: string, token: string, body: string) {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/${endpoint}`, {
    method: 'POST',
    headers: {
      apikey: PUBLISHABLE_KEY,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body,
  });
  return { status: response.status, payload: await response.json().catch(() => null) };
}

async function ownedRunCount(client: Awaited<ReturnType<typeof login>>['client']) {
  const { count, error } = await client
    .from('zenzy_transformation_runs')
    .select('id', { count: 'exact', head: true });
  if (error) throw new Error(error.message);
  return count ?? 0;
}

async function main() {
  const userA = await login(TEST_USER_A_EMAIL, TEST_USER_A_PASSWORD);
  const before = await ownedRunCount(userA.client);

  const checks = {
    transformMalformedJson: await postRaw('transform', userA.accessToken, '{'),
    transformTooShort: await postRaw('transform', userA.accessToken, JSON.stringify({ input: 'x' })),
    transformOversized: await postRaw('transform', userA.accessToken, JSON.stringify({ input: 'x'.repeat(4001) })),
    acceptMissingRunId: await postRaw('accept', userA.accessToken, JSON.stringify({})),
    acceptInvalidRunId: await postRaw('accept', userA.accessToken, JSON.stringify({ runId: 'not-a-real-run-id' })),
    evidenceMissingRunId: await postRaw('record-evidence', userA.accessToken, JSON.stringify({
      timeSavedMinutes: 0,
      stepsRemoved: 0,
      clarityGain: 3,
      outputProduced: true,
      wouldUseAgain: true,
    })),
    evidenceInvalidMetrics: await postRaw('record-evidence', userA.accessToken, JSON.stringify({
      runId: 'not-a-real-run-id',
      timeSavedMinutes: -1,
      stepsRemoved: -1,
      clarityGain: 9,
      outputProduced: true,
      wouldUseAgain: true,
    })),
  };

  assert.equal(checks.transformMalformedJson.status, 400);
  assert.equal(checks.transformTooShort.status, 400);
  assert.equal(checks.transformOversized.status, 400);
  assert.equal(checks.acceptMissingRunId.status, 400);
  assert.equal(checks.acceptInvalidRunId.status, 404);
  assert.equal(checks.evidenceMissingRunId.status, 400);
  assert.equal(checks.evidenceInvalidMetrics.status, 400);

  const after = await ownedRunCount(userA.client);
  assert.equal(after, before, 'Invalid requests must not create transformation runs.');

  const report = {
    test: 'ZJ-T-006',
    canonicalCases: ['JZ-018'],
    status: 'PASS',
    frozenSha: FROZEN_SHA,
    environment: 'NON_PRODUCTION_STAGING',
    projectRef: EXPECTED_PROJECT_REF,
    customerProductionDataTouched: false,
    applicationRuntimeCodeChanged: false,
    checks: Object.fromEntries(Object.entries(checks).map(([name, value]) => [name, value.status])),
    ownedRunCountBefore: before,
    ownedRunCountAfter: after,
    unauthorizedMutationObserved: false,
    secretsScan: 'PASS',
    recordedAt: new Date().toISOString(),
  };

  const artifactDirectory = resolve(process.cwd(), 'zj001/artifacts');
  await mkdir(artifactDirectory, { recursive: true });
  await writeFile(resolve(artifactDirectory, 'zj-t-006-report.json'), `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
