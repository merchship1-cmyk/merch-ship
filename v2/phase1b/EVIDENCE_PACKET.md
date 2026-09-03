# ZENZY Phase 1B-EVP — Evidence Packet

Lifecycle status: OPEN / NOT GREEN
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

The Phase 1A Android APK build was proven by CI but the binary was not retained. That is not a Phase 1A failure; retained installable distribution evidence begins in Phase 1B.

## Required Phase 1B evidence

### 1B-FST — Founder Smoke Test

- [ ] `FOUNDER_SMOKE_TEST.md` completed — core path completed; FST-05 long/edit/keyboard subchecks remain
- [x] exact tested source SHA recorded
- [x] Node.js 22 runtime confirmed by fail-closed Founder launcher reaching Expo runtime
- [x] MOCK mode confirmed
- [x] production API/Supabase/EAS runtime values cleared for the local session by the governed launcher
- [x] screenshots/notes captured and referenced where useful; repository-retained screenshot attachment remains separate
- [x] blocking defects resolved and retested — no blocking defect observed
- [ ] FST GREEN recorded

Current retained FST defect: `FST-04-001` — Android system Back exits from PLAN instead of stepping backward; reopening restores the same PLAN state. Classified `FAIL-NONBLOCKING`.

### 1B-EAS — EAS Preview Build

- [ ] EAS project linked through `ZENZY_EAS_PROJECT_ID`
- [ ] `EXPO_TOKEN` configured for CI authentication
- [ ] preview environment used
- [ ] internal distribution confirmed
- [ ] production build profile absent
- [ ] submit profile absent
- [ ] EAS Update channel not provisioned in Phase 1B
- [ ] `EXPO_PUBLIC_ZENZY_AI_MODE=mock` confirmed
- [ ] Android APK build completed
- [ ] EAS build ID recorded
- [ ] exact merged-main source SHA recorded
- [ ] APK retained
- [ ] APK SHA-256 retained
- [ ] provenance JSON retained
- [ ] provenance records `eas_update_channel=NONE_NOT_PROVISIONED`
- [ ] Founder/internal tester installation confirmed
- [ ] installed preview launches successfully

### 1B-DEV — Defect remediation, if invoked

The authoritative fix-lane rules are in `DEV_LANE.md`.

For each blocking defect:

- [ ] defect ID
- [ ] failing source SHA
- [ ] affected gate
- [ ] targeted fix branch/commit
- [ ] relevant automated tests rerun
- [ ] affected FST/EAS gates rerun
- [ ] resolution evidence recorded

Current state: no blocking defect requires 1B-DEV. The open Android Back behavior is non-blocking and is not being used to widen this lane.

If no code/configuration defect is found, record `1B-DEV: NOT INVOKED`.

## Phase 1B contract evidence

Before EAS execution, the secret-free Phase 1B contract workflow must establish that the proposed lane is fail-closed:

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
- [x] repository verification passes on the previously validated Phase 1B contract head; the evidence-record update must retain/reconfirm this status for its new head
- [x] Founder Test Pack artifact is retained from the validated contract run

Passing this contract check proves configuration/evidence readiness only. It does not make Phase 1B GREEN.

## Retained preview artifact set

The Phase 1B preview workflow is designed to retain:

- `zenzy-phase1b-preview.apk`
- `zenzy-phase1b-preview.apk.sha256`
- `eas-build-metadata.json`
- `provenance.json`

The GitHub Actions artifact name binds the evidence bundle to the candidate source SHA.

## Phase 1B GREEN decision checklist

- [x] Phase 1A lineage remains valid
- [ ] 1B-FST GREEN
- [x] preview configuration isolated from production — contract-proven configuration
- [ ] retained installable Android preview exists
- [ ] source/build/artifact provenance is unambiguous
- [ ] SHA-256 recorded
- [ ] internal installation succeeds
- [ ] retained preview launches
- [x] all blocking defects closed — none currently observed in FST
- [ ] evidence packet complete
- [x] governance boundary confirmed
- [ ] Founder/governance authority explicitly records Phase 1B GREEN

## Governance declaration

`PHASE 1B INTERNAL PREVIEW ONLY`

No production deployment authorized.
No production release authorized.
No app-store submission authorized.
No EAS Update publication authorized.
No external commercial operation authorized.
No RFTO certification granted.
No PRIME inheritance granted.
No BMOS attachment granted.
No broader ZENZY admission granted.
No authority transfer granted.

Phase 1B GREEN, when eventually recorded, means only that the internal pre-release preview/evidence lane satisfied its defined gates.
