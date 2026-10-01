alter table public.bastide_inventory_events add column if not exists seen_at timestamptz;

create table if not exists public.bastide_scenario_items (
  id text primary key,
  title text not null,
  kind text not null default 'object',
  category text not null default 'Objet de quête',
  description text not null default '',
  image_url text not null default '',
  mechanical_base text not null default '',
  active boolean not null default true,
  sort_order integer not null default 100,
  updated_at timestamptz not null default now()
);
alter table public.bastide_scenario_items enable row level security;
revoke all on public.bastide_scenario_items from anon, authenticated;

create index if not exists bastide_inventory_events_player_id_idx
  on public.bastide_inventory_events(player_id);

drop policy if exists "Acces direct interdit" on public.bastide_players;
create policy "Acces direct interdit" on public.bastide_players for all to anon, authenticated using (false) with check (false);
drop policy if exists "Acces direct interdit" on public.bastide_admin_tokens;
create policy "Acces direct interdit" on public.bastide_admin_tokens for all to anon, authenticated using (false) with check (false);
drop policy if exists "Acces direct interdit" on public.bastide_shop_items;
create policy "Acces direct interdit" on public.bastide_shop_items for all to anon, authenticated using (false) with check (false);
drop policy if exists "Acces direct interdit" on public.bastide_inventory_events;
create policy "Acces direct interdit" on public.bastide_inventory_events for all to anon, authenticated using (false) with check (false);
drop policy if exists "Acces direct interdit" on public.bastide_scenario_items;
create policy "Acces direct interdit" on public.bastide_scenario_items for all to anon, authenticated using (false) with check (false);

insert into public.bastide_scenario_items(id,title,kind,category,description,image_url,sort_order) values
('runara-map','Carte de l’île confiée par Runara','image','Document et indice','Une carte de l’île remise par Runara. Touchez l’image pour l’ouvrir, la déplacer et zoomer.','/atelier-guiltanas-apps/ile-aux-tempetes-bastide/assets/cartes/ile-runara-joueurs.png',10),
('captain-letter','Lettre trouvée sur le bateau','text','Document et indice','Une lettre découverte à bord. Son contenu sera complété par le MJ au moment de sa découverte.','',20)
on conflict (id) do update set title=excluded.title,kind=excluded.kind,category=excluded.category,description=excluded.description,image_url=excluded.image_url,sort_order=excluded.sort_order;

update public.bastide_players
set state=jsonb_set(state,'{money}',jsonb_build_object('po',0,'pa',coalesce((state->>'silver')::integer,0),'pc',0),true)
where not (state ? 'money');

create or replace function public.bastide_item_mutation(p_player_id text,p_action text,p_item jsonb)
returns jsonb language plpgsql security invoker set search_path=public as $$
declare v_state jsonb; v_inventory jsonb; v_id text; v_clean jsonb;
begin
  select state into v_state from public.bastide_players where id=p_player_id for update;
  if v_state is null then raise exception 'Joueur introuvable'; end if;
  v_inventory:=coalesce(v_state->'inventory','[]'::jsonb);
  v_id:=coalesce(p_item->>'id','');
  if v_id='' then raise exception 'Identifiant objet requis'; end if;
  if p_action='delete' then
    select coalesce(jsonb_agg(x),'[]'::jsonb) into v_inventory from jsonb_array_elements(v_inventory) x where x->>'id'<>v_id;
  elsif p_action in ('upsert','create') then
    v_clean:=jsonb_build_object(
      'id',v_id,'name',left(coalesce(p_item->>'name','Objet'),120),'base',left(coalesce(p_item->>'base',''),120),
      'category',left(coalesce(p_item->>'category','Équipement'),60),'quantity',greatest(0,coalesce((p_item->>'quantity')::integer,1)),
      'equipped',coalesce((p_item->>'equipped')::boolean,false),'chargesMax',greatest(0,coalesce((p_item->>'chargesMax')::integer,0)),
      'charges',greatest(0,coalesce((p_item->>'charges')::integer,0)),'notes',left(coalesce(p_item->>'notes',''),3000),
      'mediaUrl',left(coalesce(p_item->>'mediaUrl',''),1000),'mediaType',left(coalesce(p_item->>'mediaType',''),30),
      'source',left(coalesce(p_item->>'source','joueur'),40),'receivedAt',coalesce(p_item->>'receivedAt','')
    );
    select coalesce(jsonb_agg(x),'[]'::jsonb) into v_inventory from jsonb_array_elements(v_inventory) x where x->>'id'<>v_id;
    v_inventory:=v_inventory||jsonb_build_array(v_clean);
  else raise exception 'Action inconnue'; end if;
  v_state:=jsonb_set(v_state,'{inventory}',v_inventory,true);
  update public.bastide_players set state=v_state,updated_at=now() where id=p_player_id;
  return v_state;
