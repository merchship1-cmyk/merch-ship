# Phase-1A Slice-1 — Auth, Ownership, RLS

## Outcome

Adds Supabase sessions to remote mode, JWT-validated Edge execution,
server-derived run ownership, owner-scoped reads, and edge-only writes. Mock
mode remains deterministic and account-free.

## Changes

- Expo SecureStore-backed Supabase session client and auth gate.
- Authenticated transport with bearer token and publishable `apikey`.
- Edge token validation and server-authorized persistence.
- Fail-closed ownership migration and owner-scoped RLS.
- Static contract and transport tests.
- Acceptance, evidence, and rollback artifacts.

## Explicit exclusions

- No live migration or Edge deployment.
- No merge or staging activation.
- No `todo-app/` changes.
- No Slice-2 runtime or Notion runtime adapter.

## Verification

- [x] `EXPO_NO_TELEMETRY=1 npm run verify`
- [x] `todo-app/` zero-diff
- [ ] RLS integration in an authorized test database
- [ ] Migration reapply in an authorized test database
- [ ] Edge HTTP authentication in an authorized test runtime

The first two checks are required before this draft PR is opened. The final
three keep acceptance pending and do not authorize a live deployment.
