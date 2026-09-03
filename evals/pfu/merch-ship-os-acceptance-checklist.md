# MERCH SHIP OS v1 Acceptance Checklist

## Structural admission

- [ ] System registration conforms to `contracts/pfu/system-registration.schema.yaml`.
- [ ] `MERCH-SHIP-OS` is registered beneath `PFU-DOMAIN-MERCH-SHIP` without replacing BMOS/PFU authority.
- [ ] Product catalog declares exactly 12 governed product objects.
- [ ] Product catalog explicitly accounts for the 13 commercial SKU identities created by the two-component limited family object.
- [ ] Every commercial SKU follows `ENGINE-PRODUCT-DESIGN-VERSION-Q4`.
- [ ] Product lifecycle is explicit and cannot skip directly from CANDIDATE to ACTIVE without gate evidence.

## Delivery rail

- [ ] Paid/low-risk/available inventory can resolve only to a prepared fulfillment decision before live runtime authority exists.
- [ ] High-risk orders fail closed to `HOLD_REVIEW`.
- [ ] Out-of-stock or negative inventory fails closed to `HOLD_REVIEW`.
- [ ] Unknown provider mapping fails closed to `HOLD_REVIEW`.
- [ ] External fulfillment mutation requires an idempotency key.
- [ ] Duplicate external fulfillment mutation is denied.
- [ ] Delivery confirmation requires a verified fulfilled/tracking event.

## Asset and operational SSOT

- [ ] Asset vault folder contract is deterministic.
- [ ] Design naming omits Q4 unless the asset itself is quarter-specific.
- [ ] Commercial SKU naming retains Q4.
- [ ] Operational registry contains Engine, Product Type, Winner Category, Design Name, SKU Name, Print Provider, Cost, Retail, Mockup Link, and Status.
- [ ] Platform aliases cannot silently replace canonical SKU identity.

## Governance

- [ ] Default decision is DENY.
- [ ] Auto-publish is disabled.
- [ ] Live auto-fulfillment is disabled.
- [ ] Customer messaging is disabled until separately authorized.
- [ ] Secrets are prohibited from repository, governance, and evidence records.
- [ ] Cross-domain ZENZY/Prometheus references do not create inherited authority.
- [ ] Merge requires explicit Founder authority.
- [ ] Runtime activation requires explicit Founder authority.

## Live-runtime prerequisites — not satisfied by structural installation

- [ ] Shopify adapter authorized and attached.
- [ ] Provider credentials configured outside repository.
- [ ] Printify/Gelato product and variant mappings verified.
- [ ] Shopify SKU/product mappings verified.
- [ ] Drive vault created and links projected into the operational registry.
- [ ] Operational Airtable/Notion registry created and populated.
- [ ] Bounded test order proves fulfillment routing and duplicate-mutation protection.
- [ ] Tracking event proves delivery-confirmation evidence.
- [ ] Founder explicitly authorizes runtime activation.

## Verdict vocabulary

- `STRUCTURAL_PASS`: architecture/contracts are internally consistent.
- `RUNTIME_NOT_ATTACHED`: external adapters are intentionally dormant.
- `HOLD`: a required structural or authority invariant failed.
- `LIVE_RUNTIME_PASS`: reserved for separately authorized end-to-end external proof.

Structural PASS must never be relabeled as live runtime PASS.
