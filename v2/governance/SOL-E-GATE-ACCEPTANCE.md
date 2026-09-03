# SOL E-Gate Acceptance

Status: `CODE PREPARED — LIVE LOOP NOT YET CERTIFIED`

## Authorized boundary

This slice may receive signed Slack and Linear webhooks, create one Linear issue
from an authorized `SOL run this` Slack command, post bounded Slack return
messages, and append server-side evidence. It does not authorize merge, deploy,
repository writes from SOL, release publication, destructive actions, or broad
lane execution.

## Required runtime secrets

- `SLACK_SIGNING_SECRET`
- `SLACK_BOT_TOKEN`
- `SOL_FOUNDER_SLACK_USER_ID`
- `SOL_AUTHORIZED_SLACK_USER_IDS` (optional comma-separated additions)
- `LINEAR_API_KEY`
- `LINEAR_TEAM_ID`
- `LINEAR_ASSIGNEE_ID` (optional)
- `LINEAR_WEBHOOK_SECRET`
- `FOUNDER_SLACK_CHANNEL`
- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY` or `SUPABASE_SERVICE_ROLE_KEY`
- `SOL_MUTATIONS_ENABLED=false` until the controlled test begins

## Certification sequence

1. Deploy `sol-slack` and `sol-linear` to an authorized test runtime.
2. Configure Slack Events API to call `sol-slack`.
3. Configure a Linear Issue webhook to call `sol-linear`.
4. Keep `SOL_MUTATIONS_ENABLED=false` and prove a signed command records a
   blocked evidence event without creating a Linear issue.
5. Set `SOL_MUTATIONS_ENABLED=true` for the bounded test.
6. Send one authorized Slack message containing `SOL run this` and a concrete
   task description.
7. Collect the Slack event ID, Linear issue ID/identifier/URL, Slack reply
   timestamp, evidence ID, idempotency row, and event claim.
8. Redeliver the same Slack event and prove no second Linear issue exists.
9. Change the Linear issue status once and collect its `Linear-Delivery` ID,
   result hash, checkpoint row, Slack update timestamp, and evidence ID.
10. Redeliver that Linear webhook and prove no second Slack update exists.
11. Return `SOL_MUTATIONS_ENABLED=false`.

## PASS verdict

`E-GATE PASS` requires all eleven steps, exact evidence references, and zero
unexplained duplicate external mutations. Code review, static tests, or table
existence alone do not satisfy the gate.
