# B.MAZING Five-Module Pack v1.0

Status: CANON CANDIDATE / BLUE  
Owner: Ryan Richard Levack-Carr  
Parent governance: PFU Fullstack Agentic Stack

## Canonical definition

The B.MAZING Five-Module Pack is the bounded product-system spine that governs how B.MAZING product families are registered, assembled from templates, used to activate creators, priced, and routed to distribution surfaces.

## Modules

1. **Product Family Registry** — source of truth for families, SKUs, tiers, assets, surfaces, and activation flags.
2. **Template Engine** — governs reusable worksheets, scripts, creator tools, workflow packs, and activation assets.
3. **Creator Activation Module** — moves a participant through identity formation, first creation, repeatable building, and governed expansion.
4. **Pricing Logic** — defines tier relationships, bundle rules, discount boundaries, currency handling, and price-approval gates.
5. **Distribution Module** — maps approved SKUs to Gumroad, Shopify, PFU Commerce Plane, and controlled narrative surfaces.

## Shared execution spine

1. Register the product family and SKU.
2. Bind approved templates and workflows.
3. Bind the creator activation path and milestones.
4. Resolve the approved tier and price record.
5. Resolve permitted distribution channels.
6. Validate assets, claims, ownership, and delivery requirements.
7. Record evidence.
8. Apply RED, BLUE, or GREEN release verdict.
9. Publish or synchronize only when explicit matching authority exists.

## Boundaries

- This installation creates contracts and registry structures only.
- It does not create live Gumroad or Shopify products.
- It does not set commercial price amounts without an approved price record.
- It does not activate runtime automations, deployment, production distribution, or public release.
- It does not alter `todo-app/` or application infrastructure.

## Sources of truth

- **Notion:** B.MAZING operating context, human-readable registry, ownership, product decisions, and activation status.
- **GitHub:** versioned manifest, module contracts, acceptance checks, and release history.
- **Commerce platforms:** channel-native IDs and live commercial state only after explicit activation.

## Installation map

- `bmazing-system.manifest.yaml`
- `registry/bmazing/product-family-registry.yaml`
- `templates/bmazing/template-engine.yaml`
- `modules/bmazing/creator-activation.yaml`
- `commerce/bmazing/pricing-logic.yaml`
- `distribution/bmazing/distribution-module.yaml`
- `evals/bmazing/acceptance-checklist.md`

## Current verdict

The subsystem remains BLUE until registry records are populated, commercial decisions are approved, acceptance evidence is complete, and an authorized release gate explicitly enables each requested surface.
