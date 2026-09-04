import { z } from 'zod';

export const UCA_VERSION = '1.0.0-draft' as const;

export const ucaComponentKindSchema = z.enum([
  'ARCHITECTURE',
  'ENGINE_CANDIDATE',
  'PROTOCOL',
  'RECORD_SCHEMA',
  'EVIDENCE_PLANE',
  'MONEY_LIFECYCLE',
]);
export type UcaComponentKind = z.infer<typeof ucaComponentKindSchema>;

export const ucaMaturitySchema = z.enum([
  'DEFINED',
  'CODE_CONTRACTED',
  'TESTED',
  'VERIFIED',
  'CONNECTED',
  'PRODUCTION_AUTHORIZED',
]);
export type UcaMaturity = z.infer<typeof ucaMaturitySchema>;

export const ucaComponentIdSchema = z.enum([
  'UCA',
  'GCOSE',
  'IIS',
  'OVERSEER',
  'DCR_EVO_UNI',
  'DEFINE_AUTHORIZE_EXECUTE_EVIDENCE',
  'DETECT_FREEZE_CORRECT_RESUME',
  'GENERATE_PACKAGE_PRICE_PUBLISH',
  'ROUTE_EXECUTE_VALIDATE_RECORD',
  'OBSERVE_CORRELATE_EVALUATE_DECIDE',
  'UNIFIED_COMMERCIAL_RECORD',
  'UNIFIED_EVIDENCE_PLANE',
  'UNIFIED_MONEY_CHAIN',
]);
export type UcaComponentId = z.infer<typeof ucaComponentIdSchema>;

export const ucaAuthorityOwnerSchema = z.enum([
  'FOUNDER_INTENT',
  'GOV_OS',
  'PFU',
  'ZENZY',
  'OVERSEER',
  'PROMETHEUS',
  'MERCHSHIP',
  'FINANCE',
]);
export type UcaAuthorityOwner = z.infer<typeof ucaAuthorityOwnerSchema>;

export const ucaComponentSchema = z.object({
  id: ucaComponentIdSchema,
  displayName: z.string().min(1),
  kind: ucaComponentKindSchema,
  maturity: ucaMaturitySchema,
  role: z.string().min(1),
  authorityOwners: z.array(ucaAuthorityOwnerSchema).min(1),
  runtimeCeiling: z.literal('A2'),
  prohibitedClaims: z.array(z.string().min(1)).min(1),
});
export type UcaComponent = z.infer<typeof ucaComponentSchema>;

