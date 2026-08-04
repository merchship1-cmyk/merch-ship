# BMOS + PFU Kernel Installation Record

**Installation ID:** PFU-INSTALL-BMOS-KERNEL-001  
**Version:** 1.0  
**Date:** 2026-08-04  
**Repository:** `merchship1-cmyk/merch-ship`  
**Branch:** `agent/install-bmos-pfu-kernel-v1`

## Installed GitHub artifacts

- `registrations/pfu/bmos.system.yaml`
- `manifests/pfu/bmos.manifest.yaml`
- `manifests/pfu/domains/merch-ship-runtime-profile.yaml`
- `docs/pfu/bmos/founder-handbook.md`
- `docs/pfu/bmos/constitution-v1.md`
- `docs/pfu/architecture/bmos-pfu-merch-ship-map.md`
- `docs/pfu/thesis/bmos-admission-v1.md`
- `docs/pfu/kernel/pfu-os-kernel-spec-v1.md`
- `policies/pfu/kernel-enforcement-rules.yaml`
- `contracts/pfu/capability-registration.schema.yaml`
- `contracts/pfu/domain-runtime.schema.yaml`
- `flows/pfu/capability-lifecycle.yaml`
- `evidence/pfu/kernel-enforcement-record.schema.yaml`
- `evidence/pfu/bmos-kernel-installation.record.yaml`
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
7. PFU Systems Registry record: `BMOS-CONSTITUTIONAL-OS`
8. PFU Systems Registry record: `PFU-DOMAIN-MERCH-SHIP`

## Validation completed

- all authored YAML documents parse successfully
- JSON Schema documents pass Draft 2020-12 schema checks
- `registrations/pfu/bmos.system.yaml` validates against `contracts/pfu/system-registration.schema.yaml`
- `manifests/pfu/domains/merch-ship-runtime-profile.yaml` validates against `contracts/pfu/domain-runtime.schema.yaml`
- `evidence/pfu/bmos-kernel-installation.record.yaml` validates against `evidence/pfu/kernel-enforcement-record.schema.yaml`
- Notion IDs, versions, owners, release states, and claim boundaries match GitHub

## Protected boundaries

- `todo-app/` must remain zero-diff.
- No application runtime mutation is included.
- No infrastructure or secret mutation is included.
- No deployment, production execution, runtime activation, or public release is authorized.

## Pull-request evidence required

- final feature-branch head SHA
- draft pull request number and state
- compare result against `main`
- changed-file inventory
- `todo-app/` zero-diff proof
- required reviews and approvals
- explicit Founder merge decision

## Current verdict

```text
GITHUB_STRUCTURE = INSTALLED_ON_FEATURE_BRANCH
NOTION_INSTALLATION = INSTALLED_AND_REGISTERED
SCHEMA_VALIDATION = PASS
NOTION_GITHUB_RECONCILIATION = PASS
MERGED_TO_MAIN = NO
RUNTIME_ACTIVATION = NOT_AUTHORIZED
DEPLOYMENT = NOT_AUTHORIZED
KERNEL_ADMISSION_OUTCOME = PROVISIONAL
PFU_RELEASE_STATE = BLUE
```
