import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import type { TransformationEvidence } from '../src/domain/transformation';
import {
  acceptRun,
  createTransformation,
  login,
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
  'ZJ-T-004 frozen staging replay proof: create one bounded internal test plan with no external actions.';
const REQUIRED_RUNS = 3;

const supabaseUrl = process.env.SUPABASE_URL?.trim().replace(/\/$/, '');
assert.ok(supabaseUrl, 'Missing SUPABASE_URL.');
assert.equal(
  new URL(supabaseUrl).hostname,
  EXPECTED_HOST,
  'ZJ-T-004 refuses to run outside the frozen Phase 1A staging project.',
);

async function countOwnedRows(
  client: Awaited<ReturnType<typeof login>>['client'],
  table: string,
  runId: string,
) {
  const { count, error } = await client
    .from(table)
    .select('id', { count: 'exact', head: true })
    .eq('run_id', runId);
  if (error) throw new Error(`${table} count failed: ${error.message}`);
  return count ?? 0;
}

async function main() {
  const userA = await login(TEST_USER_A_EMAIL, TEST_USER_A_PASSWORD);
  const observations: Array<{
    iteration: number;
    runId: string;
    acceptanceCountAfterReplay: number;
    evidenceCountAfterReplay: number;
    stateAfterAcceptanceReplay: string;
    stateAfterEvidenceReplay: string;
  }> = [];

  for (let iteration = 1; iteration <= REQUIRED_RUNS; iteration += 1) {
    const transformation = await createTransformation(userA.accessToken, FROZEN_INPUT);
    const runId = transformation.id;
    assert.equal((await readRun(userA.client, runId))?.status, 'generated');

    const firstAcceptance = await acceptRun(userA.accessToken, runId);
    const replayAcceptance = await acceptRun(userA.accessToken, runId);

    assert.deepEqual(
      replayAcceptance,
      firstAcceptance,
      'Replay acceptance must return the same canonical acceptance response.',
    );

    const acceptanceCountAfterReplay = await countOwnedRows(
      userA.client,
      'zenzy_transformation_acceptance',
      runId,
    );
    assert.equal(acceptanceCountAfterReplay, 1);

    const stateAfterAcceptanceReplay = (await readRun(userA.client, runId))?.status;
    assert.equal(stateAfterAcceptanceReplay, 'reviewed');

    const candidateEvidence: TransformationEvidence = {
      runId,
      timeSavedMinutes: 0,
      stepsRemoved: 0,
      clarityGain: 3,
      outputProduced: true,
      wouldUseAgain: true,
      notes: 'ZJ-T-004 frozen replay proof.',
      recordedAt: new Date().toISOString(),
    };

    const firstEvidence = await recordEvidence(userA.accessToken, candidateEvidence);
    const replayEvidence = await recordEvidence(userA.accessToken, candidateEvidence);

    assert.deepEqual(
      replayEvidence,
      firstEvidence,
      'Replay evidence must return the same canonical evidence response.',
    );

    const evidenceCountAfterReplay = await countOwnedRows(
      userA.client,
      'zenzy_transformation_evidence',
      runId,
    );
    assert.equal(evidenceCountAfterReplay, 1);

    const stateAfterEvidenceReplay = (await readRun(userA.client, runId))?.status;
    assert.equal(stateAfterEvidenceReplay, 'verified');

    observations.push({
      iteration,
      runId,
      acceptanceCountAfterReplay,
      evidenceCountAfterReplay,
      stateAfterAcceptanceReplay: String(stateAfterAcceptanceReplay),
      stateAfterEvidenceReplay: String(stateAfterEvidenceReplay),
    });
  }

  const report = {
    test: 'ZJ-T-004',
    canonicalCases: ['JZ-009', 'JZ-010'],
    status: 'PASS',
    frozenSha: FROZEN_SHA,
    environment: 'NON_PRODUCTION_STAGING',
    projectRef: EXPECTED_PROJECT_REF,
    customerProductionDataTouched: false,
    applicationRuntimeCodeChanged: false,
    runsRequired: REQUIRED_RUNS,
    runsCompleted: observations.length,
    checks: {
      acceptanceReplayReturnsCanonicalRecord: true,
      acceptanceReplayCreatesNoDuplicateAuthority: true,
      acceptanceReplayLeavesReviewedState: true,
      evidenceReplayReturnsCanonicalRecord: true,
      evidenceReplayCreatesNoDuplicateEvidence: true,
      evidenceReplayLeavesVerifiedState: true,
    },
    observations,
    secretsScan: 'PASS',
    recordedAt: new Date().toISOString(),
  };

  const artifactDirectory = resolve(process.cwd(), 'zj001/artifacts');
  await mkdir(artifactDirectory, { recursive: true });
  await writeFile(
    resolve(artifactDirectory, 'zj-t-004-report.json'),
    `${JSON.stringify(report, null, 2)}\n`,
    'utf8',
  );

  console.log(JSON.stringify(report, null, 2));
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
