-- Phase-1A Slice-2 — explicit acceptance and evidence persistence.
-- Client writes remain forbidden. Server functions derive ownership from auth.

begin;

create unique index if not exists zenzy_transformation_runs_id_user_id_uidx
  on public.zenzy_transformation_runs (id, user_id);

create table if not exists public.zenzy_transformation_acceptance (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  accepted boolean not null check (accepted is true),
  accepted_at timestamptz not null default now(),
  constraint zenzy_transformation_acceptance_run_id_key unique (run_id),
  constraint zenzy_transformation_acceptance_owner_fkey
    foreign key (run_id, user_id)
    references public.zenzy_transformation_runs (id, user_id)
    on delete cascade
);

create index if not exists zenzy_transformation_acceptance_user_id_idx
  on public.zenzy_transformation_acceptance (user_id);

do $$
begin
  if exists (
    select 1
    from (
      select run_id
      from public.zenzy_transformation_evidence
      group by run_id
      having count(*) > 1
    ) as duplicate_evidence
  ) then
    raise exception using
      message = 'Phase-1A blocked: duplicate evidence rows exist for a run.';
  end if;
end;
$$;

create unique index if not exists zenzy_transformation_evidence_run_id_uidx
  on public.zenzy_transformation_evidence (run_id);

alter table public.zenzy_transformation_acceptance enable row level security;

revoke all on public.zenzy_transformation_acceptance from anon, authenticated;
grant select on public.zenzy_transformation_acceptance to authenticated;

drop policy if exists acceptance_owner_select
  on public.zenzy_transformation_acceptance;
drop policy if exists acceptance_owner_insert
  on public.zenzy_transformation_acceptance;
drop policy if exists acceptance_owner_update
  on public.zenzy_transformation_acceptance;
drop policy if exists acceptance_owner_delete
  on public.zenzy_transformation_acceptance;

create policy acceptance_owner_select
on public.zenzy_transformation_acceptance
as permissive
for select
to authenticated
using (
  (select auth.uid()) is not null
  and (select auth.uid()) = user_id
);

create or replace function public.zenzy_after_acceptance_insert()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  update public.zenzy_transformation_runs
  set status = 'reviewed'
  where id = new.run_id
    and user_id = new.user_id
    and status = 'generated';

  return new;
end;
$$;

drop trigger if exists zenzy_after_acceptance_insert
  on public.zenzy_transformation_acceptance;
create trigger zenzy_after_acceptance_insert
after insert on public.zenzy_transformation_acceptance
for each row execute function public.zenzy_after_acceptance_insert();

create or replace function public.zenzy_before_evidence_insert()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if not exists (
    select 1
    from public.zenzy_transformation_acceptance as accepted_run
    where accepted_run.run_id = new.run_id
      and accepted_run.accepted is true
  ) then
    raise exception using
      errcode = '23514',
      message = 'Phase-1A acceptance is required before evidence.';
  end if;

  return new;
end;
$$;

drop trigger if exists zenzy_before_evidence_insert
  on public.zenzy_transformation_evidence;
create trigger zenzy_before_evidence_insert
before insert on public.zenzy_transformation_evidence
for each row execute function public.zenzy_before_evidence_insert();

create or replace function public.zenzy_after_evidence_insert()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  update public.zenzy_transformation_runs
  set status = 'verified'
  where id = new.run_id;

  return new;
end;
$$;

drop trigger if exists zenzy_after_evidence_insert
  on public.zenzy_transformation_evidence;
create trigger zenzy_after_evidence_insert
after insert on public.zenzy_transformation_evidence
for each row execute function public.zenzy_after_evidence_insert();

comment on table public.zenzy_transformation_acceptance is
  'One affirmative Phase-1A acceptance per owned transformation run. Writes are server-authorized only.';
comment on column public.zenzy_transformation_acceptance.user_id is
  'Server-derived Supabase Auth owner. Clients cannot assign or reassign ownership.';

commit;
