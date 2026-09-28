-- Budget Guiltanas — schéma de synchronisation v0.2
-- Projet Supabase dédié uniquement. Ne pas exécuter dans le projet d'une autre application.

create table if not exists public.budget_states (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.budget_states enable row level security;

revoke all on table public.budget_states from anon;
revoke all on table public.budget_states from authenticated;
grant select, insert, update on table public.budget_states to authenticated;

drop policy if exists "budget_states_select_own" on public.budget_states;
create policy "budget_states_select_own"
on public.budget_states
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "budget_states_insert_own" on public.budget_states;
create policy "budget_states_insert_own"
on public.budget_states
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "budget_states_update_own" on public.budget_states;
create policy "budget_states_update_own"
on public.budget_states
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

-- La v0.2 écoute les changements Postgres pour synchroniser deux téléphones.
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'budget_states'
  ) then
    alter publication supabase_realtime add table public.budget_states;
  end if;
end $$;
