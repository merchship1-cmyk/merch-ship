# MERCH SHIP Operating System Architecture

MERCH SHIP is a software-powered commercial organism organized into modular lanes. Each lane has one bounded responsibility and can be expanded without drifting into unrelated commercial logic.

## Core Runtime

- `src/index.js` starts the Node.js HTTP service.
- `src/http/router.js` exposes API-first module endpoints.
- `src/config/env.js` centralizes environment-backed runtime configuration.
- `src/modules/` contains the governed commercial modules.
- `src/utils/` contains shared pure utilities used by multiple modules.

## Core Modules

| Module | Folder | Responsibility |
| --- | --- | --- |
| `SYNC.NODE.COMMERCE` | `src/modules/sync-node-commerce/` | Prevents drift across offers, pricing, messaging, proof, and delivery. |
| `PRODUCT_FACTORY` | `src/modules/product-factory/` | Generates product specs, metadata, versioning, and distribution manifests. |
| `OFFER_ENGINE` | `src/modules/offer-engine/` | Aligns value props, pricing, margins, and storefront messaging. |
| `PROOF_ENGINE` | `src/modules/proof-engine/` | Captures proof and routes it to approved ecosystem surfaces. |
| `DELIVERY_ENGINE` | `src/modules/delivery-engine/` | Verifies deliverables match the commercial promise. |
| `CREATOR_TOOLS` | `src/modules/creator-tools/` | Provides calculators and dashboard-ready utility payloads. |
| `AUTOMATION_CORE` | `src/modules/automation-core/` | Registers scheduled and manual automation jobs. |
| `AI_CORE` | `src/modules/ai-core/` | Builds prompt payloads for AI assistants and generators. |

## Drift Prevention Contract

`SYNC.NODE.COMMERCE` is the first sync node. It calls the offer, proof, and delivery engines and returns either:

- `synced` when the commercial lanes align.
- `drift_detected` when any lane is blocked, unverified, under-delivered, or mismatched.

This keeps pricing, messaging, proof, and delivery from evolving independently.

## Expansion Rules

1. Add new modules under `src/modules/<module-name>/`.
2. Export public module functions through `src/modules/index.js`.
3. Add API routes in `src/http/router.js` only after the module has a pure function interface.
4. Add tests under `tests/` for every new module behavior.
5. Add documentation in `docs/` when a module changes system architecture.
