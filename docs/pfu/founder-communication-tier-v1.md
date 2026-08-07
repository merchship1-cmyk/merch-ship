# Founder-Grade Communication Tier Module v1.0

Module ID: `PFU-FGCT-001`

## Purpose

Provide a machine-enforceable communication boundary for PFU claims without granting execution authority.

## Canonical state

- System-of-record installation: `SSOT_INSTALLED_BLUE`
- Release state: `BLUE`
- Runtime: `DORMANT`
- External message dispatch: disabled
- Merge authority: not granted
- Deployment authority: not granted
- Public release authority: not granted

## Canonical machine-layer dependencies

This module reuses the six PFU kernel contracts already installed on `main`:

- `contracts/pfu/machine/capability.schema.json`
- `contracts/pfu/machine/domain-contract.schema.json`
- `contracts/pfu/machine/lifecycle-state.schema.json`
- `contracts/pfu/machine/evidence-event.schema.json`
- `contracts/pfu/machine/mutation-request.schema.json`
- `contracts/pfu/machine/release-verdict.schema.json`

It adds only the module-specific contract `contracts/pfu/founder-communication-tier.schema.json`.

## Claim boundary

Conceptual and governance claims may describe the installed specification. Physical execution claims require named evidence.

Examples rejected without evidence:

- background continuation
- autonomous execution
- runtime active
- merged
- deployed
- released

Use `scripts/pfu/validate_founder_communication_tier.py` to validate the manifest or a claim.

## Validation

```bash
python3 scripts/pfu/validate_founder_communication_tier.py
python3 -m unittest tests.pfu.test_founder_communication_tier
```

## Protected boundaries

- No change to `todo-app/` is part of this module.
- No secrets are required or stored.
- No worker, webhook, deployment, external messaging, or runtime activation is installed by this package.
- Merge remains a separate Founder decision.
