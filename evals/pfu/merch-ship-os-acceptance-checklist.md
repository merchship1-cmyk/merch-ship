# MERCH SHIP OS v1 Acceptance Checklist

## Structural admission

- [x] `MERCH-SHIP-OS` is registered beneath `PFU-DOMAIN-MERCH-SHIP` without replacing BMOS/PFU authority.
- [x] Product catalog declares exactly 12 governed product objects.
- [x] Product catalog explicitly accounts for the 13 commercial SKU identities created by the two-component limited family object.
- [x] Every commercial SKU follows `ENGINE-PRODUCT-DESIGN-VERSION-Q4`.
- [x] Product lifecycle is explicit and cannot skip directly from CANDIDATE to ACTIVE without gate evidence.
- [ ] Independent schema/CI validation of the complete branch is retained after draft PR creation.

## Delivery rail

- [x] Paid/low-risk/available inventory resolves only to a prepared fulfillment decision before live runtime authority exists.
- [x] High-risk orders fail closed to `HOLD_REVIEW`.
- [x] Out-of-stock or negative inventory fails closed to `HOLD_REVIEW`.
- [x] Unknown provider mapping fails closed to `HOLD_REVIEW`.
- [x] External fulfillment mutation requires an idempotency key by contract.
- [x] Duplicate external fulfillment mutation is denied by contract.
- [x] Delivery confirmation requires a verified fulfilled/tracking event by contract.

## Asset and operational SSOT

- [x] Asset vault folder contract is deterministic.
- [x] Google Drive vault and required folder structure are created and verified.
- [x] Design naming omits Q4 unless the asset itself is quarter-specific.
- [x] Commercial SKU naming retains Q4.
- [x] Notion operational registry is created and populated with all 12 governed product objects.
- [x] Operational registry contains Engine, Product Type, Winner Category, Design Name, SKU Name, Print Provider, Cost, Retail, Mockup Link, and Status.
- [x] Platform aliases cannot silently replace canonical SKU identity.
- [x] Unverified provider, cost, retail, and mockup values remain unclaimed.

## Governance

- [x] Default decision is DENY.
- [x] Auto-publish is disabled.
- [x] Live auto-fulfillment is disabled.
- [x] Customer messaging is disabled until separately authorized.
- [x] Secrets are prohibited from repository, governance, and evidence records.
- [x] Cross-domain ZENZY/Prometheus references do not create inherited authority.
- [x] Merge requires explicit Founder authority.
- [x] Runtime activation requires explicit Founder authority.

## Live-runtime prerequisites — still unsatisfied

- [ ] Shopify adapter authorized and attached.
- [ ] Provider credentials configured outside repository.
- [ ] Printify/Gelato product and variant mappings verified.
- [ ] Shopify SKU/product mappings verified.
- [ ] Product mockups/listing assets rendered and linked.
- [ ] Cost and retail values verified and recorded.
- [ ] Bounded test order proves fulfillment routing and duplicate-mutation protection.
- [ ] Tracking event proves delivery-confirmation evidence.
- [ ] Founder explicitly authorizes live commerce/runtime activation.

## Workspace projections — satisfied

- [x] Drive vault created and verified.
- [x] Notion operational registry created and populated.
- [x] GitHub remains executable SSOT; Notion and Drive are projections, not independent release authorities.

## Verdict vocabulary

- `STRUCTURAL_PASS`: architecture/contracts are internally consistent and workspace projections exist.
- `RUNTIME_NOT_ATTACHED`: external commerce/fulfillment adapters are intentionally dormant.
- `HOLD`: a required structural or authority invariant failed.
- `LIVE_RUNTIME_PASS`: reserved for separately authorized end-to-end external proof.

Structural PASS must never be relabeled as live runtime PASS.
