-- COF2: 1 PO = 10 PA = 100 PC. No change of value and no inferred repricing.
create or replace function public.bastide_normalize_money(p_money jsonb) returns jsonb language plpgsql immutable set search_path=public as $$
declare total numeric; k text; v numeric;
begin
 foreach k in array array['po','pa','pc'] loop
  v:=coalesce((p_money->>k)::numeric,0);
  if v<0 or v<>trunc(v) or v>100000000 then raise exception 'Montant invalide : pièces entières positives requises';end if;
 end loop;
 total:=coalesce((p_money->>'po')::numeric,0)*100+coalesce((p_money->>'pa')::numeric,0)*10+coalesce((p_money->>'pc')::numeric,0);
 if total>1000000000 then raise exception 'Montant trop élevé';end if;
 return jsonb_build_object('po',floor(total/100)::bigint,'pa',floor(mod(total,100)/10)::integer,'pc',mod(total,10)::integer);
end $$;

CREATE OR REPLACE FUNCTION public.bastide_item_mutation(p_player_id text, p_action text, p_item jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
declare v_state jsonb;v_inventory jsonb;v_id text;v_clean jsonb;v_old jsonb;v_container text;
begin
  select state into v_state from public.bastide_players where id=p_player_id for update;
  if v_state is null then raise exception 'Joueur introuvable';end if;
  v_inventory:=coalesce(v_state->'inventory','[]'::jsonb);v_id:=coalesce(p_item->>'id','');
  if v_id='' then raise exception 'Identifiant objet requis';end if;
  select value into v_old from jsonb_array_elements(v_inventory) where value->>'id'=v_id limit 1;
  if coalesce(v_old->>'containerType','')='pollen-bag' and p_action='delete' then raise exception 'La besace principale ne peut pas être supprimée';end if;
  if p_action='delete' then
    select coalesce(jsonb_agg(x),'[]'::jsonb) into v_inventory from jsonb_array_elements(v_inventory) x where x->>'id'<>v_id;
  elsif p_action in ('upsert','create') then
    v_clean:=jsonb_build_object(
      'id',v_id,'name',left(coalesce(p_item->>'name','Objet'),120),'base',left(coalesce(p_item->>'base',''),120),
      'category',left(coalesce(p_item->>'category','Équipement'),60),'quantity',greatest(0,coalesce((p_item->>'quantity')::integer,1)),
      'equipped',coalesce((p_item->>'equipped')::boolean,false),'chargesMax',greatest(0,coalesce((p_item->>'chargesMax')::integer,0)),
      'charges',greatest(0,coalesce((p_item->>'charges')::integer,0)),'notes',left(coalesce(p_item->>'notes',''),3000),
      'mediaUrl',left(coalesce(p_item->>'mediaUrl',''),1000),'mediaType',left(coalesce(p_item->>'mediaType',''),30),
      'source',left(coalesce(p_item->>'source','joueur'),40),'receivedAt',coalesce(p_item->>'receivedAt',''),
      'equipment',case when jsonb_typeof(p_item->'equipment')='object' then p_item->'equipment' else '{}'::jsonb end
    );
    v_container:=left(coalesce(p_item->>'containerId',v_old->>'containerId',''),160);
    if v_container<>'' and not exists(select 1 from jsonb_array_elements(v_inventory) i where i->>'id'=v_container and i->>'containerType'='pollen-bag' and i->>'id'<>v_id) then raise exception 'Contenant introuvable';end if;
    v_clean:=coalesce(v_old,'{}'::jsonb)||v_clean||jsonb_build_object(
     'containerId',v_container,'containerType',coalesce(v_old->>'containerType',''),
     'documentUrl',left(coalesce(p_item->>'documentUrl',v_old->>'documentUrl',''),1000),
     'source',coalesce(v_old->>'source','joueur'),'shopItemId',coalesce(v_old->>'shopItemId',''),
     'purchasePriceSilver',coalesce(v_old->'purchasePriceSilver','0'::jsonb),
     'salePriceSilver',coalesce(v_old->'salePriceSilver','0'::jsonb),
     'salePriceApproved',coalesce(v_old->'salePriceApproved','false'::jsonb),
     'receivedAt',coalesce(v_old->>'receivedAt',''));
    if v_container<>'' then v_clean:=v_clean||jsonb_build_object('equipped',false);end if;
    select coalesce(jsonb_agg(x),'[]'::jsonb) into v_inventory from jsonb_array_elements(v_inventory) x where x->>'id'<>v_id;
    v_inventory:=v_inventory||jsonb_build_array(v_clean);
  else raise exception 'Action inconnue';end if;
  v_state:=jsonb_set(v_state,'{inventory}',v_inventory,true);
  update public.bastide_players set state=v_state,updated_at=now() where id=p_player_id;
  return v_state;
end $function$

;
CREATE OR REPLACE FUNCTION public.bastide_deliver_bundle(p_player_id text, p_items jsonb, p_money jsonb, p_summary text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
declare v_state jsonb;v_inventory jsonb;v_money jsonb;v_item jsonb;v_new jsonb;v_po integer;v_pa integer;v_pc integer;v_event bigint;
begin
  select state into v_state from public.bastide_players where id=p_player_id for update;
  if v_state is null then raise exception 'Joueur introuvable';end if;
  v_inventory:=coalesce(v_state->'inventory','[]'::jsonb);
  for v_item in select value from jsonb_array_elements(coalesce(p_items,'[]'::jsonb)) loop
    v_new:=jsonb_build_object(
      'id','loot-'||gen_random_uuid(),'name',left(coalesce(v_item->>'name','Objet'),120),'base',left(coalesce(v_item->>'base',''),120),
      'category',left(coalesce(v_item->>'category','Équipement'),60),'quantity',greatest(1,coalesce((v_item->>'quantity')::integer,1)),
      'equipped',false,'chargesMax',greatest(0,coalesce((v_item->>'chargesMax')::integer,0)),
      'charges',greatest(0,coalesce((v_item->>'chargesMax')::integer,0)),'notes',left(coalesce(v_item->>'notes',''),3000),
      'mediaUrl',left(coalesce(v_item->>'mediaUrl',''),1000),'mediaType',left(coalesce(v_item->>'mediaType',''),30),
      'source','mj','receivedAt',now()::text,
      'salePriceSilver',case when coalesce((v_item->>'salePriceApproved')::boolean,false) then greatest(0,coalesce((v_item->>'salePriceSilver')::numeric,0)) else 0 end,
      'salePriceApproved',coalesce((v_item->>'salePriceApproved')::boolean,false),
      'documentUrl',left(coalesce(v_item->>'documentUrl',''),1000),
      'containerId',case when p_player_id='zepheline' and exists(select 1 from jsonb_array_elements(v_inventory) i where i->>'id'='zepheline-besace-pollen') then 'zepheline-besace-pollen' else '' end,
      'equipment',case when jsonb_typeof(v_item->'equipment')='object' then v_item->'equipment' else '{}'::jsonb end
    );
    v_inventory:=v_inventory||jsonb_build_array(v_new);
  end loop;
  v_money:=coalesce(v_state->'money',jsonb_build_object('po',0,'pa',coalesce((v_state->>'silver')::integer,0),'pc',0));
  v_po:=greatest(0,coalesce((v_money->>'po')::integer,0)+coalesce((p_money->>'po')::integer,0));
  v_pa:=greatest(0,coalesce((v_money->>'pa')::integer,0)+coalesce((p_money->>'pa')::integer,0));
  v_pc:=greatest(0,coalesce((v_money->>'pc')::integer,0)+coalesce((p_money->>'pc')::integer,0));
  v_money:=public.bastide_normalize_money(jsonb_build_object('po',v_po,'pa',v_pa,'pc',v_pc));
  v_pa:=(v_money->>'po')::integer*10+(v_money->>'pa')::integer;
  v_state:=jsonb_set(jsonb_set(jsonb_set(v_state,'{inventory}',v_inventory,true),'{money}',v_money,true),'{silver}',to_jsonb(v_pa),true);
  update public.bastide_players set state=v_state,updated_at=now() where id=p_player_id;
  insert into public.bastide_inventory_events(player_id,event_type,summary,details)
  values(p_player_id,'bundle',left(coalesce(p_summary,'Envoi du MJ'),200),jsonb_build_object('items',p_items,'money',p_money,'money_after',v_money)) returning id into v_event;
  return jsonb_build_object('state',v_state,'eventId',v_event);
end $function$

;
CREATE OR REPLACE FUNCTION public.bastide_purchase(p_player_id text, p_item_id uuid, p_quantity integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
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
  v_new:=jsonb_build_object('id','mila-'||gen_random_uuid(),'name',v_item.name,'base',v_item.base,'category',v_item.category,'quantity',p_quantity,'equipped',false,'chargesMax',v_item.charges_max,'charges',v_item.charges_max,'notes',v_item.description,'mediaUrl','','mediaType','','containerId',case when p_player_id='zepheline' and exists(select 1 from jsonb_array_elements(v_inventory) i where i->>'id'='zepheline-besace-pollen') then 'zepheline-besace-pollen' else '' end,'source','mila','shopItemId',v_item.id,'purchasePriceSilver',v_item.price_silver,'salePriceApproved',true,'salePriceSilver',greatest(1,floor(v_item.price_silver::numeric/2)::integer),'receivedAt',now()::text,'equipment',v_item.equipment);
  update public.bastide_players set state=jsonb_set(jsonb_set(jsonb_set(state,'{money}',v_money,true),'{silver}',to_jsonb((v_money->>'po')::integer*10+(v_money->>'pa')::integer),true),'{inventory}',v_inventory||jsonb_build_array(v_new),true),updated_at=now() where id=p_player_id returning * into v_player;
  if v_item.stock is not null then update public.bastide_shop_items set stock=stock-p_quantity,updated_at=now() where id=p_item_id;end if;
  insert into public.bastide_inventory_events(player_id,event_type,summary,details) values(p_player_id,'purchase','Achat chez Mila : '||v_item.name,jsonb_build_object('quantity',p_quantity,'cost_pa',v_cost));
  return v_player.state;
end $function$

;
CREATE OR REPLACE FUNCTION public.bastide_transfer_money(p_sender_id text, p_recipient_id text, p_amount jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
declare
  v_sender jsonb; v_recipient jsonb; v_sender_money jsonb; v_recipient_money jsonb;
  v_po integer; v_pa integer; v_pc integer; v_amount_total integer;
  v_sender_total integer; v_recipient_total integer; v_recipient_name text;
begin
  if p_sender_id=p_recipient_id then raise exception 'Destinataire invalide'; end if;
  v_po:=greatest(0,coalesce((p_amount->>'po')::integer,0));
  v_pa:=greatest(0,coalesce((p_amount->>'pa')::integer,0));
  v_pc:=greatest(0,coalesce((p_amount->>'pc')::integer,0));
  v_amount_total:=v_po*100+v_pa*10+v_pc;
  if v_amount_total<1 then raise exception 'Montant vide'; end if;
  perform id from public.bastide_players where id in (p_sender_id,p_recipient_id) order by id for update;
  select state into v_sender from public.bastide_players where id=p_sender_id;
  select state,display_name into v_recipient,v_recipient_name from public.bastide_players where id=p_recipient_id;
  if v_sender is null or v_recipient is null then raise exception 'Joueur introuvable'; end if;
  v_sender_money:=coalesce(v_sender->'money',jsonb_build_object('po',0,'pa',coalesce((v_sender->>'silver')::integer,0),'pc',0));
  v_recipient_money:=coalesce(v_recipient->'money',jsonb_build_object('po',0,'pa',coalesce((v_recipient->>'silver')::integer,0),'pc',0));
  v_sender_total:=coalesce((v_sender_money->>'po')::integer,0)*100+coalesce((v_sender_money->>'pa')::integer,0)*10+coalesce((v_sender_money->>'pc')::integer,0);
  if v_sender_total<v_amount_total then raise exception 'Monnaie insuffisante'; end if;
  v_recipient_total:=coalesce((v_recipient_money->>'po')::integer,0)*100+coalesce((v_recipient_money->>'pa')::integer,0)*10+coalesce((v_recipient_money->>'pc')::integer,0)+v_amount_total;
  v_sender_total:=v_sender_total-v_amount_total;
  v_sender_money:=jsonb_build_object('po',v_sender_total/100,'pa',(v_sender_total%100)/10,'pc',v_sender_total%10);
  v_recipient_money:=jsonb_build_object('po',v_recipient_total/100,'pa',(v_recipient_total%100)/10,'pc',v_recipient_total%10);
  v_sender:=jsonb_set(jsonb_set(v_sender,'{money}',v_sender_money,true),'{silver}',to_jsonb((v_sender_money->>'po')::integer*10+(v_sender_money->>'pa')::integer),true);
  v_recipient:=jsonb_set(jsonb_set(v_recipient,'{money}',v_recipient_money,true),'{silver}',to_jsonb((v_recipient_money->>'po')::integer*10+(v_recipient_money->>'pa')::integer),true);
  update public.bastide_players set state=v_sender,updated_at=now() where id=p_sender_id;
  update public.bastide_players set state=v_recipient,updated_at=now() where id=p_recipient_id;
  insert into public.bastide_inventory_events(player_id,event_type,summary,details) values
    (p_sender_id,'money-transfer','Monnaie envoyée à '||v_recipient_name,jsonb_build_object('direction','sent','other_player_id',p_recipient_id,'amount',p_amount)),
    (p_recipient_id,'money-transfer','Monnaie reçue',jsonb_build_object('direction','received','other_player_id',p_sender_id,'amount',p_amount));
  return v_sender;
end $function$

;
CREATE OR REPLACE FUNCTION public.bastide_money_mutation(p_player_id text, p_delta jsonb, p_summary text DEFAULT 'Mise à jour de monnaie'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
declare v_state jsonb; v_money jsonb; v_po integer;v_pa integer;v_pc integer;
begin
  select state into v_state from public.bastide_players where id=p_player_id for update;
  if v_state is null then raise exception 'Joueur introuvable'; end if;
  v_money:=coalesce(v_state->'money',jsonb_build_object('po',0,'pa',coalesce((v_state->>'silver')::integer,0),'pc',0));
  v_po:=greatest(0,coalesce((v_money->>'po')::integer,0)+coalesce((p_delta->>'po')::integer,0));
  v_pa:=greatest(0,coalesce((v_money->>'pa')::integer,0)+coalesce((p_delta->>'pa')::integer,0));
  v_pc:=greatest(0,coalesce((v_money->>'pc')::integer,0)+coalesce((p_delta->>'pc')::integer,0));
  v_money:=public.bastide_normalize_money(jsonb_build_object('po',v_po,'pa',v_pa,'pc',v_pc));v_pa:=(v_money->>'po')::integer*10+(v_money->>'pa')::integer;
  v_state:=jsonb_set(jsonb_set(v_state,'{money}',v_money,true),'{silver}',to_jsonb(v_pa),true);
  update public.bastide_players set state=v_state,updated_at=now() where id=p_player_id;
  return v_state;
end $function$

;
CREATE OR REPLACE FUNCTION public.bastide_transfer_item(p_sender_id text, p_recipient_id text, p_item_id text, p_quantity integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
declare
  sender_state jsonb;
  recipient_state jsonb;
  sender_inventory jsonb;
  recipient_inventory jsonb;
  transferred_item jsonb;
  recipient_item jsonb;
  available integer;
  sender_name text;
  recipient_name text;
begin
  if p_sender_id is null or p_recipient_id is null or p_item_id is null then
    raise exception 'Transfert incomplet';
  end if;
  if p_sender_id = p_recipient_id then
    raise exception 'Choisis un autre joueur';
  end if;
  if coalesce(p_quantity,0) < 1 then
    raise exception 'La quantité doit être supérieure à zéro';
  end if;

  perform 1 from public.bastide_players
    where id in (p_sender_id,p_recipient_id)
    order by id
    for update;

  select state,display_name into sender_state,sender_name
    from public.bastide_players where id=p_sender_id;
  select state,display_name into recipient_state,recipient_name
    from public.bastide_players where id=p_recipient_id;

  if sender_state is null then raise exception 'Expéditeur introuvable'; end if;
  if recipient_state is null then raise exception 'Destinataire introuvable'; end if;

  select value into transferred_item
    from jsonb_array_elements(coalesce(sender_state->'inventory','[]'::jsonb))
    where value->>'id'=p_item_id
    limit 1;
  if transferred_item is null then raise exception 'Objet introuvable dans ton inventaire'; end if;

  if transferred_item->>'containerType'='pollen-bag' then raise exception 'La besace principale ne peut pas être transférée';end if;
  available:=greatest(0,coalesce((transferred_item->>'quantity')::integer,1));
  if available < p_quantity then raise exception 'Quantité insuffisante'; end if;

  select coalesce(jsonb_agg(
    case when value->>'id'=p_item_id
      then jsonb_set(value,'{quantity}',to_jsonb(available-p_quantity))
      else value end
  ),'[]'::jsonb)
  into sender_inventory
  from jsonb_array_elements(coalesce(sender_state->'inventory','[]'::jsonb))
  where value->>'id'<>p_item_id or available-p_quantity>0;

  recipient_item:=transferred_item || jsonb_build_object(
    'id','item-'||gen_random_uuid()::text,
    'quantity',p_quantity,
    'equipped',false,'containerId',case when p_recipient_id='zepheline' and exists(select 1 from jsonb_array_elements(coalesce(recipient_state->'inventory','[]'::jsonb)) i where i->>'id'='zepheline-besace-pollen') then 'zepheline-besace-pollen' else '' end,
    'source','transfer:'||p_sender_id,
    'receivedAt',now()::text
  );
  recipient_inventory:=coalesce(recipient_state->'inventory','[]'::jsonb)||jsonb_build_array(recipient_item);

  sender_state:=jsonb_set(sender_state,'{inventory}',sender_inventory,true);
  recipient_state:=jsonb_set(recipient_state,'{inventory}',recipient_inventory,true);

  update public.bastide_players set state=sender_state,updated_at=now() where id=p_sender_id;
  update public.bastide_players set state=recipient_state,updated_at=now() where id=p_recipient_id;

  insert into public.bastide_inventory_events(player_id,event_type,summary,details,seen_at)
  values(
    p_sender_id,'player_transfer_out',
    'Objet envoyé à '||recipient_name||' : '||coalesce(transferred_item->>'name','Objet')||' ×'||p_quantity,
    jsonb_build_object('recipientId',p_recipient_id,'item',recipient_item),now()
  );
  insert into public.bastide_inventory_events(player_id,event_type,summary,details)
  values(
    p_recipient_id,'player_transfer_in',
    'Objet reçu de '||sender_name||' : '||coalesce(transferred_item->>'name','Objet')||' ×'||p_quantity,
    jsonb_build_object('senderId',p_sender_id,'item',recipient_item)
  );

  return sender_state;
end;
$function$

;
create or replace function public.bastide_set_resale_price(p_player_id text,p_item_id text,p_price numeric) returns jsonb language plpgsql set search_path=public as $$
declare s jsonb;inv jsonb;
begin
 if p_price is null or p_price<0 or p_price>1000000 or p_price*10<>trunc(p_price*10) then raise exception 'Prix en PA : précision maximale 0,1 PA';end if;
 select state into s from bastide_players where id=p_player_id for update;
 if s is null or not exists(select 1 from jsonb_array_elements(s->'inventory') i where i->>'id'=p_item_id) then raise exception 'Objet introuvable';end if;
 select jsonb_agg(case when i->>'id'=p_item_id then i||jsonb_build_object('salePriceSilver',p_price,'salePriceApproved',true) else i end order by n) into inv from jsonb_array_elements(s->'inventory') with ordinality t(i,n);
 s:=jsonb_set(s,'{inventory}',inv);update bastide_players set state=s,updated_at=now() where id=p_player_id;
 insert into bastide_inventory_events(player_id,event_type,summary,details) values(p_player_id,'appraisal','Prix de revente validé par le MJ',jsonb_build_object('itemId',p_item_id,'unit_price_pa',p_price));
 return s;
end $$;
revoke all on function public.bastide_set_resale_price(text,text,numeric) from public,anon,authenticated;
grant execute on function public.bastide_set_resale_price(text,text,numeric) to service_role;

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
  v_before:=v_player.state->'money';
  v_money:=coalesce(v_player.state->'money',jsonb_build_object('po',0,'pa',coalesce((v_player.state->>'silver')::integer,0),'pc',0));
  v_total:=coalesce((v_money->>'po')::integer,0)*100+coalesce((v_money->>'pa')::integer,0)*10+coalesce((v_money->>'pc')::integer,0)+v_offer_total*10;
  v_money:=jsonb_build_object('po',v_total/100,'pa',(v_total%100)/10,'pc',v_total%10);
  update public.bastide_players set state=jsonb_set(jsonb_set(jsonb_set(state,'{inventory}',v_inventory,true),'{money}',v_money,true),'{silver}',to_jsonb((v_money->>'po')::integer*10+(v_money->>'pa')::integer),true),updated_at=now() where id=p_player_id returning * into v_player;
  insert into public.bastide_inventory_events(player_id,event_type,summary,details) values(p_player_id,'sale','Vente à Mila : '||v_offer_total||' PA',jsonb_build_object('lines',p_lines,'earned_pa',v_offer_total,'items',v_sold,'money_before',v_before,'money_after',v_money));
  return v_player.state;
end $function$

;