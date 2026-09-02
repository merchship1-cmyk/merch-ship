import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import type { TransformationEvidence } from '../../src/domain/transformation';
import {
  HttpError,
  acceptRun,
  callEvidenceHook,
  createTransformation,
  login,
  readAcceptance,
  readEvidence,
  readRun,
  recordEvidence,
} from './api';
import {
  TEST_USER_A_EMAIL,
  TEST_USER_A_PASSWORD,
  TEST_USER_B_EMAIL,
  TEST_USER_B_PASSWORD,
} from './config';

async function expectHttpStatus(action: () => Promise<unknown>, status: number) {
  try {
    await action();
    assert.fail(`Expected HTTP ${status}, but the request succeeded.`);
  } catch (error) {
    assert.ok(error instanceof HttpError, 'Expected an HTTP failure.');
    assert.equal(error.status, status);
  }
}

async function main() {
  const [userA, userB] = await Promise.all([
    login(TEST_USER_A_EMAIL, TEST_USER_A_PASSWORD),
    login(TEST_USER_B_EMAIL, TEST_USER_B_PASSWORD),
  ]);

  const marker = `PHASE1A-${randomUUID()}`;
  const transformation = await createTransformation(
    userA.accessToken,
    `${marker}: I want to make a spooky kids video but I only have 20 minutes at night.`,
  );
  const runId = transformation.id;

  const ownerRun = await readRun(userA.client, runId);
  assert.equal(ownerRun?.id, runId);
  assert.equal(ownerRun?.status, 'generated');
  assert.equal(await readRun(userB.client, runId), null);

  const candidateEvidence: TransformationEvidence = {
    runId,
    timeSavedMinutes: 20,
    stepsRemoved: 2,
    clarityGain: 4,
    outputProduced: true,
    wouldUseAgain: true,
    notes: 'Automated Phase-1A acceptance proof.',
    recordedAt: new Date().toISOString(),
  };

  await expectHttpStatus(
    () => recordEvidence(userA.accessToken, candidateEvidence),
    409,
  );
  await expectHttpStatus(() => acceptRun(userB.accessToken, runId), 404);

  const acceptance = await acceptRun(userA.accessToken, runId);
  assert.equal(acceptance.runId, runId);
  assert.equal(acceptance.accepted, true);
  assert.equal((await readRun(userA.client, runId))?.status, 'reviewed');
  assert.equal((await readAcceptance(userA.client, runId))?.accepted, true);
  assert.equal(await readAcceptance(userB.client, runId), null);

  const evidence = await recordEvidence(userA.accessToken, candidateEvidence);
  assert.equal(evidence.runId, runId);
  assert.equal((await readRun(userA.client, runId))?.status, 'verified');
  assert.ok(await readEvidence(userA.client, runId));
  assert.equal(await readEvidence(userB.client, runId), null);

  const hook = await callEvidenceHook(
    userA.accessToken,
    userB.accessToken,
    runId,
  );
  assert.equal(hook.ok, true);
  assert.equal(hook.isolationOk, true);
  assert.equal(hook.runStatus, 'verified');

  const report = {
    status: 'PASS',
    runId,
    checks: {
      authenticatedTransformation: true,
      evidenceBlockedBeforeAcceptance: true,
      crossUserAcceptanceBlocked: true,
      ownerAcceptancePersisted: true,
      executionStateReviewed: true,
      evidencePersisted: true,
      completedStateVerified: true,
      twoUserReadIsolation: true,
      evidenceHook: true,
    },
    recordedAt: new Date().toISOString(),
  };

  const artifactDirectory = resolve(process.cwd(), 'phase1a/artifacts');
  await mkdir(artifactDirectory, { recursive: true });
  await writeFile(
    resolve(artifactDirectory, 'phase1a-report.json'),
    `${JSON.stringify(report, null, 2)}\n`,
    'utf8',
  );
  console.log(JSON.stringify(report, null, 2));
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
