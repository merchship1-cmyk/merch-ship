import {
  transformationEvidenceSchema,
  transformationResultSchema,
} from '../src/domain/transformation';
import { createMockTransformation } from '../src/services/mockTransformation';

const result = transformationResultSchema.parse(
  createMockTransformation(
    'Turn a slow customer intake into a clear first execution plan.',
    new Date('2026-07-22T12:00:00.000Z'),
  ),
);

transformationEvidenceSchema.parse({
  runId: result.id,
  timeSavedMinutes: 20,
  stepsRemoved: 2,
  clarityGain: 4,
  outputProduced: true,
  wouldUseAgain: true,
  recordedAt: '2026-07-22T12:30:00.000Z',
});

console.log('Phase 0 result and evidence schemas are valid.');
