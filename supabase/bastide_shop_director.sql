-- Optional, expiring MJ presence. New private tables never enter the public Data API.
create table if not exists public.bastide_shop_director(singleton boolean primary key default true check(singleton),presence_until timestamptz,hold_seconds integer not null default 60 check(hold_seconds between 30 and 180));
insert into bastide_shop_director(singleton) values(true) on conflict do nothing;
create table if not exists public.bastide_shop_requests(
 id uuid primary key default gen_random_uuid(),player_id text not null references bastide_players(id) on delete cascade,
 client_id uuid not null,kind text not null check(kind in ('negotiate','steal')),payload jsonb not null,visit_id bigint not null,
 status text not null default 'pending' check(status in ('pending','resolved','cancelled')),deadline timestamptz not null,
 result jsonb,resolved_by text,created_at timestamptz not null default now(),resolved_at timestamptz,unique(player_id,client_id));
create unique index if not exists bastide_shop_request_pending on bastide_shop_requests(player_id) where status='pending';
create index if not exists bastide_shop_request_recent on bastide_shop_requests(created_at desc);
alter table bastide_shop_director enable row level security;alter table bastide_shop_requests enable row level security;
revoke all on bastide_shop_director,bastide_shop_requests from public,anon,authenticated;
grant all on bastide_shop_director,bastide_shop_requests to service_role;
create or replace function public.bastide_resolve_negotiation(p_player_id text,p_mode text,p_approach text,p_mj_rate integer default null,p_note text default null)
returns jsonb language plpgsql set search_path=public as $$
declare rules bastide_shop_rules%rowtype; old bastide_shop_negotiations%rowtype; info jsonb; die integer; total integer; rate integer; result text; saved bastide_shop_negotiations%rowtype;
begin
 perform bastide_assert_shop_open();
 if exists(select 1 from bastide_shop_relations where player_id=p_player_id and surcharge=2) then raise exception 'Mila refuse de négocier après le vol : intervention du MJ nécessaire';end if;
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
 if p_mj_rate is not null then if p_mj_rate not between -50 and 50 then raise exception 'Tarif MJ hors limites';end if;rate:=p_mj_rate;result:='Arbitrage MJ'||case when nullif(trim(p_note),'') is not null then ' : '||left(p_note,200) else '' end;end if;
 insert into bastide_shop_negotiations(player_id,mode,approach,die,bonus,total,rate,result,expires_at)
 values(p_player_id,p_mode,p_approach,die,(info->>'total')::integer,total,rate,result,now()+make_interval(hours=>rules.cooldown_hours))
 on conflict(player_id,mode) do update set approach=excluded.approach,die=excluded.die,bonus=excluded.bonus,total=excluded.total,rate=excluded.rate,result=excluded.result,rolled_at=now(),expires_at=excluded.expires_at,consumed_at=null returning * into saved;
 insert into bastide_inventory_events(player_id,event_type,summary,details,seen_at) values(p_player_id,'negotiation',result,to_jsonb(saved)||jsonb_build_object('bonusDetails',info,'manual',p_mj_rate is not null),now());
 return to_jsonb(saved)||jsonb_build_object('bonusDetails',info,'manual',p_mj_rate is not null);
