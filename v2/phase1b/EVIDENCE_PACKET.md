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
- [ ] MOCK mode confirmed
- [ ] screenshots/notes attached or referenced where useful
- [ ] blocking defects resolved and retested
- [ ] FST GREEN recorded

### 1B-EAS — EAS Preview Build

- [ ] EAS project linked through `ZENZY_EAS_PROJECT_ID`
- [ ] `EXPO_TOKEN` configured for CI authentication
- [ ] preview environment used
- [ ] internal distribution confirmed
- [ ] `EXPO_PUBLIC_ZENZY_AI_MODE=mock` confirmed
- [ ] Android APK build completed
- [ ] EAS build ID recorded
- [ ] exact source SHA recorded
- [ ] APK retained
- [ ] APK SHA-256 retained
- [ ] provenance JSON retained
- [ ] Founder/internal tester installation confirmed
- [ ] installed preview launches successfully

### 1B-DEV — Defect remediation, if invoked

For each blocking defect:

- [ ] defect ID
- [ ] failing source SHA
- [ ] affected gate
- [ ] targeted fix branch/commit
- [ ] relevant automated tests rerun
- [ ] affected FST/EAS gates rerun
- [ ] resolution evidence recorded

If no code defect is found, record `1B-DEV: NOT INVOKED`.

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
No external commercial operation authorized.
No RFTO certification granted.
No PRIME inheritance granted.
No BMOS attachment granted.
No broader ZENZY admission granted.
No authority transfer granted.

Phase 1B GREEN, when eventually recorded, means only that the internal pre-release preview/evidence lane satisfied its defined gates.
