import { describe, expect, it } from 'vitest';

import { createMockTransformation } from '../services/mockTransformation';
import { createResumeState, resumeStateSchema } from './resume';

describe('Zenzy exact resume state', () => {
  const now = new Date('2026-09-03T05:00:00.000Z');
  const result = createMockTransformation('Finish the current Zenzy build.', now);

  it('persists a valid clarity-stage transformation', () => {
    const state = createResumeState(result, null, null, now);

    expect(resumeStateSchema.safeParse(state).success).toBe(true);
    expect(state.result?.id).toBe(result.id);
    expect(state.acceptance).toBeNull();
    expect(state.evidence).toBeNull();
  });

  it('rejects acceptance that belongs to a different run', () => {
    const state = {
      result,
      acceptance: {
        runId: 'different-run',
        accepted: true as const,
        acceptedAt: now.toISOString(),
      },
      evidence: null,
      updatedAt: now.toISOString(),
    };

    expect(resumeStateSchema.safeParse(state).success).toBe(false);
  });

  it('rejects outcome evidence before explicit acceptance', () => {
    const state = {
      result,
      acceptance: null,
      evidence: {
        runId: result.id,
        timeSavedMinutes: 10,
        stepsRemoved: 1,
        clarityGain: 4,
        outputProduced: true,
        wouldUseAgain: true,
        recordedAt: now.toISOString(),
      },
      updatedAt: now.toISOString(),
    };

    expect(resumeStateSchema.safeParse(state).success).toBe(false);
  });
});
