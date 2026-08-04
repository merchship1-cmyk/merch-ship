# BMOS + PFU Kernel Installation Record

**Installation ID:** PFU-INSTALL-BMOS-KERNEL-001  
**Version:** 1.0  
**Date:** 2026-08-04  
**Repository:** `merchship1-cmyk/merch-ship`  
**Branch:** `agent/install-bmos-pfu-kernel-v1`

## Installed GitHub artifacts

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
- `evals/pfu/kernel-compliance-checklist.md`

## Intended Notion installation

The human control plane must contain:

1. BMOS — Constitutional Operating System v1.0
2. Founder Handbook — BMOS Permanent Operating Layer
3. PFU OS Kernel Specification v1.0
4. PFU Kernel Enforcement Rules v1.0
5. PFU Architecture + MERCH SHIP Integration Map
6. BMOS Thesis Admission Candidate v1.0
7. PFU Systems Registry record for BMOS
8. PFU Systems Registry record for MERCH SHIP kernel binding

## Protected boundaries

- `todo-app/` must remain zero-diff.
- No application runtime mutation is included.
- No infrastructure or secret mutation is included.
- No deployment, production execution, or public release is authorized.

## Required reconciliation evidence

- GitHub branch head SHA
- pull request number and state
- compare result against `main`
- changed-file inventory
- `todo-app/` zero-diff proof
- schema and YAML parse results
- Notion page URLs
- Notion registry record URLs
- Founder review and merge decision

## Current verdict

```text
GITHUB_STRUCTURE = INSTALLED_ON_FEATURE_BRANCH
NOTION_INSTALLATION = PENDING_RECONCILIATION
MERGED_TO_MAIN = NO
RUNTIME_ACTIVATION = NOT_AUTHORIZED
DEPLOYMENT = NOT_AUTHORIZED
KERNEL_ADMISSION_OUTCOME = PROVISIONAL
PFU_RELEASE_STATE = BLUE
```
