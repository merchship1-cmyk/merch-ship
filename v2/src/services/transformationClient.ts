import {
  type TransformationResult,
} from '../domain/transformation';
import { supabase } from '../lib/supabase';
import { executeMockMeshTransformation } from './meshClient';
import { executeRemoteTransformation } from './transformationTransport';

const mode = process.env.EXPO_PUBLIC_ZENZY_AI_MODE ?? 'mock';
const endpoint = process.env.EXPO_PUBLIC_ZENZY_API_URL;
const publishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const isRemoteMode = mode === 'remote';

async function runRemoteTransformation(
  input: string,
): Promise<TransformationResult> {
  if (!endpoint) {
    throw new Error(
      'Remote mode requires EXPO_PUBLIC_ZENZY_API_URL. Use mock mode for local testing.',
    );
  }

  if (!publishableKey || !supabase) {
    throw new Error(
      'Remote mode requires a configured Supabase publishable client.',
    );
  }

  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.access_token) {
    throw new Error('Sign in before running a remote transformation.');
  }

  return executeRemoteTransformation(input, {
    endpoint,
    publishableKey,
    accessToken: data.session.access_token,
  });
}

export async function runTransformation(
  input: string,
): Promise<TransformationResult> {
  const normalizedInput = input.trim();

  if (normalizedInput.length < 3) {
    throw new Error('Tell Zenzy what you are trying to get done.');
  }

  if (normalizedInput.length > 4000) {
    throw new Error('Keep the starting input under 4,000 characters.');
  }

  return isRemoteMode
    ? runRemoteTransformation(normalizedInput)
    : executeMockMeshTransformation(normalizedInput);
}
