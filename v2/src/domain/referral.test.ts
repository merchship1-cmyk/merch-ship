import { describe, expect, it } from 'vitest';

import {
  evaluateCommissionEligibility,
  referralAttributionSchema,
  verifiedRetailSaleSchema,
} from './referral';

const attribution = referralAttributionSchema.parse({
  referralId: 'ref-001',
  affiliateId: 'affiliate-001',
  visitorId: 'visitor-001',
  offerId: 'offer-001',
  createdAt: '2026-08-31T18:00:00.000Z',
  source: 'pfu-link',
});

const paidSale = verifiedRetailSaleSchema.parse({
  saleId: 'sale-001',
  customerId: 'customer-001',
  offerId: 'offer-001',
  grossAmountMinor: 4700,
  currency: 'USD',
  paymentStatus: 'paid',
  occurredAt: '2026-08-31T18:05:00.000Z',
});

describe('PFU referral router eligibility', () => {
  it('approves a verified retail sale with matching attribution', () => {
    expect(evaluateCommissionEligibility({ attribution, sale: paidSale })).toEqual({
      eligible: true,
      reason: 'verified_retail_sale',
      referralId: 'ref-001',
      saleId: 'sale-001',
      affiliateId: 'affiliate-001',
    });
  });

  it('blocks sales without attribution', () => {
    expect(evaluateCommissionEligibility({ sale: paidSale })).toMatchObject({
      eligible: false,
      reason: 'no_attribution',
    });
  });

  it('blocks offer mismatch', () => {
    expect(
      evaluateCommissionEligibility({
        attribution: { ...attribution, offerId: 'offer-999' },
        sale: paidSale,
      }),
    ).toMatchObject({ eligible: false, reason: 'offer_mismatch' });
  });

  it('blocks refunded and other non-paid transactions', () => {
    expect(
      evaluateCommissionEligibility({
        attribution,
        sale: { ...paidSale, paymentStatus: 'refunded' },
      }),
    ).toMatchObject({ eligible: false, reason: 'payment_not_paid' });
  });

  it('blocks self-referrals', () => {
    expect(
      evaluateCommissionEligibility({
        attribution,
        sale: { ...paidSale, customerId: 'affiliate-001' },
      }),
    ).toMatchObject({ eligible: false, reason: 'self_referral_blocked' });
  });
});
