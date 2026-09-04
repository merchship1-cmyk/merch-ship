# ZENZY Remote-Connected Internal Beta

State: `BLUE / CANDIDATE — NOT YET BUILT OR FOUNDER-PROVEN`

Baseline: `main` at `327fea5fde0d1b91df44db5bcf9353cca66035fd` when this lane was opened.

## Purpose

Advance the already-proven ZENZY dashboard, exact-resume UX, authenticated Supabase transport, idempotent remote transformation path, acceptance, and evidence capture into one retained internal Android beta that uses the remote backend instead of the Phase 1B deterministic mock.

This is a new lane. It does not modify, relabel, or replace the retained Phase 1B mock preview or its GREEN evidence.

## Authority boundary

Allowed:

- repository branch and draft PR work;
- CI/static/runtime verification;
- a manually authorized EAS **internal** Android APK build after the lane is integrated to `main`;
- founder/tester installation and bounded non-production testing;
- retained build, SHA-256, runtime, and device evidence.

Not allowed:

- production deployment or production AI routing;
- app-store submission or public distribution;
- EAS Update publication/channel creation;
- customer production data;
- external commercial operation;
- live mesh attachment, RFTO, PRIME or BMOS authority;
- PR #38 or WREAS advancement;
- automatic merge or automatic release.

## Build identity

The remote beta must remain separately installable from the Phase 1B preview:

- app name: `Zenzy Internal Beta`
- Android package: `com.merchship.zenzy.internalbeta`
- URL scheme: `zenzy-internal-beta`
- EAS profile: `remote-beta`
- EAS environment: `preview`
- distribution: `internal`
- Android artifact: APK
- AI mode: `remote`
- EAS Update channel: absent
- production profile: absent
- submit profile: absent

The existing `preview` profile remains `mock` mode and retains its original Phase 1B identity.

## Existing proven foundation

The lane reuses rather than replaces the current ZENZY implementation:

- Supabase session persistence through SecureStore on native;
- authenticated bearer-token remote transformation transport;
- publishable-key client boundary;
- bounded retry and idempotency request IDs;
- remote acceptance and evidence endpoints;
- two-user authenticated Phase 1A proof;
- Android Detox remote-mode proof;
- dashboard home and exact unfinished-run resume;
- JUNGLE fixed-ID idempotency remediation proof.

## Gate sequence

1. PR contract/static checks pass.
2. Existing Phase 1A and V2 required lanes remain GREEN.
3. Founder reviews the exact PR head.
4. Merge is a separate explicit decision; this document does not authorize it.
5. After integration to `main`, manually dispatch `ZENZY Remote Internal Beta` with the exact acknowledgement `REMOTE_INTERNAL_BETA_ONLY`.
6. Retain EAS build ID, exact source SHA, APK, SHA-256, workflow artifact ID/digest, and non-production boundary.
7. Install on founder physical Android and execute the device acceptance checklist below.
8. Only after retained evidence passes may this lane be classified GREEN for internal beta.

## Founder physical-device acceptance

Required before GREEN:

- install and launch the separately identified Internal Beta APK;
- sign in successfully with an authorized test account;
- confirm session survives full app close/reopen;
- create one real remote transformation and receive a schema-valid result;
- accept the transformation successfully;
- record evidence successfully;
- close the app mid-run, reopen, and use **Continue where I left off** to return to the exact unfinished checkpoint;
- verify a second test user cannot read the first user's run/evidence;
- verify signed-out/expired-session behavior fails closed with clear re-auth UX;
- verify no production profile, submit action, update channel, customer production data, or authority escalation occurred.

## Evidence classification

Until the cloud APK and physical-device checklist are retained:

`ZENZY REMOTE INTERNAL BETA = BLUE / CANDIDATE`

A passing PR or successful EAS build alone is not enough to call the lane GREEN.