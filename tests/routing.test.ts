import { describe, expect, test } from 'vitest';
import { MerchShipAgent } from '../agent/merch-ship.agent';
import { MERCH_SHIP_ROUTING_TABLE } from '../routing/routing.table';
import { resolveTrack } from '../routing/routing.validator';

describe('MERCH SHIP canonical routing', () => {
  test.each(Object.entries(MERCH_SHIP_ROUTING_TABLE))(
    'routes %s to %s',
    (signalType, track) => {
      expect(resolveTrack(signalType)).toBe(track);
    },
  );

  test.each([
    'newproduct',
    'newpost',
    'newpricingtier',
    'newcollection',
    'newcomment',
    'newsale',
    'newaudiencesignal',
    'invalid',
    '',
  ])('rejects drifted or unknown signal type %s', (signalType) => {
    expect(resolveTrack(signalType)).toBeNull();
  });

  test('agent returns an inert decision for a valid signal', () => {
    const agent = new MerchShipAgent();
    const decision = agent.route({
      id: '123e4567-e89b-12d3-a456-426614174000',
      type: 'new_product',
      timestamp: 1_786_386_000_000,
      payload: {},
    });

    expect(decision?.status).toBe('INERT');
    expect(decision?.track).toBe('productization');
    expect(decision?.stageIds).toEqual([
      'productization.validate_signal',
      'productization.define_product_card',
      'productization.define_supporting_artifacts',
    ]);
  });

  test('agent fails closed for an invalid signal', () => {
    expect(new MerchShipAgent().route({ type: 'new_product' })).toBeNull();
  });
});
