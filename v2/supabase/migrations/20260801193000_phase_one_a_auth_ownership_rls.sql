-- Phase-1A Slice-1 — Auth, ownership, and least-privilege RLS.
-- Existing rows must have deterministic ownership before this migration runs.

begin;

alter table public.zenzy_transformation_runs
  add column if not exists user_id uuid;

do $$
begin
  if exists (
    select 1
    from public.zenzy_transformation_runs
    where user_id is null
  ) then
    raise exception using
      message = 'Phase-1A blocked: zenzy_transformation_runs contains rows without deterministic ownership.';
  end if;
end;
$$;

alter table public.zenzy_transformation_runs
  alter column user_id set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.zenzy_transformation_runs'::regclass
      and conname = 'zenzy_transformation_runs_user_id_fkey'
      and contype = 'f'
  ) then
    alter table public.zenzy_transformation_runs
      add constraint zenzy_transformation_runs_user_id_fkey
      foreign key (user_id)
      references auth.users(id)
      on delete cascade;
  end if;
end;
$$;

create index if not exists zenzy_transformation_runs_user_id_idx
  on public.zenzy_transformation_runs (user_id);

create index if not exists zenzy_transformation_evidence_run_id_idx
  on public.zenzy_transformation_evidence (run_id);

alter table public.zenzy_transformation_runs enable row level security;
alter table public.zenzy_transformation_evidence enable row level security;

revoke all on public.zenzy_transformation_runs from anon, authenticated;
revoke all on public.zenzy_transformation_evidence from anon, authenticated;

grant select on public.zenzy_transformation_runs to authenticated;
grant select on public.zenzy_transformation_evidence to authenticated;

drop policy if exists runs_owner_select
  on public.zenzy_transformation_runs;
drop policy if exists runs_owner_insert
  on public.zenzy_transformation_runs;
drop policy if exists runs_owner_update
  on public.zenzy_transformation_runs;
drop policy if exists runs_owner_delete
  on public.zenzy_transformation_runs;

create policy runs_owner_select
on public.zenzy_transformation_runs
as permissive
for select
to authenticated
using (
  (select auth.uid()) is not null
  and (select auth.uid()) = user_id
);

drop policy if exists evidence_owner_select
  on public.zenzy_transformation_evidence;
drop policy if exists evidence_owner_insert
  on public.zenzy_transformation_evidence;
drop policy if exists evidence_owner_update
  on public.zenzy_transformation_evidence;
drop policy if exists evidence_owner_delete
  on public.zenzy_transformation_evidence;

create policy evidence_owner_select
on public.zenzy_transformation_evidence
as permissive
for select
to authenticated
using (
  exists (
    select 1
    from public.zenzy_transformation_runs as owned_run
    where owned_run.id = run_id
      and owned_run.user_id = (select auth.uid())
  )
);

comment on column public.zenzy_transformation_runs.user_id is
  'Server-derived Supabase Auth owner. Clients cannot assign or reassign ownership.';

commit;
