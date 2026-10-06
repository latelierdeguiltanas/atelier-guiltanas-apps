create policy "deny direct encounter access to anonymous users"
on public.bastide_encounters for all to anon using (false) with check (false);

create policy "deny direct encounter access to authenticated users"
on public.bastide_encounters for all to authenticated using (false) with check (false);
