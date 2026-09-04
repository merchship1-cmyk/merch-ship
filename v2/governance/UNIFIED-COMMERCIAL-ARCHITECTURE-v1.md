# Unified Commercial Architecture v1

Status: `DRAFT / CODE-CONTRACTED / A2 PREPARATION ONLY / NON-PRODUCTION`

## Purpose

UCA binds the existing governed commercial stack into one typed architecture without collapsing architecture, engines, protocols, evidence, money lifecycle, or records into the same concept.

The architecture preserves the constitutional separation:

```text
Founder Intent
  ↓
GOV-OS Authority
  ↓
PFU Product Identity / Lifecycle / Rights
  ↓
ZENZY Governed Planning / Routing / Execution
  ↓
Production + Commercial Planning Engines
  ↓
Overseer Supervision ──────┐
  ↓                        │
Prometheus Evidence ◄──────┘
  ↓
PFU Lifecycle Update
  ↓
GOV-OS Commercial Gate
  ↓
MERCHSHIP Commercialization
  ↓
Storefront / Funnel / CRM
  ↓
Referral / Attribution / Transaction
  ↓
Commission / Payout / Finance / Reconciliation
  ↓
Unified Commercial Record
```

UCA does not create authority. It binds already-governed domains and makes their boundaries explicit.

## Component classification

UCA v1 uses six component kinds:

- `ARCHITECTURE`
- `ENGINE_CANDIDATE`
- `PROTOCOL`
- `RECORD_SCHEMA`
- `EVIDENCE_PLANE`
- `MONEY_LIFECYCLE`

This prevents every useful sequence or abstraction from being incorrectly promoted into an independent runtime engine.

## Engine candidates installed in the UCA registry

### GCOSE — Governed Commercial OS Engine
Coordinates governed commercial preparation. GOV-OS remains the authority owner. GCOSE may not bypass policy, publish, transact, mutate production, or create authority.

### IIS — Incubation / Isolation / Saturation Engine
Models incubation, containment/isolation, and controlled expansion planning. `Saturation` is a planning identity and does not authorize autonomous market deployment.

### Overseer Engine
Supervises bounded execution signals and may recommend `FREEZE_AND_ESCALATE` when drift, loops, recursion, or evidence gaps are detected.

Overseer is intentionally separated from:

- Prometheus evidence verification
- GOV-OS authorization
- policy mutation
- production execution

It cannot declare evidence verified or authorize a protected action.

### DCR-EVO-UNI
Retained as an Engine 00/root identity only. UCA v1 admits no autonomous evolution, self-modification, policy mutation, or production-control semantics for this identity.

## Existing Unified Commercial Engine stack retained

PR #46 already code-contracts:

- Jungle BMOS
- Black Vein
- Teraformance
- Quantum Systems
- Mercury
- Morpheus
- Neo
- QTCE — Quantum–Teraformance Commercial Engine

Those contracts remain unchanged. UCA wraps them; it does not duplicate them.

The current commercial engine runtime ceiling remains `A2`.

## Four-verb constructs normalized as protocols

### Define → Authorize → Execute → Evidence
Cross-system constitutional protocol.

- Define: Founder/PFU/ZENZY intent and object definition
- Authorize: GOV-OS
- Execute: ZENZY within admitted authority
- Evidence: Prometheus

This is not a separate authority-bearing engine.

### Detect → Freeze → Correct → Resume
Stability protocol.

- Detect: Overseer/Prometheus signal
- Freeze: fail-closed recommendation/control
- Correct: bounded remediation under authority
- Resume: explicit governed decision

Resume is never automatic.

### Generate → Package → Price → Commercial Gate → Publish
Commercial preparation protocol.

The explicit `Commercial Gate` is mandatory. Generate/package/price preparation never implies public publishing authority.

### Route → Execute → Validate → Record
ZENZY/Prometheus workflow protocol. It remains constrained by AUTONOMOUS-OS and cannot cross the A3 admission boundary.

### Observe → Correlate → Evaluate → Governed Decision
Prometheus may observe, correlate, and evaluate evidence. Protected decisions remain GOV-OS decisions.

## Maturity model

Every UCA component progresses independently through:

```text
DEFINED
  ↓
CODE_CONTRACTED
  ↓ evidence
TESTED
  ↓ evidence
VERIFIED
  ↓ evidence
CONNECTED
  ↓ evidence + explicit GOV-OS authorization
PRODUCTION_AUTHORIZED
```

Rules:

- no state skipping
- `TESTED` and above require retained evidence
- `PRODUCTION_AUTHORIZED` requires explicit GOV-OS authorization
- architecture membership does not imply runtime verification
- a draft/candidate product cannot be promoted merely because it is represented in the UCA

## Unified Commercial Record

The typed record can bind identifiers for:

```text
Product
→ Offer
→ Listing
→ Transaction
→ Attribution
→ Entitlement
→ Fulfillment
→ Commission
→ Finance
→ Evidence
→ Reconciliation
```

Identifiers are references only. Presence of an identifier does not prove the lifecycle event occurred or was verified.

## Unified Money Chain

The explicit money lifecycle is:

```text
REFERRAL_OBSERVED
→ ATTRIBUTION_RECORDED
→ TRANSACTION_OBSERVED
→ TRANSACTION_VERIFIED
→ COMMISSION_ELIGIBLE
→ COMMISSION_APPROVED
→ PAYOUT_RECORDED
→ RECONCILED
```

The code contract rejects state skipping and requires evidence for verified transaction, commission, payout, and reconciliation states.

Therefore:

`CLICK != SALE`

`SALE OBSERVED != VERIFIED SALE`

`VERIFIED SALE != COMMISSION`

`COMMISSION != PAYOUT`

`PAYOUT != RECONCILIATION`

## Protected actions

At UCA v1 / AUTONOMOUS-OS A2, the following remain denied:

- public publish
- price change
- legal-term change
- customer financial execution
- production deployment
- production data mutation
- authority expansion

They return the current boundary reason:

`A3_EXECUTION_NOT_ADMITTED`

## What changed

UCA v1 refines the architecture in five ways:

1. separates architecture, engines, protocols, records, evidence, and money lifecycle
2. installs GCOSE, IIS, Overseer, and DCR-EVO-UNI as bounded engine candidates rather than verified runtime engines
3. makes Overseer fail-closed and non-authoritative
4. installs evidence-gated maturity and money-chain transitions
5. preserves the existing QTCE/Mercury/Morpheus/Neo commercial engine contracts instead of duplicating them

## What did not change

- GOV-OS remains the protected authority plane.
- PFU remains product identity/lifecycle/rights authority.
- ZENZY remains governed planning/routing/execution.
- Prometheus remains evidence/provenance/audit truth, not protected authorization.
- MERCHSHIP remains commercialization, not PFU.
- Specialized production engines retain their own internal implementations.
- PR #46 remains non-production and A2-bounded.
- Draft inventory and commercialization candidates remain draft unless separately evidenced and authorized.

## Installation files

- `v2/src/domain/unifiedCommercialArchitecture.ts`
- `v2/src/services/ucaGovernance.ts`
- `v2/src/services/ucaGovernance.test.ts`
- `v2/governance/UNIFIED-COMMERCIAL-ARCHITECTURE-v1.md`

## Current classification

`IMPLEMENTED AS CODE CONTRACT != TESTED != VERIFIED != CONNECTED != PRODUCTION-AUTHORIZED`

The next permitted promotion is `CODE_CONTRACTED → TESTED`, and only if the repository verification workflow retains passing evidence for the exact head SHA.
