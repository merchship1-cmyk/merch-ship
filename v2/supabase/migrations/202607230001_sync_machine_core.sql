create extension if not exists pgcrypto;

-- ZSM-BE-001 — Sync Machine backend spine.
-- This migration is additive. It does not replace the existing
-- zenzy_transformation_runs or zenzy_transformation_evidence tables.

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  canonical_id text not null unique,
  name text not null,
  schema_version integer not null default 1 check (schema_version > 0),
  notion_page_id text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workflows (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  canonical_id text not null unique,
  owner_id text not null,
  title text not null,
  description text,
  lifecycle_state text not null default 'DRAFT' check (
    lifecycle_state in (
      'DRAFT', 'SUBMITTED', 'ANALYZING', 'MAPPED',
      'COMPRESSION_PENDING', 'COMPRESSED', 'APPROVAL_PENDING',
      'APPROVED', 'TESTING', 'TEST_COMPLETED',
      'VERIFICATION_PENDING', 'VERIFIED', 'RELEASED',
      'ANALYSIS_FAILED', 'COMPRESSION_FAILED', 'TEST_FAILED',
      'VERIFICATION_FAILED', 'CORRECTION_REQUIRED', 'PAUSED', 'ARCHIVED'
    )
  ),
  version integer not null default 1 check (version > 0),
  source_system text not null default 'database',
  notion_record_id text,
  ghl_opportunity_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, canonical_id, version)
);

create table if not exists public.workflow_steps (
  id uuid primary key default gen_random_uuid(),
  workflow_id uuid not null references public.workflows(id) on delete cascade,
  canonical_id text not null,
  sequence integer not null check (sequence > 0),
  name text not null,
  description text,
  owner_type text not null,
  owner_id text,
  execution_mode text not null,
  tool text,
  estimated_minutes integer check (estimated_minutes is null or estimated_minutes >= 0),
  inputs jsonb not null default '{}'::jsonb check (jsonb_typeof(inputs) = 'object'),
  outputs jsonb not null default '{}'::jsonb check (jsonb_typeof(outputs) = 'object'),
  friction jsonb not null default '{}'::jsonb check (jsonb_typeof(friction) = 'object'),
  verification_required boolean not null default false,
  state text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workflow_id, canonical_id),
  unique (workflow_id, sequence)
);

comment on column public.workflow_steps.state is
  'StepState remains an explicitly open controlled value until separately canonized.';

create table if not exists public.analyses (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  workflow_id uuid not null references public.workflows(id) on delete cascade,
  workflow_version integer not null check (workflow_version > 0),
  status text not null default 'pending',
  provider text,
  model text,
  input_snapshot jsonb not null default '{}'::jsonb,
  result jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.recommendations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  workflow_id uuid not null references public.workflows(id) on delete cascade,
  analysis_id uuid references public.analyses(id) on delete set null,
  sequence integer not null check (sequence > 0),
  title text not null,
  action text not null,
  rationale text,
  expected_impact jsonb not null default '{}'::jsonb,
  status text not null default 'proposed',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workflow_id, sequence)
);

