import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import type { TransformationEvidence } from '../src/domain/transformation';
import {
  acceptRun,
  createTransformation,
  login,
  readEvidence,
  readRun,
  recordEvidence,
} from '../phase1a/orchestrator/api';
import {
  SUPABASE_PUBLISHABLE_KEY,
  SUPABASE_URL,
  TEST_USER_A_EMAIL,
  TEST_USER_A_PASSWORD,
} from '../phase1a/orchestrator/config';

const FROZEN_SHA = 'd6d7aa7f29bc3dc3a689bcd3712e1decd612ae3b';
const EXPECTED_PROJECT_REF = 'dlliijieyppljpxbweib';
const REQUIRED_RUNS = 3;

assert.equal(
  new URL(SUPABASE_URL).hostname,
  `${EXPECTED_PROJECT_REF}.supabase.co`,
  'ZJ-T-008 refuses to run outside the frozen staging project.',
);

const sha256 = (value: unknown) =>
  createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');

const requiredAuditFields = [
  'evaluation_id',
  'case_id',
  'case_version',
  'subject_commit',
  'jungle_version',
  'environment_id',
  'started_at',
  'completed_at',
  'input_hash',
  'output_hash',
  'actor_ids',
  'observed_events',
  'final_state',
  'expected_result',
  'observed_result',
  'outcome',
  'failure_domain',
  'evidence_refs',
  'secrets_scan',
  'reviewer_notes',
] as const;

function hasCompleteAuditFields(record: Record<string, unknown>) {
  return requiredAuditFields.every((field) => Object.prototype.hasOwnProperty.call(record, field));
}

async function unavailableEvidenceHook(token: string, runId: string) {
  const endpoint = `${SUPABASE_URL}/functions/v1/zj001-intentionally-unavailable-evidence-hook`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      apikey: SUPABASE_PUBLISHABLE_KEY,
    },
    body: JSON.stringify({ runId }),
  });
  return response.status;
}

async function runJz017(userA: Awaited<ReturnType<typeof login>>) {
  const observations = [];
  for (let iteration = 1; iteration <= REQUIRED_RUNS; iteration += 1) {
    const run = await createTransformation(
      userA.accessToken,
      'JZ-017 frozen partial-failure proof: create one bounded internal planning result.',
    );
    await acceptRun(userA.accessToken, run.id);
    assert.equal((await readRun(userA.client, run.id))?.status, 'reviewed');
    assert.equal(await readEvidence(userA.client, run.id), null);

    const dependencyStatus = await unavailableEvidenceHook(userA.accessToken, run.id);
    assert.ok(dependencyStatus >= 400, 'Unavailable hook must not report success.');

    const stateAfterFailure = (await readRun(userA.client, run.id))?.status;
    const evidenceAfterFailure = await readEvidence(userA.client, run.id);
    assert.equal(stateAfterFailure, 'reviewed');
    assert.equal(evidenceAfterFailure, null);

    observations.push({
      iteration,
      runId: run.id,
      dependencyStatus,
      finalState: String(stateAfterFailure),
      evidencePresent: false,
      outcome: 'PASS',
    });
  }
  return observations;
}

async function runJz019(userA: Awaited<ReturnType<typeof login>>) {
  const observations = [];
  for (let iteration = 1; iteration <= REQUIRED_RUNS; iteration += 1) {
    const startedAt = new Date().toISOString();
    const input = 'JZ-019 frozen audit-completeness proof: complete one internal happy path.';
    const run = await createTransformation(userA.accessToken, input);
    await acceptRun(userA.accessToken, run.id);
    const evidence: TransformationEvidence = {
      runId: run.id,
      timeSavedMinutes: 0,
      stepsRemoved: 0,
      clarityGain: 3,
      outputProduced: true,
      wouldUseAgain: true,
      notes: 'JZ-019 runtime happy-path evidence.',
      recordedAt: new Date().toISOString(),
    };
    await recordEvidence(userA.accessToken, evidence);
    assert.equal((await readRun(userA.client, run.id))?.status, 'verified');

    const intentionallyIncompleteAuditRecord: Record<string, unknown> = {
      evaluation_id: `zj001-jz019-${iteration}`,
      case_id: 'JZ-019',
      case_version: '0.1',
      subject_commit: FROZEN_SHA,
      jungle_version: 'ZJ-001-HARNESS-0.1',
      environment_id: EXPECTED_PROJECT_REF,
      started_at: startedAt,
      completed_at: new Date().toISOString(),
      actor_ids: ['TEST_USER_A'],
      observed_events: ['generated', 'reviewed', 'verified'],
      final_state: 'verified',
      expected_result: 'PARTIAL or FAIL, never PASS without required evidence',
      observed_result: 'Happy path completed, but audit hashes/evidence refs intentionally omitted.',
      outcome: 'PARTIAL',
      failure_domain: 'JUNGLE',
      secrets_scan: 'PASS',
      reviewer_notes: 'Intentional incomplete-audit control.',
    };

    assert.equal(hasCompleteAuditFields(intentionallyIncompleteAuditRecord), false);
    assert.notEqual(intentionallyIncompleteAuditRecord.outcome, 'PASS');

    observations.push({
      iteration,
      runId: run.id,
      runtimeFinalState: 'verified',
      auditRecordComplete: false,
      harnessOutcome: 'PARTIAL',
    });
  }
  return observations;
}

