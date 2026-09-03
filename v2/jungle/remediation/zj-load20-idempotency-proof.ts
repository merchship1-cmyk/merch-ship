import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { login } from '../../phase1a/orchestrator/api';
import {
  SUPABASE_PUBLISHABLE_KEY,
  SUPABASE_URL,
  TEST_USER_A_EMAIL,
  TEST_USER_A_PASSWORD,
} from '../../phase1a/orchestrator/config';
import { transformationResultSchema } from '../../src/domain/transformation';

const TEST = 'ZJ-LOAD20-IDEMPOTENCY-REMEDIATION-PROOF';
const EXPECTED_PROJECT_REF = 'dlliijieyppljpxbweib';
const REMEDIATION_BRANCH_BASE = 'eaa2d65550eed1f4f95b52c151c2c0610ce35241';
const ORIGINAL_JUNGLE_RUN = 33766534615;
const ORIGINAL_JUNGLE_ARTIFACT = 9897832855;
const MAX_PROVIDER_GENERATING_IDENTITIES = 2;

assert.equal(
  new URL(SUPABASE_URL).hostname,
  `${EXPECTED_PROJECT_REF}.supabase.co`,
  'Refusing to run outside dedicated ZENZY staging.',
);

type RawResult = {
  status: number;
  payload: unknown;
  elapsedMs: number;
};

async function postTransform(token: string, input: string, requestId: string): Promise<RawResult> {
  const started = performance.now();
  const response = await fetch(`${SUPABASE_URL}/functions/v1/transform`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      apikey: SUPABASE_PUBLISHABLE_KEY,
    },
    body: JSON.stringify({ input, requestId }),
  });
  return {
    status: response.status,
    payload: await response.json().catch(() => null),
    elapsedMs: Math.round(performance.now() - started),
  };
}

async function countRunsForRequest(
  client: Awaited<ReturnType<typeof login>>['client'],
  requestId: string,
) {
  const { count, error } = await client
    .from('zenzy_transformation_runs')
    .select('id', { count: 'exact', head: true })
    .eq('request_id', requestId);
  if (error) throw new Error(`run count failed: ${error.message}`);
  return count ?? 0;
}

