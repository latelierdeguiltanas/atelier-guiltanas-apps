create or replace function public.bastide_checkout(p_player_id text,p_lines jsonb default null,p_pack_id uuid default null)
returns jsonb language plpgsql set search_path=public as $$
declare p bastide_players%rowtype; pack bastide_shop_packs%rowtype; line record; item bastide_shop_items%rowtype; inventory jsonb; newitem jsonb; money jsonb; coins bigint; before_money jsonb; q integer; entry jsonb; subtotal numeric:=0; baseprice numeric;
begin
 perform bastide_assert_shop_open();
 select * into p from bastide_players where id=p_player_id for update;if not found then raise exception 'Joueur introuvable';end if;
 if p_pack_id is not null then
  select * into pack from bastide_shop_packs where id=p_pack_id and active for update;
  if not found or pack.stock=0 then raise exception 'Pack indisponible';end if;
  if pack.recipient_id is not null and pack.recipient_id<>p_player_id then raise exception 'Ce pack est réservé à un autre joueur';end if;
 else
  if jsonb_typeof(p_lines)<>'array' or coalesce(jsonb_array_length(p_lines),0) not between 1 and 40 then raise exception 'Panier vide ou trop long';end if;
  for entry in select value from jsonb_array_elements(p_lines) order by value->>'itemId' loop
   if (entry->>'quantity')::numeric<>trunc((entry->>'quantity')::numeric) or coalesce((entry->>'quantity')::integer,0) not between 1 and 100 then raise exception 'Quantité invalide';end if;
   select * into item from bastide_shop_items where id=(entry->>'itemId')::uuid and active for update;
   if not found then raise exception 'Article indisponible';end if;
   subtotal:=subtotal+item.price_silver*(entry->>'quantity')::integer;
  end loop;
  pack.lines:=p_lines;pack.price_pa:=subtotal;pack.regular_pa:=subtotal;pack.name:='Panier';
 end if;
 pack.price_pa:=pack.price_pa*coalesce((select surcharge from bastide_shop_relations where player_id=p_player_id),1);
 baseprice:=pack.price_pa;
 -- Packs already have an MJ tariff; negotiation applies to ordinary baskets only.
 if p_pack_id is null then pack.price_pa:=bastide_negotiated_price(p_player_id,'buy',pack.price_pa);end if;
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
 if p_pack_id is not null and pack.stock is not null then update bastide_shop_packs set stock=stock-1,updated_at=now() where id=pack.id;end if;
 insert into bastide_inventory_events(player_id,event_type,summary,details) values(p_player_id,'purchase_pack','Pack chez Mila : '||pack.name,jsonb_build_object('base_pa',baseprice,'packId',pack.id,'lines',pack.lines,'cost_pa',pack.price_pa,'regular_pa',pack.regular_pa,'money_before',before_money,'money_after',money));
 if p_pack_id is null then update bastide_shop_negotiations set consumed_at=now() where player_id=p_player_id and mode='buy' and consumed_at is null and expires_at>now();end if;
 return p.state;
end $$;
revoke all on function public.bastide_checkout(text,jsonb,uuid) from public,anon,authenticated;
grant execute on function public.bastide_checkout(text,jsonb,uuid) to service_role;
