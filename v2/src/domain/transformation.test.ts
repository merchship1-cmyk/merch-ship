import { describe, expect, it } from 'vitest';

import {
  transformationAcceptanceSchema,
  transformationEvidenceSchema,
  transformationResultSchema,
} from './transformation';
import { createMockTransformation } from '../services/mockTransformation';

describe('Phase 0 schemas', () => {
  it('accepts a complete transformation', () => {
    const result = createMockTransformation(
      'Finish the onboarding checklist.',
      new Date('2026-07-22T12:00:00.000Z'),
    );

    expect(transformationResultSchema.safeParse(result).success).toBe(true);
  });

  it('requires explicit affirmative clarity acceptance', () => {
    const accepted = transformationAcceptanceSchema.safeParse({
      runId: 'run-1',
      accepted: true,
      acceptedAt: '2026-07-22T12:15:00.000Z',
    });
    const rejected = transformationAcceptanceSchema.safeParse({
      runId: 'run-1',
      accepted: false,
      acceptedAt: '2026-07-22T12:15:00.000Z',
    });

    expect(accepted.success).toBe(true);
    expect(rejected.success).toBe(false);
  });

  it('requires all five evidence measures', () => {
    const parsed = transformationEvidenceSchema.safeParse({
      runId: 'run-1',
      timeSavedMinutes: 15,
      stepsRemoved: 1,
      clarityGain: 4,
      outputProduced: true,
      recordedAt: '2026-07-22T12:30:00.000Z',
    });

    expect(parsed.success).toBe(false);
  });
});
