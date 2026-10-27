-- Optional house rule, explicitly configurable by the MJ. Never accepts a client die or bonus.
create table if not exists public.bastide_shop_rules(
 singleton boolean primary key default true check(singleton),enabled boolean not null default true,
 difficulty integer not null default 15 check(difficulty between 1 and 40),
 success_pct integer not null default 10 check(success_pct between 0 and 50),
 great_pct integer not null default 20 check(great_pct between 0 and 50),
 critical_penalty integer not null default 10 check(critical_penalty between 0 and 50),
 cooldown_hours integer not null default 24 check(cooldown_hours between 1 and 168),
 overrides jsonb not null default '{}'
);
insert into bastide_shop_rules(singleton) values(true) on conflict do nothing;
alter table bastide_shop_rules enable row level security;revoke all on bastide_shop_rules from public,anon,authenticated;grant all on bastide_shop_rules to service_role;
create table if not exists public.bastide_shop_negotiations(
 player_id text references bastide_players(id) on delete cascade,mode text check(mode in ('buy','sell')),
 approach text not null,die integer not null,bonus integer not null,total integer not null,rate integer not null,
 result text not null,rolled_at timestamptz not null default now(),expires_at timestamptz not null,consumed_at timestamptz,
 primary key(player_id,mode)
);
alter table bastide_shop_negotiations enable row level security;revoke all on bastide_shop_negotiations from public,anon,authenticated;grant all on bastide_shop_negotiations to service_role;
create or replace function public.bastide_social_bonus(p_player_id text,p_approach text)
returns jsonb language plpgsql stable set search_path=public as $$
declare c jsonb; path jsonb; rank jsonb; top_rank integer; best integer:=0; bestsource text:=''; candidate integer; pattern text; rules bastide_shop_rules%rowtype; cha integer; extra integer;
begin
 select payload->'character' into c from bastide_character_levels where player_id=p_player_id;
 if c is null then raise exception 'Fiche synchronisée requise pour négocier';end if;
 pattern:=case p_approach when 'baratin' then 'baratin' when 'seduction' then 'sédu|séduction' when 'persuasion' then 'convain|persuasion' when 'negociation' then 'négoci' else null end;
 if pattern is null then raise exception 'Approche invalide';end if;
 cha:=coalesce((c->'stats'->>'CHA')::integer,0);
 for path in select value from jsonb_array_elements(coalesce(c->'paths','[]')) loop
  select coalesce(max((r->>'rank')::integer),0) into top_rank from jsonb_array_elements(path->'ranks') r where coalesce((r->>'owned')::boolean,false);
  for rank in select value from jsonb_array_elements(path->'ranks') where coalesce((value->>'owned')::boolean,false) loop
   if rank->>'text' ~* pattern and rank->>'text' ~* 'ajoute son rang \+ 2' then
    candidate:=top_rank+2;if candidate>best then best:=candidate;bestsource:=(path->>'name')||' · '||(rank->>'name');end if;
   end if;
  end loop;
 end loop;
 select * into rules from bastide_shop_rules where singleton;
 extra:=coalesce((rules.overrides->>p_player_id)::integer,0);
 return jsonb_build_object('cha',cha,'pathBonus',best,'source',bestsource,'mjAdjustment',extra,'total',cha+best+extra);
end $$;
revoke all on function bastide_social_bonus(text,text) from public,anon,authenticated;grant execute on function bastide_social_bonus(text,text) to service_role;
create or replace function public.bastide_negotiate(p_player_id text,p_mode text,p_approach text)
returns jsonb language plpgsql set search_path=public as $$
declare rules bastide_shop_rules%rowtype; old bastide_shop_negotiations%rowtype; info jsonb; die integer; total integer; rate integer; result text; saved bastide_shop_negotiations%rowtype;
begin
 perform 1 from bastide_players where id=p_player_id for update;if not found then raise exception 'Joueur introuvable';end if;
 if p_mode not in ('buy','sell') then raise exception 'Type invalide';end if;
 select * into rules from bastide_shop_rules where singleton;if not rules.enabled then raise exception 'Négociation désactivée par le MJ';end if;
 select * into old from bastide_shop_negotiations where player_id=p_player_id and mode=p_mode;
 if found and old.expires_at>now() then raise exception 'Tentative déjà effectuée. Attends la prochaine visite ou demande une réouverture au MJ';end if;
 info:=bastide_social_bonus(p_player_id,p_approach);die:=floor(random()*20)::integer+1;total:=die+(info->>'total')::integer;
 if die=1 then rate:=-rules.critical_penalty;result:='Mila se braque';
 elsif die=20 or total>=rules.difficulty+5 then rate:=rules.great_pct;result:='Excellente négociation';
 elsif total>=rules.difficulty then rate:=rules.success_pct;result:='Négociation réussie';
 else rate:=0;result:='Mila conserve son tarif';end if;
 insert into bastide_shop_negotiations(player_id,mode,approach,die,bonus,total,rate,result,expires_at)
 values(p_player_id,p_mode,p_approach,die,(info->>'total')::integer,total,rate,result,now()+make_interval(hours=>rules.cooldown_hours))
 on conflict(player_id,mode) do update set approach=excluded.approach,die=excluded.die,bonus=excluded.bonus,total=excluded.total,rate=excluded.rate,result=excluded.result,rolled_at=now(),expires_at=excluded.expires_at,consumed_at=null returning * into saved;
 insert into bastide_inventory_events(player_id,event_type,summary,details,seen_at) values(p_player_id,'negotiation',result,to_jsonb(saved)||jsonb_build_object('bonusDetails',info),now());
 return to_jsonb(saved)||jsonb_build_object('bonusDetails',info);
end $$;
revoke all on function bastide_negotiate(text,text,text) from public,anon,authenticated;grant execute on function bastide_negotiate(text,text,text) to service_role;
create or replace function public.bastide_negotiated_price(p_player_id text,p_mode text,p_price numeric)
returns numeric language plpgsql stable set search_path=public as $$
declare rate integer;
begin
 select n.rate into rate from bastide_shop_negotiations n join bastide_shop_rules r on r.singleton and r.enabled where n.player_id=p_player_id and n.mode=p_mode and n.consumed_at is null and n.expires_at>now();
 return round(p_price*(100+case when p_mode='sell' then coalesce(rate,0) else -coalesce(rate,0) end)/100,1);
end $$;
revoke all on function bastide_negotiated_price(text,text,numeric) from public,anon,authenticated;grant execute on function bastide_negotiated_price(text,text,numeric) to service_role;
