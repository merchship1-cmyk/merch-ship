# PFU BMOS Kernel Compliance Checklist

**Evaluation ID:** PFU-KERNEL-EVAL-001  
**Version:** 1.0  
**Default verdict:** BLUE

## Repository integrity

- [ ] Changes are limited to governed PFU paths.
- [ ] `todo-app/` has zero diff.
- [ ] No runtime, infrastructure, secret, or deployment mutation is included.
- [ ] Every referenced path exists on the evaluated commit.
- [ ] YAML and JSON Schema files parse successfully.

## Identity and registration

- [ ] BMOS manifest validates against the PFU system registration model or an explicitly documented specialization.
- [ ] BMOS system ID and version are unique.
- [ ] MERCH SHIP domain profile has a stable ID, owner, purpose, and parent system.
- [ ] CORE SEVEN capability classes are distinct from acting identities.
- [ ] Notion registry records match GitHub IDs, names, versions, and release state.

## Authority

- [ ] Requester, executor, verifier, approver, and release authority are defined.
- [ ] No agent, engine, domain, or capability receives universal mutation authority.
- [ ] Constitutional amendments and Thesis admission preserve Founder authority unless formal delegation exists.
- [ ] Domain authority does not override BMOS or PFU kernel controls.

## Lifecycle and evidence

- [ ] All lifecycle states and transition requirements are defined.
- [ ] No silent lifecycle bypass exists.
- [ ] Evidence record schema binds proof to system, domain, actor, request, version, and timestamp.
- [ ] Contradictory evidence requires resolution.
- [ ] Mutation history is append-only and predecessor versions remain traceable.

## Release truth

- [ ] Kernel admission outcomes remain distinct from PFU RED/BLUE/GREEN release states.
- [ ] Structural installation is not described as runtime activation.
- [ ] Feature-branch creation is not described as merged installation.
- [ ] Merge, deployment, production execution, public release, and runtime activation remain separately gated.
- [ ] Final claims include commit SHA, PR state, Notion reconciliation, and validation evidence.

## MERCH SHIP domain binding

- [ ] Runtime and data boundaries are declared.
- [ ] Protected heritage path is declared.
- [ ] BMOS services and Field Operations bindings are declared.
- [ ] Failure, escalation, rollback, evidence, and release policies are declared.
- [ ] Runtime activation remains `STRUCTURAL_ONLY` until validated and authorized.

## Evaluation verdict

```text
STRUCTURE = PENDING_EVALUATION
NOTION_RECONCILIATION = PENDING
SCHEMA_VALIDATION = PENDING
HERITAGE_INTEGRITY = PENDING
MERGE = NOT_AUTHORIZED_BY_THIS_CHECKLIST
DEPLOYMENT = NOT_AUTHORIZED
RUNTIME_ACTIVATION = NOT_AUTHORIZED
RELEASE_STATE = BLUE
```
