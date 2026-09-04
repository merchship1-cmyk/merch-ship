# PFU Federated Execution Acceptance Checklist v1.0

Status: BLUE / VALIDATION REQUIRED
Doctrine: `docs/pfu/doctrines/splitparlalunifedeexecutiom-v1.md`
Policy: `policies/pfu/federated-evidence-policy.yaml`
Contract: `contracts/pfu/federated-evidence-envelope.schema.json`

## Architecture boundary

- [ ] B.MAZING and PFU / MERCH SHIP remain independently governed.
- [ ] No shared backend authority is introduced.
- [ ] No shared database trust is introduced.
- [ ] No automatic role propagation is introduced.
- [ ] No cross-domain SSOT mutation authority is introduced.

## Bridge controls

- [ ] Bridge defaults to deny.
- [ ] Source and destination domains are explicit.
- [ ] Actor/service identity is authenticated.
- [ ] Scope is declared and bounded.
- [ ] Evidence type and provenance are recorded.
- [ ] Execution identifier is recorded.
- [ ] Permissions are revocable.
- [ ] Uncertainty fails closed.

## Evidence comparison

- [ ] Comparison outputs are limited to alignment, contradiction, uncertainty, change, or insufficient evidence.
- [ ] Comparison cannot mutate either domain.
- [ ] Comparison cannot grant release authority.
- [ ] Source attribution is retained end-to-end.

## Execution physics

- [ ] Handoffs are deterministic.
- [ ] Schema validation passes.
- [ ] Mutations are idempotent or retry-safe where applicable.
- [ ] Reversible actions have rollback behavior.
- [ ] Meaningful actions produce evidence records.

## Release gates

- [ ] Safety gates remain active.
- [ ] Rights gates remain active.
- [ ] Quality gates remain active.
- [ ] Founder authority remains required for release.
- [ ] Auto-publish remains disabled.
- [ ] Auto-approval remains disabled.

## Proof threshold

A lane may not be classified implemented or production-ready until one bounded end-to-end execution produces:

Defined -> Built -> Released -> Observed -> Evidence Captured -> Learning Recorded

Final verdict must remain BLUE if any required control is unverified.
