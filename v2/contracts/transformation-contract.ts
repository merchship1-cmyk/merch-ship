export type ModelTransformation = {
  objective: string;
  idea: {
    signal: string;
    finishLine: string;
  };
  plan: Array<{
    id: string;
    title: string;
    action: string;
    definitionOfDone: string;
  }>;
  createdOutput: {
    title: string;
    body: string;
  };
  schedule: Array<{
    label: string;
    action: string;
    durationMinutes: number;
  }>;
  review: {
    prompt: string;
    successCriteria: string[];
  };
};

export const modelTransformationJsonSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'objective',
    'idea',
    'plan',
    'createdOutput',
    'schedule',
    'review',
  ],
  properties: {
    objective: { type: 'string', minLength: 1 },
    idea: {
      type: 'object',
      additionalProperties: false,
      required: ['signal', 'finishLine'],
      properties: {
        signal: { type: 'string', minLength: 1 },
        finishLine: { type: 'string', minLength: 1 },
      },
    },
    plan: {
      type: 'array',
      minItems: 3,
      maxItems: 5,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'title', 'action', 'definitionOfDone'],
        properties: {
          id: { type: 'string', minLength: 1 },
          title: { type: 'string', minLength: 1 },
          action: { type: 'string', minLength: 1 },
          definitionOfDone: { type: 'string', minLength: 1 },
        },
      },
    },
    createdOutput: {
      type: 'object',
      additionalProperties: false,
      required: ['title', 'body'],
      properties: {
        title: { type: 'string', minLength: 1 },
        body: { type: 'string', minLength: 1 },
      },
    },
    schedule: {
      type: 'array',
      minItems: 2,
      maxItems: 4,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['label', 'action', 'durationMinutes'],
        properties: {
          label: { type: 'string', minLength: 1 },
          action: { type: 'string', minLength: 1 },
          durationMinutes: {
            type: 'integer',
            minimum: 1,
            maximum: 240,
          },
        },
      },
    },
    review: {
      type: 'object',
      additionalProperties: false,
      required: ['prompt', 'successCriteria'],
      properties: {
        prompt: { type: 'string', minLength: 1 },
        successCriteria: {
          type: 'array',
          minItems: 2,
          maxItems: 5,
          items: { type: 'string', minLength: 1 },
        },
      },
    },
  },
} as const;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

export function isModelTransformation(
  value: unknown,
): value is ModelTransformation {
  if (!isRecord(value)) {
    return false;
  }

  const idea = value.idea;
  const createdOutput = value.createdOutput;
  const review = value.review;
  const plan = value.plan;
  const schedule = value.schedule;

  return (
    isNonEmptyString(value.objective) &&
    isRecord(idea) &&
    isNonEmptyString(idea.signal) &&
    isNonEmptyString(idea.finishLine) &&
    Array.isArray(plan) &&
    plan.length >= 3 &&
    plan.length <= 5 &&
    plan.every(
      (step) =>
        isRecord(step) &&
        isNonEmptyString(step.id) &&
        isNonEmptyString(step.title) &&
        isNonEmptyString(step.action) &&
        isNonEmptyString(step.definitionOfDone),
    ) &&
    isRecord(createdOutput) &&
    isNonEmptyString(createdOutput.title) &&
    isNonEmptyString(createdOutput.body) &&
    Array.isArray(schedule) &&
    schedule.length >= 2 &&
    schedule.length <= 4 &&
    schedule.every(
      (item) =>
        isRecord(item) &&
        isNonEmptyString(item.label) &&
        isNonEmptyString(item.action) &&
        Number.isInteger(item.durationMinutes) &&
        Number(item.durationMinutes) > 0 &&
        Number(item.durationMinutes) <= 240,
    ) &&
    isRecord(review) &&
    isNonEmptyString(review.prompt) &&
    Array.isArray(review.successCriteria) &&
    review.successCriteria.length >= 2 &&
    review.successCriteria.length <= 5 &&
    review.successCriteria.every(isNonEmptyString)
  );
}
