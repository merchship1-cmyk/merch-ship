begin;

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.pfu_events (
  event_id uuid primary key default gen_random_uuid(),
  source_system text not null,
  source_event_id text not null,
  event_type text not null,
  entity_type text,
  entity_id text,
  repository text,
  branch text,
  actor_id text,
  correlation_id uuid not null default gen_random_uuid(),
  causation_id uuid,
  idempotency_key text not null,
  payload_hash text not null,
  payload jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null,
  received_at timestamptz not null default now(),
  authorization_verdict text not null default 'PENDING',
  inserted_at timestamptz not null default now(),
  constraint pfu_events_source_system_check
    check (source_system in ('github', 'notion', 'ghl', 'pfu')),
  constraint pfu_events_authorization_verdict_check
    check (authorization_verdict in ('PENDING', 'AUTHORIZED', 'DENIED', 'QUARANTINED')),
  constraint pfu_events_payload_hash_check
    check (payload_hash ~ '^sha256:[0-9a-f]{64}$'),
  constraint pfu_events_source_identity_unique
    unique (source_system, source_event_id),
  constraint pfu_events_idempotency_key_unique
    unique (idempotency_key)
);

create index if not exists pfu_events_correlation_id_idx
  on public.pfu_events (correlation_id);
create index if not exists pfu_events_repository_occurred_at_idx
  on public.pfu_events (repository, occurred_at desc);
create index if not exists pfu_events_event_type_occurred_at_idx
  on public.pfu_events (event_type, occurred_at desc);

create table if not exists public.pfu_event_processing (
  processing_id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.pfu_events(event_id) on delete restrict,
  correlation_id uuid not null,
  state text not null,
  attempt_number integer not null default 1,
  worker_delivery_id text not null,
  detail jsonb not null default '{}'::jsonb,
  recorded_at timestamptz not null default now(),
  constraint pfu_event_processing_state_check
    check (state in (
      'RECEIVED',
      'VALIDATED',
      'AUTHORIZED',
      'PROCESSING',
      'COMPLETED',
      'RETRY_PENDING',
      'FAILED',
      'QUARANTINED',
      'RECONCILIATION_REQUIRED'
    )),
  constraint pfu_event_processing_attempt_check
    check (attempt_number > 0)
);

create index if not exists pfu_event_processing_event_idx
  on public.pfu_event_processing (event_id, recorded_at);
create index if not exists pfu_event_processing_correlation_idx
  on public.pfu_event_processing (correlation_id, recorded_at);

create table if not exists public.pfu_mutations (
  mutation_id uuid primary key default gen_random_uuid(),
  event_id uuid references public.pfu_events(event_id) on delete restrict,
  correlation_id uuid not null,
  target_system text not null,
  target_type text not null,
  target_id text,
  idempotency_key text not null unique,
  authorization_verdict text not null,
  mutation_request jsonb not null,
  mutation_response jsonb,
  before_state jsonb,
  after_state jsonb,
  mutation_status text not null,
  requested_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint pfu_mutations_target_system_check
    check (target_system in ('github', 'notion', 'ghl', 'supabase', 'pfu')),
  constraint pfu_mutations_authorization_verdict_check
    check (authorization_verdict in ('PENDING', 'AUTHORIZED', 'DENIED', 'QUARANTINED')),
  constraint pfu_mutations_status_check
    check (mutation_status in (
      'REQUESTED',
      'AUTHORIZED',
      'DISPATCHED',
      'COMPLETED',
      'FAILED',
      'RECONCILIATION_REQUIRED',
      'CANCELLED'
    ))
);

create index if not exists pfu_mutations_event_idx
  on public.pfu_mutations (event_id, requested_at);
create index if not exists pfu_mutations_correlation_idx
  on public.pfu_mutations (correlation_id, requested_at);

create table if not exists public.pfu_evidence (
  evidence_id uuid primary key default gen_random_uuid(),
  event_id uuid references public.pfu_events(event_id) on delete restrict,
  correlation_id uuid not null,
  evidence_type text not null,
  control_id text not null,
  verdict text not null,
  evidence jsonb not null default '{}'::jsonb,
  recorded_at timestamptz not null default now(),
  constraint pfu_evidence_verdict_check
    check (verdict in ('PENDING', 'AUTHORIZED', 'DENIED', 'QUARANTINED', 'PASS', 'FAIL'))
);

create index if not exists pfu_evidence_event_idx
  on public.pfu_evidence (event_id, recorded_at);
create index if not exists pfu_evidence_control_idx
  on public.pfu_evidence (control_id, recorded_at desc);
create index if not exists pfu_evidence_correlation_idx
  on public.pfu_evidence (correlation_id, recorded_at);

