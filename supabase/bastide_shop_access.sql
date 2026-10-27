-- Access is locked in SQL too: hiding a button is not authorization.
alter table public.bastide_shop_rules add column if not exists shop_open boolean not null default true;
alter table public.bastide_shop_rules add column if not exists shop_message text not null default 'La boutique est accessible uniquement lorsque le groupe séjourne au Repos du Dragon.';
alter table public.bastide_shop_rules add column if not exists visit_id bigint not null default 1;
alter table public.bastide_shop_rules add column if not exists theft_enabled boolean not null default true;
alter table public.bastide_shop_rules add column if not exists theft_dc integer not null default 20 check(theft_dc between 5 and 40);
alter table public.bastide_shop_rules add column if not exists theft_max_pa integer not null default 10 check(theft_max_pa between 1 and 1000);
create or replace function public.bastide_assert_shop_open()
returns void language plpgsql set search_path=public as $$
declare opened boolean;
begin select shop_open into opened from bastide_shop_rules where singleton for share;if opened is distinct from true then raise exception 'Boutique fermée : le groupe ne séjourne pas au Repos du Dragon';end if;end $$;
revoke all on function bastide_assert_shop_open() from public,anon,authenticated;grant execute on function bastide_assert_shop_open() to service_role;
create or replace function public.bastide_set_shop_access(p_open boolean,p_message text default null)
returns jsonb language plpgsql set search_path=public as $$
declare r bastide_shop_rules%rowtype;
begin
 update bastide_shop_rules set visit_id=visit_id+case when p_open and not shop_open then 1 else 0 end,shop_open=p_open,shop_message=coalesce(nullif(left(trim(p_message),500),''),shop_message) where singleton returning * into r;
 return jsonb_build_object('open',r.shop_open,'message',r.shop_message,'visitId',r.visit_id);
end $$;
revoke all on function bastide_set_shop_access(boolean,text) from public,anon,authenticated;grant execute on function bastide_set_shop_access(boolean,text) to service_role;
create table if not exists public.bastide_shop_incidents(
 player_id text references bastide_players(id) on delete cascade,visit_id bigint not null,item_id uuid not null,
 die integer not null,bonus integer not null,total integer not null,success boolean not null,created_at timestamptz not null default now(),primary key(player_id,visit_id)
);
alter table bastide_shop_incidents enable row level security;revoke all on bastide_shop_incidents from public,anon,authenticated;grant all on bastide_shop_incidents to service_role;
create table if not exists public.bastide_shop_relations(
 player_id text primary key references bastide_players(id) on delete cascade,surcharge integer not null default 1 check(surcharge in(1,2)),reason text not null default '',updated_at timestamptz not null default now()
);
alter table bastide_shop_relations enable row level security;revoke all on bastide_shop_relations from public,anon,authenticated;grant all on bastide_shop_relations to service_role;
create or replace function public.bastide_attempt_theft(p_player_id text,p_item_id uuid)
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
   if r->>'text' ~* 'pickpocket|précision manuelle' and r->>'text' ~* 'rang \+ 2' then bonus:=greatest(bonus,toprank+2);end if;
  end loop;
 end loop;
 bonus:=bonus+agi;die:=floor(random()*20)::integer+1;total:=die+bonus;won:=die<>1 and (die=20 or total>=rules.theft_dc);
 insert into bastide_shop_incidents(player_id,visit_id,item_id,die,bonus,total,success) values(p_player_id,rules.visit_id,item.id,die,bonus,total,won);
 if won then
  perform bastide_deliver_bundle(p_player_id,jsonb_build_array(jsonb_build_object('name',item.name,'base',item.base,'category',item.category,'quantity',1,'notes',item.description,'equipment',item.equipment)),'{}','Objet dérobé chez Mila : '||item.name);
  if item.stock is not null then update bastide_shop_items set stock=stock-1,updated_at=now() where id=item.id;end if;
 else
  insert into bastide_shop_relations(player_id,surcharge,reason) values(p_player_id,2,'Tentative de vol repérée par Mila') on conflict(player_id) do update set surcharge=2,reason=excluded.reason,updated_at=now();
  update bastide_shop_negotiations set consumed_at=now() where player_id=p_player_id and consumed_at is null;
 end if;
 insert into bastide_inventory_events(player_id,event_type,summary,details)
 values(p_player_id,'shop_theft',case when won then 'Vol réussi chez Mila' else 'Vol repéré : tarifs d’achat doublés et négociation bloquée jusqu’au pardon du MJ' end,jsonb_build_object('die',die,'bonus',bonus,'total',total,'success',won,'item',item.name,'visit',rules.visit_id));
 return jsonb_build_object('die',die,'bonus',bonus,'total',total,'success',won,'item',item.name,'message',case when won then 'Tu subtilises un exemplaire sans être repéré.' else 'Mila t’a vu. Tes tarifs d’achat sont doublés et elle refuse de négocier jusqu’à ce que le MJ lève sa méfiance.' end);
end $$;
revoke all on function bastide_attempt_theft(text,uuid) from public,anon,authenticated;grant execute on function bastide_attempt_theft(text,uuid) to service_role;
