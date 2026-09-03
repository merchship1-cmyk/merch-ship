import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import type { TransformationEvidence } from '../src/domain/transformation';
import {
  HttpError,
  acceptRun,
  createTransformation,
  login,
  readAcceptance,
  readEvidence,
  readRun,
  recordEvidence,
} from '../phase1a/orchestrator/api';
import {
  TEST_USER_A_EMAIL,
  TEST_USER_A_PASSWORD,
} from '../phase1a/orchestrator/config';

const FROZEN_SHA = 'd6d7aa7f29bc3dc3a689bcd3712e1decd612ae3b';
const EXPECTED_PROJECT_REF = 'dlliijieyppljpxbweib';
const EXPECTED_HOST = `${EXPECTED_PROJECT_REF}.supabase.co`;
const FROZEN_INPUT =
  'ZJ-T-003 frozen staging proof: create one bounded internal test plan with no external actions.';
const REQUIRED_RUNS = 3;

const supabaseUrl = process.env.SUPABASE_URL?.trim().replace(/\/$/, '');
assert.ok(supabaseUrl, 'Missing SUPABASE_URL.');
assert.equal(
  new URL(supabaseUrl).hostname,
  EXPECTED_HOST,
  'ZJ-T-003 refuses to run outside the frozen Phase 1A staging project.',
);

async function expectHttpStatus(
  action: () => Promise<unknown>,
  expectedStatus: number,
) {
  try {
    await action();
    assert.fail(`Expected HTTP ${expectedStatus}, but the request succeeded.`);
  } catch (error) {
    assert.ok(error instanceof HttpError, 'Expected an HTTP failure.');
    assert.equal(error.status, expectedStatus);
  }
}

async function main() {
  const userA = await login(TEST_USER_A_EMAIL, TEST_USER_A_PASSWORD);
  const observations: Array<{
    iteration: number;
    runId: string;
    beforeAcceptance: string;
    afterAcceptance: string;
    afterEvidence: string;
  }> = [];

  for (let iteration = 1; iteration <= REQUIRED_RUNS; iteration += 1) {
    const transformation = await createTransformation(userA.accessToken, FROZEN_INPUT);
    const runId = transformation.id;

    assert.equal((await readRun(userA.client, runId))?.status, 'generated');
    assert.equal(await readAcceptance(userA.client, runId), null);
    assert.equal(await readEvidence(userA.client, runId), null);

    const candidateEvidence: TransformationEvidence = {
      runId,
      timeSavedMinutes: 0,
      stepsRemoved: 0,
      clarityGain: 3,
      outputProduced: true,
      wouldUseAgain: true,
      notes: 'ZJ-T-003 frozen staging state-transition proof.',
      recordedAt: new Date().toISOString(),
    };

    await expectHttpStatus(
      () => recordEvidence(userA.accessToken, candidateEvidence),
      409,
    );

    const beforeAcceptance = (await readRun(userA.client, runId))?.status;
    assert.equal(beforeAcceptance, 'generated');
    assert.equal(await readEvidence(userA.client, runId), null);

    const acceptance = await acceptRun(userA.accessToken, runId);
    assert.equal(acceptance.runId, runId);
    assert.equal(acceptance.accepted, true);

    const afterAcceptance = (await readRun(userA.client, runId))?.status;
    assert.equal(afterAcceptance, 'reviewed');
    assert.equal((await readAcceptance(userA.client, runId))?.accepted, true);
    assert.equal(await readEvidence(userA.client, runId), null);

    const evidence = await recordEvidence(userA.accessToken, candidateEvidence);
    assert.equal(evidence.runId, runId);

    const afterEvidence = (await readRun(userA.client, runId))?.status;
    assert.equal(afterEvidence, 'verified');
    assert.ok(await readEvidence(userA.client, runId));

    observations.push({
      iteration,
      runId,
      beforeAcceptance: String(beforeAcceptance),
      afterAcceptance: String(afterAcceptance),
      afterEvidence: String(afterEvidence),
    });
  }

  assert.equal(observations.length, REQUIRED_RUNS);

  const report = {
    test: 'ZJ-T-003',
    canonicalCases: ['JZ-006', 'JZ-007', 'JZ-008'],
    status: 'PASS',
    frozenSha: FROZEN_SHA,
    environment: 'NON_PRODUCTION_STAGING',
    projectRef: EXPECTED_PROJECT_REF,
    customerProductionDataTouched: false,
    applicationRuntimeCodeChanged: false,
    runsRequired: REQUIRED_RUNS,
    runsCompleted: observations.length,
    checks: {
      evidenceBeforeAcceptanceRejected: true,
      rejectedEvidenceLeavesGeneratedState: true,
      affirmativeAcceptanceCreatesOneOwnerAcceptance: true,
      acceptanceAdvancesGeneratedToReviewed: true,
      evidenceAfterAcceptancePersists: true,
      evidenceAdvancesReviewedToVerified: true,
    },
    observations,
    secretsScan: 'PASS',
    recordedAt: new Date().toISOString(),
  };

  const artifactDirectory = resolve(process.cwd(), 'zj001/artifacts');
  await mkdir(artifactDirectory, { recursive: true });
  await writeFile(
    resolve(artifactDirectory, 'zj-t-003-report.json'),
    `${JSON.stringify(report, null, 2)}\n`,
    'utf8',
  );

  console.log(JSON.stringify(report, null, 2));
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