create table if not exists public.pfu_exceptions (
  exception_id uuid primary key default gen_random_uuid(),
  event_id uuid references public.pfu_events(event_id) on delete restrict,
  correlation_id uuid not null,
  exception_class text not null,
  severity text not null,
  status text not null default 'OPEN',
  message text not null,
  context jsonb not null default '{}'::jsonb,
  resolution jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pfu_exceptions_severity_check
    check (severity in ('INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  constraint pfu_exceptions_status_check
    check (status in ('OPEN', 'ACKNOWLEDGED', 'RESOLVED', 'WAIVED'))
);

create index if not exists pfu_exceptions_status_idx
  on public.pfu_exceptions (status, severity, created_at);
create index if not exists pfu_exceptions_correlation_idx
  on public.pfu_exceptions (correlation_id, created_at);

create table if not exists public.pfu_reconciliation_jobs (
  reconciliation_id uuid primary key default gen_random_uuid(),
  correlation_id uuid not null,
  source_system text not null,
  target_system text not null,
  subject_type text not null,
  subject_id text not null,
  expected_state jsonb not null,
  observed_state jsonb,
  status text not null default 'PENDING',
  attempt_count integer not null default 0,
  next_attempt_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pfu_reconciliation_systems_check
    check (
      source_system in ('github', 'notion', 'ghl', 'supabase', 'pfu')
      and target_system in ('github', 'notion', 'ghl', 'supabase', 'pfu')
    ),
  constraint pfu_reconciliation_status_check
    check (status in ('PENDING', 'PROCESSING', 'RECONCILED', 'FAILED', 'QUARANTINED')),
  constraint pfu_reconciliation_attempt_count_check
    check (attempt_count >= 0)
);

create index if not exists pfu_reconciliation_due_idx
  on public.pfu_reconciliation_jobs (status, next_attempt_at);
create index if not exists pfu_reconciliation_correlation_idx
  on public.pfu_reconciliation_jobs (correlation_id, created_at);

create table if not exists public.pfu_automation_registry (
  automation_id text primary key,
  name text not null,
  owning_system text not null,
  trigger_type text not null,
  source_system text not null,
  target_system text not null,
  enabled boolean not null default false,
  version text not null,
  authority_owner text not null,
  policy jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pfu_automation_registry_systems_check
    check (
      source_system in ('github', 'notion', 'ghl', 'supabase', 'pfu')
      and target_system in ('github', 'notion', 'ghl', 'supabase', 'pfu')
    )
);

insert into public.pfu_automation_registry (
  automation_id,
  name,
  owning_system,
  trigger_type,
  source_system,
  target_system,
  enabled,
  version,
  authority_owner,
  policy
)
values (
  'PFU-AUTO-GITHUB-INGRESS-001',
  'GitHub execution event ingress',
  'PFU Autonomous Runtime',
  'SIGNED_WEBHOOK',
  'github',
  'supabase',
  false,
  '1.0.0',
  'PFU Founder Authority',
  jsonb_build_object(
    'projection_enabled', false,
    'runtime_dispatch_enabled', false,
    'allowlist_required', true,
    'signature_required', true
  )
)
on conflict (automation_id) do nothing;

create table if not exists public.pfu_release_authorizations (
  authorization_id uuid primary key default gen_random_uuid(),
  release_id text not null,
  release_version text not null,
  client_id text,
  delivery_type text,
  verdict text not null,
  authorized_by text not null,
  evidence_refs jsonb not null default '[]'::jsonb,
  recorded_at timestamptz not null default now(),
  constraint pfu_release_authorizations_verdict_check
    check (verdict in ('AUTHORIZED', 'DENIED', 'REVOKED'))
);

create index if not exists pfu_release_authorizations_release_idx
  on public.pfu_release_authorizations (release_id, release_version, recorded_at desc);

create table if not exists public.pfu_runtime_deliveries (
  delivery_id uuid primary key default gen_random_uuid(),
  release_id text not null,
  release_version text not null,
  client_id text not null,
  delivery_type text not null,
  idempotency_key text not null unique,
  ghl_contact_id text,
  ghl_opportunity_id text,
  status text not null default 'PENDING',
  request jsonb,
  response jsonb,
  attempt_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pfu_runtime_deliveries_status_check
    check (status in (
      'PENDING',
      'AUTHORIZED',
      'DISPATCHING',
      'DELIVERED',
      'ACKNOWLEDGED',
      'FAILED',
      'RETRY_PENDING',
      'RECONCILIATION_REQUIRED',
      'CANCELLED'
    )),
  constraint pfu_runtime_deliveries_attempt_count_check
    check (attempt_count >= 0)
);

create index if not exists pfu_runtime_deliveries_release_idx
  on public.pfu_runtime_deliveries (release_id, client_id, created_at);
create index if not exists pfu_runtime_deliveries_status_idx
  on public.pfu_runtime_deliveries (status, updated_at);

create or replace function public.pfu_reject_immutable_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception '% is append-only; create successor evidence instead', tg_table_name
    using errcode = '55000';
end;
$$;

create or replace function public.pfu_set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists pfu_events_immutable on public.pfu_events;
create trigger pfu_events_immutable
before update or delete on public.pfu_events
for each row execute function public.pfu_reject_immutable_mutation();

drop trigger if exists pfu_event_processing_immutable on public.pfu_event_processing;
create trigger pfu_event_processing_immutable
before update or delete on public.pfu_event_processing
for each row execute function public.pfu_reject_immutable_mutation();

drop trigger if exists pfu_mutations_immutable on public.pfu_mutations;
create trigger pfu_mutations_immutable
before update or delete on public.pfu_mutations
for each row execute function public.pfu_reject_immutable_mutation();

drop trigger if exists pfu_evidence_immutable on public.pfu_evidence;
create trigger pfu_evidence_immutable
before update or delete on public.pfu_evidence
for each row execute function public.pfu_reject_immutable_mutation();

drop trigger if exists pfu_release_authorizations_immutable on public.pfu_release_authorizations;
create trigger pfu_release_authorizations_immutable
before update or delete on public.pfu_release_authorizations
for each row execute function public.pfu_reject_immutable_mutation();

drop trigger if exists pfu_exceptions_updated_at on public.pfu_exceptions;
create trigger pfu_exceptions_updated_at
before update on public.pfu_exceptions
for each row execute function public.pfu_set_updated_at();

drop trigger if exists pfu_reconciliation_jobs_updated_at on public.pfu_reconciliation_jobs;
create trigger pfu_reconciliation_jobs_updated_at
before update on public.pfu_reconciliation_jobs
for each row execute function public.pfu_set_updated_at();

drop trigger if exists pfu_automation_registry_updated_at on public.pfu_automation_registry;
create trigger pfu_automation_registry_updated_at
before update on public.pfu_automation_registry
for each row execute function public.pfu_set_updated_at();

drop trigger if exists pfu_runtime_deliveries_updated_at on public.pfu_runtime_deliveries;
create trigger pfu_runtime_deliveries_updated_at
before update on public.pfu_runtime_deliveries
for each row execute function public.pfu_set_updated_at();

alter table public.pfu_events enable row level security;
alter table public.pfu_event_processing enable row level security;
alter table public.pfu_mutations enable row level security;
alter table public.pfu_evidence enable row level security;
alter table public.pfu_exceptions enable row level security;
alter table public.pfu_reconciliation_jobs enable row level security;
alter table public.pfu_automation_registry enable row level security;
alter table public.pfu_release_authorizations enable row level security;
alter table public.pfu_runtime_deliveries enable row level security;

revoke all on public.pfu_events from anon, authenticated;
revoke all on public.pfu_event_processing from anon, authenticated;
revoke all on public.pfu_mutations from anon, authenticated;
revoke all on public.pfu_evidence from anon, authenticated;
revoke all on public.pfu_exceptions from anon, authenticated;
revoke all on public.pfu_reconciliation_jobs from anon, authenticated;
revoke all on public.pfu_automation_registry from anon, authenticated;
revoke all on public.pfu_release_authorizations from anon, authenticated;
revoke all on public.pfu_runtime_deliveries from anon, authenticated;

revoke all on function public.pfu_reject_immutable_mutation() from public, anon, authenticated;
revoke all on function public.pfu_set_updated_at() from public, anon, authenticated;

grant select, insert on public.pfu_events to service_role;
grant select, insert on public.pfu_event_processing to service_role;
grant select, insert on public.pfu_mutations to service_role;
grant select, insert on public.pfu_evidence to service_role;
grant select, insert, update on public.pfu_exceptions to service_role;
grant select, insert, update on public.pfu_reconciliation_jobs to service_role;
grant select, insert, update on public.pfu_automation_registry to service_role;
grant select, insert on public.pfu_release_authorizations to service_role;
grant select, insert, update on public.pfu_runtime_deliveries to service_role;

comment on table public.pfu_events is
  'Immutable canonical cross-system event ledger for PFU.';
comment on table public.pfu_event_processing is
  'Append-only processing lifecycle evidence for canonical PFU events.';
comment on table public.pfu_mutations is
  'Immutable request and result evidence for governed cross-system mutations.';
comment on table public.pfu_evidence is
  'Immutable control, authorization, and verification evidence.';
comment on table public.pfu_automation_registry is
  'Registry of permitted PFU automations; all entries default disabled.';

commit;
