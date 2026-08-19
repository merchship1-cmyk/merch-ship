# PFU Fullstack Agentic Stack v1.0

Status: CANON CANDIDATE / BLUE
Owner: Ryan Richard Levack-Carr

## Canonical definition

The PFU Fullstack Agentic Stack is the governed operating spine through which every PFU system declares its identity, registers its capabilities, receives bounded authority, executes agentic workflows, and produces verifiable evidence.

## Layers

1. Governance OS — global rules for models, tools, agents, runtimes, memory, surfaces, workflows, outputs, and release authority.
2. Agentic lanes — bounded subsystems with models, tools/APIs, memory/state, orchestration/runtime, and workflows.
3. Notion registry — human-readable Systems and Agents registries.
4. GitHub codebase — versioned policies, flows, prompts, contracts, evidence, and evaluations.
5. Multi-AI mesh — specialized planning, coding, orchestration, memory, artifact, and runtime responsibilities.

## Runtime loop

1. Receive request.
2. Resolve identity and authority.
3. Read global governance.
4. Read system registry.
5. Select an authorized subsystem.
6. Load policies and contracts.
7. Select permitted models, agents, and tools.
8. Execute the bounded workflow.
9. Validate outputs.
10. Record evidence.
11. Apply the release gate.
12. Update registry and runtime state.

## Federated execution doctrine — installed 2026-08-19

Canonical doctrine: `docs/pfu/doctrines/splitparlalunifedeexecutiom-v1.md`

Formula:
Split domains -> Parallel operation -> Unified evidence view -> Federated execution instances -> Execution-first proof.

The doctrine governs how independently controlled B.MAZING and PFU / MERCH SHIP domains may exchange bounded evidence without merging architecture or authority.

Hard boundary:
- B.MAZING and PFU / MERCH SHIP remain independently governed.
- Unified evidence is a comparison view, not a unified SSOT.
- No shared backend authority, shared database trust, automatic role propagation, architecture inheritance, or cross-domain SSOT authority is permitted.
- Cross-domain evidence requires an explicit, scoped, authenticated, revocable, deny-by-default bridge.
- Evidence comparison may classify alignment, contradiction, uncertainty, change, or insufficient evidence, but cannot mutate either source domain or grant release authority.
- Founder release authority, safety, rights, and quality gates remain intact.
- Auto-publish and auto-approval remain unauthorized.

Machine controls:
- Policy: `policies/pfu/federated-evidence-policy.yaml`
- Evidence envelope: `contracts/pfu/federated-evidence-envelope.schema.json`
- Acceptance gates: `evals/pfu/federated-execution-acceptance-checklist.md`

Implementation state: BLUE until a bounded end-to-end lane validates the bridge, contract, evidence capture, and release controls.

## Enforcement rule

An unregistered system may be designed, but it may not enter production execution. No AI or agent receives universal mutation, merge, deployment, or release authority.

## Sources of truth

- Notion: registry, operating context, ownership, and human-readable governance.
- GitHub: executable policies, schemas, prompts, workflows, evidence, and release history.
- Runtime database: authenticated state and protected execution records.

## Installation map

- `pfu-system.manifest.yaml`
- `policies/pfu/stack-policy.yaml`
- `policies/pfu/release-policy.yaml`
- `policies/pfu/federated-evidence-policy.yaml`
- `contracts/pfu/system-registration.schema.yaml`
- `contracts/pfu/federated-evidence-envelope.schema.json`
- `flows/pfu/runtime-loop.yaml`
- `prompts/pfu/runtime-brainstem.md`
- `evidence/pfu/evidence-record.schema.yaml`
- `evals/pfu/acceptance-checklist.md`
- `evals/pfu/federated-execution-acceptance-checklist.md`
