# B.MAZING Five-Module Pack — Acceptance Checklist

## System registration

- [ ] The B.MAZING subsystem ID, version, owner, purpose, parent system, and authority chain are declared.
- [ ] All five modules are registered and point to versioned contracts.
- [ ] Notion and GitHub sources of truth are linked.
- [ ] Runtime, commerce synchronization, deployment, production, and public-release flags default to disabled.

## Product Family Registry

- [ ] Every product family has a stable family ID and lifecycle state.
- [ ] Every SKU belongs to exactly one registered family.
- [ ] Every SKU declares delivery assets, fulfillment mode, price record, channel bindings, and activation flags.
- [ ] Bundles reference only registered, release-eligible SKUs.

## Template Engine

- [ ] Every template has an owner, version, source file, input contract, output contract, rights record, and validation rules.
- [ ] Family and activation-stage bindings are explicit.
- [ ] Claims, accessibility, editable source, export quality, and rights are validated.
- [ ] Lore and Stick-Man hooks remain optional and clarity-preserving.

## Creator Activation Module

- [ ] Each activation stage has a concrete outcome and evidence requirement.
- [ ] Stage progression is based on completed evidence, not inferred identity.
- [ ] User agency is preserved and narrative framing is non-coercive.
- [ ] No milestone grants merge, deployment, entitlement, production, or public-release authority.

## Pricing Logic

- [ ] Every live SKU has an explicitly approved price record.
- [ ] Currency, tax behavior, effective dates, channel amounts, and approval evidence are present.
- [ ] No B.MAZING amount was inferred from another PFU or MERCH SHIP product.
- [ ] Bundle and discount rules produce clear customer-facing terms.

## Distribution Module

- [ ] Every channel binding includes a channel product ID, delivery assets, fulfillment mode, terms, price record, owner, and activation state.
- [ ] Product creation, updates, publishing, price changes, and deletion use the required mutation authority.
- [ ] Customer-facing deliverables, prices, terms, and calls to action are not obscured by lore.
- [ ] Cross-channel sync records source and destination identifiers and validation evidence.

## Security, evidence, and release

- [ ] No secrets, private credentials, or sensitive customer data appear in repository files, prompts, logs, or evidence.
- [ ] Meaningful actions record an execution ID, inputs, tools, outputs, mutations, validation, defects, and residual risks.
- [ ] Protected paths, including `todo-app/`, remain unchanged.
- [ ] The release manifest binds module versions, policies, commit SHA, evidence bundle, and Founder approval.
- [ ] RED, BLUE, or GREEN is justified independently for merge, deployment, runtime activation, commerce sync, production, and public release.

## Installation verdict

The structural installation remains BLUE until this checklist is evidenced, commercial records are populated, and explicit matching authority is supplied for each requested mutation or release surface.
