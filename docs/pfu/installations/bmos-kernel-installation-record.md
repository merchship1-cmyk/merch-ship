# BMOS + PFU Kernel Installation Record

**Installation ID:** PFU-INSTALL-BMOS-KERNEL-001  
**Version:** 1.1  
**Initial installation date:** 2026-08-04  
**Constitution ratification date:** 2026-08-05  
**Repository:** `merchship1-cmyk/merch-ship`  
**Branch:** `agent/install-bmos-pfu-kernel-v1`

## Installed GitHub artifacts

- `registrations/pfu/bmos.system.yaml`
- `manifests/pfu/bmos.manifest.yaml`
- `manifests/pfu/domains/merch-ship-runtime-profile.yaml`
- `docs/pfu/bmos/founder-handbook.md`
- `docs/pfu/bmos/constitution-v1.md`
- `docs/pfu/constitution/pfu-constitution-v1.md`
- `docs/pfu/architecture/bmos-pfu-merch-ship-map.md`
- `docs/pfu/thesis/bmos-admission-v1.md`
- `docs/pfu/kernel/pfu-os-kernel-spec-v1.md`
- `policies/pfu/kernel-enforcement-rules.yaml`
- `contracts/pfu/capability-registration.schema.yaml`
- `contracts/pfu/domain-runtime.schema.yaml`
- `flows/pfu/capability-lifecycle.yaml`
- `evidence/pfu/evidence-record.schema.yaml`
- `evidence/pfu/kernel-enforcement-record.schema.yaml`
- `evidence/pfu/bmos-kernel-installation.record.yaml`
- `evidence/pfu/pfu-constitution-ratification.event.yaml`
- `evals/pfu/kernel-compliance-checklist.md`
- updated root `pfu-system.manifest.yaml`

## Notion installation

Installed under **PFU Fullstack Agentic Stack — Canonical v1.0**:

1. BMOS — Constitutional Operating System v1.0
2. Founder Handbook — BMOS Permanent Operating Layer
3. PFU OS Kernel Specification v1.0
4. PFU Kernel Enforcement Rules v1.0
5. PFU Architecture + MERCH SHIP Integration Map
6. BMOS Thesis Admission Candidate v1.0
7. BMOS Capability Map v1.0
8. PFU Constitution v1
9. BMOS → PFU Interoperability Charter v1.0
10. PFU Constitution Ratification Event — PFU-CONST-RAT-2026-08-05-001
11. PFU Systems Registry record: `BMOS-CONSTITUTIONAL-OS`
12. PFU Systems Registry record: `PFU-DOMAIN-MERCH-SHIP`

## Validation completed

- authored YAML documents used by the original installation parse successfully
- existing JSON Schema documents pass Draft 2020-12 schema checks
- `registrations/pfu/bmos.system.yaml` validates against `contracts/pfu/system-registration.schema.yaml`
- `manifests/pfu/domains/merch-ship-runtime-profile.yaml` validates against `contracts/pfu/domain-runtime.schema.yaml`
- `evidence/pfu/bmos-kernel-installation.record.yaml` validates against `evidence/pfu/kernel-enforcement-record.schema.yaml`
- the ratification event is structured against `evidence/pfu/evidence-record.schema.yaml`
- the PFU Constitution content hash is recorded as `ac50a6bdb8c90e717395b2cc5bb10754cc165d18e24802013b14fc1dd6204b89`
- Notion IDs, versions, owners, release states, and claim boundaries are reconciled with the governed branch

## Ratification record

- **Event ID:** `PFU-CONST-RAT-2026-08-05-001`
- **Constitution:** `docs/pfu/constitution/pfu-constitution-v1.md`
- **Evidence:** `evidence/pfu/pfu-constitution-ratification.event.yaml`
- **Founder authority:** Ryan Richard Levack-Carr
- **Constitution commit:** `ff979dd9ce58b129fbbe178f219e4b8da2327a70`
- **Ratification-event commit:** `d667a3fe3bea55bd528ca45b0a2ff97372daa8f8`
- **Kernel authorization:** `ACTIVE_GOVERNANCE_ONLY`
- **PFU release state:** `BLUE`

## Protected boundaries

- `todo-app/` must remain zero-diff.
- No application runtime mutation is included.
- No infrastructure or secret mutation is included.
- No deployment, production execution, runtime activation, migration, public release, or domain mutation is authorized.
- PR #17 must not merge without a separate explicit Founder merge decision.

## Remaining evidence required

- final feature-branch head SHA after ratification synchronization
- compare result against `main`
- changed-file inventory
- `todo-app/` zero-diff proof
- validation of the six final machine-layer JSON schemas after generation
- MERCH SHIP repository conformance evidence
- required reviews and approvals
- explicit Founder merge decision

## Current verdict

```text
PFU_CONSTITUTION = RATIFIED
SYSTEM_OF_RECORD_RATIFICATION = RECORDED_ON_GOVERNED_BRANCH_AND_NOTION
PFU_KERNEL_CONSTITUTIONAL_AUTHORIZATION = ACTIVE_GOVERNANCE_ONLY
GITHUB_STRUCTURE = INSTALLED_ON_FEATURE_BRANCH
NOTION_INSTALLATION = INSTALLED_AND_REGISTERED
KERNEL_ADMISSION_OUTCOME = PROVISIONAL
PFU_RELEASE_STATE = BLUE
MACHINE_LAYER_JSON_SCHEMAS = NOT_GENERATED
MERCH_SHIP_CONFORMANCE = NOT_EXECUTED
MERGED_TO_MAIN = NO
RUNTIME_ACTIVATION = NOT_AUTHORIZED
DEPLOYMENT = NOT_AUTHORIZED
DOMAIN_MUTATION = HOLD
```
