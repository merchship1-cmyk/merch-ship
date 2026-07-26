import { describe, expect, it } from 'vitest';

import { createMockTransformation } from './mockTransformation';

describe('createMockTransformation', () => {
  it('preserves the input and returns the full execution loop', () => {
    const result = createMockTransformation(
      '  Turn my rough service idea into a usable first offer.  ',
      new Date('2026-07-22T12:00:00.000Z'),
    );

    expect(result.sourceInput).toBe(
      'Turn my rough service idea into a usable first offer.',
    );
    expect(result.plan.length).toBeGreaterThanOrEqual(3);
    expect(result.createdOutput.body.length).toBeGreaterThan(20);
    expect(result.schedule.length).toBeGreaterThanOrEqual(2);
    expect(result.review.successCriteria.length).toBeGreaterThanOrEqual(2);
  });
});
