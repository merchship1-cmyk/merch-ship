import {
  isModelTransformation,
  modelTransformationJsonSchema,
} from '../contracts/transformation-contract';

async function main() {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL ?? 'gpt-5.6-sol';

  if (!apiKey) {
    throw new Error(
      'OPENAI_API_KEY is required for the main-branch API smoke test.',
    );
  }

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      store: false,
      reasoning: { effort: 'low' },
      instructions:
        'Return a compact Zenzy operational transformation that satisfies the supplied schema.',
      input:
        'Turn a messy weekly planning process into one clear execution loop.',
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

  const payload = (await response.json()) as {
    error?: { message?: string };
    output?: Array<{
      content?: Array<{ type?: string; text?: string }>;
    }>;
  };

  if (!response.ok) {
    throw new Error(
      'OpenAI smoke test failed: ' +
        (payload.error?.message ?? 'unknown API error'),
    );
  }

  const outputText = payload.output
    ?.flatMap((item) => item.content ?? [])
    .find((content) => content.type === 'output_text')?.text;

  if (!outputText || !isModelTransformation(JSON.parse(outputText))) {
    throw new Error('OpenAI smoke test returned an invalid structured output.');
  }

  console.log(
    'Responses API structured-output smoke test passed with ' + model + '.',
  );
}

main().catch((error: unknown) => {
  console.error(
    error instanceof Error ? error.message : 'OpenAI smoke test failed.',
  );
  process.exitCode = 1;
});
