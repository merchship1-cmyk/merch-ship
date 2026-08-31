import { z } from 'zod';

export const referralAttributionSchema = z.object({
  referralId: z.string().min(3),
  affiliateId: z.string().min(1),
  visitorId: z.string().min(1),
  offerId: z.string().min(1),
  createdAt: z.string().datetime(),
  source: z.string().min(1).optional(),
});

export const verifiedRetailSaleSchema = z.object({
  saleId: z.string().min(1),
  customerId: z.string().min(1),
  offerId: z.string().min(1),
  grossAmountMinor: z.number().int().nonnegative(),
  currency: z.string().length(3),
  paymentStatus: z.enum(['paid', 'refunded', 'chargeback', 'cancelled']),
  occurredAt: z.string().datetime(),
});

export const commissionDecisionSchema = z.object({
  eligible: z.boolean(),
  reason: z.enum([
    'verified_retail_sale',
    'no_attribution',
    'offer_mismatch',
    'payment_not_paid',
    'self_referral_blocked',
  ]),
  referralId: z.string().min(1).optional(),
  saleId: z.string().min(1),
  affiliateId: z.string().min(1).optional(),
});

export type ReferralAttribution = z.infer<typeof referralAttributionSchema>;
export type VerifiedRetailSale = z.infer<typeof verifiedRetailSaleSchema>;
export type CommissionDecision = z.infer<typeof commissionDecisionSchema>;

export function evaluateCommissionEligibility(input: {
  attribution?: ReferralAttribution | null;
  sale: VerifiedRetailSale;
}): CommissionDecision {
  const { attribution, sale } = input;

  if (!attribution) {
    return {
      eligible: false,
      reason: 'no_attribution',
      saleId: sale.saleId,
    };
  }

  if (attribution.offerId !== sale.offerId) {
    return {
      eligible: false,
      reason: 'offer_mismatch',
      referralId: attribution.referralId,
      saleId: sale.saleId,
      affiliateId: attribution.affiliateId,
    };
  }

  if (sale.paymentStatus !== 'paid') {
    return {
      eligible: false,
      reason: 'payment_not_paid',
      referralId: attribution.referralId,
      saleId: sale.saleId,
      affiliateId: attribution.affiliateId,
    };
  }

  if (attribution.affiliateId === sale.customerId) {
    return {
      eligible: false,
      reason: 'self_referral_blocked',
      referralId: attribution.referralId,
      saleId: sale.saleId,
      affiliateId: attribution.affiliateId,
    };
  }

  return {
    eligible: true,
    reason: 'verified_retail_sale',
    referralId: attribution.referralId,
    saleId: sale.saleId,
    affiliateId: attribution.affiliateId,
  };
}