export const UCA_COMPONENT_REGISTRY: readonly UcaComponent[] = [
  {
    id: 'UCA',
    displayName: 'Unified Commercial Architecture',
    kind: 'ARCHITECTURE',
    maturity: 'CODE_CONTRACTED',
    role: 'Binds governed product, execution, evidence, commercialization, money, and reconciliation domains without creating new authority.',
    authorityOwners: ['GOV_OS', 'PFU', 'ZENZY', 'PROMETHEUS', 'MERCHSHIP'],
    runtimeCeiling: 'A2',
    prohibitedClaims: [
      'Architecture membership does not imply runtime verification, connectivity, sellability, public availability, or production authorization.',
    ],
  },
  {
    id: 'GCOSE',
    displayName: 'Governed Commercial OS Engine',
    kind: 'ENGINE_CANDIDATE',
    maturity: 'CODE_CONTRACTED',
    role: 'Coordinates governed commercial preparation across existing authority, product, execution, evidence, and commercialization boundaries.',
    authorityOwners: ['GOV_OS'],
    runtimeCeiling: 'A2',
    prohibitedClaims: [
      'May not bypass GOV-OS, publish, transact, mutate production, or create authority.',
    ],
  },
  {
    id: 'IIS',
    displayName: 'Incubation / Isolation / Saturation Engine',
    kind: 'ENGINE_CANDIDATE',
    maturity: 'CODE_CONTRACTED',
    role: 'Models bounded incubation, isolation, and controlled expansion planning for candidate systems and products.',
    authorityOwners: ['GOV_OS', 'PFU'],
    runtimeCeiling: 'A2',
    prohibitedClaims: [
      'Saturation means controlled expansion planning only; no autonomous market deployment is admitted.',
    ],
  },
  {
    id: 'OVERSEER',
    displayName: 'Overseer Engine',
    kind: 'ENGINE_CANDIDATE',
    maturity: 'CODE_CONTRACTED',
    role: 'Supervises bounded execution signals, detects instability indicators, and recommends freeze/escalation without becoming the evidence or authority plane.',
    authorityOwners: ['OVERSEER', 'GOV_OS'],
    runtimeCeiling: 'A2',
    prohibitedClaims: [
      'Overseer may not authorize protected actions, declare evidence verified, mutate policy, or expand authority.',
    ],
  },
  {
    id: 'DCR_EVO_UNI',
    displayName: 'DCR-EVO-UNI',
    kind: 'ENGINE_CANDIDATE',
    maturity: 'CODE_CONTRACTED',
    role: 'Reserved root evolution/unification identity with no live execution semantics admitted by UCA v1.',
    authorityOwners: ['GOV_OS'],
    runtimeCeiling: 'A2',
    prohibitedClaims: [
      'The Engine 00 identity does not imply implemented autonomous evolution, self-modification, or production control.',
    ],
  },
  {
    id: 'DEFINE_AUTHORIZE_EXECUTE_EVIDENCE',
    displayName: 'Define → Authorize → Execute → Evidence',
    kind: 'PROTOCOL',
    maturity: 'CODE_CONTRACTED',
    role: 'Cross-system constitutional sequence from intent definition through governed execution to retained evidence.',
    authorityOwners: ['GOV_OS', 'ZENZY', 'PROMETHEUS'],
    runtimeCeiling: 'A2',
    prohibitedClaims: ['The protocol is not a separate authority-bearing engine.'],
  },
  {
    id: 'DETECT_FREEZE_CORRECT_RESUME',
    displayName: 'Detect → Freeze → Correct → Resume',
    kind: 'PROTOCOL',
    maturity: 'CODE_CONTRACTED',
    role: 'Stability protocol for detecting drift/loop/recursion/evidence gaps and escalating before governed resume.',
    authorityOwners: ['OVERSEER', 'PROMETHEUS', 'GOV_OS'],
    runtimeCeiling: 'A2',
    prohibitedClaims: ['Resume is not automatic and requires the applicable GOV-OS authority decision.'],
  },
  {
    id: 'GENERATE_PACKAGE_PRICE_PUBLISH',
    displayName: 'Generate → Package → Price → Commercial Gate → Publish',
    kind: 'PROTOCOL',
    maturity: 'CODE_CONTRACTED',
    role: 'Commercial preparation protocol with an explicit GOV-OS gate before any publish step.',
    authorityOwners: ['PFU', 'MERCHSHIP', 'GOV_OS'],
    runtimeCeiling: 'A2',
    prohibitedClaims: ['Generate, package, or price preparation never implies public publishing authority.'],
  },
  {
    id: 'ROUTE_EXECUTE_VALIDATE_RECORD',
    displayName: 'Route → Execute → Validate → Record',
    kind: 'PROTOCOL',
    maturity: 'CODE_CONTRACTED',
    role: 'ZENZY/Prometheus workflow protocol for bounded routing, execution, validation, and evidence recording.',
    authorityOwners: ['ZENZY', 'PROMETHEUS', 'GOV_OS'],
    runtimeCeiling: 'A2',
    prohibitedClaims: ['The protocol does not bypass the AUTONOMOUS-OS A3 admission boundary.'],
  },
  {
    id: 'OBSERVE_CORRELATE_EVALUATE_DECIDE',
    displayName: 'Observe → Correlate → Evaluate → Governed Decision',
    kind: 'PROTOCOL',
    maturity: 'CODE_CONTRACTED',
    role: 'Prometheus evidence sequence that culminates in a GOV-OS decision for protected transitions.',
    authorityOwners: ['PROMETHEUS', 'GOV_OS'],
    runtimeCeiling: 'A2',
    prohibitedClaims: ['Prometheus evaluation may inform but may not replace GOV-OS protected authorization.'],
  },
  {
    id: 'UNIFIED_COMMERCIAL_RECORD',
    displayName: 'Unified Commercial Record',
    kind: 'RECORD_SCHEMA',
    maturity: 'CODE_CONTRACTED',
    role: 'Evidence-linked record joining product, offer, listing, transaction, attribution, entitlement, fulfillment, commission, finance, and reconciliation identifiers.',
    authorityOwners: ['PFU', 'MERCHSHIP', 'PROMETHEUS', 'FINANCE'],
    runtimeCeiling: 'A2',
    prohibitedClaims: ['Presence of an identifier does not itself prove the referenced lifecycle event occurred or was verified.'],
  },
  {
    id: 'UNIFIED_EVIDENCE_PLANE',
    displayName: 'Unified Evidence Plane',
    kind: 'EVIDENCE_PLANE',
    maturity: 'CODE_CONTRACTED',
    role: 'Prometheus-centered evidence, provenance, trace, verification, audit, and reconciliation binding across UCA.',
    authorityOwners: ['PROMETHEUS', 'GOV_OS'],
    runtimeCeiling: 'A2',
    prohibitedClaims: ['Evidence collection does not itself grant production or commercial authority.'],
  },
  {
    id: 'UNIFIED_MONEY_CHAIN',
    displayName: 'Unified Money Chain',
    kind: 'MONEY_LIFECYCLE',
    maturity: 'CODE_CONTRACTED',
    role: 'Separates referral, attribution, transaction observation, transaction verification, commission eligibility/approval, payout recording, and reconciliation.',
    authorityOwners: ['MERCHSHIP', 'PROMETHEUS', 'GOV_OS', 'FINANCE'],
    runtimeCeiling: 'A2',
    prohibitedClaims: ['Click, referral, checkout intent, or observed transaction may not be represented as verified sale, commission, or payout without required evidence.'],
  },
] as const;

