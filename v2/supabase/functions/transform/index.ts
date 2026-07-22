import {
  isModelTransformation,
  modelTransformationJsonSchema,
  type ModelTransformation,
} from '../../../contracts/transformation-contract.ts';

type OpenAIResponse = {
  error?: { message?: string };
  output?: Array<{
    content?: Array<{ type?: string; text?: string }>;
  }>;
};

const apiKey = Deno.env.get('OPENAI_API_KEY');
const model = Deno.env.get('OPENAI_MODEL') ?? 'gpt-5.6-sol';
const reasoningEffort =
  Deno.env.get('OPENAI_REASONING_EFFORT') ?? 'low';
const allowedOrigin = Deno.env.get('ALLOWED_ORIGIN') ?? '*';

const corsHeaders = {
  'Access-Control-Allow-Origin': allowedOrigin,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });

const extractOutputText = (payload: OpenAIResponse) =>
  payload.output
    ?.flatMap((item) => item.content ?? [])
    .find((content) => content.type === 'output_text')?.text;

const instructions = [
  'Role: Zenzy operational transformation engine.',
  'Goal: turn one messy or unfinished input into a clear first execution result.',
  'Success means the output preserves the user intent, provides three to five specific plan steps, creates one immediately usable execution brief, schedules two to four bounded actions, and defines a review gate.',
  'Do not invent customer facts, integrations, completed actions, dates, or evidence.',
  'Keep the language public-facing and avoid operating-system or workflow jargon.',
].join(' ');

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed.' }, 405);
  }

  if (!apiKey) {
    return json({ error: 'Transformation service is not configured.' }, 503);
  }

  let input = '';
  try {
    const body = (await request.json()) as { input?: unknown };
    input = typeof body.input === 'string' ? body.input.trim() : '';
  } catch {
    return json({ error: 'Request body must be valid JSON.' }, 400);
  }

  if (input.length < 3 || input.length > 4000) {
    return json({ error: 'Input must contain 3 to 4,000 characters.' }, 400);
  }

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      reasoning: { effort: reasoningEffort },
      instructions,
      input,
      text: {
        format: {
          type: 'json_schema',
          name: 'zenzy_transformation',
          strict: true,
          schema: modelTransformationJsonSchema,
        },
      },
    }),
  });

  const payload = (await response.json()) as OpenAIResponse;
  if (!response.ok) {
    console.error('OpenAI request failed:', payload.error?.message ?? response.status);
    return json({ error: 'Transformation generation failed.' }, 502);
  }

  const outputText = extractOutputText(payload);
  if (!outputText) {
    return json({ error: 'Transformation output was empty.' }, 502);
  }

  let transformation: ModelTransformation;
  try {
    const parsed: unknown = JSON.parse(outputText);
    if (!isModelTransformation(parsed)) {
      throw new Error('Schema mismatch');
    }
    transformation = parsed;
  } catch {
    return json({ error: 'Transformation output failed validation.' }, 502);
  }

  return json({
    id: crypto.randomUUID(),
    sourceInput: input,
    ...transformation,
    generatedAt: new Date().toISOString(),
  });
});
