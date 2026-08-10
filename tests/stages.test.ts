import { describe, expect, test } from 'vitest';
import { MERCH_SHIP_ROUTING_TABLE } from '../routing/routing.table';
import { MERCH_SHIP_STAGE_DEFINITIONS } from '../stages/stage.definitions';
import { validateStage } from '../validators/stage.validator';

describe('deterministic stage definitions', () => {
  test('defines stages for every routed track', () => {
    const routedTracks = new Set(Object.values(MERCH_SHIP_ROUTING_TABLE));
    expect(new Set(Object.keys(MERCH_SHIP_STAGE_DEFINITIONS))).toEqual(routedTracks);
  });

  test.each(Object.entries(MERCH_SHIP_STAGE_DEFINITIONS))(
    '%s stages are valid and unique',
    (_track, stages) => {
      expect(stages.length).toBeGreaterThan(0);
      expect(stages.every(validateStage)).toBe(true);
      expect(new Set(stages.map((stage) => stage.id)).size).toBe(stages.length);
    },
  );

  test('definitions contain no execution or integration fields', () => {
    const serialized = JSON.stringify(MERCH_SHIP_STAGE_DEFINITIONS);
    expect(serialized).not.toContain('webhook');
    expect(serialized).not.toContain('credential');
    expect(serialized).not.toContain('endpoint');
    expect(serialized).not.toContain('deployment');
  });
});
