import { randomUUID } from 'node:crypto';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import {
  transformationAcceptanceSchema,
  transformationEvidenceSchema,
  transformationResultSchema,
  type TransformationEvidence,
} from '../../src/domain/transformation';
import {
  SUPABASE_PUBLISHABLE_KEY,
  SUPABASE_URL,
  endpoints,
} from './config';

export class HttpError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export type SignedInUser = {
  client: SupabaseClient;
  accessToken: string;
};

const readError = (payload: unknown, fallback: string) => {
  if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) {
    return fallback;
  }
  const error = (payload as Record<string, unknown>).error;
  return typeof error === 'string' && error.trim() ? error : fallback;
};

async function postJson(endpoint: string, token: string, body: unknown) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      apikey: SUPABASE_PUBLISHABLE_KEY,
    },
    body: JSON.stringify(body),
  });

  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw new HttpError(
      readError(payload, `Request failed with HTTP ${response.status}.`),
      response.status,
    );
  }
  return payload;
}

export async function login(email: string, password: string): Promise<SignedInUser> {
  const client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data.session?.access_token) {
    throw new Error(`Test login failed: ${error?.message ?? 'no access token returned'}`);
  }
  return { client, accessToken: data.session.access_token };
}

export async function createTransformation(
  token: string,
  input: string,
  requestId = randomUUID(),
) {
  return transformationResultSchema.parse(
    await postJson(endpoints.transform, token, { input, requestId }),
  );
}

export async function acceptRun(token: string, runId: string) {
  return transformationAcceptanceSchema.parse(
    await postJson(endpoints.accept, token, { runId }),
  );
}

export async function recordEvidence(
  token: string,
  evidence: TransformationEvidence,
) {
  return transformationEvidenceSchema.parse(
    await postJson(endpoints.evidence, token, evidence),
  );
}

export async function callEvidenceHook(
  ownerToken: string,
  otherUserAccessToken: string,
  runId: string,
) {
  const payload = await postJson(endpoints.evidenceHook, ownerToken, {
    runId,
    otherUserAccessToken,
  });
  if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) {
    throw new Error('Evidence hook returned an invalid payload.');
  }
  return payload as Record<string, unknown>;
}

async function readOwnedRow(
  client: SupabaseClient,
  table: string,
  column: string,
  runId: string,
  select: string,
) {
  const { data, error } = await client
    .from(table)
    .select(select)
    .eq(column, runId)
    .maybeSingle();
  if (error) throw new Error(`${table} read failed: ${error.message}`);
  return data as Record<string, unknown> | null;
}

export const readRun = (client: SupabaseClient, runId: string) =>
  readOwnedRow(client, 'zenzy_transformation_runs', 'id', runId, 'id,status');

export const readAcceptance = (client: SupabaseClient, runId: string) =>
  readOwnedRow(
    client,
    'zenzy_transformation_acceptance',
    'run_id',
    runId,
    'id,run_id,accepted,accepted_at',
  );

export const readEvidence = (client: SupabaseClient, runId: string) =>
  readOwnedRow(
    client,
    'zenzy_transformation_evidence',
    'run_id',
    runId,
    'id,run_id,recorded_at',
  );
