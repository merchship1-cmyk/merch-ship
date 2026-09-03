# ZENZY Phase 1B — Founder / Governance GREEN Decision

Decision date: 2026-09-03
Decision state: `PHASE 1B GREEN — BOUNDED INTERNAL PRE-RELEASE ONLY`
Repository baseline at decision: `f5d4b3c6eb15b5ef5f7e5e2cd7a31aeaded0ad25`
Authority: Founder / repository owner advancement decision

## Decision

Phase 1B is approved GREEN for the bounded internal founder/tester pre-release lane only.

This decision closes the Founder/governance decision gate identified in `EVIDENCE_PACKET.md`. It does not rewrite or replace earlier evidence; it appends the explicit decision required by that packet.

## Evidence basis

The decision relies on the retained Phase 1B evidence already integrated in the repository:

- Phase 1A lineage: GREEN
- Phase 1B contract: GREEN
- 1B-FST Founder Smoke: GREEN
- 1B-EAS retained internal Android preview: GREEN
- retained installable Android APK and SHA-256: present
- Founder/internal installation: confirmed
- retained preview launch: confirmed
- Founder real-device resume acceptance: passed
- governed mock PFU route on physical Android: passed
- blocking Phase 1B defects: none remain
- evidence packet: technically complete

## Post-merge JUNGLE remediation evidence

PR #42 is merged at repository baseline `f5d4b3c6eb15b5ef5f7e5e2cd7a31aeaded0ad25` and the bounded post-merge runtime proof was executed against that exact `main` SHA.

Retained proof:

- workflow: `ZENZY / JUNGLE Load-20 Idempotency Remediation Proof`
- workflow run ID: `33788134326`
- event: `workflow_dispatch`
- tested branch: `main`
- tested SHA: `f5d4b3c6eb15b5ef5f7e5e2cd7a31aeaded0ad25`
- job ID: `100757823088`
- job: `JUNGLE / Fixed-ID Recovery + Single-Flight`
- outcome: `SUCCESS`
- artifact ID: `9906244558`
- artifact digest: `sha256:d0d9eb6abba4e3c92b192657b4b70b5e52107672930f7702988d5c68689cf773`
- environment: `NON_PRODUCTION_STAGING`
- full load ladder rerun: `false`
- ZJ-T-005 through ZJ-T-008 rerun: `false`
- provider-generating identities used / ceiling: `2 / 2`
- customer production data touched: `false`
- production authority changed: `false`

Bounded outcomes:

1. Ambiguous-response recovery: PASS — `200 -> 200`, same canonical run, one persisted run.
2. Same request ID with changed input: PASS — `409 IDEMPOTENCY_INPUT_MISMATCH`, persisted run count remained one.
3. Concurrent same-ID single-flight: PASS — one canonical success, competing active-lease response, canonical recovery `200`, one persisted run.

The original JUNGLE failure evidence remains retained and is not superseded or relabeled.

## Separate open CI configuration issue

The `V2 Component Pipeline` push run `33781171477` on the same merge SHA is not being reclassified as GREEN by this decision. Its Lane B runtime job reached the API-connectivity gate with the repository tests and Expo bundle passing, then failed because `OPENAI_API_KEY` was unavailable to that main-push job.

That credential/scope configuration issue remains an independent gate for subsequent V2 main-runtime / broader engineering-assurance advancement. It does not expand this Phase 1B decision and must not be hidden, bypassed, or treated as a production credential authorization.

## Authority boundary

`PHASE 1B GREEN != PRODUCTION AUTHORITY`

This decision does not authorize:

- production deployment or production release
- app-store submission
- EAS Update publication
- customer production access or customer production data
- production AI routing
- external commercial operation
- live mesh attachment
- RFTO certification
- PRIME inheritance
- BMOS attachment
- broader ZENZY admission
- PR #38 advancement
- WREAS integration
- authority transfer

## Result

`ZENZY PHASE 1B: GREEN — INTERNAL PRE-RELEASE / NON-PRODUCTION`

The next engineering gate is the separate V2 main-runtime credential/scope correction and verification. WREAS remains isolated until its own sequencing and authorization conditions are satisfied.
