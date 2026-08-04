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
- `contracts/pfu/system-registration.schema.yaml`
- `flows/pfu/runtime-loop.yaml`
- `prompts/pfu/runtime-brainstem.md`
- `evidence/pfu/evidence-record.schema.yaml`
- `evals/pfu/acceptance-checklist.md`
