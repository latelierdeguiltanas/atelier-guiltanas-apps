create table if not exists public.bastide_pact_entries (
 id uuid primary key, player_id text not null references public.bastide_players(id) check(player_id='wilfried'),
 title text not null check(length(title) between 1 and 160), content text not null check(length(content) between 1 and 20000),
 status text not null check(status in ('proposal','draft','published','rejected')), author text not null check(author in ('player','mj')),
 revision integer not null default 1, seen_revision integer not null default 0,
 history jsonb not null default '[]', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.bastide_pact_entries enable row level security;
revoke all on public.bastide_pact_entries from public,anon,authenticated;
grant all on public.bastide_pact_entries to service_role;
create index if not exists bastide_pact_entries_player_date on public.bastide_pact_entries(player_id,created_at desc);
