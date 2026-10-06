create table if not exists public.bastide_personal_entries (
  id uuid primary key default gen_random_uuid(),
  owner_id text not null references public.bastide_players(id) on delete cascade,
  kind text not null check (kind in ('contract','confidence')),
  title text not null check (char_length(title) between 1 and 120),
  content text not null default '' check (char_length(content) <= 20000),
  status text not null default 'draft' check (status in ('draft','active','completed','shared')),
  audience jsonb not null default '[]'::jsonb check (jsonb_typeof(audience)='array'),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata)='object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.bastide_personal_entries enable row level security;
revoke all on table public.bastide_personal_entries from anon, authenticated;
grant all on table public.bastide_personal_entries to service_role;
drop policy if exists "Acces direct interdit" on public.bastide_personal_entries;
create policy "Acces direct interdit" on public.bastide_personal_entries
  for all to anon, authenticated using (false) with check (false);
create index if not exists bastide_personal_entries_owner_idx
  on public.bastide_personal_entries(owner_id,kind,updated_at desc);

create or replace function public.bastide_companion_mutation(p_player_id text,p_companion jsonb)
returns jsonb language plpgsql security invoker set search_path=public as $$
declare v_state jsonb;v_clean jsonb;
begin
  select state into v_state from public.bastide_players where id=p_player_id for update;
  if v_state is null then raise exception 'Joueur introuvable';end if;
  v_clean:=jsonb_build_object(
    'name',left(coalesce(p_companion->>'name','Mon loup'),80),
    'hp',greatest(0,least(999,coalesce((p_companion->>'hp')::integer,0)))
  );
  v_state:=jsonb_set(v_state,'{companion}',v_clean,true);
  update public.bastide_players set state=v_state,updated_at=now() where id=p_player_id;
  return v_state;
end $$;

create or replace function public.bastide_sell_items(p_player_id text,p_lines jsonb)
returns jsonb language plpgsql security invoker set search_path=public as $$
declare
  v_player public.bastide_players%rowtype;v_line jsonb;v_inv_item jsonb;v_shop public.bastide_shop_items%rowtype;
  v_inventory jsonb;v_money jsonb;v_total integer;v_quantity integer;v_remaining integer;v_offer integer;v_offer_total integer:=0;v_item_id text;
