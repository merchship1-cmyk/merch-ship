import { z } from 'zod';

export const transformationSchema = z.object({
  objective: z.string().min(1),
  idea: z.object({
    signal: z.string().min(1),
    finishLine: z.string().min(1),
  }),
  plan: z.array(z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    action: z.string().min(1),
    definitionOfDone: z.string().min(1),
  })).min(3).max(5),
  createdOutput: z.object({
    title: z.string().min(1),
    body: z.string().min(1),
  }),
  schedule: z.array(z.object({
    label: z.string().min(1),
    action: z.string().min(1),
    durationMinutes: z.number().int().min(1).max(240),
  })).min(2).max(4),
  review: z.object({
    prompt: z.string().min(1),
    successCriteria: z.array(z.string().min(1)).min(2).max(5),
  }),
});

export type ZenzyTransformation = z.infer<typeof transformationSchema>;

export const transformationJsonSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['objective', 'idea', 'plan', 'createdOutput', 'schedule', 'review'],
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
      type: 'array', minItems: 3, maxItems: 5,
      items: {
        type: 'object', additionalProperties: false,
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
      type: 'object', additionalProperties: false,
      required: ['title', 'body'],
      properties: {
        title: { type: 'string', minLength: 1 },
        body: { type: 'string', minLength: 1 },
      },
    },
    schedule: {
      type: 'array', minItems: 2, maxItems: 4,
      items: {
        type: 'object', additionalProperties: false,
        required: ['label', 'action', 'durationMinutes'],
        properties: {
          label: { type: 'string', minLength: 1 },
          action: { type: 'string', minLength: 1 },
          durationMinutes: { type: 'integer', minimum: 1, maximum: 240 },
        },
      },
    },
    review: {
      type: 'object', additionalProperties: false,
      required: ['prompt', 'successCriteria'],
      properties: {
        prompt: { type: 'string', minLength: 1 },
        successCriteria: {
          type: 'array', minItems: 2, maxItems: 5,
          items: { type: 'string', minLength: 1 },
        },
      },
    },
  },
} as const;
