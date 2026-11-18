-- Atelier WoW uniquement. À déployer sur un projet Supabase distinct des hubs JDR.
create table if not exists public.atelierwow_bnet_sessions (
  id uuid primary key default gen_random_uuid(),
  handoff_hash text unique,
  handoff_expires_at timestamptz,
  session_hash text unique,
  session_expires_at timestamptz,
  access_token_cipher text not null,
  account_id text,
  account_battletag text,
  created_at timestamptz not null default now()
);
create index if not exists atelierwow_bnet_sessions_expiry on public.atelierwow_bnet_sessions(session_expires_at);
alter table public.atelierwow_bnet_sessions enable row level security;
revoke all on table public.atelierwow_bnet_sessions from anon, authenticated, public;
-- Aucune policy publique : seul le backend avec sa clé serveur peut lire cette table.
