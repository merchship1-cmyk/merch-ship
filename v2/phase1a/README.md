# ZENZY Phase-1A Verification Spine

This folder is the single verification subsystem for the authenticated Phase-1A gate.

## Lanes

1. **Orchestrator** — signs in two real test users, creates a remote transformation, proves evidence is blocked before acceptance, proves user B cannot accept or read user A's run, persists acceptance/evidence, and calls the final RLS evidence hook.
2. **Mobile simulator** — Detox drives the Expo Android app through login → input → clarity → explicit acceptance → execution → review. The Android project is generated only in CI and is not a release package mutation.
3. **Evidence hook** — `supabase/functions/zenzy-evidence-hook` performs owner and cross-user reads with user access tokens plus the publishable key. It never receives a service-role key.
4. **CI gate** — `.github/workflows/zenzy-phase1a.yml` fuses static, runtime, and mobile checks into `Phase 1A / Required Gate`.

## Staging runtime installed

The connected Supabase staging project now has:

- `transform` — active, JWT verified
- `accept` — active, JWT verified
- `record-evidence` — active, JWT verified
- `zenzy-evidence-hook` — active, JWT verified
- `zenzy_transformation_acceptance` — RLS enabled, owner-scoped SELECT only
- evidence owner hardening — `(run_id, user_id)` must match the canonical run owner

A rollback-only database smoke test verifies:

1. evidence is rejected before acceptance;
2. acceptance moves `generated -> reviewed`;
3. evidence moves `reviewed -> verified`;
4. the smoke transaction leaves no test rows behind.

## Remaining CI configuration

The workflow intentionally fails closed until these GitHub Actions secrets are configured:

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `ZENZY_TEST_USER_A_EMAIL`
- `ZENZY_TEST_USER_A_PASSWORD`
- `ZENZY_TEST_USER_B_EMAIL`
- `ZENZY_TEST_USER_B_PASSWORD`

The Android application id is deterministic and CI-only (`com.merchship.zenzy.phase1a.test`), so no Android package repository variable is required.

No service-role key is exposed to the orchestrator or mobile job. Repository branch protection must separately require `Phase 1A / Required Gate` before this PR can be treated as merge-gated.

**State: BLUE — code and staging runtime installed; authenticated two-user and Android Detox evidence still pending GitHub Actions credentials.**
