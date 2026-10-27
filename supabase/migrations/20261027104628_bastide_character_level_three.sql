alter table public.bastide_character_levels drop constraint bastide_character_levels_payload_check;
alter table public.bastide_character_levels add constraint bastide_character_levels_payload_check check (payload->>'format'='FOH_HUB_CHARACTER' and payload->'character'->>'level' in ('2','3'));
create or replace function public.bastide_character_level_save(p_player text,p_revision bigint,p_payload jsonb)
returns jsonb language plpgsql security invoker set search_path=public,pg_temp as $$
declare oldrow public.bastide_character_levels; newrev bigint; hpmax integer; pmmax integer;
begin
 if p_payload->'character'->>'id' is distinct from p_player or coalesce(p_payload->'character'->>'level','') not in ('2','3') then raise exception 'Identité ou niveau invalide'; end if;
 perform pg_advisory_xact_lock(hashtextextended('bastide-character:'||p_player,0));
 select * into oldrow from public.bastide_character_levels where player_id=p_player for update;
 if coalesce(oldrow.revision,0)<>p_revision then return jsonb_build_object('conflict',true); end if;
 newrev:=p_revision+1;
 insert into public.bastide_character_levels(player_id,payload,revision) values(p_player,p_payload,newrev)
 on conflict(player_id) do update set payload=excluded.payload,revision=excluded.revision,updated_at=now();
 hpmax:=(p_payload->'character'->'combat'->>'pvMax')::integer;
 pmmax:=(p_payload->'character'->'combat'->>'pmMax')::integer;
 insert into public.bastide_resources(player_id,hp,pm,hp_max,pm_max) values(p_player,hpmax,pmmax,hpmax,pmmax)
 on conflict(player_id) do update set
 hp=greatest(0,least(hpmax,bastide_resources.hp+hpmax-bastide_resources.hp_max)),
 pm=greatest(0,least(pmmax,bastide_resources.pm+pmmax-bastide_resources.pm_max)),
 hp_max=hpmax,pm_max=pmmax,revision=bastide_resources.revision+1,updated_at=now();
 return jsonb_build_object('revision',newrev);
end $$;
