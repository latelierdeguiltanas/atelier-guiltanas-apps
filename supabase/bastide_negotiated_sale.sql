CREATE OR REPLACE FUNCTION public.bastide_sell_items(p_player_id text, p_lines jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
declare
  v_player public.bastide_players%rowtype;v_line jsonb;v_inv_item jsonb;v_shop public.bastide_shop_items%rowtype;
  v_inventory jsonb;v_money jsonb;v_total bigint;v_quantity integer;v_remaining integer;v_offer numeric;v_offer_total numeric:=0;v_sold jsonb:='[]'::jsonb;v_before jsonb;v_item_id text;
begin
  if jsonb_typeof(p_lines)<>'array' or jsonb_array_length(p_lines)<1 or jsonb_array_length(p_lines)>30 then raise exception 'Panier de vente invalide';end if;
  select * into v_player from public.bastide_players where id=p_player_id for update;
  if not found then raise exception 'Joueur introuvable';end if;
  v_inventory:=coalesce(v_player.state->'inventory','[]'::jsonb);
  for v_line in select value from jsonb_array_elements(p_lines) loop
    v_item_id:=left(coalesce(v_line->>'itemId',''),160);
    v_quantity:=coalesce((v_line->>'quantity')::integer,0);
    if v_item_id='' or v_quantity<1 then raise exception 'Objet ou quantité invalide';end if;
    select value into v_inv_item from jsonb_array_elements(v_inventory) where value->>'id'=v_item_id limit 1;
    if v_inv_item is null then raise exception 'Objet introuvable dans l inventaire';end if;
    if coalesce((v_inv_item->>'equipped')::boolean,false) then raise exception 'Rangez l objet avant de le vendre';end if;
    if coalesce((v_inv_item->>'quantity')::integer,0)<v_quantity then raise exception 'Quantité insuffisante';end if;
    if v_inv_item->>'containerType'='pollen-bag' or exists(select 1 from jsonb_array_elements(v_inventory) i where i->>'containerId'=v_item_id) then raise exception 'Ce contenant ne peut pas être vendu';end if;
    if coalesce((v_inv_item->>'salePriceApproved')::boolean,false) then
      v_offer:=coalesce((v_inv_item->>'salePriceSilver')::numeric,0);v_shop:=null;
      if coalesce(v_inv_item->>'shopItemId','') ~* '^[0-9a-f-]{36}$' then select * into v_shop from bastide_shop_items where id=(v_inv_item->>'shopItemId')::uuid and active;end if;
      if v_offer<=0 then raise exception 'Cet objet n est pas destiné à la vente';end if;
    else
    select * into v_shop from public.bastide_shop_items
      where active and (
        id=case when v_inv_item->>'shopItemId' ~* '^[0-9a-f-]{36}$' then (v_inv_item->>'shopItemId')::uuid else null end
        or lower(name)=lower(coalesce(v_inv_item->>'name',''))
        or (coalesce(v_inv_item->>'base','')<>'' and lower(base)=lower(v_inv_item->>'base'))
      ) order by case when id::text=coalesce(v_inv_item->>'shopItemId','') then 0 else 1 end limit 1;
    if not found then raise exception 'Mila doit estimer cet objet avant la vente : %',coalesce(v_inv_item->>'name','Objet');end if;
    v_offer:=greatest(1,floor(v_shop.price_silver::numeric/2)::integer);
    end if;
    v_sold:=v_sold||jsonb_build_array(jsonb_build_object('id',v_item_id,'name',v_inv_item->>'name','quantity',v_quantity,'unit_price_pa',v_offer));
    v_offer_total:=v_offer_total+(v_offer*v_quantity);
    v_remaining:=(v_inv_item->>'quantity')::integer-v_quantity;
    select coalesce(jsonb_agg(case when x->>'id'=v_item_id then jsonb_set(x,'{quantity}',to_jsonb(v_remaining),true) else x end) filter(where x->>'id'<>v_item_id or v_remaining>0),'[]'::jsonb)
      into v_inventory from jsonb_array_elements(v_inventory) as e(x);
    if v_shop.stock is not null then update public.bastide_shop_items set stock=stock+v_quantity,updated_at=now() where id=v_shop.id;end if;
  end loop;
  v_offer_total:=public.bastide_negotiated_price(p_player_id,'sell',v_offer_total);
  v_before:=v_player.state->'money';
  v_money:=coalesce(v_player.state->'money',jsonb_build_object('po',0,'pa',coalesce((v_player.state->>'silver')::integer,0),'pc',0));
  v_total:=coalesce((v_money->>'po')::integer,0)*100+coalesce((v_money->>'pa')::integer,0)*10+coalesce((v_money->>'pc')::integer,0)+v_offer_total*10;
  v_money:=jsonb_build_object('po',v_total/100,'pa',(v_total%100)/10,'pc',v_total%10);
  update public.bastide_players set state=jsonb_set(jsonb_set(jsonb_set(state,'{inventory}',v_inventory,true),'{money}',v_money,true),'{silver}',to_jsonb((v_money->>'po')::integer*10+(v_money->>'pa')::integer),true),updated_at=now() where id=p_player_id returning * into v_player;
  insert into public.bastide_inventory_events(player_id,event_type,summary,details) values(p_player_id,'sale','Vente à Mila : '||v_offer_total||' PA',jsonb_build_object('lines',p_lines,'earned_pa',v_offer_total,'items',v_sold,'money_before',v_before,'money_after',v_money));
  update public.bastide_shop_negotiations set consumed_at=now() where player_id=p_player_id and mode='sell' and consumed_at is null and expires_at>now();
  return v_player.state;
end $function$

;