async function main() {
  const startedAt = new Date().toISOString();
  const userA = await login(TEST_USER_A_EMAIL, TEST_USER_A_PASSWORD);

  // Case 1: simulate an ambiguous/lost first response. The second call must recover
  // the exact canonical result with no second run.
  const recoveryRequestId = randomUUID();
  const recoveryInput =
    'JUNGLE remediation proof: create a bounded internal three-step recovery plan for a synthetic weekly review.';

  const first = await postTransform(userA.accessToken, recoveryInput, recoveryRequestId);
  assert.equal(first.status, 200, 'Initial fixed-id transform must succeed.');
  const firstResult = transformationResultSchema.parse(first.payload);

  // Treat the first response as if the caller did not retain it, then recover by identity.
  const recovered = await postTransform(userA.accessToken, recoveryInput, recoveryRequestId);
  assert.equal(recovered.status, 200, 'Same-id recovery must return a canonical success.');
  const recoveredResult = transformationResultSchema.parse(recovered.payload);
  assert.equal(recoveredResult.id, firstResult.id, 'Recovery must return the original run id.');
  const recoveryCount = await countRunsForRequest(userA.client, recoveryRequestId);
  assert.equal(recoveryCount, 1, 'Same request identity must persist exactly one run.');

  const mismatched = await postTransform(
    userA.accessToken,
    `${recoveryInput} changed`,
    recoveryRequestId,
  );
  assert.equal(mismatched.status, 409, 'Same requestId with different input must fail closed.');
  const mismatchPayload = mismatched.payload as Record<string, unknown> | null;
  assert.equal(mismatchPayload?.code, 'IDEMPOTENCY_INPUT_MISMATCH');
  assert.equal(await countRunsForRequest(userA.client, recoveryRequestId), 1);

  // Case 2: two callers start the exact same request concurrently. One may receive
  // REQUEST_IN_PROGRESS while the other owns the lease, or both may receive the
  // same canonical result if the first finishes before the second resolves.
  const concurrentRequestId = randomUUID();
  const concurrentInput =
    'JUNGLE remediation single-flight proof: create a bounded internal checklist for a synthetic planning review.';
  const concurrent = await Promise.all([
    postTransform(userA.accessToken, concurrentInput, concurrentRequestId),
    postTransform(userA.accessToken, concurrentInput, concurrentRequestId),
  ]);

  const successes = concurrent.filter((row) => row.status === 200);
  const inProgress = concurrent.filter((row) => {
    if (row.status !== 409 || typeof row.payload !== 'object' || row.payload === null) return false;
    return (row.payload as Record<string, unknown>).code === 'REQUEST_IN_PROGRESS' ||
      (row.payload as Record<string, unknown>).code === 'REQUEST_STATE_CHANGED';
  });
  assert.ok(successes.length >= 1, 'Concurrent same-id proof must produce a canonical success.');
  assert.equal(successes.length + inProgress.length, 2, 'No unexpected concurrent outcome is allowed.');

  const canonicalAfterConcurrency = await postTransform(
    userA.accessToken,
    concurrentInput,
    concurrentRequestId,
  );
  assert.equal(canonicalAfterConcurrency.status, 200);
  const canonicalConcurrentResult = transformationResultSchema.parse(
    canonicalAfterConcurrency.payload,
  );
  if (successes.length > 0) {
    const firstConcurrentSuccess = transformationResultSchema.parse(successes[0].payload);
    assert.equal(canonicalConcurrentResult.id, firstConcurrentSuccess.id);
  }
  const concurrentCount = await countRunsForRequest(userA.client, concurrentRequestId);
  assert.equal(concurrentCount, 1, 'Concurrent same-id requests must persist exactly one run.');

  const report = {
    test: TEST,
    status: 'PASS',
    environment: 'NON_PRODUCTION_STAGING',
    projectRef: EXPECTED_PROJECT_REF,
    remediationBase: REMEDIATION_BRANCH_BASE,
    originalJungleEvidence: {
      runId: ORIGINAL_JUNGLE_RUN,
      artifactId: ORIGINAL_JUNGLE_ARTIFACT,
      fullLoadRerun: false,
      zjt005Through008Rerun: false,
    },
    providerGeneratingIdentityCeiling: MAX_PROVIDER_GENERATING_IDENTITIES,
    providerGeneratingIdentitiesUsed: 2,
    cases: {
      ambiguousResponseRecovery: {
        requestId: recoveryRequestId,
        firstStatus: first.status,
        recoveredStatus: recovered.status,
        sameCanonicalRun: recoveredResult.id === firstResult.id,
        canonicalRunId: firstResult.id,
        persistedRunCount: recoveryCount,
      },
      inputMismatch: {
        requestId: recoveryRequestId,
        status: mismatched.status,
        code: mismatchPayload?.code ?? null,
        persistedRunCountAfterMismatch: await countRunsForRequest(userA.client, recoveryRequestId),
      },
      concurrentSingleFlight: {
        requestId: concurrentRequestId,
        observedStatuses: concurrent.map((row) => row.status),
        successfulResponses: successes.length,
        activeLeaseResponses: inProgress.length,
        canonicalRecoveryStatus: canonicalAfterConcurrency.status,
        canonicalRunId: canonicalConcurrentResult.id,
        persistedRunCount: concurrentCount,
      },
    },
    customerProductionDataTouched: false,
    productionAuthorityChanged: false,
    mergePerformed: false,
    directFinancialCostMeasured: false,
    directFinancialCostNote:
      'Exactly two unique provider-generating request identities were allowed; provider token/cost telemetry is not exposed by the current transform response.',
    startedAt,
    completedAt: new Date().toISOString(),
  };

  const artifactDir = resolve(process.cwd(), 'jungle/artifacts/remediation');
  await mkdir(artifactDir, { recursive: true });
  await writeFile(
    resolve(artifactDir, 'zj-load20-idempotency-proof.json'),
    `${JSON.stringify(report, null, 2)}\n`,
    'utf8',
  );
  console.log(JSON.stringify(report, null, 2));
}

void main().catch(async (error: unknown) => {
  const artifactDir = resolve(process.cwd(), 'jungle/artifacts/remediation');
  await mkdir(artifactDir, { recursive: true }).catch(() => undefined);
  const report = {
    test: TEST,
    status: 'FAIL',
    environment: 'NON_PRODUCTION_STAGING',
    projectRef: EXPECTED_PROJECT_REF,
    fullLoadRerun: false,
    zjt005Through008Rerun: false,
    error: error instanceof Error ? error.message : String(error),
    recordedAt: new Date().toISOString(),
  };
  await writeFile(
    resolve(artifactDir, 'zj-load20-idempotency-proof.json'),
    `${JSON.stringify(report, null, 2)}\n`,
    'utf8',
  ).catch(() => undefined);
  console.error(JSON.stringify(report, null, 2));
  process.exitCode = 1;
});