end $$;
revoke all on function bastide_resolve_negotiation(text,text,text,integer,text) from public,anon,authenticated;grant execute on function bastide_resolve_negotiation(text,text,text,integer,text) to service_role;
create or replace function public.bastide_resolve_theft(p_player_id text,p_item_id uuid,p_mj_success boolean default null,p_note text default null)
returns jsonb language plpgsql set search_path=public as $$
declare rules bastide_shop_rules%rowtype;item bastide_shop_items%rowtype;c jsonb;p jsonb;r jsonb;toprank integer;bonus integer:=0;agi integer;die integer;total integer;won boolean;
begin
 perform bastide_assert_shop_open();select * into rules from bastide_shop_rules where singleton;
 if not rules.theft_enabled then raise exception 'Tentatives de vol désactivées par le MJ';end if;
 perform 1 from bastide_players where id=p_player_id for update;if not found then raise exception 'Joueur introuvable';end if;
 if exists(select 1 from bastide_shop_incidents where player_id=p_player_id and visit_id=rules.visit_id) then raise exception 'Une seule tentative de vol par visite au Repos du Dragon';end if;
 if exists(select 1 from bastide_shop_relations where player_id=p_player_id and surcharge=2) then raise exception 'Mila te surveille : le MJ doit lever sa méfiance';end if;
 select * into item from bastide_shop_items where id=p_item_id and active for update;
 if not found or item.stock=0 or item.category<>'Consommable' or item.price_silver>rules.theft_max_pa or item.charges_max>0 then raise exception 'Cet article ne peut pas être dérobé automatiquement';end if;
 select payload->'character' into c from bastide_character_levels where player_id=p_player_id;if c is null then raise exception 'Fiche synchronisée requise';end if;
 agi:=coalesce((c->'stats'->>'AGI')::integer,0);
 for p in select value from jsonb_array_elements(c->'paths') loop
  select coalesce(max((x->>'rank')::integer),0) into toprank from jsonb_array_elements(p->'ranks') x where coalesce((x->>'owned')::boolean,false);
  for r in select value from jsonb_array_elements(p->'ranks') where coalesce((value->>'owned')::boolean,false) loop
   if r->>'text' ~* 'pickpocket|précision manuelle' and r->>'text' ~* 'rang[[:space:]]*[+][[:space:]]*2' then bonus:=greatest(bonus,toprank+2);end if;
  end loop;
 end loop;
 bonus:=bonus+agi;die:=floor(random()*20)::integer+1;total:=die+bonus;won:=die<>1 and (die=20 or total>=rules.theft_dc);
 if p_mj_success is not null then won:=p_mj_success;end if;
 insert into bastide_shop_incidents(player_id,visit_id,item_id,die,bonus,total,success) values(p_player_id,rules.visit_id,item.id,die,bonus,total,won);
 if won then
  perform bastide_deliver_bundle(p_player_id,jsonb_build_array(jsonb_build_object('name',item.name,'base',item.base,'category',item.category,'quantity',1,'notes',item.description,'equipment',item.equipment)),'{}','Objet dérobé chez Mila : '||item.name);
  if item.stock is not null then update bastide_shop_items set stock=stock-1,updated_at=now() where id=item.id;end if;
 else
  insert into bastide_shop_relations(player_id,surcharge,reason) values(p_player_id,2,'Tentative de vol repérée par Mila') on conflict(player_id) do update set surcharge=2,reason=excluded.reason,updated_at=now();
  update bastide_shop_negotiations set consumed_at=now() where player_id=p_player_id and consumed_at is null;
 end if;
 insert into bastide_inventory_events(player_id,event_type,summary,details)
 values(p_player_id,'shop_theft',case when won then 'Vol réussi chez Mila' else 'Vol repéré : tarifs d’achat doublés et négociation bloquée jusqu’au pardon du MJ' end,jsonb_build_object('die',die,'bonus',bonus,'total',total,'success',won,'item',item.name,'visit',rules.visit_id,'manual',p_mj_success is not null,'note',left(p_note,500)));
 return jsonb_build_object('die',die,'bonus',bonus,'total',total,'success',won,'item',item.name,'manual',p_mj_success is not null,'note',left(p_note,500),'message',case when won then 'Tu subtilises un exemplaire sans être repéré.' else 'Mila t’a vu. Tes tarifs d’achat sont doublés et elle refuse de négocier jusqu’à ce que le MJ lève sa méfiance.' end);
end $$;
revoke all on function bastide_resolve_theft(text,uuid,boolean,text) from public,anon,authenticated;grant execute on function bastide_resolve_theft(text,uuid,boolean,text) to service_role;

