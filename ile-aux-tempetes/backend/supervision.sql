create table public.nespresso_activity (
 player_id text primary key references public.campaign_players(id),
 last_seen_at timestamptz, last_page text, sheet_opened_at timestamptz, sheet_saved_at timestamptz,
 state_read_at timestamptz, last_sync_error text, sync_error_at timestamptz,
 snapshot jsonb, snapshot_at timestamptz, notes text, notes_at timestamptz
);
alter table public.nespresso_activity enable row level security;
create policy "deny direct access" on public.nespresso_activity for all to anon,authenticated using(false) with check(false);
revoke all on public.nespresso_activity from public,anon,authenticated;
grant all on public.nespresso_activity to service_role;
