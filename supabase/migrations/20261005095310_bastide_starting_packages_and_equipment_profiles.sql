-- Paquetages COF2 validés, économie de départ et conservation des profils équipables.
create or replace function public.bastide_item_mutation(p_player_id text,p_action text,p_item jsonb)
returns jsonb language plpgsql set search_path='public' as $$
declare v_state jsonb;v_inventory jsonb;v_id text;v_clean jsonb;
begin
  select state into v_state from public.bastide_players where id=p_player_id for update;
  if v_state is null then raise exception 'Joueur introuvable';end if;
  v_inventory:=coalesce(v_state->'inventory','[]'::jsonb);v_id:=coalesce(p_item->>'id','');
  if v_id='' then raise exception 'Identifiant objet requis';end if;
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
    select coalesce(jsonb_agg(x),'[]'::jsonb) into v_inventory from jsonb_array_elements(v_inventory) x where x->>'id'<>v_id;
    v_inventory:=v_inventory||jsonb_build_array(v_clean);
  else raise exception 'Action inconnue';end if;
  v_state:=jsonb_set(v_state,'{inventory}',v_inventory,true);
  update public.bastide_players set state=v_state,updated_at=now() where id=p_player_id;
  return v_state;
end $$;

create or replace function public.bastide_deliver_bundle(p_player_id text,p_items jsonb,p_money jsonb,p_summary text)
returns jsonb language plpgsql set search_path='public' as $$
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
      'equipment',case when jsonb_typeof(v_item->'equipment')='object' then v_item->'equipment' else '{}'::jsonb end
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
  insert into public.bastide_inventory_events(player_id,event_type,summary,details)
  values(p_player_id,'bundle',left(coalesce(p_summary,'Envoi du MJ'),200),jsonb_build_object('items',p_items,'money',p_money)) returning id into v_event;
  return jsonb_build_object('state',v_state,'eventId',v_event);
end $$;

-- Prix usuels du livre de base. Les potions de mana restent une règle maison Bastide.
update public.bastide_shop_items set name='Rations de voyage (1 semaine)',description='Une semaine de nourriture sèche.',price_silver=4,updated_at=now() where name='Rations de voyage';
update public.bastide_shop_items set name='Torches (lot de 3)',description='Trois torches pour éclairer les lieux sombres.',price_silver=1,updated_at=now() where name='Torche';
update public.bastide_shop_items set name='Corde de chanvre (15 m)',description='Quinze mètres de corde solide.',price_silver=2,updated_at=now() where name='Corde de chanvre (10 m)';
update public.bastide_shop_items set price_silver=1,updated_at=now() where name='Couverture';
update public.bastide_shop_items set price_silver=1,updated_at=now() where name='Sac à dos';
update public.bastide_shop_items set description='Rend 1d4° PV sans dépasser le maximum. Boire ou administrer la potion demande une action en combat. Un seul usage.',price_silver=10,updated_at=now() where name='Potion de soins';
update public.bastide_shop_items set price_silver=10,updated_at=now() where name='Potion de mana';
update public.bastide_shop_items set price_silver=25,updated_at=now() where name='Potion de mana concentrée';

