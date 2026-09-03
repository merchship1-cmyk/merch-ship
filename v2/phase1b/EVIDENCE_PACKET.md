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

- [ ] `FOUNDER_SMOKE_TEST.md` completed
- [ ] exact tested source SHA recorded
- [ ] Node.js 22 runtime confirmed
- [ ] MOCK mode confirmed
- [ ] production API/Supabase/EAS runtime values cleared for the local session
- [ ] screenshots/notes attached or referenced where useful
- [ ] blocking defects resolved and retested
- [ ] FST GREEN recorded

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

If no code/configuration defect is found, record `1B-DEV: NOT INVOKED`.

## Phase 1B contract evidence

Before EAS execution, the secret-free Phase 1B contract workflow must establish that the proposed lane is fail-closed:

- [ ] preview is the only EAS build profile
- [ ] Android output is APK
- [ ] internal distribution only
- [ ] Node.js 22 is pinned
- [ ] MOCK mode is forced
- [ ] no production profile exists
- [ ] no submit profile exists
- [ ] no EAS Update channel exists
- [ ] `expo-updates` has not been admitted
- [ ] separate Zenzy Preview app identifiers resolve correctly
- [ ] repository verification passes
- [ ] Founder Test Pack artifact is retained

Passing this contract check proves configuration/evidence readiness only. It does not make Phase 1B GREEN.

## Retained preview artifact set

The Phase 1B preview workflow is designed to retain:

- `zenzy-phase1b-preview.apk`
- `zenzy-phase1b-preview.apk.sha256`
- `eas-build-metadata.json`
- `provenance.json`

The GitHub Actions artifact name binds the evidence bundle to the candidate source SHA.

## Phase 1B GREEN decision checklist

- [ ] Phase 1A lineage remains valid
- [ ] 1B-FST GREEN
- [ ] preview configuration isolated from production
- [ ] retained installable Android preview exists
- [ ] source/build/artifact provenance is unambiguous
- [ ] SHA-256 recorded
- [ ] internal installation succeeds
- [ ] retained preview launches
- [ ] all blocking defects closed
- [ ] evidence packet complete
- [ ] governance boundary confirmed
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
