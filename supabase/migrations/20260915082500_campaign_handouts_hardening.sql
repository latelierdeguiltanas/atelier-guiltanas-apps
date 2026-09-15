create index if not exists campaign_player_tokens_player_idx
  on public.campaign_player_tokens (player_id);
create index if not exists campaign_events_handout_idx
  on public.campaign_handout_events (handout_id);
create index if not exists campaign_events_player_idx
  on public.campaign_handout_events (player_id);

drop policy if exists "Deny direct access" on public.campaign_players;
create policy "Deny direct access" on public.campaign_players
  for all to anon, authenticated using (false) with check (false);
drop policy if exists "Deny direct access" on public.campaign_admin_tokens;
create policy "Deny direct access" on public.campaign_admin_tokens
  for all to anon, authenticated using (false) with check (false);
drop policy if exists "Deny direct access" on public.campaign_player_tokens;
create policy "Deny direct access" on public.campaign_player_tokens
  for all to anon, authenticated using (false) with check (false);
drop policy if exists "Deny direct access" on public.campaign_handouts;
create policy "Deny direct access" on public.campaign_handouts
  for all to anon, authenticated using (false) with check (false);
drop policy if exists "Deny direct access" on public.campaign_handout_assignments;
create policy "Deny direct access" on public.campaign_handout_assignments
  for all to anon, authenticated using (false) with check (false);
drop policy if exists "Deny direct access" on public.campaign_handout_events;
create policy "Deny direct access" on public.campaign_handout_events
  for all to anon, authenticated using (false) with check (false);
