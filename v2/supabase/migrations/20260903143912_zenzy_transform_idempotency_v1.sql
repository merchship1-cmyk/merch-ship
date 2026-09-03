begin;

alter table public.zenzy_transformation_runs
  add column if not exists request_id uuid;

create unique index if not exists zenzy_transformation_runs_user_request_uidx
  on public.zenzy_transformation_runs (user_id, request_id)
  where request_id is not null;

create table if not exists public.zenzy_transformation_requests (
  request_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  input_hash text not null check (char_length(input_hash) = 64),
  state text not null default 'processing'
    check (state in ('processing', 'retryable_failure', 'completed', 'exhausted')),
  attempt_count integer not null default 1
    check (attempt_count between 1 and 2),
  lease_expires_at timestamptz not null,
  run_id uuid null,
  last_error_code text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, request_id),
  constraint zenzy_transformation_requests_run_owner_fkey
    foreign key (run_id, user_id)
    references public.zenzy_transformation_runs (id, user_id)
    on delete set null
);

create unique index if not exists zenzy_transformation_requests_run_id_uidx
  on public.zenzy_transformation_requests (run_id)
  where run_id is not null;

create index if not exists zenzy_transformation_requests_lease_idx
  on public.zenzy_transformation_requests (state, lease_expires_at);

alter table public.zenzy_transformation_requests enable row level security;

revoke all on public.zenzy_transformation_requests from anon, authenticated;

comment on table public.zenzy_transformation_requests is
  'Server-only ZENZY transform idempotency and bounded retry lease ledger. No client writes.';

comment on column public.zenzy_transformation_runs.request_id is
  'Optional client-stable idempotency identity. Unique per authenticated owner when present.';

commit;
