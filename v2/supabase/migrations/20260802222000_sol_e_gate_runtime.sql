-- SOL E-Gate runtime state.
-- Server-only, append-only evidence; no client mutation surface.

create table if not exists public.sol_evidence_events (
  id uuid primary key default gen_random_uuid(),
  source_system text not null check (
    source_system in ('slack', 'linear', 'github', 'notion', 'ai', 'system')
  ),
  source_event_id text not null,
  command_id text not null,
  command text not null,
  lane integer not null default 0 check (lane between 0 and 8),
  status text not null check (
    status in ('accepted', 'completed', 'blocked', 'failed')
  ),
  payload jsonb not null default '{}'::jsonb
    check (jsonb_typeof(payload) = 'object'),
  created_at timestamptz not null default now()
);

create unique index if not exists sol_evidence_events_command_id_uidx
  on public.sol_evidence_events (command_id);
create index if not exists sol_evidence_events_source_event_idx
  on public.sol_evidence_events (source_system, source_event_id);

create table if not exists public.sol_idempotency (
  source_system text not null check (
    source_system in ('slack', 'linear', 'github', 'notion', 'ai', 'system')
  ),
  source_event_id text not null,
  command_id text not null,
  command text not null,
  evidence_id uuid not null
    references public.sol_evidence_events(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (source_system, source_event_id)
);

create table if not exists public.sol_sync_checkpoints (
  source_system text not null check (
    source_system in ('linear', 'slack', 'github', 'notion', 'ai', 'system')
  ),
  source_event_id text not null,
  entity_id text not null,
  event_type text not null,
  result_hash text not null,
  processed_at timestamptz not null default now(),
  primary key (source_system, source_event_id, result_hash)
);

create index if not exists sol_sync_checkpoints_entity_idx
  on public.sol_sync_checkpoints (
    source_system,
    entity_id,
    processed_at desc
  );

create table if not exists public.sol_event_claims (
  source_system text not null check (source_system in ('slack', 'linear')),
  source_event_id text not null,
  command_id text not null,
  status text not null default 'processing' check (
    status in ('processing', 'completed', 'blocked', 'failed')
  ),
  claimed_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_error text,
  primary key (source_system, source_event_id)
);

create unique index if not exists sol_event_claims_command_id_uidx
  on public.sol_event_claims (command_id);

create table if not exists public.sol_delivery_outbox (
  id uuid primary key default gen_random_uuid(),
  dedupe_key text not null unique,
  destination text not null check (destination in ('slack')),
  action text not null check (action in ('post_message')),
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  status text not null default 'pending' check (
    status in ('pending', 'sent', 'failed')
  ),
  attempts integer not null default 0 check (attempts >= 0),
  last_error text,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

comment on table public.sol_evidence_events is
  'Append-only evidence stream for governed SOL command execution.';
comment on table public.sol_idempotency is
  'Finalized command idempotency records linked to persisted evidence.';
comment on table public.sol_sync_checkpoints is
  'Deduplication checkpoints for cross-system synchronization events.';
comment on table public.sol_event_claims is
  'Atomic claim records preventing concurrent duplicate external mutations.';
comment on table public.sol_delivery_outbox is
  'Dedupe-safe delivery state for SOL return-leg notifications.';

alter table public.sol_evidence_events enable row level security;
alter table public.sol_idempotency enable row level security;
alter table public.sol_sync_checkpoints enable row level security;
alter table public.sol_event_claims enable row level security;
alter table public.sol_delivery_outbox enable row level security;

revoke all on table public.sol_evidence_events from anon, authenticated;
revoke all on table public.sol_idempotency from anon, authenticated;
revoke all on table public.sol_sync_checkpoints from anon, authenticated;
revoke all on table public.sol_event_claims from anon, authenticated;
revoke all on table public.sol_delivery_outbox from anon, authenticated;

grant select, insert on table public.sol_evidence_events to service_role;
grant select, insert on table public.sol_idempotency to service_role;
grant select, insert on table public.sol_sync_checkpoints to service_role;
grant select, insert, update on table public.sol_event_claims to service_role;
grant select, insert, update on table public.sol_delivery_outbox to service_role;

create or replace function public.sol_claim_event(
  p_source_system text,
  p_source_event_id text,
  p_command_id text
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  affected integer := 0;
begin
  insert into public.sol_event_claims (
    source_system,
    source_event_id,
    command_id,
    status
  ) values (
    p_source_system,
    p_source_event_id,
    p_command_id,
    'processing'
  )
  on conflict (source_system, source_event_id) do nothing;

  if found then
    return true;
  end if;

  update public.sol_event_claims
  set
    command_id = p_command_id,
    status = 'processing',
    updated_at = now(),
    last_error = null
  where source_system = p_source_system
    and source_event_id = p_source_event_id
    and status in ('blocked', 'failed');

  get diagnostics affected = row_count;
  return affected > 0;
end;
$$;

create or replace function public.sol_finalize_event(
  p_source_system text,
  p_source_event_id text,
  p_command_id text,
  p_command text,
  p_lane integer,
  p_status text,
  p_payload jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  evidence_uuid uuid;
begin
  insert into public.sol_evidence_events (
    source_system,
    source_event_id,
    command_id,
    command,
    lane,
    status,
    payload
  ) values (
    p_source_system,
    p_source_event_id,
    p_command_id,
    p_command,
    p_lane,
    p_status,
    coalesce(p_payload, '{}'::jsonb)
  )
  on conflict (command_id) do nothing
  returning id into evidence_uuid;

  if evidence_uuid is null then
    select id into evidence_uuid
    from public.sol_evidence_events
    where command_id = p_command_id;
  end if;

  if p_status = 'completed' then
    insert into public.sol_idempotency (
      source_system,
      source_event_id,
      command_id,
      command,
      evidence_id
    ) values (
      p_source_system,
      p_source_event_id,
      p_command_id,
      p_command,
      evidence_uuid
    )
    on conflict (source_system, source_event_id) do nothing;
  end if;

  update public.sol_event_claims
  set
    status = p_status,
    updated_at = now(),
    last_error = case
      when p_status = 'failed' then coalesce(p_payload ->> 'error', 'failed')
      else null
    end
  where source_system = p_source_system
    and source_event_id = p_source_event_id;

  return evidence_uuid;
end;
$$;

create or replace function public.sol_mark_delivery(
  p_delivery_id uuid,
  p_sent boolean,
  p_error text default null
)
returns void
language sql
security invoker
set search_path = ''
as $$
  update public.sol_delivery_outbox
  set
    status = case when p_sent then 'sent' else 'failed' end,
    attempts = attempts + 1,
    last_error = case when p_sent then null else p_error end,
    sent_at = case when p_sent then now() else sent_at end
  where id = p_delivery_id;
$$;

revoke all on function public.sol_claim_event(text, text, text)
  from public, anon, authenticated;
revoke all on function public.sol_finalize_event(
  text, text, text, text, integer, text, jsonb
) from public, anon, authenticated;
revoke all on function public.sol_mark_delivery(uuid, boolean, text)
  from public, anon, authenticated;

grant execute on function public.sol_claim_event(text, text, text)
  to service_role;
grant execute on function public.sol_finalize_event(
  text, text, text, text, integer, text, jsonb
) to service_role;
grant execute on function public.sol_mark_delivery(uuid, boolean, text)
  to service_role;