end $$;

create or replace function public.bastide_money_mutation(p_player_id text,p_delta jsonb,p_summary text default 'Mise à jour de monnaie')
returns jsonb language plpgsql security invoker set search_path=public as $$
declare v_state jsonb; v_money jsonb; v_po integer;v_pa integer;v_pc integer;
begin
  select state into v_state from public.bastide_players where id=p_player_id for update;
  if v_state is null then raise exception 'Joueur introuvable'; end if;
  v_money:=coalesce(v_state->'money',jsonb_build_object('po',0,'pa',coalesce((v_state->>'silver')::integer,0),'pc',0));
  v_po:=greatest(0,coalesce((v_money->>'po')::integer,0)+coalesce((p_delta->>'po')::integer,0));
  v_pa:=greatest(0,coalesce((v_money->>'pa')::integer,0)+coalesce((p_delta->>'pa')::integer,0));
  v_pc:=greatest(0,coalesce((v_money->>'pc')::integer,0)+coalesce((p_delta->>'pc')::integer,0));
  v_money:=jsonb_build_object('po',v_po,'pa',v_pa,'pc',v_pc);
  v_state:=jsonb_set(jsonb_set(v_state,'{money}',v_money,true),'{silver}',to_jsonb(v_pa),true);
  update public.bastide_players set state=v_state,updated_at=now() where id=p_player_id;
  return v_state;
end $$;

create or replace function public.bastide_deliver_bundle(p_player_id text,p_items jsonb,p_money jsonb,p_summary text)
returns jsonb language plpgsql security invoker set search_path=public as $$
declare v_state jsonb;v_inventory jsonb;v_money jsonb;v_item jsonb;v_new jsonb;v_po integer;v_pa integer;v_pc integer;v_event bigint;
begin
  select state into v_state from public.bastide_players where id=p_player_id for update;
  if v_state is null then raise exception 'Joueur introuvable'; end if;
  v_inventory:=coalesce(v_state->'inventory','[]'::jsonb);
  for v_item in select value from jsonb_array_elements(coalesce(p_items,'[]'::jsonb)) loop
    v_new:=jsonb_build_object(
      'id','loot-'||gen_random_uuid(),'name',left(coalesce(v_item->>'name','Objet'),120),'base',left(coalesce(v_item->>'base',''),120),
      'category',left(coalesce(v_item->>'category','Équipement'),60),'quantity',greatest(1,coalesce((v_item->>'quantity')::integer,1)),
      'equipped',false,'chargesMax',greatest(0,coalesce((v_item->>'chargesMax')::integer,0)),
      'charges',greatest(0,coalesce((v_item->>'chargesMax')::integer,0)),'notes',left(coalesce(v_item->>'notes',''),3000),
      'mediaUrl',left(coalesce(v_item->>'mediaUrl',''),1000),'mediaType',left(coalesce(v_item->>'mediaType',''),30),
      'source','mj','receivedAt',now()::text
    );
    v_inventory:=v_inventory||jsonb_build_array(v_new);
  end loop;
  v_money:=coalesce(v_state->'money',jsonb_build_object('po',0,'pa',coalesce((v_state->>'silver')::integer,0),'pc',0));
  v_po:=greatest(0,coalesce((v_money->>'po')::integer,0)+coalesce((p_money->>'po')::integer,0));
  v_pa:=greatest(0,coalesce((v_money->>'pa')::integer,0)+coalesce((p_money->>'pa')::integer,0));
  v_pc:=greatest(0,coalesce((v_money->>'pc')::integer,0)+coalesce((p_money->>'pc')::integer,0));
  v_money:=jsonb_build_object('po',v_po,'pa',v_pa,'pc',v_pc);
  v_state:=jsonb_set(jsonb_set(jsonb_set(v_state,'{inventory}',v_inventory,true),'{money}',v_money,true),'{silver}',to_jsonb(v_pa),true);
  update public.bastide_players set state=v_state,updated_at=now() where id=p_player_id;
  insert into public.bastide_inventory_events(player_id,event_type,summary,details) values(p_player_id,'bundle',left(coalesce(p_summary,'Envoi du MJ'),200),jsonb_build_object('items',p_items,'money',p_money)) returning id into v_event;
  return jsonb_build_object('state',v_state,'eventId',v_event);
