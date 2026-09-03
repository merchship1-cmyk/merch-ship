begin;

alter table public.zenzy_transformation_requests
  drop constraint if exists zenzy_transformation_requests_run_owner_fkey;

alter table public.zenzy_transformation_requests
  add constraint zenzy_transformation_requests_run_owner_fkey
    foreign key (run_id, user_id)
    references public.zenzy_transformation_runs (id, user_id)
    on delete cascade;

commit;
