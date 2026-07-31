# ZENZY Fullstack Finisher v2.0

This document governs the completion path for the ZENZY mobile successor in `v2/`.

## Current status

- Verdict: **BLUE**
- Phase 0 implementation: merged into `main` through PR #4
- Local mode: deterministic mock verified
- Remote backend: coded, not evidenced as activated
- Authenticated persistence: incomplete
- EAS: not configured
- Installable private beta: not evidenced
- Public release: not authorized

Repository truth takes precedence over prompt assumptions. Every run must reconcile the live default branch, pull requests, CI state, relevant files, and ZENZY governance records before planning or mutation.

## Repository boundaries

- Active application: `v2/`
- Protected heritage: `todo-app/`
- Preserve a zero unintended diff in `todo-app/`.
- Never commit client secrets, OpenAI keys, Supabase service-role keys, signing credentials, or store credentials.
- Never merge, deploy, submit builds, or release without the corresponding explicit founder authorization.
- Never claim that an action occurred without direct tool evidence.

## Verified Phase 1 gaps

- `v2/src/services/transformationClient.ts` does not attach Supabase `Authorization` or `apikey` headers.
- The Phase 0 persistence tables do not contain `user_id` ownership.
- Current RLS posture is server-only and does not implement authenticated user access.
- The Edge Function does not yet establish an end-to-end authenticated user-owned persistence contract.
- `v2/app.json` lacks Android and iOS application identifiers.
- No `v2/eas.json` is present in the Phase 0 file set.

## Completion roadmap

1. **Phase 1 code** — auth session handling, user ownership, least-privilege RLS, persistence, stable error contracts, tests, governance, and a draft PR.
2. **Staging activation** — approved migrations, Edge Function deployment, staging-only secrets, authenticated smoke tests, and RLS-isolation evidence.
3. **EAS private beta** — application IDs, development/preview profiles, internal Android build, iOS development path, and install evidence.
4. **Real-device private beta** — named testers, core-loop scenarios, defects, fixes, regression proof, and usability evidence.
5. **Store closed testing** — signed artifacts, privacy/support/store package, closed-track upload, and tester evidence.
6. **GREEN GATE** — exact commit, clean CI, security checks, closed-testing proof, monitoring, rollback, and explicit production authorization.

## Authorization commands

Use one gate at a time:

- `AUTHORIZE PHASE-1 CODE ONLY`
- `AUTHORIZE PHASE-1 STAGING ACTIVATION`
- `AUTHORIZE EAS PRIVATE BETA BUILD`
- `AUTHORIZE STORE CLOSED TESTING`
- `AUTHORIZE GREEN PRODUCTION RELEASE`

### Phase 1 code authority

Allowed:

- create a dedicated branch;
- modify approved `v2/` code, tests, migrations, environment templates, governance, CI, and documentation;
- implement authenticated sessions, user-owned persistence, RLS policies, and tests;
- open a draft PR.

Forbidden:

- Supabase deployment;
- real secret writes;
- merge to `main`;
- EAS submission;
- store upload;
- public release.

## Phase 1 target file map

Exact filenames must be reconciled against the live tree before implementation.

```text
v2/package.json
v2/package-lock.json
v2/app.json
v2/.env.example
v2/src/lib/supabase.ts                         NEW
v2/src/auth/AuthProvider.tsx                   NEW
v2/src/auth/sessionStorage.ts                  NEW
v2/src/screens/AuthScreen.tsx                  NEW or integrated auth surface
v2/src/services/transformationClient.ts        MODIFY
v2/src/services/transformationRepository.ts    NEW
v2/src/domain/auth.ts                           NEW
v2/src/domain/persistence.ts                    NEW
v2/src/**/__tests__                             ADD/MODIFY
v2/supabase/migrations/<phase1_auth>.sql        NEW
v2/supabase/functions/transform/index.ts        MODIFY
v2/scripts/staging-smoke.ts                     NEW
v2/governance/ZAC-P1-001.md                     NEW
.github/workflows/v2-component-pipeline.yml     MODIFY
v2/README.md                                    MODIFY
```

## Required acceptance tests

| ID | Test | Expected result |
|---|---|---|
| P1-AUTH-01 | Valid session remote request | Authorization present; strict successful response |
| P1-AUTH-02 | No session | Controlled auth-required state; no false persistence |
| P1-AUTH-03 | Expired token | Refresh or explicit re-auth; no silent failure |
| P1-DATA-01 | User A creates a run | Stored with User A ownership |
| P1-DATA-02 | User B reads User A run | Denied by RLS |
| P1-DATA-03 | User A reloads own run | Success after app restart |
| P1-FUNC-01 | Provider failure | Stable error; no false completed record |
| P1-FUNC-02 | Malformed provider output | Rejected and safely evidenced |
| P1-REG-01 | Mock mode regression | Existing deterministic tests remain green |
| P1-GOV-01 | Heritage boundary | Zero unintended diff in `todo-app/` |
| P1-SEC-01 | Secret scan | No client or committed secret |

## Verification contract

Every completion claim must include:

- branch and commit SHA;
- files changed;
- commands executed;
- test and CI results;
- staging/build identifiers when applicable;
- security and RLS evidence;
- defects and residual risk;
- RED, BLUE, or GREEN verdict;
- one exact next founder command.

## Stop conditions

Stop mutation when:

- the target repository or branch is ambiguous;
- connected state contradicts authorization;
- a secret appears in client code or a commit;
- RLS would need to be weakened to pass;
- `todo-app/` changes unexpectedly;
- migration could destroy data without an approved recovery path;
- deployment, merge, store upload, or public release would be required but is not authorized.

## Immediate next command

```text
AUTHORIZE PHASE-1 CODE ONLY.
Reconcile main, create a dedicated Phase 1 branch, implement authenticated client sessions, user-owned persistence, least-privilege RLS, secure Edge Function identity and persistence, tests, CI updates, governance documentation, and a draft PR. Do not deploy, merge, configure production, upload builds, or release.
```
