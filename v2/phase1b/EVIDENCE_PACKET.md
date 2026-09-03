# ZENZY Phase 1B-EVP — Evidence Packet

Lifecycle status: TECHNICAL EVIDENCE COMPLETE / FOUNDER GREEN DECISION PENDING
Boundary: internal founder/tester preview only

## Phase 1A lineage references

- Reviewed head: `a6f15ff1ca38716c272468a66dc11a4af46a0ca4`
- Merge commit: `8bcd9c9e1d0ce3cfaecfffc779ec5ace95ee1a6c`
- PR: `#26`
- Canonical workflow run: `33679558841`
- Authenticated runtime evidence artifact: `9865759960`
- Final Detox evidence artifact: `9866797295`
- Z-001 Heritage Integrity: PASS
- V2 Component Pipeline: PASS
- ZENZY Phase 1A Gate: PASS

The Phase 1A Android APK build was proven by CI but the binary was not retained. Retained installable distribution evidence begins in Phase 1B.

## Post-PR #35 hardened-main reconciliation

- PR #35 reviewed head: `8b2022faa9a9b41874296c5c941eeda8d34775ff`
- PR #35 merge commit: `f537cc051ffff2853a9a99211b81829c1eb76227`
- PR #35 classification before merge: STAGING RUNTIME PASS / full Phase 1A regression GREEN
- current hardened `main` baseline for this reconciliation: `f537cc051ffff2853a9a99211b81829c1eb76227`

A repository comparison from the PR #34 merged baseline `5a99d90050b25e10bdd7230c2a4ffd85ca182d21` to the hardened baseline `f537cc051ffff2853a9a99211b81829c1eb76227` shows changes only in the ZJ-001 remediation workflow, Supabase Edge Functions/shared governance helpers/tests, and the `zenzy_security_events` migration. No Expo/React Native client source, package/build configuration, EAS preview configuration, or Android client file changed.

Therefore the retained PR #34 APK remains evidence for the same client source now present on hardened `main`; the remote staging backend it can target has separately advanced through the staging-validated PR #35 hardening. This does not turn the mock Phase 1B APK into a remote or production build.

## Required Phase 1B evidence

### 1B-FST — Founder Smoke Test

- [x] `FOUNDER_SMOKE_TEST.md` completed
- [x] exact tested source SHA recorded
- [x] Node.js 22 runtime confirmed by fail-closed Founder launcher reaching Expo runtime
- [x] MOCK mode confirmed
- [x] production API/Supabase/EAS runtime values cleared for the local session by the governed launcher
- [x] screenshots/notes captured and referenced where useful
- [x] blocking defects resolved and retested — no blocking defect observed
- [x] FST GREEN recorded

`1B-FST: GREEN`

Retained non-blocking FST findings:

- `FST-04-001` — Android system Back exits from PLAN instead of stepping backward; reopening restores the same PLAN state with no run loss.
- `FST-09-001` — Expo surfaced a visible `SafeAreaView has been deprecated...` development warning during long-input editing; app remained usable and keyboard behavior passed.

Both remain non-blocking UX/development findings. Neither expands authority.

### 1B-EAS — Retained Internal Android Preview

Authoritative retained evidence: `PR34_PREVIEW_EVIDENCE.md`.

- [x] EAS project linked through repository-owned `eas-project.json`
- [x] `EXPO_TOKEN` CI authentication proven
- [x] preview environment used
- [x] internal distribution confirmed
- [x] production build profile absent
- [x] submit profile absent
- [x] EAS Update channel not provisioned in Phase 1B
- [x] `EXPO_PUBLIC_ZENZY_AI_MODE=mock` confirmed
- [x] Android APK build completed
- [x] EAS build ID recorded — `32b0642e-4b22-4c2e-97ac-6cca46156333`
- [x] PR #34 merged-main source recorded — `5a99d90050b25e10bdd7230c2a4ffd85ca182d21`
- [x] tested merge candidate recorded — `9690b4ef1a03eb0d9256913c207e88d93018f747`
- [x] tested candidate and PR #34 final merged main proven tree-identical — `0f9c61fdbfc3132723d80c58a732d5dc5678c338`
- [x] later PR #35 changes proven not to modify Expo/React Native client or preview build configuration
- [x] APK retained in GitHub Actions artifact `9889097019`
- [x] APK SHA-256 retained — `1c6929faadba48501097036f945b6d44a4f806622f15f9e09ee7b04a272ea4b7`
- [x] EAS metadata retained
- [x] provenance JSON retained
- [x] supplemental provenance records `eas_update_channel=NONE_NOT_PROVISIONED`
- [x] Founder/internal tester installation confirmed
- [x] installed preview launches successfully
- [x] Founder real-device resume acceptance target passed
- [x] governed mock PFU route passed on physical Android

