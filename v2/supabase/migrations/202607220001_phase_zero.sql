create extension if not exists pgcrypto;

create table if not exists public.zenzy_transformation_runs (
  id uuid primary key default gen_random_uuid(),
  source_input text not null check (char_length(source_input) between 3 and 4000),
  result jsonb not null check (jsonb_typeof(result) = 'object'),
  provider text not null default 'openai',
  model text not null,
  status text not null default 'generated'
    check (status in ('generated', 'reviewed', 'verified')),
  created_at timestamptz not null default now()
);

create table if not exists public.zenzy_transformation_evidence (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.zenzy_transformation_runs(id)
    on delete cascade,
  time_saved_minutes integer not null check (time_saved_minutes between 0 and 10080),
  steps_removed integer not null check (steps_removed between 0 and 1000),
  clarity_gain integer not null check (clarity_gain between 1 and 5),
  output_produced boolean not null,
  would_use_again boolean not null,
  notes text check (char_length(notes) <= 1000),
  recorded_at timestamptz not null default now()
);

alter table public.zenzy_transformation_runs enable row level security;
alter table public.zenzy_transformation_evidence enable row level security;

revoke all on public.zenzy_transformation_runs from anon, authenticated;
revoke all on public.zenzy_transformation_evidence from anon, authenticated;

comment on table public.zenzy_transformation_runs is
  'Phase 0 transformation results. Writes remain server-authorized only.';
comment on table public.zenzy_transformation_evidence is
  'Five-field Phase 0 evidence record linked to a completed transformation.';
