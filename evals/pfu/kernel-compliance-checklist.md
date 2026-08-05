# PFU BMOS Kernel Compliance Checklist

**Evaluation:** `PFU-KERNEL-EVAL-002`  
**Version:** `1.2`  
**Subject commit:** `3d9eb6f9e3198bd7fa36c948b86be5c652fdcff7`  
**Evaluated at:** `2026-08-05T19:09:00Z`  
**Release state:** `BLUE`  
**Merge verdict:** `GREEN_READY`

## Repository integrity
- [x] Branch is `0` commits behind `main`.
- [x] Changes are limited to governed PFU paths.
- [x] `todo-app/` has zero diff.
- [x] Z-001 Heritage Integrity run `31030468345` passed.
- [x] No deployment, runtime, infrastructure, secret, webhook, worker, or Supabase mutation exists.

## Constitutional and domain binding
- [x] PFU Constitution is ratified.
- [x] Kernel authorization is `ACTIVE_GOVERNANCE_ONLY`.
- [x] Kernel admission remains `PROVISIONAL`.
- [x] MERCH SHIP remains `STRUCTURAL_ONLY`.
- [x] Founder authority remains required for merge and release.

## Machine layer
- [x] Six required Draft 2020-12 schemas are present.
- [x] Six meta-schema checks passed.
- [x] Six valid fixtures passed.
- [x] Six missing-required-field rejection checks passed.
- [x] Four conditional governance rejection checks passed.
- [x] All six artifact hashes reconcile.
- [x] Every schema is bound to `3d9eb6f9e3198bd7fa36c948b86be5c652fdcff7`.

## Evidence and release
- [x] Acceptance checklist is complete.
- [x] Final conformance record is PASS.
- [x] Release manifest is complete.
- [x] GREEN_READY contains zero blockers.
- [x] GREEN_READY means readiness for a Founder decision, not merge authorization.

```text
PFU_STATIC_CONFORMANCE = PASS
EVIDENCE_SCHEMA_REVALIDATION = PASS
KERNEL_CONSTITUTION_BINDING = VALID
MACHINE_LAYER_SCHEMA_VALIDATION = PASS
ACCEPTANCE_CHECKLIST = PASS
RELEASE_MANIFEST = COMPLETE
MERGE_VERDICT = GREEN_READY
MERGE_READINESS = READY_FOR_FOUNDER_DECISION
MERGE_AUTHORIZATION = NOT_GRANTED
PFU_RELEASE_STATE = BLUE
DEPLOYMENT = NOT_AUTHORIZED
RUNTIME_ACTIVATION = NOT_AUTHORIZED
DOMAIN_MUTATION = HOLD
```

**GREEN_READY:** all pre-Founder merge-readiness controls pass for `3d9eb6f9e3198bd7fa36c948b86be5c652fdcff7`. No merge, deployment, runtime activation, public release, domain mutation, or Thesis admission is authorized by this checklist.
