# Phase-1A Slice-1 Implementation Contract

Status: AUTHORIZED FOR CODE AND LOCAL VERIFICATION

Authority owner: Ryan Richard Levack-Carr

## Mission

Add authenticated sessions, server-derived ownership, least-privilege RLS, and
an authenticated Edge-only write path to the existing Phase 0 vertical slice.

## Allowed scope

- Work only inside `v2/` plus directly supporting CI metadata if required.
- Preserve deterministic mock mode and the Phase 0 execution loop.
- Add Supabase email/password session handling for remote mode.
- Add `user_id` ownership to transformation runs.
- Give authenticated clients owner-scoped reads only.
- Validate the bearer token at the Edge Function before server-authorized writes.
- Add tests, evidence, acceptance, rollback, and a draft PR.

## Protected and excluded scope

- `todo-app/` is immutable and must remain zero-diff.
- No Notion runtime adapter, research ingestion, new module, or capability fusion.
- No output table, retry engine, run-history UI, or Slice-2 runtime.
- No live migration, Edge deployment, staging activation, merge, or release.
- No client-side privileged key or client-supplied ownership.

## Stop line

Stop at a locally verified branch and draft pull request. Runtime acceptance
remains pending until isolated RLS integration, migration reapply, and Edge HTTP
tests are run in an authorized Supabase environment.
