export const MERCH_SHIP_ROUTING_TABLE = {
  new_product: 'productization',
  new_post: 'distribution',
  new_pricing_tier: 'pricing',
  new_collection: 'onboarding',
  new_comment: 'review',
  new_dm: 'onboarding',
  new_sale: 'purchase',
  new_audience_signal: 'distribution',
} as const;

export type MerchShipSignalType = keyof typeof MERCH_SHIP_ROUTING_TABLE;
export type MerchShipTrackName =
  (typeof MERCH_SHIP_ROUTING_TABLE)[MerchShipSignalType];
