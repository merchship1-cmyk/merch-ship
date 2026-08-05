# Phase-1A Slice-1 Rollback Plan

No live database or Edge deployment is authorized by this branch.

## Code rollback

Revert the Phase-1A Slice-1 commit or close the draft PR. Phase 0 mock mode and
the protected `todo-app/` heritage remain available from `main`.

## Test-database rollback, if later authorized

1. Stop the Edge Function version that writes `user_id`-owned runs.
2. Revoke authenticated access to both transformation tables.
3. Drop `evidence_owner_select` and `runs_owner_select`.
4. Drop `zenzy_transformation_runs_user_id_idx`.
5. Drop `zenzy_transformation_runs_user_id_fkey`.
6. Drop `user_id` only after confirming no retained records require ownership.

The destructive database steps require a separately reviewed rollback
migration. They must not be run manually against production.
