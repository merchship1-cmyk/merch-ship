import { describe, expect, it } from 'vitest';

import { createActiveRunSession, activeRunSessionSchema } from './activeRun';
import type { TransformationResult } from './transformation';

const result: TransformationResult = {
  id: 'run-123',
  sourceInput: 'Plan my MERCH SHIP launch',
  objective: 'Create a practical MERCH SHIP launch plan.',
  idea: {
    signal: 'A launch needs a clear sequence.',
    finishLine: 'A launch plan is ready to execute.',
  },
  plan: [
    {
      id: 'step-1',
      title: 'Define launch offer',
      action: 'Write the launch offer.',
      definitionOfDone: 'The offer is clear.',
    },
    {
      id: 'step-2',
      title: 'Prepare launch assets',
      action: 'Prepare the required launch assets.',
      definitionOfDone: 'Assets are ready.',
    },
    {
      id: 'step-3',
      title: 'Schedule launch',
      action: 'Choose and schedule the launch date.',
      definitionOfDone: 'The launch is scheduled.',
    },
  ],
  createdOutput: {
    title: 'MERCH SHIP Launch Plan',
    body: 'A practical launch plan.',
  },
  schedule: [
    {
      label: 'Prepare',
      action: 'Prepare launch materials.',
      durationMinutes: 30,
    },
    {
      label: 'Review',
      action: 'Review launch readiness.',
      durationMinutes: 15,
    },
  ],
  review: {
    prompt: 'Is the launch ready?',
    successCriteria: ['Offer is clear', 'Assets are ready'],
  },
  generatedAt: '2026-09-03T04:00:00.000Z',
};

describe('Zenzy active-run resume model', () => {
  it('stores an unfinished clarity run', () => {
    const session = createActiveRunSession(result);

    expect(activeRunSessionSchema.safeParse(session).success).toBe(true);
    expect(session.result.sourceInput).toBe('Plan my MERCH SHIP launch');
    expect(session.acceptance).toBeNull();
  });

  it('stores an accepted run that can resume execution', () => {
    const session = createActiveRunSession(result, {
      runId: result.id,
      accepted: true,
      acceptedAt: '2026-09-03T04:05:00.000Z',
    });

    expect(session.acceptance?.runId).toBe(result.id);
    expect(session.evidence).toBeNull();
  });

  it('stores completed evidence only when it belongs to the same run', () => {
    const session = createActiveRunSession(
      result,
      {
        runId: result.id,
        accepted: true,
        acceptedAt: '2026-09-03T04:05:00.000Z',
      },
      {
        runId: result.id,
        timeSavedMinutes: 20,
        stepsRemoved: 2,
        clarityGain: 4,
        outputProduced: true,
        wouldUseAgain: true,
        recordedAt: '2026-09-03T04:20:00.000Z',
      },
    );

    expect(activeRunSessionSchema.safeParse(session).success).toBe(true);
    expect(session.evidence?.runId).toBe(result.id);
  });

  it('rejects acceptance from a different run', () => {
    const parsed = activeRunSessionSchema.safeParse({
      version: 1,
      result,
      acceptance: {
        runId: 'different-run',
        accepted: true,
        acceptedAt: '2026-09-03T04:05:00.000Z',
      },
      evidence: null,
    });

    expect(parsed.success).toBe(false);
  });
});