do $$
declare p record;pack jsonb;kept jsonb;money jsonb;total_pc integer;
begin
  for p in select id,state from public.bastide_players where id in ('prepotante','scanlan','vivelame','wilfried','zepheline','faelar') for update loop
    pack:=jsonb_build_array(
      jsonb_build_object('id','starter-sac','name','Sac d’aventurier','base','Sac à dos','category','Équipement','quantity',1,'equipped',false,'notes','Contient le matériel de voyage courant.','source','paquetage','equipment','{}'::jsonb),
      jsonb_build_object('id','starter-couverture','name','Couverture','base','Couverture','category','Équipement','quantity',1,'equipped',false,'notes','Couverture de voyage.','source','paquetage','equipment','{}'::jsonb),
      jsonb_build_object('id','starter-torche','name','Torche','base','Torche','category','Équipement','quantity',1,'equipped',false,'notes','Éclairage de voyage.','source','paquetage','equipment','{}'::jsonb),
      jsonb_build_object('id','starter-briquet','name','Briquet à silex','base','Briquet à silex','category','Équipement','quantity',1,'equipped',false,'notes','Permet d’allumer un feu ou une torche.','source','paquetage','equipment','{}'::jsonb),
      jsonb_build_object('id','starter-outre','name','Outre','base','Outre','category','Équipement','quantity',1,'equipped',false,'notes','Réserve d’eau de voyage.','source','paquetage','equipment','{}'::jsonb),
      jsonb_build_object('id','starter-gamelle','name','Gamelle','base','Gamelle','category','Équipement','quantity',1,'equipped',false,'notes','Nécessaire de repas.','source','paquetage','equipment','{}'::jsonb)
    );
    if p.id='prepotante' then pack:=pack||jsonb_build_array(
      jsonb_build_object('id','starter-rapiere','name','Rapière','base','Rapière','category','Arme','quantity',1,'equipped',true,'notes','Arme de contact du paquetage de voleuse.','source','paquetage','equipment',jsonb_build_object('slot','main_hand','effect','Rapière équipée.')),
      jsonb_build_object('id','starter-dagues','name','Dagues','base','Dague','category','Arme','quantity',5,'equipped',false,'notes','Cinq dagues.','source','paquetage','equipment',jsonb_build_object('slot','main_hand','effect','Dague légère.')),
      jsonb_build_object('id','starter-cuir','name','Armure de cuir simple','base','Cuir simple','category','Protection','quantity',1,'equipped',true,'notes','Armure du paquetage de voleuse.','source','paquetage','equipment',jsonb_build_object('slot','armor','effect','Armure COF2 : valeur d’armure 2.','bonuses',jsonb_build_object('armorDef',2))),
      jsonb_build_object('id','starter-crochetage','name','Outils de crochetage','base','Outils de crochetage','category','Équipement','quantity',1,'equipped',false,'notes','Outils spécialisés de voleuse.','source','paquetage','equipment','{}'::jsonb),
      jsonb_build_object('id','starter-corde','name','Corde (10 m)','base','Corde','category','Équipement','quantity',1,'equipped',false,'notes','Dix mètres de corde.','source','paquetage','equipment','{}'::jsonb)
    );
    elsif p.id='scanlan' then pack:=pack||jsonb_build_array(
      jsonb_build_object('id','starter-rapiere','name','Rapière','base','Rapière','category','Arme','quantity',1,'equipped',true,'notes','Arme de contact du paquetage de barde.','source','paquetage','equipment',jsonb_build_object('slot','main_hand','effect','Rapière équipée.')),
      jsonb_build_object('id','starter-dague','name','Dague','base','Dague','category','Arme','quantity',1,'equipped',false,'notes','Arme légère de secours.','source','paquetage','equipment',jsonb_build_object('slot','main_hand','effect','Dague légère.')),
      jsonb_build_object('id','starter-instrument','name','Instrument de musique','base','Instrument de musique','category','Équipement','quantity',1,'equipped',false,'notes','Instrument personnel de Scanlan.','source','paquetage','equipment','{}'::jsonb),
      jsonb_build_object('id','starter-cuir','name','Armure de cuir simple','base','Cuir simple','category','Protection','quantity',1,'equipped',false,'notes','Conservée dans l’inventaire : Scanlan profite actuellement de son style sans armure.','source','paquetage','equipment',jsonb_build_object('slot','armor','effect','Armure COF2 : valeur d’armure 2.','bonuses',jsonb_build_object('armorDef',2)))
    );
    elsif p.id='vivelame' then pack:=pack||jsonb_build_array(
      jsonb_build_object('id','starter-petoire','name','Pétoire','base','Pétoire','category','Arme','quantity',1,'equipped',true,'notes','Arme à poudre de l’arquebusier.','source','paquetage','equipment',jsonb_build_object('slot','main_hand','effect','Pétoire équipée.')),
      jsonb_build_object('id','starter-javelot','name','Javelot','base','Épée longue','category','Arme','quantity',1,'equipped',false,'notes','Apparence de javelot ; profil mécanique de l’épée longue.','source','paquetage','equipment',jsonb_build_object('slot','main_hand','effect','Javelot personnalisé, profil d’épée longue.')),
      jsonb_build_object('id','starter-dague','name','Dague','base','Dague','category','Arme','quantity',1,'equipped',false,'notes','Arme légère de secours.','source','paquetage','equipment',jsonb_build_object('slot','main_hand','effect','Dague légère.')),
      jsonb_build_object('id','starter-cuir-renforce','name','Cuir renforcé / broigne','base','Cuir renforcé, broigne','category','Protection','quantity',1,'equipped',true,'notes','Armure du paquetage d’arquebusier.','source','paquetage','equipment',jsonb_build_object('slot','armor','effect','Armure COF2 : valeur d’armure 3.','bonuses',jsonb_build_object('armorDef',3)))
    );
    elsif p.id='wilfried' then pack:=pack||jsonb_build_array(
      jsonb_build_object('id','starter-masse','name','Masse','base','Masse','category','Arme','quantity',1,'equipped',true,'notes','Arme de contact du prêtre.','source','paquetage','equipment',jsonb_build_object('slot','main_hand','effect','Masse équipée.')),
      jsonb_build_object('id','starter-chemise-mailles','name','Chemise de mailles','base','Chemise de mailles','category','Protection','quantity',1,'equipped',true,'notes','Armure du paquetage de prêtre.','source','paquetage','equipment',jsonb_build_object('slot','armor','effect','Armure COF2 : valeur d’armure 4.','bonuses',jsonb_build_object('armorDef',4))),
      jsonb_build_object('id','starter-petit-bouclier','name','Petit bouclier','base','Petit bouclier','category','Protection','quantity',1,'equipped',true,'notes','Bouclier du paquetage de prêtre.','source','paquetage','equipment',jsonb_build_object('slot','shield','effect','Bouclier COF2 : DEF +1.','bonuses',jsonb_build_object('shieldDef',1)))
    );
    elsif p.id='zepheline' then pack:=pack||jsonb_build_array(
      jsonb_build_object('id','arc-feerique','name','Arc féerique','base','Arc adapté à une Fée','category','Arme','quantity',1,'equipped',true,'notes','Arme adaptée à sa taille ; dégâts limités au d4.','source','fiche','equipment',jsonb_build_object('slot','main_hand','effect','Arc adapté à sa taille.','weapon',jsonb_build_object('modes',jsonb_build_array(jsonb_build_object('label','Distance','attackType','distance','damage','1d4','damageType','perforant','range','30 m','attackBonus',0,'damageBonus',0))))),
      jsonb_build_object('id','starter-dague-feerique','name','Dague féerique','base','Dague adaptée à une Fée','category','Arme','quantity',1,'equipped',false,'notes','Arme légère de secours adaptée à sa taille.','source','paquetage','equipment',jsonb_build_object('slot','main_hand','effect','Dague féerique légère.'))
    );
    elsif p.id='faelar' then pack:=pack||jsonb_build_array(
      jsonb_build_object('id','epee-longue','name','Épée longue','base','Épée longue','category','Arme','quantity',1,'equipped',false,'notes','Attaque au contact : +2 · 1d8+1 DM.','source','fiche','equipment',jsonb_build_object('slot','main_hand','effect','Arme de contact.','weapon',jsonb_build_object('modes',jsonb_build_array(jsonb_build_object('label','Contact','attackType','contact','damage','1d8','damageStat','FOR','damageType','tranchant','range','Contact','attackBonus',0,'damageBonus',0))))),
      jsonb_build_object('id','arc-court','name','Arc court','base','Arc court','category','Arme','quantity',1,'equipped',true,'notes','Attaque à distance : +2 · 1d6+3 DM · portée 30 m.','source','fiche','equipment',jsonb_build_object('slot','main_hand','effect','Arme à distance à deux mains.','weapon',jsonb_build_object('modes',jsonb_build_array(jsonb_build_object('label','Distance','attackType','distance','damage','1d6','damageStat','PER','damageType','perforant','range','30 m','attackBonus',0,'damageBonus',0))))),
      jsonb_build_object('id','dague','name','Dague','base','Dague','category','Arme','quantity',1,'equipped',false,'notes','Arme légère de secours.','source','fiche','equipment',jsonb_build_object('slot','main_hand','effect','Dague légère.')),
      jsonb_build_object('id','cuir-renforce','name','Cuir renforcé / broigne','base','Cuir renforcé, broigne','category','Protection','quantity',1,'equipped',true,'notes','Armure portée à la création.','source','fiche','equipment',jsonb_build_object('slot','armor','effect','Armure COF2 : valeur d’armure 3.','bonuses',jsonb_build_object('armorDef',3))),
      jsonb_build_object('id','starter-carquois','name','Carquois de 20 flèches','base','Carquois','category','Équipement','quantity',1,'equipped',false,'chargesMax',20,'charges',20,'notes','Vingt flèches pour l’arc court.','source','paquetage','equipment','{}'::jsonb)
    );end if;

    select coalesce(jsonb_agg(x),'[]'::jsonb) into kept
    from jsonb_array_elements(coalesce(p.state->'inventory','[]'::jsonb)) x
    where x->>'id' not in (
      'rapiere-0','5-dagues-1','armure-de-cuir-simple-2','dague-1','petoire-0','javelot-profil-mecanique-epee-longue-1','dague-2','cuir-renforce-broigne-3',
      'starter-sac','starter-couverture','starter-torche','starter-briquet','starter-outre','starter-gamelle','starter-rapiere','starter-dagues','starter-dague','starter-cuir','starter-crochetage','starter-corde','starter-instrument','starter-petoire','starter-javelot','starter-cuir-renforce','starter-masse','starter-chemise-mailles','starter-petit-bouclier','starter-dague-feerique','starter-carquois',
      'arc-feerique','epee-longue','arc-court','dague','cuir-renforce'
    );
    money:=coalesce(p.state->'money',jsonb_build_object('po',0,'pa',coalesce((p.state->>'silver')::integer,0),'pc',0));
    total_pc:=coalesce((money->>'po')::integer,0)*100+coalesce((money->>'pa')::integer,0)*10+coalesce((money->>'pc')::integer,0);
    if total_pc=0 then money:=jsonb_build_object('po',0,'pa',10,'pc',0);end if;
    update public.bastide_players set state=jsonb_set(jsonb_set(jsonb_set(state,'{inventory}',kept||pack,true),'{money}',money,true),'{silver}',to_jsonb(coalesce((money->>'pa')::integer,0)),true),updated_at=now() where id=p.id;
    if not exists(select 1 from public.bastide_inventory_events where player_id=p.id and summary='Paquetage de départ COF2') then
      insert into public.bastide_inventory_events(player_id,event_type,summary,details) values(p.id,'bundle','Paquetage de départ COF2',jsonb_build_object('money',money,'items',pack));
    end if;
  end loop;
end $$;
