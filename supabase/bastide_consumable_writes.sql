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
  update public.bastide_players set state=jsonb_set(jsonb_set(jsonb_set(state,'{money}',v_money,true),'{silver}',to_jsonb((v_money->>'po')::integer*10+(v_money->>'pa')::integer),true),'{inventory}',public.bastide_stack_consumables(v_inventory||jsonb_build_array(v_new)),true),updated_at=now() where id=p_player_id returning * into v_player;
  if v_item.stock is not null then update public.bastide_shop_items set stock=stock-p_quantity,updated_at=now() where id=p_item_id;end if;
  insert into public.bastide_inventory_events(player_id,event_type,summary,details) values(p_player_id,'purchase','Achat chez Mila : '||v_item.name,jsonb_build_object('quantity',p_quantity,'cost_pa',v_cost));
  return v_player.state;
end $function$
;
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
  v_state:=jsonb_set(v_state,'{inventory}',public.bastide_stack_consumables(v_inventory),true);
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
  recipient_state:=jsonb_set(recipient_state,'{inventory}',public.bastide_stack_consumables(recipient_inventory),true);

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
  v_state:=jsonb_set(jsonb_set(jsonb_set(v_state,'{inventory}',public.bastide_stack_consumables(v_inventory),true),'{money}',v_money,true),'{silver}',to_jsonb(v_pa),true);
  update public.bastide_players set state=v_state,updated_at=now() where id=p_player_id;
  insert into public.bastide_inventory_events(player_id,event_type,summary,details)
  values(p_player_id,'bundle',left(coalesce(p_summary,'Envoi du MJ'),200),jsonb_build_object('items',p_items,'money',p_money,'money_after',v_money)) returning id into v_event;
  return jsonb_build_object('state',v_state,'eventId',v_event);
end $function$
;