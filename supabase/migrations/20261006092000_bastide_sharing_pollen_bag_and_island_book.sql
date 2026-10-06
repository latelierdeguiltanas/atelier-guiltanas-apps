create index if not exists bastide_personal_entries_audience_gin_idx
  on public.bastide_personal_entries using gin (audience);

do $$
declare
  v_state jsonb;
  v_inventory jsonb;
  v_added boolean := false;
begin
  select state into v_state
  from public.bastide_players
  where id = 'zepheline'
  for update;

  if v_state is null then
    raise exception 'Zéphéline est introuvable';
  end if;

  v_inventory := coalesce(v_state->'inventory', '[]'::jsonb);

  if not exists (
    select 1 from jsonb_array_elements(v_inventory) item
    where item->>'id' = 'zepheline-besace-pollen'
  ) then
    v_inventory := v_inventory || jsonb_build_array(jsonb_build_object(
      'id','zepheline-besace-pollen',
      'name','Besace de pollen',
      'base','Objet féerique personnel',
      'category','Objet spécial',
      'quantity',1,
      'equipped',false,
      'chargesMax',0,
      'charges',0,
      'notes','Les objets non vivants volontairement rangés dans la besace sont miniaturisés et deviennent presque sans poids. Ils retrouvent leur taille et leur poids normaux en sortant. La besace ne peut contenir ni créature, ni élément fixé au décor, ni objet démesuré.',
      'containerType','pollen-bag',
      'containerId','',
      'source','mj',
      'receivedAt',now()::text,
      'equipment','{}'::jsonb
    ));
    v_added := true;
  end if;

  if not exists (
    select 1 from jsonb_array_elements(v_inventory) item
    where item->>'id' = 'zepheline-livre-premiers-orages'
  ) then
    v_inventory := v_inventory || jsonb_build_array(jsonb_build_object(
      'id','zepheline-livre-premiers-orages',
      'name','Les Premiers Orages',
      'base','Recueil ancien sur l’Île aux Tempêtes',
      'category','Document et indice',
      'quantity',1,
      'equipped',false,
      'chargesMax',0,
      'charges',0,
      'notes','Un fragment anonyme raconte la naissance volcanique de l’île, la prison de Sharruth et les cicatrices magiques laissées par les dragons. Il s’arrête après le combat d’un dragon bleu contre une dragonne de bronze dont le nom a été perdu.',
      'documentUrl','../../documents/les-premiers-orages/',
      'containerType','',
      'containerId','zepheline-besace-pollen',
      'source','mj',
      'receivedAt',now()::text,
      'equipment','{}'::jsonb
    ));
    v_added := true;
  end if;

  update public.bastide_players
  set state = jsonb_set(v_state, '{inventory}', v_inventory, true), updated_at = now()
  where id = 'zepheline';

  if v_added then
    insert into public.bastide_inventory_events(player_id,event_type,summary,details)
    values ('zepheline','delivery','Une besace féerique et un ancien recueil ont rejoint ton inventaire.',jsonb_build_object('item_ids',jsonb_build_array('zepheline-besace-pollen','zepheline-livre-premiers-orages')));
  end if;
end $$;
