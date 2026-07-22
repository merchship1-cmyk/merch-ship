import {
  isModelTransformation,
  modelTransformationJsonSchema,
} from '../contracts/transformation-contract';
import { transformationResultSchema } from '../src/domain/transformation';
import { createMockTransformation } from '../src/services/mockTransformation';

const required = new Set<string>(modelTransformationJsonSchema.required);
const expected = [
  'objective',
  'idea',
  'plan',
  'createdOutput',
  'schedule',
  'review',
];

for (const field of expected) {
  if (!required.has(field)) {
    throw new Error('Structured output schema is missing: ' + field);
  }
}

const mock = createMockTransformation(
  'Compress a manual weekly reporting process.',
  new Date('2026-07-22T12:00:00.000Z'),
);

const modelPayload = {
  objective: mock.objective,
  idea: mock.idea,
  plan: mock.plan,
  createdOutput: mock.createdOutput,
  schedule: mock.schedule,
  review: mock.review,
};

if (!isModelTransformation(modelPayload)) {
  throw new Error('Structured output runtime validator rejected a valid result.');
}

transformationResultSchema.parse(mock);
console.log('Structured output contract is valid.');