create table if not exists public.tests (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  workflow_id uuid references public.workflows(id) on delete cascade,
  test_type text not null,
  status text not null default 'pending',
  input jsonb not null default '{}'::jsonb,
  expected jsonb not null default '{}'::jsonb,
  actual jsonb,
  passed boolean,
  run_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.evidence (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  workflow_id uuid references public.workflows(id) on delete cascade,
  workflow_version integer,
  object_type text not null,
  object_id text not null,
  actor_id text,
  evidence_type text not null,
  source_system text not null,
  uri text,
  checksum text,
  payload jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null,
  created_at timestamptz not null default now()
);

comment on column public.evidence.object_type is
  'ObjectType remains an explicitly open controlled value until separately canonized.';

create table if not exists public.metrics (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  workflow_id uuid references public.workflows(id) on delete cascade,
  metric_key text not null,
  numeric_value numeric,
  text_value text,
  unit text,
  dimensions jsonb not null default '{}'::jsonb,
  measured_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.idempotency_keys (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  operation_id text not null,
  idempotency_key text not null,
  scope text not null,
  request_hash text not null,
  status text not null default 'claimed' check (
    status in ('claimed', 'completed', 'failed')
  ),
  response jsonb,
  claimed_at timestamptz not null default now(),
  completed_at timestamptz,
  expires_at timestamptz,
  unique (workspace_id, operation_id),
  unique (workspace_id, idempotency_key)
);

create table if not exists public.sync_jobs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  workflow_id uuid references public.workflows(id) on delete cascade,
  operation_id text not null,
  idempotency_key_id uuid not null references public.idempotency_keys(id) on delete restrict,
  target_system text not null,
  direction text not null check (direction in ('inbound', 'outbound', 'reconcile')),
  status text not null default 'queued' check (
    status in ('queued', 'running', 'succeeded', 'failed', 'dead_lettered')
  ),
  source_version text,
  target_version text,
  payload jsonb not null default '{}'::jsonb,
  attempt_count integer not null default 1 check (attempt_count > 0),
  last_error text,
  next_attempt_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (idempotency_key_id, attempt_count)
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  operation_id text not null,
  idempotency_key text not null,
  component_id text,
  submodule_id text,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  workflow_id uuid references public.workflows(id) on delete cascade,
  workflow_version integer,
  aggregate_type text not null,
  aggregate_id text not null,
  event_type text not null,
  schema_version integer not null default 1 check (schema_version > 0),
  actor_ref text not null,
  source_system text not null,
  source_version text,
  state_transition jsonb,
  contact_ref text,
  opportunity_ref text,
  privacy_class text not null default 'internal',
  payload jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists workflows_workspace_state_idx
  on public.workflows (workspace_id, lifecycle_state);
create index if not exists workflow_steps_workflow_sequence_idx
  on public.workflow_steps (workflow_id, sequence);
create index if not exists analyses_workflow_created_idx
  on public.analyses (workflow_id, created_at desc);
create index if not exists evidence_workflow_type_idx
  on public.evidence (workflow_id, evidence_type, occurred_at desc);
create index if not exists metrics_workspace_key_idx
  on public.metrics (workspace_id, metric_key, measured_at desc);
create index if not exists events_workspace_type_idx
  on public.events (workspace_id, event_type, occurred_at desc);
create index if not exists events_operation_idx
  on public.events (operation_id, occurred_at);
create index if not exists sync_jobs_status_next_attempt_idx
  on public.sync_jobs (status, next_attempt_at, created_at);
create index if not exists sync_jobs_workspace_workflow_idx
  on public.sync_jobs (workspace_id, workflow_id, created_at desc);

create or replace function public.prevent_event_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'events are append-only';
end;
$$;

drop trigger if exists events_append_only_update on public.events;
create trigger events_append_only_update
before update on public.events
for each row execute function public.prevent_event_mutation();

drop trigger if exists events_append_only_delete on public.events;
create trigger events_append_only_delete
before delete on public.events
for each row execute function public.prevent_event_mutation();

alter table public.workspaces enable row level security;
alter table public.workflows enable row level security;
alter table public.workflow_steps enable row level security;
alter table public.analyses enable row level security;
alter table public.recommendations enable row level security;
alter table public.tests enable row level security;
alter table public.evidence enable row level security;
alter table public.metrics enable row level security;
alter table public.events enable row level security;
alter table public.sync_jobs enable row level security;
alter table public.idempotency_keys enable row level security;

revoke all on public.workspaces from anon, authenticated;
revoke all on public.workflows from anon, authenticated;
revoke all on public.workflow_steps from anon, authenticated;
revoke all on public.analyses from anon, authenticated;
revoke all on public.recommendations from anon, authenticated;
revoke all on public.tests from anon, authenticated;
revoke all on public.evidence from anon, authenticated;
revoke all on public.metrics from anon, authenticated;
revoke all on public.events from anon, authenticated;
revoke all on public.sync_jobs from anon, authenticated;
revoke all on public.idempotency_keys from anon, authenticated;

comment on table public.events is
  'Append-only governed domain event envelope. Payloads must exclude secrets and unnecessary personal data.';
comment on table public.sync_jobs is
  'One record per synchronization attempt. Retries reuse the same governed operation and idempotency identity.';
comment on table public.idempotency_keys is
  'One governed business operation identity per workspace and idempotency key.';