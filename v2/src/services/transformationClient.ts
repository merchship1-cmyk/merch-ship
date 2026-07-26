import {
  transformationResultSchema,
  type TransformationResult,
} from '../domain/transformation';
import { createMockTransformation } from './mockTransformation';

const mode = process.env.EXPO_PUBLIC_ZENZY_AI_MODE ?? 'mock';
const endpoint = process.env.EXPO_PUBLIC_ZENZY_API_URL;

async function runRemoteTransformation(
  input: string,
): Promise<TransformationResult> {
  if (!endpoint) {
    throw new Error(
      'Remote mode requires EXPO_PUBLIC_ZENZY_API_URL. Use mock mode for local testing.',
    );
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ input }),
  });

  if (!response.ok) {
    throw new Error('Zenzy transformation service is currently unavailable.');
  }

  return transformationResultSchema.parse(await response.json());
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

  return mode === 'remote'
    ? runRemoteTransformation(normalizedInput)
    : createMockTransformation(normalizedInput);
}
