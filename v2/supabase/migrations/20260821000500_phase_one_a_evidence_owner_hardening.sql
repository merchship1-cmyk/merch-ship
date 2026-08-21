-- Phase-1A Slice-2 correction — bind evidence ownership to the canonical run owner.
-- This reconciles the deployed schema where zenzy_transformation_evidence.user_id is mandatory.

begin;

do $$
begin
  if exists (
    select 1
    from public.zenzy_transformation_evidence as evidence
    join public.zenzy_transformation_runs as run on run.id = evidence.run_id
    where evidence.user_id is distinct from run.user_id
  ) then
    raise exception using
      message = 'Phase-1A blocked: evidence ownership does not match run ownership.';
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.zenzy_transformation_evidence'::regclass
      and conname = 'zenzy_transformation_evidence_owner_fkey'
      and contype = 'f'
  ) then
    alter table public.zenzy_transformation_evidence
      add constraint zenzy_transformation_evidence_owner_fkey
      foreign key (run_id, user_id)
      references public.zenzy_transformation_runs (id, user_id)
      on delete cascade;
  end if;
end;
$$;

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
      and accepted_run.user_id = new.user_id
      and accepted_run.accepted is true
  ) then
    raise exception using
      errcode = '23514',
      message = 'Phase-1A acceptance is required before evidence.';
  end if;

  return new;
end;
$$;

comment on column public.zenzy_transformation_evidence.user_id is
  'Server-derived Supabase Auth owner. Must match the canonical transformation run owner.';

commit;
