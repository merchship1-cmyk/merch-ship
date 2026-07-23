-- Corrective additive migration for ZSM-BE-001.
-- Aligns the initial candidate schema with the locked workflow and event contracts.

alter table public.workflows
  add column if not exists external_id text;

update public.workflows
set external_id = canonical_id
where external_id is null;

alter table public.workflows
  alter column external_id set not null;

create unique index if not exists workflows_workspace_external_id_uidx
  on public.workflows (workspace_id, external_id);

alter table public.workflows
  drop constraint if exists workflows_lifecycle_state_check;

alter table public.workflows
  add constraint workflows_lifecycle_state_check check (
    lifecycle_state in (
      'DRAFT', 'RECEIVED', 'INTAKE_VALIDATION', 'ACCEPTED',
      'SWEEP_PLANNED', 'SWEEP_ACTIVE', 'RELEASE_READY', 'RELEASED', 'CLOSED',
      'HOLD', 'QUARANTINED', 'ESCALATED', 'CORRECTION_REQUIRED',
      'RETEST_ACTIVE', 'REJECTED', 'CANCELLED'
    )
  ) not valid;

alter table public.workflow_steps
  add column if not exists external_id text;

update public.workflow_steps
set external_id = canonical_id
where external_id is null;

alter table public.workflow_steps
  alter column external_id set not null;

create unique index if not exists workflow_steps_workflow_external_id_uidx
  on public.workflow_steps (workflow_id, external_id);

alter table public.events
  add column if not exists event_id text,
  add column if not exists correlation_id text,
  add column if not exists causation_id text,
  add column if not exists workflow_run_id text,
  add column if not exists event_class text,
  add column if not exists source_record_version text,
  add column if not exists change_payload jsonb not null default '{}'::jsonb,
  add column if not exists previous_record_hash text,
  add column if not exists record_hash text,
  add column if not exists is_compensating_entry boolean not null default false,
  add column if not exists compensates_event_id text;

update public.events
set event_id = coalesce(event_id, id::text),
    correlation_id = coalesce(correlation_id, operation_id),
    event_class = coalesce(event_class, 'new'),
    record_hash = coalesce(record_hash, encode(digest(id::text || occurred_at::text, 'sha256'), 'hex'))
where event_id is null
   or correlation_id is null
   or event_class is null
   or record_hash is null;

alter table public.events
  alter column event_id set not null,
  alter column correlation_id set not null,
  alter column event_class set not null,
  alter column record_hash set not null;

create unique index if not exists events_event_id_uidx
  on public.events (event_id);

create index if not exists events_correlation_idx
  on public.events (correlation_id, occurred_at);

alter table public.events
  drop constraint if exists events_event_class_check;

alter table public.events
  add constraint events_event_class_check check (
    event_class in ('new', 'duplicate', 'replay', 'retry', 'correction', 'child', 'compensating')
  ) not valid;

alter table public.events
  drop constraint if exists events_compensation_check;

alter table public.events
  add constraint events_compensation_check check (
    (is_compensating_entry = false and compensates_event_id is null)
    or (is_compensating_entry = true and compensates_event_id is not null)
  ) not valid;

comment on column public.workflows.lifecycle_state is
  'Canonical lifecycle: DRAFT → RECEIVED → INTAKE_VALIDATION → ACCEPTED → SWEEP_PLANNED → SWEEP_ACTIVE → RELEASE_READY → RELEASED → CLOSED; branches HOLD, QUARANTINED, ESCALATED, CORRECTION_REQUIRED, RETEST_ACTIVE, REJECTED, CANCELLED.';
comment on column public.workflow_steps.state is
  'StepState remains open until separately canonized; arbitrary final state expansion is prohibited.';
comment on column public.events.event_class is
  'New, Duplicate, Replay, Retry, Correction, Child, or Compensating event classification.';