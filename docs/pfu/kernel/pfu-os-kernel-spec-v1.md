# PFU OS Kernel Specification v1.0

**System:** PFU Fullstack Agentic Stack  
**Constitutional authority:** PFU Constitution v1.0  
**Constitutional subsystem:** BMOS  
**Status:** Constitutionally authorized / release BLUE  
**Ratification event:** `PFU-CONST-RAT-2026-08-05-001`

The PFU OS Kernel is the enforceable governance layer that binds BMOS constitutional capability to registered PFU domains.

The kernel is constitutionally authorized to enforce governance controls. This authorization does not activate application runtime, deployment, domain mutation, merge, infrastructure, secrets, workers, webhooks, or production execution.

## 0. Constitutional authority

The normative Constitution is `docs/pfu/constitution/pfu-constitution-v1.md`.

The ratification event is `evidence/pfu/pfu-constitution-ratification.event.yaml`.

Authority order:

`PFU CONSTITUTION → PFU KERNEL → BMOS INTEROPERABILITY CHARTER → CAPABILITY AND OPERATIONAL CONTRACTS → DOMAIN RUNTIMES → EVIDENCE → PFU THESIS`

The Constitution is supreme over the kernel. The kernel may validate and enforce constitutional requirements but may not amend the Constitution or manufacture authority.

## 1. Identity kernel

Recognized classes:

- constitutional authority: PFU Constitution
- constitutional operating system: BMOS
- parent system: PFU Fullstack Agentic Stack
- domains: MERCH SHIP, ZENZY, Heritage, and future registered domains
- constitutional capabilities: CORE SEVEN
- operational engines: Field Operations
- actors: registered humans, agents, services, and runtimes
- capabilities: registered, versioned, lifecycle-governed units

Every governed action must resolve a stable ID, version, owner, class, state, and domain binding.

## 2. Authority kernel

Every operation declares requester, executor, verifier, approver, and release authority.

The CORE SEVEN define capability functions but do not independently act. Authority is exercised through assigned actors.

Constitutional amendments, permanent identity changes, authority-chain changes, merge, deployment, runtime activation, domain mutation, and Thesis admission require explicit Founder authority unless a formally delegated constitutional authority is recorded.

## 3. Capability registry

Each capability record contains:

- capability ID and canonical name
- version and lifecycle state
- owner and authority source
- domain bindings and dependencies
- actor and engine assignments
- evidence references
- mutation history
- kernel admission outcome
- PFU release state

The normative schema is `contracts/pfu/capability-registration.schema.yaml`.

## 4. Domain runtime contract

Every domain must declare purpose, runtime boundary, data boundary, authorized actors, consumed BMOS services, lifecycle mapping, evidence destination, failure policy, and release authority.

Domains may govern internal implementation but may not redefine BMOS, bypass the lifecycle, mutate another domain, or self-admit into the Thesis.

The normative schema is `contracts/pfu/domain-runtime.schema.yaml`.

## 5. Lifecycle state machine

`IDEA → DESIGN → BUILD → TEST → RFTO_LAUNCH → THE_JUNGLE → THE_MOUNTAIN → THE_THESIS`

Every transition requires the evidence, authority, boundary, and integrity controls defined in `flows/pfu/capability-lifecycle.yaml`.

## 6. Evidence kernel

Required evidence classes include functional correctness, failure-path behavior, security and boundary compliance, performance where relevant, domain compatibility, provenance, mutation traceability, and release approval.

The authoritative enforcement record follows `evidence/pfu/kernel-enforcement-record.schema.yaml`.

Constitutional ratification evidence follows `evidence/pfu/evidence-record.schema.yaml` and is recorded at `evidence/pfu/pfu-constitution-ratification.event.yaml`.

## 7. Mutation kernel

Allowed governed mutations include version upgrades, capability extensions, domain bindings, and evidence additions.

Protected constitutional changes require explicit review. Silent identity changes, authority reassignment, lifecycle bypass, evidence deletion, and domain override of BMOS are forbidden.

## 8. Verdict kernel

The kernel uses two non-conflicting verdict dimensions:

### Kernel admission outcome

- `HOLD` — missing authority, evidence, registration, or dependencies
- `CORRECTION_REQUIRED` — evidence disproves a claim or a control fails
- `PROVISIONAL` — controlled proving is authorized but permanent admission is incomplete
- `ADMITTED` — final constitutional admission is evidenced and authorized

### PFU release state

- `RED` — blocked by safety, authority, integrity, or boundary failure
- `BLUE` — designed or implemented but not fully evidenced or production-authorized
- `GREEN` — all required validations, approvals, evidence, and release authority are satisfied

A capability can be `PROVISIONAL` and `BLUE`; the dimensions must not be collapsed.

## 9. Anti-drift kernel

The kernel preserves:

- identity
- authority
- domain boundaries
- lifecycle order
- evidence integrity
- mutation history
- version integrity
- release truth
- Thesis integrity

Critical anti-drift failure blocks advancement and prevents claims such as approved, installed, production-ready, active, or canonical.

## MERCH SHIP profile

MERCH SHIP is structurally bound through `manifests/pfu/domains/merch-ship-runtime-profile.yaml`.

This specification installs and authorizes governance structure only. Application runtime enforcement, deployment, production execution, merge, and public release require separate evidence and authorization.

## Current state

```text
PFU_CONSTITUTION = RATIFIED
PFU_KERNEL_CONSTITUTIONAL_AUTHORIZATION = ACTIVE_GOVERNANCE_ONLY
KERNEL_ADMISSION_OUTCOME = PROVISIONAL
PFU_RELEASE_STATE = BLUE
MACHINE_LAYER_JSON_SCHEMAS = NOT_GENERATED
MERCH_SHIP_CONFORMANCE = NOT_EXECUTED
MERGED_TO_MAIN = NO
RUNTIME_ACTIVATION = NOT_AUTHORIZED
DEPLOYMENT = NOT_AUTHORIZED
DOMAIN_MUTATION = HOLD
```
