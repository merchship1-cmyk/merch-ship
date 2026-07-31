# ZENZY Build Cycle — 2026-07-31

## Engine state

| Engine | Build-cycle action | State |
| --- | --- | --- |
| Identity | Supabase bearer-token middleware and secret gate | BLUE |
| Product | Canonical seven-module app map | BLUE |
| Workflow | Governed processing route and bounded input contract | BLUE |
| Sync | Runtime readiness and cross-system documentation | BLUE |
| AI Mesh | OpenAI Responses API with strict structured output | BLUE |
| User | Authenticated user context on transformations | BLUE |
| Commerce | Content module mapped to commercial readiness | BLUE |

## Connector verification

- Replit: connected; runtime process and `/api/healthz` are live.
- GitHub: connected with administrator and push permission to `merchship1-cmyk/merch-ship`.
- Notion: connected to Ryan Levack-Carr's workspace with search, fetch, create, and update access.
- Google Drive: connected to the expected account.
- OpenAI Platform: new key created securely and verified in the approved local environment file.
- Supabase: connected; project is `ACTIVE_HEALTHY` in `ca-central-1`.
- Supabase data plane: Phase‑0 tables and the evidence foreign-key index are installed.
- Supabase security: RLS enabled; `anon` and `authenticated` have no table DML grants.

## Runtime blockers observed

The Replit app reported `OPENAI_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_JWT_SECRET` as missing. The modernized middleware validates access tokens through Supabase Auth, so the shared JWT secret is retained only as an optional legacy variable. The Replit process is live, but protected transformation routes cannot operate until the OpenAI key, Supabase URL, and active publishable/anon key are installed through Replit's Secrets interface.

## Verification gate

This branch is eligible for GREEN only after Replit secret installation, authenticated Supabase verification, one database persistence test, and one live OpenAI transformation smoke test. Local dependency installation, type checking, automated tests, and production build are complete.
