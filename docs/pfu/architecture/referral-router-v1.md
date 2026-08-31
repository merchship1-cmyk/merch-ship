# PFU Referral Router v1

Status: BUILD / BLUE CANDIDATE
Owner: Ryan Richard Levack-Carr
Parent: PFU Fullstack Agentic Stack

## Purpose

PFU Referral Router v1 records and evaluates referral attribution for genuine retail transactions. It does not pay commissions, recruit affiliates, activate production runtime, or authorize deployment.

## Core flow

Tracked PFU link
→ referral attribution
→ retail offer
→ customer transaction
→ verified paid sale
→ attribution validation
→ commission eligibility decision
→ downstream commission ledger (future gated capability)

## Compensation boundary

The router may mark a transaction eligible only when:

- a valid referral attribution exists;
- the attributed offer matches the purchased offer;
- the transaction is in paid state;
- the affiliate is not the customer on the transaction.

The router must not award compensation for recruitment, affiliate sign-up, account activation, or purchase of participation rights.

## Explicit non-authority

This slice does not authorize:

- Supabase migration or schema mutation;
- production runtime activation;
- payment processing or payouts;
- commission amount calculation;
- public release;
- affiliate enrollment rules;
- multi-level/downline compensation;
- secrets or webhook mutation.

## Runtime evidence required before GREEN

1. Unit tests for eligible and blocked cases.
2. Persistence design and RLS review.
3. Idempotent attribution handling.
4. Duplicate-sale prevention.
5. Refund/chargeback reversal behavior.
6. Fraud/self-referral controls.
7. Commission policy approval.
8. Founder release authorization.

## Current state

```text
PFU_REFERRAL_ROUTER = BUILD
PFU_RELEASE_STATE = BLUE
COMMISSION_ELIGIBILITY_LOGIC = IMPLEMENTED_CANDIDATE
COMMISSION_CALCULATION = NOT_IMPLEMENTED
PAYOUTS = NOT_IMPLEMENTED
DATABASE_MUTATION = NOT_AUTHORIZED
RUNTIME_ACTIVATION = NOT_AUTHORIZED
DEPLOYMENT = NOT_AUTHORIZED
```
