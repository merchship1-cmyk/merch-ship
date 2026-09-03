import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { login } from '../phase1a/orchestrator/api';
import {
  SUPABASE_PUBLISHABLE_KEY,
  TEST_USER_B_EMAIL,
  TEST_USER_B_PASSWORD,
  endpoints,
} from '../phase1a/orchestrator/config';
import { transformationResultSchema } from '../src/domain/transformation';

const ORIGINAL_RUN_ID = 33766534615;
const ORIGINAL_ARTIFACT_ID = 9897832855;
const ORIGINAL_ARTIFACT_DIGEST = 'sha256:e524a00ac15bed043563d578632d93316e220abcec8d7ca73e3784af2afe35f4';
const SUBJECT_SHA = 'eaa2d65550eed1f4f95b52c151c2c0610ce35241';
const FAILED_STAGE = 20;
const FAILED_ORDINAL = 6;
const INPUT = `JUNGLE progressive load ${FAILED_STAGE}/${FAILED_ORDINAL}: create a bounded three-step internal planning brief for a synthetic weekly task review.`;
const TIMEOUT_MS = 120_000;

const sanitizeError = (payload: unknown) => {
  if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) return null;
  const value = (payload as Record<string, unknown>).error;
  return typeof value === 'string' ? value.slice(0, 240) : null;
};

async function main() {
  const userB = await login(TEST_USER_B_EMAIL, TEST_USER_B_PASSWORD);
  const started = performance.now();
  let status = 0;
  let responseBytes = 0;
  let payload: unknown = null;
  let transportError: string | null = null;

  try {
    const response = await fetch(endpoints.transform, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userB.accessToken}`,
        apikey: SUPABASE_PUBLISHABLE_KEY,
      },
      body: JSON.stringify({ input: INPUT }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    status = response.status;
    const text = await response.text();
    responseBytes = Buffer.byteLength(text, 'utf8');
    payload = text ? JSON.parse(text) : null;
  } catch (error) {
    transportError = error instanceof Error ? error.message : String(error);
  }

  const parsed = transformationResultSchema.safeParse(payload);
  const recovered = status === 200 && parsed.success;
  const report = {
    test: 'ZJ-PROGRESSIVE-001-RETRY-DIAGNOSTIC',
    subjectSha: SUBJECT_SHA,
    environment: 'NON_PRODUCTION_STAGING',
    originalFailure: {
      workflowRunId: ORIGINAL_RUN_ID,
      artifactId: ORIGINAL_ARTIFACT_ID,
      artifactDigest: ORIGINAL_ARTIFACT_DIGEST,
      stageConcurrency: FAILED_STAGE,
      ordinal: FAILED_ORDINAL,
      actor: 'B',
      observedStatus: 503,
    },
    retryPolicy: {
      additionalAttemptsAuthorizedByHarness: 1,
      automaticLoopRetries: 0,
      requestTimeoutMs: TIMEOUT_MS,
    },
    retryObservation: {
      observedStatus: status,
      elapsedMs: Math.round(performance.now() - started),
      responseBytes,
      schemaValid: parsed.success,
      runId: parsed.success ? parsed.data.id : null,
      sanitizedError: sanitizeError(payload),
      transportError,
    },
    outcome: recovered ? 'RECOVERED_ON_SINGLE_BOUNDED_RETRY' : 'RETRY_FAILED',
    originalLoadVerdictChanged: false,
    originalLoadVerdict: 'FAIL_AT_20_CONCURRENCY_19_OF_20_SUCCESS',
    runtimeCodeChanged: false,
    mergeAuthorizedOrPerformed: false,
    remediationInterpretation: recovered
      ? 'The failed request is consistent with transient pressure, but current runtime has no internal provider retry/dead-letter mechanism. The original 20-concurrency reliability failure remains retained.'
      : 'The request remained unsuccessful after one bounded retry. Treat as a persistent or repeated staging/runtime failure and retain the original load failure.',
    recordedAt: new Date().toISOString(),
  };

  const dir = resolve(process.cwd(), 'jungle-diagnostic/artifacts');
  await mkdir(dir, { recursive: true });
  await writeFile(resolve(dir, 'zj-progressive-001-retry-report.json'), `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
  if (!recovered) process.exitCode = 1;
}

void main().catch(async (error: unknown) => {
  const report = {
    test: 'ZJ-PROGRESSIVE-001-RETRY-DIAGNOSTIC',
    outcome: 'INVALID',
    failureDomain: 'DIAGNOSTIC_HARNESS_OR_ENVIRONMENT',
    originalLoadVerdictChanged: false,
    runtimeCodeChanged: false,
    error: error instanceof Error ? error.message : String(error),
    recordedAt: new Date().toISOString(),
  };
  const dir = resolve(process.cwd(), 'jungle-diagnostic/artifacts');
  await mkdir(dir, { recursive: true }).catch(() => undefined);
  await writeFile(resolve(dir, 'zj-progressive-001-retry-report.json'), `${JSON.stringify(report, null, 2)}\n`).catch(() => undefined);
  console.error(JSON.stringify(report, null, 2));
  process.exitCode = 1;
});