create or replace function public.bastide_shop_resolve_request(p_id uuid,p_player_id text default null,p_admin boolean default false,p_rate integer default null,p_success boolean default null,p_note text default null)
returns jsonb language plpgsql set search_path=public as $$
declare r bastide_shop_requests%rowtype;owner_id text;answer jsonb;v bigint;
begin
 select player_id into owner_id from bastide_shop_requests where id=p_id;
 if owner_id is null or (not p_admin and owner_id is distinct from p_player_id) then raise exception 'Demande inaccessible';end if;
 perform 1 from bastide_players where id=owner_id for update;
 select * into r from bastide_shop_requests where id=p_id for update;
 if r.status<>'pending' then return to_jsonb(r);end if;
 if not p_admin and r.deadline>now() then return to_jsonb(r);end if;
 begin
  perform bastide_assert_shop_open();select visit_id into v from bastide_shop_rules where singleton;
  if v<>r.visit_id then raise exception 'Visite terminée : demande annulée';end if;
  if r.kind='negotiate' then answer:=bastide_resolve_negotiation(owner_id,r.payload->>'mode',r.payload->>'approach',case when p_admin then p_rate else null end,case when p_admin then p_note else null end);
  else answer:=bastide_resolve_theft(owner_id,(r.payload->>'itemId')::uuid,case when p_admin then p_success else null end,case when p_admin then p_note else null end);end if;
  update bastide_shop_requests set status='resolved',result=answer,resolved_by=case when p_admin and (p_rate is not null or p_success is not null) then 'mj' else 'auto' end,resolved_at=now() where id=p_id returning * into r;
 exception when others then
  update bastide_shop_requests set status='cancelled',result=jsonb_build_object('error',sqlerrm),resolved_by='cancelled',resolved_at=now() where id=p_id returning * into r;
 end;
 return to_jsonb(r);
end $$;
revoke all on function bastide_shop_resolve_request(uuid,text,boolean,integer,boolean,text) from public,anon,authenticated;grant execute on function bastide_shop_resolve_request(uuid,text,boolean,integer,boolean,text) to service_role;
create or replace function public.bastide_shop_submit_request(p_player_id text,p_client_id uuid,p_kind text,p_body jsonb)
returns jsonb language plpgsql set search_path=public as $$
declare d bastide_shop_director%rowtype;r bastide_shop_requests%rowtype;rules bastide_shop_rules%rowtype;i bastide_shop_items%rowtype;
begin
 perform bastide_assert_shop_open();perform 1 from bastide_players where id=p_player_id for update;if not found then raise exception 'Joueur introuvable';end if;
 select * into r from bastide_shop_requests where player_id=p_player_id and client_id=p_client_id;
 if found then return to_jsonb(r);end if;
 if p_kind not in ('negotiate','steal') then raise exception 'Action invalide';end if;
 select * into r from bastide_shop_requests where player_id=p_player_id and status='pending';if found then
  if r.kind is distinct from p_kind or r.payload is distinct from p_body then raise exception 'Une autre demande est déjà en cours';end if;return to_jsonb(r);end if;
 select * into rules from bastide_shop_rules where singleton;
 if exists(select 1 from bastide_shop_relations where player_id=p_player_id and surcharge=2) then raise exception 'Mila te surveille : intervention du MJ nécessaire';end if;
 if p_kind='negotiate' then
  if not rules.enabled or p_body->>'mode' is null or p_body->>'mode' not in ('buy','sell') then raise exception 'Négociation indisponible';end if;
  perform bastide_social_bonus(p_player_id,p_body->>'approach');
  if exists(select 1 from bastide_shop_negotiations where player_id=p_player_id and mode=p_body->>'mode' and expires_at>now()) then raise exception 'Tentative déjà effectuée pour cette période';end if;
 else
  if not rules.theft_enabled then raise exception 'Vol désactivé';end if;
  if exists(select 1 from bastide_shop_incidents where player_id=p_player_id and visit_id=rules.visit_id) then raise exception 'Une seule tentative de vol par visite';end if;
  select * into i from bastide_shop_items where id=(p_body->>'itemId')::uuid and active;
  if not found or i.stock=0 or i.category<>'Consommable' or i.price_silver>rules.theft_max_pa or i.charges_max>0 then raise exception 'Objet non dérobable';end if;
 end if;
 select * into d from bastide_shop_director where singleton;
 insert into bastide_shop_requests(player_id,client_id,kind,payload,visit_id,deadline)
 values(p_player_id,p_client_id,p_kind,p_body,rules.visit_id,case when d.presence_until>now() then now()+make_interval(secs=>d.hold_seconds) else now() end) returning * into r;
 if r.deadline<=now() then return bastide_shop_resolve_request(r.id,p_player_id,false);end if;return to_jsonb(r);
end $$;
revoke all on function bastide_shop_submit_request(text,uuid,text,jsonb) from public,anon,authenticated;grant execute on function bastide_shop_submit_request(text,uuid,text,jsonb) to service_role;
