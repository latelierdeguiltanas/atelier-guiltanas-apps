begin;
create table if not exists public.bastide_combat_library(
  id text primary key check(id='island'),
  library jsonb not null,
  revision integer not null default 1,
  updated_at timestamptz not null default now(),
  constraint bastide_combat_library_object check(jsonb_typeof(library)='object')
);
alter table public.bastide_combat_library enable row level security;
revoke all on public.bastide_combat_library from public,anon,authenticated;
grant select,insert,update on public.bastide_combat_library to service_role;
commit;
