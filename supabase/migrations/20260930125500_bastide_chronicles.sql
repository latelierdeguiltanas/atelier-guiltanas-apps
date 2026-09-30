create extension if not exists pgcrypto;

create table if not exists public.bastide_chronicle_tokens (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,
  label text not null default 'Chroniqueur de la Bastide',
  created_at timestamptz not null default now(),
  last_used_at timestamptz,
  revoked_at timestamptz
);

create table if not exists public.bastide_chronicles (
  id uuid primary key default gen_random_uuid(),
  session_number smallint check (session_number is null or session_number >= 0),
  session_date date,
  title text not null check (char_length(title) between 1 and 120),
  subtitle text not null default '' check (char_length(subtitle) <= 220),
  summary_text text not null default '' check (char_length(summary_text) <= 30000),
  lyrics_text text not null default '' check (char_length(lyrics_text) <= 30000),
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bastide_chronicle_assets (
  id uuid primary key default gen_random_uuid(),
  chronicle_id uuid not null references public.bastide_chronicles(id) on delete cascade,
  kind text not null check (kind in ('image', 'audio')),
  storage_path text not null unique,
  original_name text not null,
  mime_type text not null,
  file_size bigint not null check (file_size > 0 and file_size <= 52428800),
  caption text not null default '' check (char_length(caption) <= 300),
  sort_order smallint not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists bastide_chronicles_public_idx
  on public.bastide_chronicles (published_at desc, session_number desc)
  where status = 'published';
create index if not exists bastide_chronicle_assets_parent_idx
  on public.bastide_chronicle_assets (chronicle_id, sort_order, created_at);

alter table public.bastide_chronicle_tokens enable row level security;
alter table public.bastide_chronicles enable row level security;
alter table public.bastide_chronicle_assets enable row level security;

revoke all on table public.bastide_chronicle_tokens from anon, authenticated;
revoke all on table public.bastide_chronicles from anon, authenticated;
revoke all on table public.bastide_chronicle_assets from anon, authenticated;
grant all on table public.bastide_chronicle_tokens to service_role;
grant all on table public.bastide_chronicles to service_role;
grant all on table public.bastide_chronicle_assets to service_role;

drop policy if exists "Deny direct access" on public.bastide_chronicle_tokens;
create policy "Deny direct access" on public.bastide_chronicle_tokens
  for all to anon, authenticated using (false) with check (false);
drop policy if exists "Deny direct access" on public.bastide_chronicles;
create policy "Deny direct access" on public.bastide_chronicles
  for all to anon, authenticated using (false) with check (false);
drop policy if exists "Deny direct access" on public.bastide_chronicle_assets;
create policy "Deny direct access" on public.bastide_chronicle_assets
  for all to anon, authenticated using (false) with check (false);

insert into public.bastide_chronicle_tokens (token_hash, label)
values ('b269e31e1036b7db968889dded85e6d4003c40be58627810e7d202c22aa7845b', 'Scanlan — chroniqueur')
on conflict (token_hash) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'bastide-chronicles',
  'bastide-chronicles',
  false,
  52428800,
  array[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'audio/mpeg', 'audio/mp4', 'audio/ogg', 'audio/wav', 'audio/x-wav'
  ]
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