export const unifiedCommercialRecordSchema = z.object({
  recordId: z.string().min(1),
  productId: z.string().min(1),
  offerId: z.string().min(1).optional(),
  listingId: z.string().min(1).optional(),
  transactionId: z.string().min(1).optional(),
  attributionId: z.string().min(1).optional(),
  entitlementId: z.string().min(1).optional(),
  fulfillmentId: z.string().min(1).optional(),
  commissionId: z.string().min(1).optional(),
  financeRecordId: z.string().min(1).optional(),
  reconciliationId: z.string().min(1).optional(),
  evidenceIds: z.array(z.string().min(1)),
  lifecycleMaturity: ucaMaturitySchema,
});
export type UnifiedCommercialRecord = z.infer<typeof unifiedCommercialRecordSchema>;

export const moneyChainStateSchema = z.enum([
  'REFERRAL_OBSERVED',
  'ATTRIBUTION_RECORDED',
  'TRANSACTION_OBSERVED',
  'TRANSACTION_VERIFIED',
  'COMMISSION_ELIGIBLE',
  'COMMISSION_APPROVED',
  'PAYOUT_RECORDED',
  'RECONCILED',
]);
export type MoneyChainState = z.infer<typeof moneyChainStateSchema>;

export const MONEY_CHAIN_ORDER: readonly MoneyChainState[] = [
  'REFERRAL_OBSERVED',
  'ATTRIBUTION_RECORDED',
  'TRANSACTION_OBSERVED',
  'TRANSACTION_VERIFIED',
  'COMMISSION_ELIGIBLE',
  'COMMISSION_APPROVED',
  'PAYOUT_RECORDED',
  'RECONCILED',
] as const;

export function getUcaComponent(id: UcaComponentId): UcaComponent {
  const component = UCA_COMPONENT_REGISTRY.find((item) => item.id === id);
  if (component === undefined) {
    throw new Error(`Unknown UCA component: ${id}`);
  }
  return component;
}