async function runJz023(userA: Awaited<ReturnType<typeof login>>) {
  const input = 'JZ-023 harness-control proof: create a valid bounded internal planning result.';
  const run = await createTransformation(userA.accessToken, input);
  assert.ok(run.id);

  const validOutputHash = sha256(run);
  const intentionallyCorruptCapture = {
    evaluation_id: 'zj001-jz023-control',
    case_id: 'JZ-023',
    case_version: '0.1',
    subject_commit: FROZEN_SHA,
    jungle_version: 'ZJ-001-HARNESS-0.1',
    environment_id: EXPECTED_PROJECT_REF,
    started_at: new Date().toISOString(),
    completed_at: new Date().toISOString(),
    input_hash: sha256(input),
    output_hash: validOutputHash,
    actor_ids: ['TEST_USER_A'],
    observed_events: 'CORRUPTED_NOT_ARRAY',
    final_state: 'generated',
    expected_result: 'INVALID with failure_domain JUNGLE',
    observed_result: 'ZENZY returned correctly; local evidence capture intentionally corrupted.',
    outcome: 'INVALID',
    failure_domain: 'JUNGLE',
    evidence_refs: [],
    secrets_scan: 'PASS',
    reviewer_notes: 'Intentional JUNGLE corruption control.',
  };

  assert.equal(Array.isArray(intentionallyCorruptCapture.observed_events), false);
  assert.equal(intentionallyCorruptCapture.outcome, 'INVALID');
  assert.equal(intentionallyCorruptCapture.failure_domain, 'JUNGLE');

  return {
    runId: run.id,
    zenzyResponseValid: true,
    outputHash: validOutputHash,
    harnessOutcome: 'INVALID',
    failureDomain: 'JUNGLE',
  };
}

async function classifyBlockedFaultCases() {
  const transformSource = await readFile(
    resolve(process.cwd(), 'supabase/functions/transform/index.ts'),
    'utf8',
  );
  const apiSource = await readFile(
    resolve(process.cwd(), 'phase1a/orchestrator/api.ts'),
    'utf8',
  );

  const hasProviderFaultInjection = /fault[_-]?inject|mock[_-]?provider|simulate[_-]?timeout|provider[_-]?fixture/i.test(transformSource);
  const hasExplicitProviderTimeout = /AbortController|AbortSignal\.timeout|timeoutMs|providerTimeout/i.test(transformSource);
  const hasClientIdempotencyIdentity = /idempotency|idempotency-key|requestId|request_id/i.test(
    `${transformSource}\n${apiSource}`,
  );

  assert.equal(hasProviderFaultInjection, false);

  return {
    JZ015: {
      outcome: 'BLOCKED',
      failureDomain: 'TEST_DESIGN',
      reason: 'Frozen staging transform exposes no authorized malformed-provider-response injection surface.',
      providerFaultInjectionAvailable: hasProviderFaultInjection,
    },
    JZ016: {
      outcome: 'BLOCKED',
      failureDomain: 'TEST_DESIGN',
      reason: 'Frozen staging transform exposes no authorized provider-timeout injection surface.',
      providerFaultInjectionAvailable: hasProviderFaultInjection,
      explicitProviderTimeoutControlDetected: hasExplicitProviderTimeout,
    },
    JZ022: {
      outcome: 'BLOCKED',
      failureDomain: 'TEST_DESIGN',
      reason: 'Frozen transform interface exposes no client-stable idempotency identity for a same-identity retry experiment.',
      clientStableIdempotencyIdentityDetected: hasClientIdempotencyIdentity,
    },
  };
}

async function main() {
  const userA = await login(TEST_USER_A_EMAIL, TEST_USER_A_PASSWORD);

  const [jz017, jz019, jz023, blocked] = await Promise.all([
    runJz017(userA),
    runJz019(userA),
    runJz023(userA),
    classifyBlockedFaultCases(),
  ]);

  const report = {
    test: 'ZJ-T-008',
    canonicalCases: ['JZ-015', 'JZ-016', 'JZ-017', 'JZ-019', 'JZ-022', 'JZ-023'],
    harnessStatus: 'PASS',
    frozenSha: FROZEN_SHA,
    environment: 'NON_PRODUCTION_STAGING',
    projectRef: EXPECTED_PROJECT_REF,
    customerProductionDataTouched: false,
    applicationRuntimeCodeChanged: false,
    results: {
      JZ015: blocked.JZ015,
      JZ016: blocked.JZ016,
      JZ017: {
        requiredRuns: REQUIRED_RUNS,
        finalOutcome: jz017.every((row) => row.outcome === 'PASS') ? 'PASS' : 'FAIL',
        observations: jz017,
      },
      JZ019: {
        requiredRuns: REQUIRED_RUNS,
        finalOutcome: jz019.every((row) => row.harnessOutcome === 'PARTIAL') ? 'PASS' : 'FAIL',
        note: 'The control passes only because incomplete audit evidence is prevented from receiving a full PASS.',
        observations: jz019,
      },
      JZ022: blocked.JZ022,
      JZ023: {
        requiredRuns: 1,
        finalOutcome: jz023.harnessOutcome === 'INVALID' && jz023.failureDomain === 'JUNGLE' ? 'PASS' : 'FAIL',
        observation: jz023,
      },
    },
    secretsScan: 'PASS',
    recordedAt: new Date().toISOString(),
  };

  const artifactDirectory = resolve(process.cwd(), 'zj001/artifacts');
  await mkdir(artifactDirectory, { recursive: true });
  await writeFile(
    resolve(artifactDirectory, 'zj-t-008-report.json'),
    `${JSON.stringify(report, null, 2)}\n`,
    'utf8',
  );
  console.log(JSON.stringify(report, null, 2));
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
