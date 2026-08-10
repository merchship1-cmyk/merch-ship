import type { MerchShipTrackName } from '../routing/routing.table';
import type { MerchShipStage } from '../schemas/stage.schema';

type StageDefinitions = Readonly<
  Record<MerchShipTrackName, readonly MerchShipStage[]>
>;

export const MERCH_SHIP_STAGE_DEFINITIONS = {
  onboarding: [
    {
      id: 'onboarding.validate_signal',
      name: 'Validate onboarding signal',
      description: 'Validate the canonical input contract without external I/O.',
      inputs: ['signal'],
      outputs: ['validated_signal'],
    },
    {
      id: 'onboarding.define_corridor',
      name: 'Define onboarding corridor',
      description: 'Describe the inert onboarding corridor artifact contract.',
      inputs: ['validated_signal'],
      outputs: ['onboarding_corridor_spec'],
    },
    {
      id: 'onboarding.define_cta',
      name: 'Define onboarding CTA',
      description: 'Describe the inert CTA artifact contract.',
      inputs: ['onboarding_corridor_spec'],
      outputs: ['cta_spec'],
    },
  ],
  purchase: [
    {
      id: 'purchase.validate_signal',
      name: 'Validate purchase signal',
      description: 'Validate the canonical input contract without processing a sale.',
      inputs: ['signal'],
      outputs: ['validated_signal'],
    },
    {
      id: 'purchase.define_chamber',
      name: 'Define purchase chamber',
      description: 'Describe the inert purchase chamber contract.',
      inputs: ['validated_signal'],
      outputs: ['purchase_chamber_spec'],
    },
    {
      id: 'purchase.define_follow_up',
      name: 'Define purchase follow-up',
      description: 'Describe receipt and follow-up CTA contracts without dispatch.',
      inputs: ['purchase_chamber_spec'],
      outputs: ['receipt_spec', 'follow_up_cta_spec'],
    },
  ],
  review: [
    {
      id: 'review.validate_signal',
      name: 'Validate review signal',
      description: 'Validate the canonical input contract without scheduling work.',
      inputs: ['signal'],
      outputs: ['validated_signal'],
    },
    {
      id: 'review.define_chamber',
      name: 'Define review chamber',
      description: 'Describe the inert review chamber contract.',
      inputs: ['validated_signal'],
      outputs: ['review_chamber_spec'],
    },
    {
      id: 'review.define_trust',
      name: 'Define trust artifact',
      description: 'Describe the inert trust artifact contract.',
      inputs: ['review_chamber_spec'],
      outputs: ['trust_chamber_spec'],
    },
  ],
  distribution: [
    {
      id: 'distribution.validate_signal',
      name: 'Validate distribution signal',
      description: 'Validate the canonical input contract without publishing.',
      inputs: ['signal'],
      outputs: ['validated_signal'],
    },
    {
      id: 'distribution.define_bundle',
      name: 'Define distribution bundle',
      description: 'Describe the inert distribution bundle contract.',
      inputs: ['validated_signal'],
      outputs: ['distribution_bundle_spec'],
    },
    {
      id: 'distribution.define_instructions',
      name: 'Define posting instructions',
      description: 'Describe posting instructions without platform dispatch.',
      inputs: ['distribution_bundle_spec'],
      outputs: ['posting_instruction_spec'],
    },
  ],
  pricing: [
    {
      id: 'pricing.validate_signal',
      name: 'Validate pricing signal',
      description: 'Validate the canonical input contract without changing prices.',
      inputs: ['signal'],
      outputs: ['validated_signal'],
    },
    {
      id: 'pricing.define_chamber',
      name: 'Define pricing chamber',
      description: 'Describe the inert pricing chamber contract.',
      inputs: ['validated_signal'],
      outputs: ['pricing_chamber_spec'],
    },
    {
      id: 'pricing.define_tier_logic',
      name: 'Define tier logic',
      description: 'Describe tier logic without commerce mutation.',
      inputs: ['pricing_chamber_spec'],
      outputs: ['tier_logic_spec'],
    },
  ],
  productization: [
    {
      id: 'productization.validate_signal',
      name: 'Validate productization signal',
      description: 'Validate the canonical input contract without creating a product.',
      inputs: ['signal'],
      outputs: ['validated_signal'],
    },
    {
      id: 'productization.define_product_card',
      name: 'Define product card',
      description: 'Describe the inert product card contract.',
      inputs: ['validated_signal'],
      outputs: ['product_card_spec'],
    },
    {
      id: 'productization.define_supporting_artifacts',
      name: 'Define supporting artifacts',
      description: 'Describe CTA, pricing, and distribution contracts without execution.',
      inputs: ['product_card_spec'],
      outputs: ['cta_spec', 'pricing_chamber_spec', 'distribution_bundle_spec'],
    },
  ],
} as const satisfies StageDefinitions;
