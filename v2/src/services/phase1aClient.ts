import {
  transformationAcceptanceSchema,
  transformationEvidenceSchema,
  type TransformationAcceptance,
  type TransformationEvidence,
} from '../domain/transformation';
import { supabase } from '../lib/supabase';
import { isRemoteMode } from './transformationClient';

const transformEndpoint = process.env.EXPO_PUBLIC_ZENZY_API_URL;
const publishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const functionBase = transformEndpoint?.replace(/\/transform\/?$/, '');
const acceptEndpoint =
  process.env.EXPO_PUBLIC_ZENZY_ACCEPT_URL ??
  (functionBase ? `${functionBase}/accept` : undefined);
const evidenceEndpoint =
  process.env.EXPO_PUBLIC_ZENZY_EVIDENCE_URL ??
  (functionBase ? `${functionBase}/record-evidence` : undefined);

const errorMessage = (payload: unknown, fallback: string) => {
  if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) {
    return fallback;
  }
  const error = (payload as Record<string, unknown>).error;
  return typeof error === 'string' && error.trim() ? error : fallback;
};

async function authorizedPost(endpoint: string | undefined, body: unknown) {
  if (!endpoint) throw new Error('Phase 1A endpoint is not configured.');
  if (!publishableKey || !supabase) {
    throw new Error('Phase 1A remote mode requires Supabase configuration.');
  }

  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.access_token) {
    throw new Error('Sign in before continuing this transformation.');
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${data.session.access_token}`,
      apikey: publishableKey,
    },
    body: JSON.stringify(body),
  });

  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Your session expired. Sign in and try again.');
    }
    throw new Error(errorMessage(payload, 'Phase 1A persistence failed.'));
  }

  return payload;
}

export async function acceptTransformation(
  runId: string,
): Promise<TransformationAcceptance> {
  if (!isRemoteMode) {
    return transformationAcceptanceSchema.parse({
      runId,
      accepted: true,
      acceptedAt: new Date().toISOString(),
    });
  }

  return transformationAcceptanceSchema.parse(
    await authorizedPost(acceptEndpoint, { runId }),
  );
}

export async function recordTransformationEvidence(
  evidence: TransformationEvidence,
): Promise<TransformationEvidence> {
  if (!isRemoteMode) {
    return transformationEvidenceSchema.parse(evidence);
  }

  return transformationEvidenceSchema.parse(
    await authorizedPost(evidenceEndpoint, evidence),
  );
}
