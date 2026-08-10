import { describe, expect, test } from 'vitest';
import { validateArtifact } from '../validators/artifact.validator';
import { validateSignal } from '../validators/signal.validator';
import { validateStage } from '../validators/stage.validator';
import { validateTrack } from '../validators/track.validator';

const validSignal = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  type: 'new_sale',
  timestamp: 1_786_386_000_000,
  payload: { order_id: 'order-1' },
};

const validStage = {
  id: 'purchase.validate_signal',
  name: 'Validate purchase signal',
  description: 'Validate a canonical signal without commerce execution.',
  inputs: ['signal'],
  outputs: ['validated_signal'],
};

describe('fail-closed validators', () => {
  test('accepts a complete canonical signal', () => {
    expect(validateSignal(validSignal)).toBe(true);
  });

  test.each([
    { ...validSignal, id: 'not-a-uuid' },
    { ...validSignal, type: 'newsale' },
    { ...validSignal, timestamp: Number.NaN },
    { ...validSignal, payload: [] },
    { ...validSignal, extra: true },
  ])('rejects malformed signal %#', (signal) => {
    expect(validateSignal(signal)).toBe(false);
  });

  test('accepts a complete deterministic stage', () => {
    expect(validateStage(validStage)).toBe(true);
  });

  test.each([
    { ...validStage, id: 'Invalid Stage' },
    { ...validStage, inputs: [] },
    { ...validStage, outputs: ['same', 'same'] },
    { ...validStage, extra: true },
  ])('rejects malformed stage %#', (stage) => {
    expect(validateStage(stage)).toBe(false);
  });

  test('accepts a complete track', () => {
    expect(
      validateTrack({ id: 'track.purchase', name: 'purchase', stages: [validStage] }),
    ).toBe(true);
  });

  test.each([
    { id: 'track.unknown', name: 'unknown', stages: [validStage] },
    { id: 'track.purchase', name: 'purchase', stages: [] },
    {
      id: 'track.purchase',
      name: 'purchase',
      stages: [validStage, validStage],
    },
    { id: 'track.purchase', name: 'purchase', stages: [validStage], extra: true },
  ])('rejects malformed track %#', (track) => {
    expect(validateTrack(track)).toBe(false);
  });

  test('accepts a complete artifact contract', () => {
    expect(
      validateArtifact({
        id: '123e4567-e89b-12d3-a456-426614174000',
        type: 'product_card',
        content: {},
        generatedAt: 1_786_386_000_000,
      }),
    ).toBe(true);
  });

  test.each([
    {
      id: '123e4567-e89b-12d3-a456-426614174000',
      type: 'productcard',
      content: {},
      generatedAt: 1_786_386_000_000,
    },
    {
      id: '123e4567-e89b-12d3-a456-426614174000',
      type: 'product_card',
      content: [],
      generatedAt: 1_786_386_000_000,
    },
    {
      id: '123e4567-e89b-12d3-a456-426614174000',
      type: 'product_card',
      content: {},
      generatedAt: Number.POSITIVE_INFINITY,
    },
  ])('rejects malformed artifact %#', (artifact) => {
    expect(validateArtifact(artifact)).toBe(false);
  });
});
