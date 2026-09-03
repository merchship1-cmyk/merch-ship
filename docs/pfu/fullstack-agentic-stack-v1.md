# PFU Fullstack Agentic Stack v1.2

Status: SCOPED PRODUCTION GREEN / GLOBAL STACK GOVERNED BLUE  
Owner: Ryan Richard Levack-Carr  
Last reconciled: 2026-08-06

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

## Current operational state

The global PFU stack remains governed and deny-by-default. One deliberately narrow production lane is active:

```text
LANE_ID = PFU-PROD-LANE-001
MODULE = pfu_enterprise_agent_architecture
MODULE_VERSION = 1.1.0
ARCHITECTURE_STATE = production_green
RUNTIME_STATE = production_active
RELEASE_STATE = green
PRODUCTION_SCOPE = internal_read_only_registry
```

This scoped GREEN state does not authorize the entire PFU universe for deployment or unrestricted execution.

## Production Lane #1

### Runtime objects

- `pfu_agent_modules`
- `pfu_agent_models`
- `pfu_agent_capabilities`
- `pfu_agent_tasks`
- `pfu_agent_executions`
- `pfu_agent_gate_results`
- `pfu_agent_evidence_events`
- `pfu_agent_harness_runs`

### Private controller

- Function: `zenzy_private.run_pfu_agent_task(...)`
- Client exposure: none
- Ordinary authenticated execution: denied
- Permission model: owner-scoped RLS and private service-controlled invocation

### Registered runtime roles

- `pfu_reasoning_sim_v1`
- `pfu_confidence_eval_v1`
- `pfu_router_v1`

These are deterministic PFU runtime roles, not claims of connected external AI models.

### Restricted MCP-compatible capability

```text
CAPABILITY = pfu.registry.read
STATUS = restricted_active
ACCESS_MODE = read_only
NETWORK_ACCESS = false
CREDENTIAL_REQUIRED = false
WRITE_OPERATIONS = false
COST_PER_CALL = 0
```

Allowed operations:

- `list_modules`
- `get_module`
- `list_models`
- `list_capabilities`

No external MCP server is connected.

## Validation evidence

The production harness passed 8/8 governed controls:

- owner isolation
- runaway-loop protection
- append-only evidence
- capability restriction
- confidence routing
- cost ceiling
- iteration ceiling
- timeout ceiling

A live production task then executed through the controller:

```text
TASK_ID = be98cb90-9d47-49f9-9e9d-76528584f2b7
EXECUTION_ID = f0b6bdae-727c-498d-8093-9490b6dc5c6a
OPERATION = list_modules
CONFIDENCE = 0.65
RETURN_THRESHOLD = 0.80
CONTROLLER_DECISION = use_authorized_tool
CAPABILITY = pfu.registry.read
FINAL_VERDICT = tool_used
ITERATIONS = 2
ELAPSED_MS = 25
ACCUMULATED_COST = 0
EXTERNAL_CALLS = 0
WRITES = 0
```

All five task gates passed. Three append-only evidence events were emitted: `task_received`, `gate_evaluated`, and `execution_completed`. The isolation identity saw zero tasks, executions, gate results, and evidence records.

## Remaining boundary

The controller currently proves authorization, routing, ceilings, completion, isolation, and evidence. The selected registry rows are not yet materialized into the execution `result_payload`; that expansion remains separately gated.

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
- `evidence/pfu/pfu-enterprise-agent-production-green-2026-08-06.event.yaml`
- `evals/pfu/acceptance-checklist.md`
- `evals/pfu/enterprise-agent-production-green-checklist.md`

## Canonical verdict

```text
GLOBAL_PFU_STACK = GOVERNED_BLUE
PRODUCTION_LANE_001 = GREEN
PRODUCTION_SCOPE = internal_read_only_registry
EXTERNAL_MCP_SERVER_CONNECTED = false
EXTERNAL_MODEL_CONNECTED = false
NETWORK_TOOL_ACCESS = false
CREDENTIALS_INSTALLED = false
FULL_STACK_DEPLOYMENT = not_authorized
PUBLIC_RELEASE = not_authorized
```
