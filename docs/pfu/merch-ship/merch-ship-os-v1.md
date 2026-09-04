# MERCH SHIP OS v1

## Status

STRUCTURAL CANDIDATE WITH ACTIVE WORKSPACE PROJECTIONS — the governed subsystem is installed on a bounded feature branch; the Notion operational registry and Google Drive asset-vault structure are created and verified. No merge, live Shopify mutation, fulfillment-provider mutation, customer messaging, production deployment, or production activation is authorized by this installation.

## Position in the unified architecture

```text
FOUNDER
  → PFU CONSTITUTION
    → PFU KERNEL
      → BMOS / GOV-OS constitutional controls
        → PFU-DOMAIN-MERCH-SHIP
          → MERCH-SHIP-OS
            → Product Family Registry
            → Delivery Rail
            → Asset Vault
            → Operational Registry Projection
            → Commercial Evidence
```

Downstream relationships are declared but not automatically activated:

```text
PFU product identity
  → MERCH SHIP operational state
    → Shopify commercial events
      → approved fulfillment provider
        → delivery evidence
          → Prometheus-compatible evidence projection
            → ZENZY entitlement/access projection when a separate contract authorizes it
```

A downstream reference does not create shared authority. ZENZY, Prometheus, Shopify, Printify, Gelato, Drive, Airtable, and Notion retain their own permissions and activation gates.

## Installed subsystem components

### 1. Product Family Registry

Canonical catalog: `manifests/pfu/merch-ship/q4-product-catalog-v1.yaml`.

Three product families are registered:

1. Ship While You Create
2. Product Factory Universe
3. Fulfillment That Does Not Break

The catalog contains 12 governed product objects. The final limited family object contains two fulfillment-addressable commercial SKUs, so the catalog has 13 commercial SKU identities while retaining 12 governed lifecycle objects.

Canonical commercial naming:

```text
ENGINE-PRODUCT-DESIGN-VERSION-Q4
```

Reusable source-design naming:

```text
ENGINE-PRODUCT-DESIGN-VERSION
```

No platform may silently rename a canonical SKU. A platform constraint must create an explicit alias mapping.

The 12 governed objects are also projected into the Notion operational registry. Provider mapping, cost, retail, and mockup evidence remain intentionally unclaimed until verified.

## 2. Delivery Rail

Contract: `flows/pfu/merch-ship/delivery-rail-v1.yaml`.

States:

```text
ORDER_OBSERVED
  → DELIVERY_READY
    → FULFILLMENT_REQUESTED
      → DELIVERY_CONFIRMED
```

Fail-closed states:

```text
HOLD_REVIEW
FAILED_RECOVERABLE
```

Bounded decisions:

- Paid + low risk + inventory available → prepare fulfillment.
- Fulfilled + tracking present → prepare delivery confirmation and evidence.
- High risk, unavailable inventory, negative inventory, unknown provider mapping, or missing write authority → HOLD_REVIEW.

Provider preferences are structural policy only until verified mappings and live adapters exist:

- Canada: Gelato preferred.
- United States: Printify preferred.
- EU: Gelato preferred.
- LaSalle, Ontario: domestic-Canada Gelato preference.
- Unknown/unverified provider resolution: HOLD_REVIEW.

Every external mutation must be bounded and idempotent.

Shopify, Printify, and Gelato adapters remain `NOT_ATTACHED`.

## 3. Asset Vault

Contract: `manifests/pfu/merch-ship/asset-vault-v1.yaml`.

The Google Drive vault has been created and its required folder structure verified. It remains private/not shared at installation time.

Canonical root:

```text
MERCH SHIP VAULT Q4/
├── 01_DESIGNS/
│   ├── ENGINE_1_SHIP/
│   ├── ENGINE_2_FACTORY/
│   └── ENGINE_3_FULFILL/
├── 02_MOCKUPS/
│   ├── FRONT/
│   ├── BACK/
│   └── LIFESTYLE/
├── 03_LISTINGS/
└── 04_ARCHIVE/
```

The operational registry projects these fields:

- Engine
- Product Type
- Winner Category
- Design Name
- SKU Name
- Print Provider
- Cost
- Retail
- Mockup Link
- Status

Lifecycle:

```text
CANDIDATE → PACKAGE_READY → OFFER_DEFINED → ACTIVE
                              ↘ HOLD
ACTIVE → RETIRED
```

## 4. SSOT boundaries

The subsystem uses a layered SSOT rather than pretending one platform owns everything:

- PFU/GitHub: canonical identity, contracts, authority, schemas, lifecycle rules.
- Notion: active human-control-plane and operational-registry projection.
- Drive: active governed folder projection for design/mockup/listing assets.
- Shopify: commercial event log only after live runtime attachment.
- Fulfillment provider: manufacturing/fulfillment execution only after live runtime attachment.
- Evidence layer: immutable references to commercial and delivery outcomes.

Airtable was not created because the Notion operational registry now fulfills the declared `Airtable_or_Notion` projection role.

## 5. Release and runtime gates

Structural installation and workspace projection do not authorize commerce.

Before any product reaches ACTIVE in a live store, require at minimum:

1. product-object contract validation;
2. verified provider variant mapping;
3. cost and retail recorded;
4. mockup/listing asset link recorded;
5. Shopify product/SKU mapping verified;
6. fulfillment routing test completed in a non-production or bounded test lane where available;
7. idempotency key and duplicate-mutation guard verified;
8. high-risk and out-of-stock hold behavior verified;
9. evidence destination verified;
10. explicit Founder runtime/release authorization.

## 6. Authority boundaries

The following remain DENIED by default:

- merge without explicit Founder authority;
- production deployment;
- auto-publish;
- live auto-fulfillment;
- production provider credential use;
- public release;
- customer messaging;
- destructive inventory/product mutation;
- cross-domain ZENZY/Prometheus authority inheritance.

`STRUCTURAL INSTALLATION != LIVE COMMERCE`

`CATALOG REGISTERED != PRODUCTS CREATED`

`DELIVERY CONTRACT INSTALLED != AUTO-FULFILLMENT ACTIVE`

`DRIVE VAULT CREATED != PRODUCT ASSETS RENDERED OR PUBLIC`

`NOTION REGISTRY CREATED != LIVE COMMERCE`

`PFU IDENTITY != SHOPIFY IMPLEMENTATION`
