export const MERCH_SHIP_ARTIFACT_TYPES = [
  'cta',
  'pricing_chamber',
  'onboarding_corridor',
  'distribution_bundle',
  'product_card',
  'trust_chamber',
  'faq_chamber',
  'legal_chamber',
] as const;

export type MerchShipArtifactType = (typeof MERCH_SHIP_ARTIFACT_TYPES)[number];

export interface MerchShipArtifact {
  readonly id: string;
  readonly type: MerchShipArtifactType;
  readonly content: Readonly<Record<string, unknown>>;
  readonly generatedAt: number;
}
