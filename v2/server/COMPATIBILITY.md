# ZSM-BE-001 compatibility report

## Scope

This backend spine is additive. It does not replace or mutate the Phase 0 tables introduced by PR #4:

- `zenzy_transformation_runs`
- `zenzy_transformation_evidence`

## Compatibility position

The Phase 0 tables remain the narrow runtime record for one user transformation and its five evidence measures.

The Sync Machine tables add the wider governed system context:

- `workspaces` owns tenancy and schema version.
- `workflows` owns the canonical workflow record and lifecycle.
- `workflow_steps` owns ordered execution structure.
- `analyses`, `recommendations`, and `tests` own evaluation artifacts.
- `evidence` stores cross-system verification references.
- `metrics` stores measured outcomes.
- `events` stores append-only governed event envelopes.
- `sync_jobs` stores one record per synchronization attempt.
- `idempotency_keys` owns one business-operation identity.

## Non-destructive binding strategy

A future separately authorized migration may link `zenzy_transformation_runs` to a workspace and workflow by adding nullable foreign keys or by emitting an event/evidence record. This candidate does not perform that binding.

No data is copied, renamed, deleted, or backfilled by ZSM-BE-001.

## Source-of-truth boundaries

- Notion remains the canonical governance source.
- PostgreSQL is the canonical runtime state and event store for authorized operations.
- GHL is an operational runtime/mirror and not canonical authority.
- The Expo client does not write governance, event, sync-job, or idempotency records directly.

## Controlled values

`WorkflowState` is fixed to the canonical lifecycle and branches.

`StepState` and the complete `ObjectType` union remain open until separately canonized. The database stores them as text and the server types intentionally do not invent final unions.

## Rollback limits

The migration is forward-additive. Rolling it back by dropping tables would destroy governed evidence, event history, idempotency identity, and sync-attempt records. Production rollback therefore requires an explicit data-retention and archival plan and is not authorized by this candidate.
