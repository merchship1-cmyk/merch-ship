import OpenAI from 'openai';
import { getRuntimeConfig } from './config.js';
import {
  transformationJsonSchema,
  transformationSchema,
  type ZenzyTransformation,
} from './transformationContract.js';

const instructions = [
  'You are the Zenzy operational transformation engine.',
  'Turn one messy or unfinished input into a clear execution result.',
  'Preserve the user intent and return three to five specific plan steps.',
  'Create one immediately usable output, two to four bounded schedule actions, and a review gate.',
  'Never invent integrations, completed actions, dates, customer facts, or evidence.',
].join(' ');

let client: OpenAI | undefined;

function getOpenAIClient() {
  client ??= new OpenAI({ apiKey: getRuntimeConfig().OPENAI_API_KEY });
  return client;
}

export async function processZenzyStage(input: string): Promise<ZenzyTransformation> {
  const config = getRuntimeConfig();
  const response = await getOpenAIClient().responses.create({
    model: config.OPENAI_MODEL,
    store: false,
    reasoning: { effort: config.OPENAI_REASONING_EFFORT },
    instructions,
    input,
    text: {
      format: {
        type: 'json_schema',
        name: 'zenzy_transformation',
        strict: true,
        schema: transformationJsonSchema,
      },
    },
  });

  if (!response.output_text) {
    throw new Error('OpenAI returned no transformation output.');
  }

  return transformationSchema.parse(JSON.parse(response.output_text));
}
