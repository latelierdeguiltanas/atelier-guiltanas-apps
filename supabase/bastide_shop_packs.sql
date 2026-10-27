-- Bastide: conservative consumable stacks and atomic shop packs. Invoker-only RPCs.
create or replace function public.bastide_stack_consumables(p_inventory jsonb)
returns jsonb language plpgsql stable set search_path=public as $$
declare result jsonb:='[]'; item jsonb; old jsonb; signature jsonb; oldsig jsonb; pos integer; hit integer; shop bastide_shop_items%rowtype;
begin
 for item in select value from jsonb_array_elements(coalesce(p_inventory,'[]')) loop
  item:=public.bastide_catalog_item(item);
  if lower(coalesce(item->>'category','')) not like 'consommable%' or coalesce((item->>'equipped')::boolean,false) or coalesce((item->>'chargesMax')::numeric,0)>0 or coalesce(item->>'containerType','')<>'' or coalesce((item->>'quantity')::numeric,0)<=0 then result:=result||jsonb_build_array(item);continue;end if;
  -- Recover catalogue identifiers/prices missing on old Mila purchases only.
  if item->>'source'='mila' and coalesce(item->>'shopItemId','')='' then
   select * into shop from bastide_shop_items s where s.name=item->>'name' and s.base=coalesce(item->>'base','') and s.description=coalesce(item->>'notes','') order by s.id limit 1;
   if found then item:=item||jsonb_build_object('shopItemId',shop.id,'purchasePriceSilver',shop.price_silver,'salePriceSilver',greatest(1,floor(shop.price_silver::numeric/2)));end if;
  end if;
  -- Explicit approved custom prices remain distinct from ordinary catalogue prices.
  if coalesce(item->>'shopItemId','')<>'' and not coalesce((item->>'salePriceApproved')::boolean,false) then
   select * into shop from bastide_shop_items where id::text=item->>'shopItemId';
   if found and coalesce((item->>'salePriceSilver')::numeric,0)=greatest(1,floor(shop.price_silver::numeric/2)) then item:=item||'{"salePriceApproved":true}'::jsonb;end if;
  end if;
  -- Normalized empty defaults; retain every unknown property in the signature.
  item:=jsonb_build_object('containerId','','containerType','','mediaUrl','','mediaType','','documentUrl','','charges',0,'chargesMax',0,'equipment','{}'::jsonb,'salePriceApproved',false,'salePriceSilver',0,'shopItemId','')||item;
  signature:=item-array['id','quantity','source','receivedAt','purchasePriceSilver','catalogLoot'];hit:=-1;
  for old,pos in select value,(ordinality-1)::integer from jsonb_array_elements(result) with ordinality loop
   oldsig:=old-array['id','quantity','source','receivedAt','purchasePriceSilver','catalogLoot'];
   if oldsig=signature then hit:=pos;exit;end if;
  end loop;
  if hit<0 then result:=result||jsonb_build_array(item);
  else result:=jsonb_set(result,array[hit::text,'quantity'],to_jsonb((old->>'quantity')::numeric+(item->>'quantity')::numeric));end if;
 end loop;return result;
end $$;
revoke all on function public.bastide_stack_consumables(jsonb) from public,anon,authenticated;
grant execute on function public.bastide_stack_consumables(jsonb) to service_role;

create table if not exists public.bastide_shop_packs(
 id uuid primary key default gen_random_uuid(),name text not null check(length(name) between 1 and 120),
 lines jsonb not null check(jsonb_typeof(lines)='array' and jsonb_array_length(lines) between 1 and 40),
 price_pa numeric(12,1) not null check(price_pa>=0 and price_pa<=1000000),
 regular_pa numeric(12,1) not null,discount_percent numeric(5,2) not null default 0,
 pricing_mode text not null default 'fixed' check(pricing_mode in ('fixed','percent')),
 recipient_id text references public.bastide_players(id),stock integer check(stock>=0),active boolean not null default true,
 updated_at timestamptz not null default now()
);
alter table public.bastide_shop_packs enable row level security;
revoke all on public.bastide_shop_packs from public,anon,authenticated;
grant all on public.bastide_shop_packs to service_role;
-- Custom bearer authorization is performed by bastide-inventory, never by direct client SQL.