begin
  if jsonb_typeof(p_lines)<>'array' or jsonb_array_length(p_lines)<1 or jsonb_array_length(p_lines)>30 then raise exception 'Panier de vente invalide';end if;
  select * into v_player from public.bastide_players where id=p_player_id for update;
  if not found then raise exception 'Joueur introuvable';end if;
  v_inventory:=coalesce(v_player.state->'inventory','[]'::jsonb);
  for v_line in select value from jsonb_array_elements(p_lines) loop
    v_item_id:=left(coalesce(v_line->>'itemId',''),160);
    v_quantity:=greatest(0,least(99,coalesce((v_line->>'quantity')::integer,0)));
    if v_item_id='' or v_quantity<1 then raise exception 'Objet ou quantité invalide';end if;
    select value into v_inv_item from jsonb_array_elements(v_inventory) where value->>'id'=v_item_id limit 1;
    if v_inv_item is null then raise exception 'Objet introuvable dans l inventaire';end if;
    if coalesce((v_inv_item->>'equipped')::boolean,false) then raise exception 'Rangez l objet avant de le vendre';end if;
    if coalesce((v_inv_item->>'quantity')::integer,0)<v_quantity then raise exception 'Quantité insuffisante';end if;
    select * into v_shop from public.bastide_shop_items
      where active and (
        id=case when v_inv_item->>'shopItemId' ~* '^[0-9a-f-]{36}$' then (v_inv_item->>'shopItemId')::uuid else null end
        or lower(name)=lower(coalesce(v_inv_item->>'name',''))
        or (coalesce(v_inv_item->>'base','')<>'' and lower(base)=lower(v_inv_item->>'base'))
      ) order by case when id::text=coalesce(v_inv_item->>'shopItemId','') then 0 else 1 end limit 1;
    if not found then raise exception 'Mila doit estimer cet objet avant la vente : %',coalesce(v_inv_item->>'name','Objet');end if;
    v_offer:=greatest(1,floor(v_shop.price_silver::numeric/2)::integer);
    v_offer_total:=v_offer_total+(v_offer*v_quantity);
    v_remaining:=(v_inv_item->>'quantity')::integer-v_quantity;
    select coalesce(jsonb_agg(case when x->>'id'=v_item_id then jsonb_set(x,'{quantity}',to_jsonb(v_remaining),true) else x end) filter(where x->>'id'<>v_item_id or v_remaining>0),'[]'::jsonb)
      into v_inventory from jsonb_array_elements(v_inventory) as e(x);
    if v_shop.stock is not null then update public.bastide_shop_items set stock=stock+v_quantity,updated_at=now() where id=v_shop.id;end if;
  end loop;
  v_money:=coalesce(v_player.state->'money',jsonb_build_object('po',0,'pa',coalesce((v_player.state->>'silver')::integer,0),'pc',0));
  v_total:=coalesce((v_money->>'po')::integer,0)*100+coalesce((v_money->>'pa')::integer,0)*10+coalesce((v_money->>'pc')::integer,0)+v_offer_total*10;
  v_money:=jsonb_build_object('po',v_total/100,'pa',(v_total%100)/10,'pc',v_total%10);
  update public.bastide_players set state=jsonb_set(jsonb_set(jsonb_set(state,'{inventory}',v_inventory,true),'{money}',v_money,true),'{silver}',to_jsonb((v_money->>'pa')::integer),true),updated_at=now() where id=p_player_id returning * into v_player;
  insert into public.bastide_inventory_events(player_id,event_type,summary,details) values(p_player_id,'sale','Vente à Mila : '||v_offer_total||' PA',jsonb_build_object('lines',p_lines,'earned_pa',v_offer_total));
  return v_player.state;
end $$;

revoke all on function public.bastide_companion_mutation(text,jsonb) from public,anon,authenticated;
revoke all on function public.bastide_sell_items(text,jsonb) from public,anon,authenticated;
grant execute on function public.bastide_companion_mutation(text,jsonb),public.bastide_sell_items(text,jsonb) to service_role;

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
  v_new:=jsonb_build_object('id','mila-'||gen_random_uuid(),'name',v_item.name,'base',v_item.base,'category',v_item.category,'quantity',p_quantity,'equipped',false,'chargesMax',v_item.charges_max,'charges',v_item.charges_max,'notes',v_item.description,'mediaUrl','','mediaType','','source','mila','shopItemId',v_item.id,'purchasePriceSilver',v_item.price_silver,'salePriceSilver',greatest(1,floor(v_item.price_silver::numeric/2)::integer),'receivedAt',now()::text,'equipment',v_item.equipment);
  update public.bastide_players set state=jsonb_set(jsonb_set(jsonb_set(state,'{money}',v_money,true),'{silver}',to_jsonb((v_money->>'pa')::integer),true),'{inventory}',v_inventory||jsonb_build_array(v_new),true),updated_at=now() where id=p_player_id returning * into v_player;
  if v_item.stock is not null then update public.bastide_shop_items set stock=stock-p_quantity,updated_at=now() where id=p_item_id;end if;
  insert into public.bastide_inventory_events(player_id,event_type,summary,details) values(p_player_id,'purchase','Achat chez Mila : '||v_item.name,jsonb_build_object('quantity',p_quantity,'cost_pa',v_cost));
  return v_player.state;
end $$;

revoke all on function public.bastide_purchase(text,uuid,integer) from public,anon,authenticated;
grant execute on function public.bastide_purchase(text,uuid,integer) to service_role;
