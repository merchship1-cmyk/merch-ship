# ZENZY Phase-1A Verification Spine

This folder is the single verification subsystem for the authenticated Phase-1A gate.

## Lanes

1. **Orchestrator** — signs in two real test users, creates a remote transformation, proves evidence is blocked before acceptance, proves user B cannot accept or read user A's run, persists acceptance/evidence, and calls the final RLS evidence hook.
2. **Mobile simulator** — Detox drives the Expo Android app through login → input → clarity → explicit acceptance → execution → review. The Android project is generated only in CI and is not a release package mutation.
3. **Evidence hook** — `supabase/functions/zenzy-evidence-hook` performs owner and cross-user reads with user access tokens plus the publishable key. It never receives a service-role key.
4. **CI gate** — `.github/workflows/zenzy-phase1a.yml` fuses static, runtime, and mobile checks into `Phase 1A / Required Gate`.

## Required staging configuration

The workflow intentionally fails closed until these are configured:

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `ZENZY_TEST_USER_A_EMAIL`
- `ZENZY_TEST_USER_A_PASSWORD`
- `ZENZY_TEST_USER_B_EMAIL`
- `ZENZY_TEST_USER_B_PASSWORD`
- repository variable `ZENZY_ANDROID_PACKAGE` for the temporary CI Android application id
- the migration and `transform`, `accept`, `record-evidence`, and `zenzy-evidence-hook` functions deployed to the authorized staging Supabase project

No service-role key is exposed to the orchestrator or mobile job. Live deployment and production release remain separate governed actions.

**State: BLUE — implementation installed in code; runtime proof pending staging deployment and CI evidence.**
