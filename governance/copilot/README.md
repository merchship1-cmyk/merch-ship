# PFU × GitHub Copilot governance

This directory is the repository-backed desired-state and evidence layer for PFU Copilot governance.

## Authority boundary

GitHub Enterprise **AI Controls** are the authoritative runtime. These files do not change Copilot licenses, models, agents, enterprise teams, or policies by themselves. They support review, validation, evidence, and controlled manual reconciliation.

Notion control center: https://app.notion.com/p/3b013e5cbb9f819c9986fe68e02a6d89

## Resolution contract

1. Enterprise `disabled` is a hard deny and cannot be overridden by a team.
2. Enterprise `enabled` applies to all licensed users in the enterprise.
3. Enterprise `optional` requires an enterprise-team grant while Enterprise Teams mode is active.
4. Access from multiple enterprise teams is additive within one enterprise.
5. Organization model controls are deactivated only while Enterprise Teams mode is enabled.
6. GitHub does not combine policies across enterprises. PFU requires explicit identity and license-source resolution before external mesh routing.

## Files

- `enterprise.yaml` — enterprise baseline and resolution contract.
- `model-registry.yaml` — verified model inventory; intentionally empty until live inventory is captured.
- `agent-registry.yaml` — separately governed agent capability classes.
- `surface-matrix.yaml` — IDE, CLI, web, and app compatibility evidence.
- `organizations/` — legacy organization-policy references, not active team-mode policy.
- `teams/` — requested team grants. Only optional models belong in `model_grants`.
- `mesh-routing.yaml` — PFU overlay rules for exported, signed policy snapshots.
- `validate_policy.py` — structural validation and boundary checks.

## Activation sequence

1. Export or manually evidence the current GitHub enterprise model policy.
2. Replace all unverified fields with observed values and evidence URLs.
3. Register models using GitHub's canonical identifiers and current availability states.
4. Add optional-model grants to reviewed team manifests.
5. Run `python3 governance/copilot/validate_policy.py`.
6. Review the effective union for every multi-team user.
7. Apply approved changes manually in GitHub Enterprise AI Controls.
8. Capture audit evidence and reconcile Notion.
9. Activate mesh routing only from a signed, time-bounded export.

## Non-goals

- No live Enterprise policy mutation from GitHub Actions.
- No secret or enterprise-admin token stored in this repository.
- No claim of real-time GitHub-to-Notion synchronization.
- No automatic ChatGPT access to Notion or GitHub without authenticated connectors.
- No cross-enterprise policy merge inferred from a username alone.

## Current state

`BLUE / INVENTORY REQUIRED` — the control structure exists; live enterprise values, model catalog, team membership, and runtime access remain unverified.
