create extension if not exists pgcrypto;

create table if not exists public.campaign_players (
  id text primary key,
  display_name text not null,
  sort_order smallint not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.campaign_admin_tokens (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,
  label text not null default 'Maître du jeu',
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);

create table if not exists public.campaign_player_tokens (
  id uuid primary key default gen_random_uuid(),
  player_id text not null references public.campaign_players(id) on delete cascade,
  token_hash text not null unique,
  created_at timestamptz not null default now(),
  last_used_at timestamptz,
  revoked_at timestamptz
);

create table if not exists public.campaign_handouts (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('image', 'text', 'object')),
  title text not null check (char_length(title) between 1 and 120),
  content_text text,
  storage_path text,
  mime_type text,
  file_size bigint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint campaign_handouts_content_check check (
    (kind = 'image' and storage_path is not null)
    or (kind in ('text', 'object') and content_text is not null)
  )
);

create table if not exists public.campaign_handout_assignments (
  handout_id uuid not null references public.campaign_handouts(id) on delete cascade,
  player_id text not null references public.campaign_players(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  revoked_at timestamptz,
  primary key (handout_id, player_id)
);

create table if not exists public.campaign_handout_events (
  id bigint generated always as identity primary key,
  event_type text not null check (event_type in ('created', 'assigned', 'revoked', 'player_link_reset')),
  handout_id uuid references public.campaign_handouts(id) on delete set null,
  player_id text references public.campaign_players(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists campaign_assignments_player_active_idx
  on public.campaign_handout_assignments (player_id, assigned_at desc)
  where revoked_at is null;

create index if not exists campaign_handouts_created_idx
  on public.campaign_handouts (created_at desc);

alter table public.campaign_players enable row level security;
alter table public.campaign_admin_tokens enable row level security;
alter table public.campaign_player_tokens enable row level security;
alter table public.campaign_handouts enable row level security;
alter table public.campaign_handout_assignments enable row level security;
alter table public.campaign_handout_events enable row level security;

revoke all on table public.campaign_players from anon, authenticated;
revoke all on table public.campaign_admin_tokens from anon, authenticated;
revoke all on table public.campaign_player_tokens from anon, authenticated;
revoke all on table public.campaign_handouts from anon, authenticated;
revoke all on table public.campaign_handout_assignments from anon, authenticated;
revoke all on table public.campaign_handout_events from anon, authenticated;
revoke all on sequence public.campaign_handout_events_id_seq from anon, authenticated;

grant all on table public.campaign_players to service_role;
grant all on table public.campaign_admin_tokens to service_role;
grant all on table public.campaign_player_tokens to service_role;
grant all on table public.campaign_handouts to service_role;
grant all on table public.campaign_handout_assignments to service_role;
grant all on table public.campaign_handout_events to service_role;
grant usage, select on sequence public.campaign_handout_events_id_seq to service_role;

insert into public.campaign_players (id, display_name, sort_order) values
  ('vax', 'Vax’Ildan', 1),
  ('hammerz', 'Hammerz', 2),
  ('lelio', 'Lelio', 3),
  ('loris', 'Loris', 4)
on conflict (id) do update set
  display_name = excluded.display_name,
  sort_order = excluded.sort_order;

insert into public.campaign_admin_tokens (token_hash, label)
values ('e93dea5024f3ef9f30a383b8b0872793787cebce0344548729cc8e1710296f95', 'Clé principale MJ')
on conflict (token_hash) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'campaign-handouts',
  'campaign-handouts',
  false,
  15728640,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
