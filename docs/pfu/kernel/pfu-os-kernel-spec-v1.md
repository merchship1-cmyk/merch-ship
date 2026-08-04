# PFU OS Kernel Specification v1.0

**System:** PFU Fullstack Agentic Stack  
**Constitutional subsystem:** BMOS  
**Status:** Canon candidate / release BLUE

The PFU OS Kernel is the enforceable governance layer that binds BMOS constitutional capability to registered PFU domains.

## 1. Identity kernel

Recognized classes:

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

Constitutional amendments, permanent identity changes, authority-chain changes, and Thesis admission require explicit Founder authority unless a formally delegated constitutional authority is recorded.

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

This specification installs governance structure only. Application runtime enforcement, deployment, production execution, merge, and public release require separate evidence and authorization.
