# PFU × GitHub Copilot governance

This directory is the repository-backed desired-state, validation, and evidence layer for PFU Copilot governance.

## Authority boundary

GitHub Enterprise **AI Controls** are authoritative for Copilot policy and model settings. Copilot seat assignment is governed separately through GitHub **Billing and licensing**. Organization controls may remain active when access is organization-assigned and Enterprise Teams model access mode is not enabled.

These files do not change licenses, models, agents, enterprise teams, or policies. They support review, validation, evidence collection, and controlled manual reconciliation only.

Notion control center: https://app.notion.com/p/3b013e5cbb9f819c9986fe68e02a6d89

## Resolution contract

1. Enterprise `disabled` is a hard deny and cannot be overridden by an organization or team.
2. Enterprise `enabled` applies to users governed by that enterprise policy.
3. When Enterprise Teams mode is disabled, enterprise `optional` remains organization-controlled.
4. When Enterprise Teams mode is verified as enabled, organization model settings are deactivated and `optional` requires an enterprise-team grant.
5. Access from multiple enterprise teams is additive while Enterprise Teams mode is enabled.
6. GitHub normally applies the most restrictive policy when a user has licenses from multiple enterprises.
7. PFU adds a routing-only stop for multiple enterprise license sources until identity, license source, and the effective GitHub-native outcome are evidenced. This stop does not override or mutate GitHub enforcement.
8. Unconfigured model behavior must be resolved from the observed mode and GitHub default-availability policy; it must never be inferred from public documentation alone.

## Files

- `enterprise.yaml` — authority split, observed scope, native resolution rules, PFU overlay, controls, and evidence posture.
- `model-registry.yaml` — observed model inventory; intentionally empty until live inventory is captured.
- `agent-registry.yaml` — separately governed agent capability classes.
- `client-policy-registry.yaml` — independent client policies, including Copilot CLI.
- `surface-matrix.yaml` — exact IDE, CLI, web, GitHub Mobile, and Copilot app evidence surfaces.
- `organizations/` — conditional organization-policy references. Their runtime role depends on observed Enterprise Teams mode.
- `teams/` — requested team grants and membership evidence. Only optional models belong in `model_grants`.
- `mesh-routing.yaml` — GitHub-native resolution mapping plus PFU routing-only stop rules.
- `validate_policy.py` — structural validation, inventory gates, activation gates, and resolution logic.
- `scan_secrets.py` — high-risk credential-pattern and structured-file scan. It does not claim to prove that files are secret-free.
- `tests/` — resolution and validator regression tests.

## Validation profiles

Structural validation permits documented inventory gaps but proves that those gaps block activation:

```bash
python3 governance/copilot/validate_policy.py --mode structural
python3 -m unittest discover governance/copilot/tests -v
python3 governance/copilot/scan_secrets.py
```

Activation validation is a hard gate and must fail until every required live value and evidence field is present:

```bash
python3 governance/copilot/validate_policy.py --mode activation
```

## Inventory and activation sequence

1. Verify the enterprise slug against its expected slug, active/accessibility state, Copilot plan, organization slug, and Enterprise Teams mode.
2. Export or manually evidence the current GitHub enterprise model policy and default-availability policy.
3. Register models using GitHub canonical identifiers, observed states, timestamps, and evidence URLs.
4. Verify enterprise-team slugs, membership, license sources, and effective multi-team unions.
5. Record agent, client-policy, and exact surface availability.
6. Capture and verify the snapshot signature, signer key, algorithm, SHA-256, timestamp, observer, and source URL.
7. Run structural validation, regression tests, and the high-risk secret-pattern scan.
8. Run activation validation; do not continue while any activation block remains.
9. Obtain founder approval for frontier access, with evidence and expiry.
10. Apply separately approved changes manually in the correct GitHub control surface.
11. Run access tests, capture audit and rollback evidence, and reconcile Notion.
12. Activate mesh routing only from a verified, signed, time-bounded snapshot.

## Non-goals

- No live enterprise policy mutation from GitHub Actions.
- No license or seat assignment from this repository.
- No secret or enterprise-admin token stored in this repository.
- No claim of real-time GitHub-to-Notion synchronization.
- No automatic ChatGPT access to Notion or GitHub without authenticated connectors.
- No cross-enterprise decision inferred from a username alone.

## Current state

`GOVERNANCE GREEN / INVENTORY REQUIRED` — the corrected control structure and hard activation gates exist; live enterprise values, organization identity, model catalog, memberships, license sources, surface access, and runtime evidence remain unverified.

`MERGE: NOT AUTHORIZED`

`ACTIVATION: NOT AUTHORIZED`