create or replace function public.bastide_save_shop_pack(p_pack jsonb)
returns jsonb language plpgsql set search_path=public as $$
declare packid uuid; line jsonb; item bastide_shop_items%rowtype; lines jsonb:='[]'; subtotal numeric:=0; regular numeric:=0; qty integer; price numeric; discount numeric; mode text; saved bastide_shop_packs%rowtype;
begin
 if trim(coalesce(p_pack->>'name',''))='' then raise exception 'Nom du pack requis';end if;
 if jsonb_typeof(p_pack->'lines')<>'array' or coalesce(jsonb_array_length(p_pack->'lines'),0) not between 1 and 40 then raise exception 'Ajoute de 1 à 40 lignes';end if;
 for line in select value from jsonb_array_elements(p_pack->'lines') loop
  if (line->>'quantity')::numeric<>trunc((line->>'quantity')::numeric) then raise exception 'Quantité entière requise';end if;
  qty:=(line->>'quantity')::integer;if qty is null or qty not between 1 and 100 then raise exception 'Quantité invalide';end if;
  select * into item from bastide_shop_items where id=(line->>'itemId')::uuid and active;
  if not found then raise exception 'Article indisponible';end if;
  regular:=regular+item.price_silver*qty;
  if not coalesce((line->>'gift')::boolean,false) then subtotal:=subtotal+item.price_silver*qty;end if;
  lines:=lines||jsonb_build_array(jsonb_build_object('itemId',item.id,'name',item.name,'quantity',qty,'gift',coalesce((line->>'gift')::boolean,false),'unitPrice',item.price_silver));
 end loop;
 mode:=coalesce(p_pack->>'pricingMode','fixed');discount:=coalesce((p_pack->>'discountPercent')::numeric,0);
 if discount not between 0 and 100 then raise exception 'Remise invalide';end if;
 price:=case when mode='percent' then floor(subtotal*(100-discount))/100 else (p_pack->>'price')::numeric end;
 -- Round to one copper coin, never fractions of a coin.
 if mode='percent' then price:=round(price,1);end if;
 if price is null or price<0 or price>1000000 or price*10<>trunc(price*10) then raise exception 'Prix invalide (précision : 0,1 PA)';end if;
 if p_pack->>'stock' is not null and p_pack->>'stock'<>'' and (p_pack->>'stock')::numeric<>trunc((p_pack->>'stock')::numeric) then raise exception 'Stock entier requis';end if;
 packid:=coalesce(nullif(p_pack->>'id','')::uuid,gen_random_uuid());
 insert into bastide_shop_packs(id,name,lines,price_pa,regular_pa,discount_percent,pricing_mode,recipient_id,stock,active)
 values(packid,left(trim(p_pack->>'name'),120),lines,price,regular,discount,mode,nullif(p_pack->>'recipientId',''),nullif(p_pack->>'stock','')::integer,coalesce((p_pack->>'active')::boolean,true))
 on conflict(id) do update set name=excluded.name,lines=excluded.lines,price_pa=excluded.price_pa,regular_pa=excluded.regular_pa,discount_percent=excluded.discount_percent,pricing_mode=excluded.pricing_mode,recipient_id=excluded.recipient_id,stock=excluded.stock,active=excluded.active,updated_at=now() returning * into saved;
 return to_jsonb(saved);
end $$;
revoke all on function public.bastide_save_shop_pack(jsonb) from public,anon,authenticated;
grant execute on function public.bastide_save_shop_pack(jsonb) to service_role;

create or replace function public.bastide_purchase_pack(p_player_id text,p_pack_id uuid)
returns jsonb language plpgsql set search_path=public as $$
declare p bastide_players%rowtype; pack bastide_shop_packs%rowtype; line record; item bastide_shop_items%rowtype; inventory jsonb; newitem jsonb; money jsonb; coins bigint; before_money jsonb; q integer;
begin
 select * into p from bastide_players where id=p_player_id for update;if not found then raise exception 'Joueur introuvable';end if;
 select * into pack from bastide_shop_packs where id=p_pack_id and active for update;
 if not found or pack.stock=0 then raise exception 'Pack indisponible';end if;
 if pack.recipient_id is not null and pack.recipient_id<>p_player_id then raise exception 'Ce pack est réservé à un autre joueur';end if;
 before_money:=coalesce(p.state->'money',jsonb_build_object('pa',coalesce((p.state->>'silver')::numeric,0)));
 money:=bastide_normalize_money(before_money);
 coins:=(money->>'po')::bigint*100+(money->>'pa')::bigint*10+(money->>'pc')::bigint-(pack.price_pa*10)::bigint;
 if coins<0 then raise exception 'Monnaie insuffisante';end if;
 inventory:=coalesce(p.state->'inventory','[]');
 -- Aggregate repeated lines (including gifts), and lock catalogue rows in UUID order.
 for line in select (value->>'itemId')::uuid as id,sum((value->>'quantity')::integer)::integer as quantity from jsonb_array_elements(pack.lines) group by 1 order by 1 loop
  select * into item from bastide_shop_items where id=line.id and active for update;
  if not found then raise exception 'Article indisponible dans le pack';end if;
  q:=line.quantity;if item.stock is not null and item.stock<q then raise exception 'Stock insuffisant : %',item.name;end if;
  newitem:=jsonb_build_object('id','mila-'||gen_random_uuid(),'name',item.name,'base',item.base,'category',item.category,'quantity',q,'equipped',false,'chargesMax',item.charges_max,'charges',item.charges_max,'notes',item.description,'mediaUrl','','mediaType','','documentUrl','','containerId',case when p_player_id='zepheline' and exists(select 1 from jsonb_array_elements(inventory) i where i->>'id'='zepheline-besace-pollen') then 'zepheline-besace-pollen' else '' end,'source','mila','shopItemId',item.id,'purchasePriceSilver',item.price_silver,'salePriceApproved',true,'salePriceSilver',greatest(1,floor(item.price_silver::numeric/2)),'receivedAt',now()::text,'equipment',item.equipment);
  inventory:=inventory||jsonb_build_array(newitem);
  if item.stock is not null then update bastide_shop_items set stock=stock-q,updated_at=now() where id=item.id;end if;
 end loop;
 money:=jsonb_build_object('po',coins/100,'pa',(coins%100)/10,'pc',coins%10);
 p.state:=p.state||jsonb_build_object('money',money,'silver',(money->>'po')::integer*10+(money->>'pa')::integer,'inventory',bastide_stack_consumables(inventory));
 update bastide_players set state=p.state,updated_at=now() where id=p_player_id;
 if pack.stock is not null then update bastide_shop_packs set stock=stock-1,updated_at=now() where id=pack.id;end if;
 insert into bastide_inventory_events(player_id,event_type,summary,details) values(p_player_id,'purchase_pack','Pack chez Mila : '||pack.name,jsonb_build_object('packId',pack.id,'lines',pack.lines,'cost_pa',pack.price_pa,'regular_pa',pack.regular_pa,'money_before',before_money,'money_after',money));
 return p.state;
end $$;
revoke all on function public.bastide_purchase_pack(text,uuid) from public,anon,authenticated;
grant execute on function public.bastide_purchase_pack(text,uuid) to service_role;
