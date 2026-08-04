# PFU Fullstack Agentic Stack — Acceptance Checklist

## Registration

- [ ] System identity, version, owner, and purpose are declared.
- [ ] Models, tools, agents, surfaces, memory, and runtime are registered.
- [ ] Inputs, outputs, evidence destination, failure policy, and release authority are declared.

## Authority and permissions

- [ ] Identity and active authority resolve before execution.
- [ ] Permissions are deny-by-default.
- [ ] No universal mutation or release authority exists.
- [ ] Protected paths and environments are explicit.

## Runtime

- [ ] Governance and registry are read before subsystem selection.
- [ ] Only declared models, tools, agents, surfaces, and memory stores are used.
- [ ] Timeouts, retries, idempotency, escalation, and rollback are defined.

## Security

- [ ] No secrets appear in prompts, client code, commits, logs, or evidence.
- [ ] Tool actions and state mutations use least privilege.
- [ ] External outputs are validated before persistence or release.

## Evidence and release

- [ ] Every meaningful execution has an execution ID.
- [ ] Tool calls, mutations, outputs, validation, defects, and residual risks are recorded.
- [ ] Release manifest versions policy, workflow, prompt, agents, and commit SHA together.
- [ ] RED, BLUE, or GREEN verdict is justified.
- [ ] Merge, deployment, and public release require explicit matching authority.

## Installation verdict

A repository installation is BLUE until the registry rows are populated, a subsystem passes this checklist, and an authorized release gate produces evidence.
