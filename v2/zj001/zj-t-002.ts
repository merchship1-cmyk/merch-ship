import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const FROZEN_SHA = 'd6d7aa7f29bc3dc3a689bcd3712e1decd612ae3b';
const EXPECTED_PROJECT_REF = 'dlliijieyppljpxbweib';

const required = (name: string) => {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required ZJ-T-002 environment variable: ${name}`);
  return value;
};

const SUPABASE_URL = required('SUPABASE_URL').replace(/\/$/, '');
const SUPABASE_PUBLISHABLE_KEY = required('SUPABASE_PUBLISHABLE_KEY');
const TEST_USER_A_EMAIL = required('TEST_USER_A_EMAIL');
const TEST_USER_A_PASSWORD = required('TEST_USER_A_PASSWORD');
const TEST_USER_B_EMAIL = required('TEST_USER_B_EMAIL');
const TEST_USER_B_PASSWORD = required('TEST_USER_B_PASSWORD');

const expectedHost = `${EXPECTED_PROJECT_REF}.supabase.co`;
assert.equal(
  new URL(SUPABASE_URL).hostname,
  expectedHost,
  'ZJ-T-002 refuses to run outside the frozen Phase 1A staging project.',
);

const FUNCTIONS_BASE = `${SUPABASE_URL}/functions/v1`;
const endpoints = {
  transform: `${FUNCTIONS_BASE}/transform`,
  accept: `${FUNCTIONS_BASE}/accept`,
};

type SignedInUser = {
  client: SupabaseClient;
  accessToken: string;
  userId: string;
};

async function login(email: string, password: string): Promise<SignedInUser> {
  const client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });

  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data.session?.access_token || !data.user?.id) {
    throw new Error(`Dedicated test-user login failed: ${error?.message ?? 'session unavailable'}`);
  }

  return {
    client,
    accessToken: data.session.access_token,
    userId: data.user.id,
  };
}

async function postJson(
  endpoint: string,
  authorization: string | null,
  body: unknown,
) {
  const headers: Record<string, string> = {
    apikey: SUPABASE_PUBLISHABLE_KEY,
    'Content-Type': 'application/json',
  };
  if (authorization) headers.Authorization = authorization;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  const payload: unknown = await response.json().catch(() => null);
  return { status: response.status, payload };
}

async function expectStatus(
  label: string,
  expectedStatus: number,
  action: () => Promise<{ status: number; payload: unknown }>,
) {
  const response = await action();
  assert.equal(
    response.status,
    expectedStatus,
    `${label}: expected HTTP ${expectedStatus}, received ${response.status}`,
  );
}

async function findOrCreateOwnerRun(userA: SignedInUser) {
  const { data, error } = await userA.client
    .from('zenzy_transformation_runs')
    .select('id')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`Owner-scoped run lookup failed: ${error.message}`);
  if (data?.id && typeof data.id === 'string') {
    return { runId: data.id, createdFallbackRun: false };
  }

  const response = await postJson(
    endpoints.transform,
    `Bearer ${userA.accessToken}`,
    { input: 'ZJ-T-002 dedicated staging cross-user authentication check.' },
  );
  assert.equal(response.status, 200, 'Fallback dedicated-test transformation failed.');
  assert.ok(
    typeof response.payload === 'object' &&
      response.payload !== null &&
      !Array.isArray(response.payload) &&
      typeof (response.payload as Record<string, unknown>).id === 'string',
    'Fallback transformation did not return a run id.',
  );

  return {
    runId: (response.payload as Record<string, string>).id,
    createdFallbackRun: true,
  };
}

async function main() {
  const [userA, userB] = await Promise.all([
    login(TEST_USER_A_EMAIL, TEST_USER_A_PASSWORD),
    login(TEST_USER_B_EMAIL, TEST_USER_B_PASSWORD),
  ]);
  assert.notEqual(userA.userId, userB.userId, 'Dedicated test identities must be distinct.');

  await expectStatus('missing authentication', 401, () =>
    postJson(endpoints.transform, null, { input: 'ZJ-T-002 missing authentication.' }),
  );

  await expectStatus('invalid authentication', 401, () =>
    postJson(endpoints.transform, 'Bearer zj-t-002-invalid-token', {
      input: 'ZJ-T-002 invalid authentication.',
    }),
  );

  await expectStatus('explicit user_id spoofing', 400, () =>
    postJson(endpoints.transform, `Bearer ${userA.accessToken}`, {
      input: 'ZJ-T-002 explicit user id spoof attempt.',
      user_id: userB.userId,
    }),
  );

  await expectStatus('explicit userId spoofing', 400, () =>
    postJson(endpoints.transform, `Bearer ${userA.accessToken}`, {
      input: 'ZJ-T-002 explicit camel-case user id spoof attempt.',
      userId: userB.userId,
    }),
  );

  const { runId, createdFallbackRun } = await findOrCreateOwnerRun(userA);

  const { data: ownerVisible, error: ownerReadError } = await userA.client
    .from('zenzy_transformation_runs')
    .select('id')
    .eq('id', runId)
    .maybeSingle();
  if (ownerReadError) throw new Error(`Owner read failed: ${ownerReadError.message}`);
  assert.equal(ownerVisible?.id, runId, 'Owner must be able to read the owner-scoped run.');

  const { data: otherVisible, error: otherReadError } = await userB.client
    .from('zenzy_transformation_runs')
    .select('id')
    .eq('id', runId)
    .maybeSingle();
  if (otherReadError) throw new Error(`Cross-user read check failed: ${otherReadError.message}`);
  assert.equal(otherVisible, null, 'Cross-user RLS must hide the owner-scoped run.');

  await expectStatus('cross-user acceptance authentication', 404, () =>
    postJson(endpoints.accept, `Bearer ${userB.accessToken}`, { runId }),
  );

  const report = {
    test: 'ZJ-T-002',
    status: 'PASS',
    frozenSha: FROZEN_SHA,
    environment: 'NON_PRODUCTION_STAGING',
    projectRef: EXPECTED_PROJECT_REF,
    customerProductionDataTouched: false,
    createdFallbackDedicatedTestRun: createdFallbackRun,
    checks: {
      dedicatedTestUsersAuthenticated: true,
      distinctTestIdentities: true,
      missingAuthenticationRejected: true,
      invalidAuthenticationRejected: true,
      explicitSnakeCaseUserIdSpoofRejected: true,
      explicitCamelCaseUserIdSpoofRejected: true,
      ownerScopedReadAllowed: true,
      crossUserReadRejected: true,
      crossUserAcceptanceRejected: true,
    },
    recordedAt: new Date().toISOString(),
  };

  const artifactDirectory = resolve(process.cwd(), 'zj001/artifacts');
  await mkdir(artifactDirectory, { recursive: true });
  await writeFile(
    resolve(artifactDirectory, 'zj-t-002-report.json'),
    `${JSON.stringify(report, null, 2)}\n`,
    'utf8',
  );

  console.log(JSON.stringify(report, null, 2));
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
