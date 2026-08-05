# PFU Autonomous Runtime v1

This package installs the first executable unit of the PFU autonomous multi-engine loop:

- GitHub webhook ingress through a Notion Worker
- HMAC-SHA256 signature verification
- provider-delivery deduplication
- canonical PFU event envelopes
- repository allowlist authorization
- append-only Supabase event, evidence, processing, and mutation ledgers
- dormant Notion and GHL projection boundaries

## Runtime authority

```text
GitHub = execution-event authority
Notion Worker = ingress and orchestration boundary
Supabase = durable event and evidence authority
Notion projection = disabled in this unit
GHL dispatch = disabled in this unit
AI Mesh mutation = disabled in this unit
```

This branch contains code and migrations only. It does not apply the database migration, deploy the Worker, configure secrets, create a GitHub App, activate webhooks, mutate Notion, call GHL, merge, or deploy.

## Folder map

```text
v2/pfu-runtime/
├── README.md
└── worker/
    ├── .env.example
    ├── package.json
    ├── tsconfig.json
    ├── src/
    │   ├── canonical.ts
    │   ├── index.ts
    │   ├── security.ts
    │   ├── supabase.ts
    │   └── types.ts
    └── tests/
        ├── canonical.test.ts
        └── security.test.ts
```

Database migration:

```text
v2/supabase/migrations/20260804144700_pfu_autonomous_runtime_ledger.sql
```

## Local verification

Requires Node.js 22+ and npm 10+.

```bash
cd v2/pfu-runtime/worker
npm install
npm run verify
```

The dependency versions are pinned in `package.json`. Generate and commit the lockfile from an authenticated networked build environment before deployment.

## Required secrets

```text
GITHUB_WEBHOOK_SECRET
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
PFU_ALLOWED_REPOSITORIES
```

`PFU_ALLOWED_REPOSITORIES` is a comma-separated allowlist such as:

```text
merchship1-cmyk/merch-ship
```

The service-role key is server-side only. It must never be exposed to Expo, React Native, browser code, repository files, logs, or Notion pages.

## Activation sequence

1. Review and apply the migration to an explicitly authorized staging project.
2. Create an internal Notion integration if a later projection phase requires Notion API writes.
3. Install the Notion CLI and authenticate to the intended workspace.
4. Set Worker secrets using `ntn workers env set`.
5. Deploy the Worker and retrieve its webhook URL.
6. Configure the GitHub App webhook secret and URL.
7. Subscribe only to authorized GitHub events.
8. Run signed, invalid-signature, duplicate-delivery, and unauthorized-repository tests.
9. Collect database evidence by correlation ID.
10. Keep Notion and GHL dispatch disabled until their separate gates pass.

## Acceptance gates

- invalid signatures are rejected before persistence
- valid events are persisted before any projection or runtime effect
- duplicate GitHub delivery IDs produce one `pfu_events` record
- every accepted event has a deterministic payload hash and correlation ID
- unauthorized repositories receive a `DENIED` verdict
- append-only tables reject updates and deletes
- `anon` and `authenticated` receive no table access
- no live side effect is possible from this unit
