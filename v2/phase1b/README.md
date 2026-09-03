# ZENZY Phase 1B — Governed Pre-Release Preview Lane

Phase 1B advances the verified Phase 1A mobile slice into internal Founder/tester preview and evidence-building. It does not authorize production or broader system admission.

## Lifecycle

`1A GREEN -> 1B-FST -> 1B-EAS -> 1B-EVP -> Founder/Governance Phase 1B decision`

If a blocking defect is found in FST or EAS:

`failing gate -> 1B-DEV -> targeted fix -> affected verification rerun -> return to gate`

## 1B-FST — Founder Smoke Test

Purpose: human-visible smoke verification of the merged Phase 1A baseline.

Initial source: `8bcd9c9e1d0ce3cfaecfffc779ec5ace95ee1a6c`.

Use `founder-smoke.ps1` on Windows. The launcher checks out the exact SHA, clears remote/API/Supabase values, forces `EXPO_PUBLIC_ZENZY_AI_MODE=mock`, runs `npm ci`, performs the Android Expo bundle check, then starts Expo for Android QR/device testing.

Record observations in `FOUNDER_SMOKE_TEST.md`.

## 1B-EAS — Internal EAS Preview

`../eas.json` intentionally contains only a `preview` build profile.

Controls:

- EAS environment: `preview`
- distribution: `internal`
- channel: `phase-1b-preview`
- Android output: installable APK
- AI mode: `mock`
- app identity: `Zenzy Preview`
- Android application id: `com.merchship.zenzy.phase1b.preview`
- iOS preview bundle id reserved by the preview app variant: `com.merchship.zenzy.phase1b.preview`
- production build profile: intentionally absent
- submit/store action: intentionally absent

The GitHub workflow `.github/workflows/zenzy-phase1b-preview.yml` is manual-dispatch only and requires the acknowledgement `PHASE1B_PREVIEW_ONLY`. It also fails closed until `EXPO_TOKEN` and `ZENZY_EAS_PROJECT_ID` are configured.

The workflow runs repository verification before packaging, requests an EAS Android preview build, downloads the resulting APK, validates it as an archive, computes SHA-256, records provenance, and uploads the evidence bundle as a retained GitHub Actions artifact.

### EAS bootstrap boundary

The workflow does not create an Expo account, EAS project, signing authority, store listing, production channel, or application-store release. Initial EAS project linkage and Android signing credentials, if not already present, remain explicit setup blockers.

## 1B-DEV — Controlled Fix Lane

Open this lane only for a demonstrated Phase 1B defect.

Required controls:

1. record the failing source SHA and gate;
2. create a narrowly scoped Phase 1B fix branch;
3. make only the targeted correction required for the defect;
4. rerun the relevant repository verification;
5. rerun every FST/EAS gate materially affected by the change;
6. record the fix SHA and resolution in the evidence packet;
7. integrate only through the repository's normal governed review path.

No unrelated feature expansion belongs in 1B-DEV.

If no code defect is found, record `1B-DEV: NOT INVOKED`.

## 1B-EVP — Evidence Packet

Use `EVIDENCE_PACKET.md` as the Phase 1B closure record. Phase 1B remains OPEN until Founder smoke evidence, retained preview provenance, install/launch evidence, defect closure, and the governance declaration are complete.

## Hard boundary

`MERGED != production release`

`PREVIEW != release`

`FST GREEN != RFTO`

`PHASE 1B GREEN != PRIME`

`PHASE 1B GREEN != BMOS`

`EVIDENCE != authority`

No production deployment, production release, external commercial operation, RFTO certification, PRIME inheritance, BMOS attachment, broader ZENZY admission, or authority transfer is authorized by this lane.
