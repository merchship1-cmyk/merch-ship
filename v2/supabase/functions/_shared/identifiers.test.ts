import { describe, expect, it } from 'vitest';

import { isUuid } from './identifiers';

describe('ZENZY run identifier validation', () => {
  it('accepts canonical UUIDs', () => {
    expect(isUuid('8f0a5b6e-0063-4d4d-80b2-6f0da0af3b18')).toBe(true);
  });

  it('rejects malformed run identifiers before database lookup', () => {
    expect(isUuid('not-a-real-run-id')).toBe(false);
    expect(isUuid('')).toBe(false);
  });
});