`1B-EAS: GREEN — INTERNAL NON-PRODUCTION PREVIEW EVIDENCE`

Retained workflow evidence:

- workflow run: `33742972511`
- artifact: `zenzy-pr34-resume-preview-64a27db73ae1b78ddd13cc4b6d89584890e6ac21`
- artifact ID: `9889097019`
- artifact archive digest: `sha256:2ac0f1de04925e5307756cbb577e072f2973742b5b5916320b97ba2f873976e5`
- retained until: `2026-10-03T10:29:59Z`

### 1B-DEV — Controlled Fix Lane

The authoritative fix-lane rules remain in `DEV_LANE.md`.

No blocking Phase 1B defect required the controlled fix lane.

`1B-DEV: NOT INVOKED FOR BLOCKING DEFECTS`

The resume/dashboard increment was developed and validated separately in PR #34 and is integrated into `main`. The two original FST findings remain non-blocking.

## Phase 1B contract evidence

The secret-free Phase 1B contract established the preview lane as fail-closed:

- [x] preview is the only EAS build profile
- [x] Android output is APK
- [x] internal distribution only
- [x] Node.js 22 is pinned
- [x] MOCK mode is forced
- [x] no production profile exists
- [x] no submit profile exists
- [x] no EAS Update channel exists
- [x] `expo-updates` has not been admitted
- [x] separate Zenzy Preview app identifiers resolve correctly
- [x] repository verification passed on the retained preview candidate
- [x] Founder Test Pack artifact retained
- [x] current repository checks preserved the Phase 1B contract after PR #34 integration
- [x] PR #35 integration did not modify the client or preview build configuration

Passing this contract proves configuration/evidence readiness only. It does not grant production authority.

## Retained preview artifact set

The retained PR #34 preview artifact contains:

- `ZENZY-PR34-Resume-Preview.apk`
- `ZENZY-PR34-Resume-Preview.apk.sha256`
- `eas-build-metadata.json`
- `provenance.json`

The artifact, EAS build ID, APK hash, tested merge candidate, PR #34 merged-main commit, identical PR #34 Git tree, and later hardened-main client-scope comparison are cross-recorded in `PR34_PREVIEW_EVIDENCE.md`.

## Phase 1B GREEN decision checklist

- [x] Phase 1A lineage remains valid
- [x] 1B-FST GREEN
- [x] preview configuration isolated from production
- [x] retained installable Android preview exists
- [x] source/build/artifact provenance is unambiguous for the bounded preview client
- [x] APK SHA-256 recorded
- [x] internal installation succeeds
- [x] retained preview launches
- [x] Founder real-device resume flow passes
- [x] all blocking Phase 1B defects closed — none remain
- [x] evidence packet reconciled and complete
- [x] governance boundary confirmed
- [ ] Founder/governance authority explicitly records Phase 1B GREEN

## Current Phase 1B state

- current hardened repository baseline: `f537cc051ffff2853a9a99211b81829c1eb76227`
- Phase 1A lineage: GREEN
- Phase 1B contract: GREEN
- 1B-FST Founder Smoke: GREEN
- 1B-EAS retained internal Android preview: GREEN
- 1B-DEV blocking-defect lane: NOT INVOKED
- ZJ-001 staging hardening: integrated to `main`; staging runtime validated before merge
- Phase 1B technical evidence: COMPLETE
- Phase 1B overall: OPEN solely pending explicit Founder/governance GREEN decision

The smallest remaining Phase 1B action is the separate Founder/governance decision. That decision may record Phase 1B GREEN for the bounded internal pre-release lane only; it must not be interpreted as production release, RFTO, PRIME/BMOS, live mesh, customer access, or authority transfer.

## Governance declaration

`PHASE 1B INTERNAL PREVIEW ONLY`

No production deployment authorized.
No production release authorized.
No app-store submission authorized.
No EAS Update publication authorized.
No external commercial operation authorized.
No live mesh attachment authorized.
No production AI routing authorized.
No RFTO certification granted.
No PRIME inheritance granted.
No BMOS attachment granted.
No broader ZENZY admission granted.
No authority transfer granted.

Phase 1B GREEN, if explicitly recorded by the Founder/governance authority, means only that the internal pre-release preview/evidence lane satisfied its defined gates.
