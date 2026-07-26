import type { TransformationResult } from '../domain/transformation';

const compact = (value: string) => value.trim().replace(/\s+/g, ' ');

export function createMockTransformation(
  rawInput: string,
  now = new Date(),
): TransformationResult {
  const sourceInput = compact(rawInput).slice(0, 4000);
  const shortInput =
    sourceInput.length > 96 ? sourceInput.slice(0, 93) + '...' : sourceInput;

  return {
    id: 'mock-' + now.getTime(),
    sourceInput,
    objective: 'Move this work from an open loop into a finished first result.',
    idea: {
      signal: shortInput,
      finishLine:
        'A usable first version exists, its next actions are scheduled, and the result can be reviewed.',
    },
    plan: [
      {
        id: 'define',
        title: 'Define the finish line',
        action:
          'Write one sentence describing what must exist when this work is complete.',
        definitionOfDone: 'The outcome is observable and can be reviewed.',
      },
      {
        id: 'reduce',
        title: 'Remove nonessential work',
        action:
          'Keep only the decisions and actions required to produce the first usable version.',
        definitionOfDone: 'The path contains no optional setup or expansion.',
      },
      {
        id: 'build',
        title: 'Create the first usable version',
        action:
          'Use the execution brief below to complete the smallest real output.',
        definitionOfDone: 'A person can use or review the output immediately.',
      },
      {
        id: 'verify',
        title: 'Review the change',
        action:
          'Compare the result with the original mess and record the five Phase 0 evidence fields.',
        definitionOfDone: 'The transformation has a recorded before-and-after result.',
      },
    ],
    createdOutput: {
      title: 'First execution brief',
      body:
        'Outcome: ' +
        shortInput +
        '\n\nStart now: describe the smallest usable result in one sentence. Complete only the first action that makes that result real. Leave expansion for the review.',
    },
    schedule: [
      {
        label: 'Now',
        action: 'Write the finish line and complete the first physical action.',
        durationMinutes: 20,
      },
      {
        label: 'Next',
        action: 'Finish the smallest usable output without adding new scope.',
        durationMinutes: 30,
      },
      {
        label: 'Review',
        action: 'Record what changed and decide whether the result is usable.',
        durationMinutes: 10,
      },
    ],
    review: {
      prompt: 'Did this turn the original mess into a usable next result?',
      successCriteria: [
        'A real output now exists.',
        'The next actions are clear and scheduled.',
        'The five Phase 0 evidence fields can be recorded.',
      ],
    },
    generatedAt: now.toISOString(),
  };
}
