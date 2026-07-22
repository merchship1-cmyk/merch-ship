# MERCH SHIP CI Governance Lanes

This document defines the GitHub Actions control path for the preserved Z-001 v1 component and the future v2 runtime.

| Lane | Purpose | Current state | Enforcement |
| --- | --- | --- | --- |
| A — Heritage | Preserve the exact Z-001 v1 HTML/CSS/JS source | Active | Git blob pins and static-boundary checks |
| B — v2 Runtime | Validate the future server-side v2 package | Staged | Activates only for changes under `v2/` |
| C — Governance | Verify governance packets and component lineage | Staged | Runs after Lane B succeeds |
| D — Registry | Write an approved release record | Blocked | Requires a registered target, schema, credential, approval, and receipt |

## Gate order

`Lane A → Lane B → Lane C → Lane D`

Lane A is operational now. Lanes B and C are contract scaffolds: they remain dormant until a `v2/` package is introduced and must not be described as passing runtime evidence before that activation. Lane D is intentionally not implemented as a write workflow because the repository contains no registry contract or authorized target.

## Change authority

- A change to `todo-app/index.html`, `todo-app/styles.css`, or `todo-app/app.js` must deliberately update the Z-001 baseline manifest in the same reviewed change.
- A v2 change must supply a committed lockfile and every script named by the v2 workflow.
- A registry write may be activated only after its target, payload, authority, credential scope, approval gate, and evidence receipt are versioned.
