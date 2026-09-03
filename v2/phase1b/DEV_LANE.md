# ZENZY Phase 1B-DEV — Controlled Fix Lane

Status: NOT INVOKED
Lifecycle: Phase 1B pre-release / internal evidence only
Initial Phase 1A baseline: `8bcd9c9e1d0ce3cfaecfffc779ec5ace95ee1a6c`

## Purpose

Phase 1B-DEV exists only to remediate defects demonstrated by Phase 1B-FST or Phase 1B-EAS evidence. It is not a feature-development lane and does not expand ZENZY authority or product scope.

## Entry criteria

A DEV cycle may begin only when all of the following are recorded:

- defect ID
- failing/source candidate SHA
- originating gate (`1B-FST` or `1B-EAS`)
- observable failure or evidence reference
- severity (`blocking` or `non-blocking`)
- affected behavior or component

## Permitted changes

- smallest targeted change required to resolve the demonstrated defect
- tests directly supporting the correction
- build/configuration changes directly required for the affected Phase 1B preview path
- evidence/documentation updates needed to preserve accurate lineage

## Prohibited changes

Phase 1B-DEV must not be used for:

- unrelated feature expansion
- production deployment configuration
- production build or submission profiles
- EAS Update publication or production channels
- production secrets or live customer data
- commercial operation
- RFTO certification
- PRIME inheritance
- BMOS attachment
- broader ZENZY admission
- authority transfer

## Branch and lineage rule

A fix should be traceable from the candidate that demonstrated the defect. A branch may follow the repository convention, for example:

`zenzy/phase-1b-fix/<defect-id>`

The exact branch name is not authoritative. The required evidence is the relationship:

`failing candidate SHA -> defect ID -> fix commit SHA -> rerun evidence`

Evidence from an earlier SHA must never be represented as if it tested a later fix SHA.

## Required fix record

For each invoked DEV cycle record:

- Defect ID:
- Originating gate:
- Failing source SHA:
- Failure evidence/reference:
- Severity:
- Root cause:
- Fix scope:
- Fix commit SHA:
- Automated checks rerun:
- FST gates rerun:
- EAS rebuild required: YES / NO
- Installation/launch retest required: YES / NO
- Final result: OPEN / RESOLVED / DEFERRED-NONBLOCKING

## Retest matrix

### UI / interaction defect

Minimum rerun:

1. repository verification relevant to the change
2. affected Founder Smoke Test gate(s)
3. EAS preview rebuild if the installable binary changed
4. installation/launch check when a new APK is produced

### Native / Android / build configuration defect

Minimum rerun:

1. repository verification
2. Android preview build
3. retained APK provenance and SHA-256
4. internal installation
5. launch/runtime smoke path
6. affected FST gates

### Evidence/documentation-only defect

Minimum rerun:

1. Phase 1B contract validation
2. affected evidence packet checks

A documentation-only correction does not require a new application binary unless it changes build/runtime inputs.

## Exit criteria

Phase 1B-DEV is GREEN for an invoked defect only when:

- the blocking defect is resolved or explicitly reclassified through a documented governance decision
- the fix SHA is recorded
- all materially affected checks are rerun successfully
- any required preview binary is rebuilt and rebound to its own provenance/digest
- no unrelated feature expansion was introduced
- no production or authority boundary was crossed

If Phase 1B-FST and Phase 1B-EAS reveal no defect requiring code/configuration changes, record:

`1B-DEV: NOT INVOKED`

## Governance boundary

`FIX INTEGRATION != PRODUCTION RELEASE`

`DEV GREEN != RFTO`

`DEV GREEN != PRIME/BMOS`

`DEFECT CLOSURE != AUTHORITY TRANSFER`
