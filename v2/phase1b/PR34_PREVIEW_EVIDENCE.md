# ZENZY Phase 1B — PR #34 Retained Preview Evidence

Evidence state: VERIFIED / NON-PRODUCTION INTERNAL PREVIEW
Evidence date: 2026-09-03

## Source lineage

- PR: `#34` — `ZENZY Dashboard + Resume V1 — return to exact unfinished work`
- PR head: `64a27db73ae1b78ddd13cc4b6d89584890e6ac21`
- PR base: `d6d7aa7f29bc3dc3a689bcd3712e1decd612ae3b`
- Tested GitHub merge candidate: `9690b4ef1a03eb0d9256913c207e88d93018f747`
- Tested merge-candidate tree: `0f9c61fdbfc3132723d80c58a732d5dc5678c338`
- PR #34 merged-main commit: `5a99d90050b25e10bdd7230c2a4ffd85ca182d21`
- PR #34 merged-main tree: `0f9c61fdbfc3132723d80c58a732d5dc5678c338`

The tested merge candidate and the PR #34 GitHub merge commit have the identical tree SHA. Therefore the retained APK was built from source content identical to the client source content integrated through PR #34; only the merge commit identity/timestamp differs.

## Hardened-main follow-up

ZENZY `main` later advanced through PR #35:

- PR #35 reviewed head: `8b2022faa9a9b41874296c5c941eeda8d34775ff`
- PR #35 merge commit: `f537cc051ffff2853a9a99211b81829c1eb76227`

A repository comparison from PR #34 merged main `5a99d90050b25e10bdd7230c2a4ffd85ca182d21` to hardened main `f537cc051ffff2853a9a99211b81829c1eb76227` contains only:

- `.github/workflows/zenzy-zj001-remediation.yml`;
- Supabase Edge Function governance/identifier helpers and tests;
- `transform`, `accept`, `record-evidence`, and `zenzy-evidence-hook` server-function changes;
- the `zenzy_security_events` migration.

No Expo/React Native client source, app package/build configuration, EAS preview configuration, or Android client file changed. The retained APK therefore continues to represent the same Phase 1B client code present on hardened `main`. The staging backend has separately advanced through PR #35 hardening; that does not change the retained APK into a remote or production artifact.

## GitHub Actions retained artifact

Workflow run: `33742972511`
Workflow: `ZENZY PR 34 Resume Preview`

Primary retained artifact:

- artifact ID: `9889097019`
- artifact name: `zenzy-pr34-resume-preview-64a27db73ae1b78ddd13cc4b6d89584890e6ac21`
- GitHub artifact archive digest: `sha256:2ac0f1de04925e5307756cbb577e072f2973742b5b5916320b97ba2f873976e5`
- retained until: `2026-10-03T10:29:59Z`

Retained bundle contents:

- `ZENZY-PR34-Resume-Preview.apk`
- `ZENZY-PR34-Resume-Preview.apk.sha256`
- `eas-build-metadata.json`
- `provenance.json`

## EAS build evidence

- EAS build ID: `32b0642e-4b22-4c2e-97ac-6cca46156333`
- status: `FINISHED`
- platform: `ANDROID`
- distribution: `INTERNAL`
- build profile: `preview`
- app identifier: `com.merchship.zenzy.phase1b.preview`
- SDK: `57.0.0`
- app version: `0.1.0`
- build version: `1`
- EAS recorded Git commit: `9690b4ef1a03eb0d9256913c207e88d93018f747`

## APK integrity

APK: `ZENZY-PR34-Resume-Preview.apk`

SHA-256:

`1c6929faadba48501097036f945b6d44a4f806622f15f9e09ee7b04a272ea4b7`

The SHA-256 value is retained both in `provenance.json` and in `ZENZY-PR34-Resume-Preview.apk.sha256`.

## Preview configuration boundary

The source tree used by the retained build contains only the `preview` EAS build profile:

- Node `22.23.2`
- environment `preview`
- internal distribution
- Android `apk`
- `ZENZY_PHASE1B_PREVIEW=1`
- `EXPO_PUBLIC_ZENZY_AI_MODE=mock`
- no `production` build profile
- no `submit` profile
- no EAS Update channel field

For Phase 1B evidence purposes, the absent update-channel configuration is recorded as:

`eas_update_channel=NONE_NOT_PROVISIONED`

This is supplemental evidence tied to the exact tested PR #34 tree SHA; it does not modify the immutable retained build artifact.

## Founder real-device evidence

PR #34 records Founder physical Android validation at head `64a27db73ae1b78ddd13cc4b6d89584890e6ac21`:

- standalone APK installed and launched;
- governed PFU preview route completed;
- app close/reopen restored active work;
- `Continue where I left off` returned to the exact clarity checkpoint;
- IDEA → PLAN → CREATE → SCHEDULE → REVIEW completed;
- evidence capture completed.

Classification recorded on PR #34: `REAL-DEVICE PASS` for the resume acceptance target and governed mock mesh slice.

## Authority boundary

This evidence establishes an internal non-production installable preview and its source/build/artifact provenance only.

It does not authorize:

- production deployment or release;
- app-store submission;
- EAS Update publication;
- live mesh attachment;
- production AI routing;
- customer access;
- RFTO certification;
- PRIME/BMOS attachment;
- broader ZENZY authority;
- authority transfer.

`PREVIEW PASS != PRODUCTION AUTHORITY`
`MERGED SOURCE != PRODUCTION RELEASE`
`EVIDENCE != AUTHORITY`
