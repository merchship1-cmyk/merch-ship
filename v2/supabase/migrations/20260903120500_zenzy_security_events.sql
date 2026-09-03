create table if not exists public.zenzy_security_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null check (event_type = 'governance_denial'),
  reason_code text not null check (
    reason_code in (
      'PRODUCTION_AUTHORITY_CLAIM',
      'EXTERNAL_WRITE_NOT_AUTHORIZED',
      'SECRET_DISCLOSURE_REQUEST'
    )
  ),
  request_fingerprint text not null check (length(request_fingerprint) = 64),
  input_length integer not null check (input_length between 0 and 4000),
  phase text not null default 'PHASE_1A_STAGING' check (phase = 'PHASE_1A_STAGING'),
  created_at timestamptz not null default now()
);

alter table public.zenzy_security_events enable row level security;

create policy "zenzy_security_events_owner_select"
on public.zenzy_security_events
for select
to authenticated
using (auth.uid() = user_id);

revoke insert, update, delete on public.zenzy_security_events from anon, authenticated;
grant select on public.zenzy_security_events to authenticated;

comment on table public.zenzy_security_events is
  'Bounded non-production ZENZY governance-denial evidence. Stores reason metadata and a request fingerprint, never raw prompt text or secret values.';