end $$;

create or replace function public.bastide_mark_events_seen(p_player_id text)
returns integer language plpgsql security invoker set search_path=public as $$
declare n integer;begin update public.bastide_inventory_events set seen_at=now() where player_id=p_player_id and seen_at is null;get diagnostics n=row_count;return n;end $$;

create or replace function public.bastide_purchase(p_player_id text,p_item_id uuid,p_quantity integer)
returns jsonb language plpgsql security invoker set search_path=public as $$
declare v_player public.bastide_players%rowtype;v_item public.bastide_shop_items%rowtype;v_cost integer;v_inventory jsonb;v_new jsonb;v_money jsonb;v_total integer;
begin
  if p_quantity<1 or p_quantity>20 then raise exception 'Quantité invalide';end if;
  select * into v_player from public.bastide_players where id=p_player_id for update;
  select * into v_item from public.bastide_shop_items where id=p_item_id and active for update;
  if not found then raise exception 'Objet indisponible';end if;
  if v_item.stock is not null and v_item.stock<p_quantity then raise exception 'Stock insuffisant';end if;
  v_cost:=v_item.price_silver*p_quantity;
  v_money:=coalesce(v_player.state->'money',jsonb_build_object('po',0,'pa',coalesce((v_player.state->>'silver')::integer,0),'pc',0));
  v_total:=coalesce((v_money->>'po')::integer,0)*100+coalesce((v_money->>'pa')::integer,0)*10+coalesce((v_money->>'pc')::integer,0)-v_cost*10;
  if v_total<0 then raise exception 'Monnaie insuffisante';end if;
  v_money:=jsonb_build_object('po',v_total/100,'pa',(v_total%100)/10,'pc',v_total%10);
  v_inventory:=coalesce(v_player.state->'inventory','[]'::jsonb);
  v_new:=jsonb_build_object('id','mila-'||gen_random_uuid(),'name',v_item.name,'base',v_item.base,'category',v_item.category,'quantity',p_quantity,'equipped',false,'chargesMax',v_item.charges_max,'charges',v_item.charges_max,'notes',v_item.description,'mediaUrl','','mediaType','','source','mila','receivedAt',now()::text);
  update public.bastide_players set state=jsonb_set(jsonb_set(jsonb_set(state,'{money}',v_money,true),'{silver}',to_jsonb((v_money->>'pa')::integer),true),'{inventory}',v_inventory||jsonb_build_array(v_new),true),updated_at=now() where id=p_player_id returning * into v_player;
  if v_item.stock is not null then update public.bastide_shop_items set stock=stock-p_quantity,updated_at=now() where id=p_item_id;end if;
  insert into public.bastide_inventory_events(player_id,event_type,summary,details) values(p_player_id,'purchase','Achat chez Mila : '||v_item.name,jsonb_build_object('quantity',p_quantity,'cost_pa',v_cost));
  return v_player.state;
end $$;

revoke all on function public.bastide_item_mutation(text,text,jsonb) from public,anon,authenticated;
revoke all on function public.bastide_money_mutation(text,jsonb,text) from public,anon,authenticated;
revoke all on function public.bastide_deliver_bundle(text,jsonb,jsonb,text) from public,anon,authenticated;
revoke all on function public.bastide_mark_events_seen(text) from public,anon,authenticated;
revoke all on function public.bastide_purchase(text,uuid,integer) from public,anon,authenticated;
grant execute on function public.bastide_item_mutation(text,text,jsonb),public.bastide_money_mutation(text,jsonb,text),public.bastide_deliver_bundle(text,jsonb,jsonb,text),public.bastide_mark_events_seen(text),public.bastide_purchase(text,uuid,integer) to service_role;
