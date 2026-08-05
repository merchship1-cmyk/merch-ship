import {
  transformationResultSchema,
  type TransformationResult,
} from '../domain/transformation';

type RemoteTransformationOptions = {
  endpoint: string;
  publishableKey: string;
  accessToken: string;
  fetcher?: typeof fetch;
};

export async function executeRemoteTransformation(
  input: string,
  {
    endpoint,
    publishableKey,
    accessToken,
    fetcher = fetch,
  }: RemoteTransformationOptions,
): Promise<TransformationResult> {
  const response = await fetcher(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      apikey: publishableKey,
    },
    body: JSON.stringify({ input }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Your session expired. Sign in and try again.');
    }
    throw new Error('Zenzy transformation service is currently unavailable.');
  }

  return transformationResultSchema.parse(await response.json());
}
