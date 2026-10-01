-- Catalogue de départ de Mila. Les articles restent modifiables depuis l’espace MJ.
with catalogue(name,base,category,description,price_silver,stock,charges_max,sort_order) as (values
  ('Rations de voyage','Rations','Consommable','Une journée de nourriture sèche.',5,null::integer,0,10),
  ('Torche','Torche','Équipement','Éclaire les lieux sombres.',1,null,0,20),
  ('Corde de chanvre (10 m)','Corde','Équipement','Dix mètres de corde solide.',10,null,0,30),
  ('Couverture','Couverture','Équipement','Une couverture de voyage épaisse.',2,null,0,40),
  ('Gourde','Gourde','Équipement','Une gourde avec sa lanière.',1,null,0,50),
  ('Sac à dos','Sac à dos','Équipement','Pour transporter le matériel courant.',5,null,0,60),
  ('Nécessaire de soin','Nécessaire de soin','Consommable','Bandages et petit matériel de premiers soins. Effet selon la situation et la décision du MJ.',10,8,3,70),
  ('Antidote','Antidote','Consommable','Accorde une aide contre un poison, selon le poison rencontré et la décision du MJ.',25,4,0,80),
  ('Potion de soins','Potion de soins','Consommable','Récupère des PV selon la règle validée par le MJ.',50,6,0,90),
  ('Potion de mana — Bastide','Potion de mana','Consommable','Consommable maison de la Bastide. La récupération de PM est annoncée par le MJ.',50,4,0,100),
  ('Tissus matelassés, fourrures','Tissus matelassés, fourrures','Protection','Armure COF2 : DEF +1, AGI maximale +7.',2,2,0,200),
  ('Cuir simple','Cuir simple','Protection','Armure COF2 : DEF +2, AGI maximale +6.',4,2,0,210),
  ('Cuir renforcé, broigne','Cuir renforcé, broigne','Protection','Armure COF2 : DEF +3, AGI maximale +5.',8,1,0,220),
  ('Chemise de mailles','Chemise de mailles','Protection','Armure COF2 : DEF +4, AGI maximale +4.',15,1,0,230),
  ('Cotte de mailles','Cotte de mailles','Protection','Armure COF2 : DEF +5, AGI maximale +3.',25,1,0,240),
  ('Armure de plaques','Armure de plaques','Protection','Armure COF2 : DEF +6, AGI maximale +2.',60,1,0,250),
  ('Petit bouclier','Petit bouclier','Protection','Bouclier COF2 : DEF +1.',2,2,0,260),
  ('Grand bouclier','Grand bouclier','Protection','Bouclier COF2 : DEF +2.',4,1,0,270)
)
insert into public.bastide_shop_items(name,base,category,description,price_silver,stock,charges_max,sort_order,active)
select c.name,c.base,c.category,c.description,c.price_silver,c.stock,c.charges_max,c.sort_order,true
from catalogue c
where not exists (select 1 from public.bastide_shop_items s where lower(s.name)=lower(c.name));

create or replace function public.bastide_transfer_money(
  p_sender_id text,
  p_recipient_id text,
  p_amount jsonb
) returns jsonb language plpgsql security invoker set search_path=public as $$
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
  v_sender:=jsonb_set(jsonb_set(v_sender,'{money}',v_sender_money,true),'{silver}',to_jsonb((v_sender_money->>'pa')::integer),true);
  v_recipient:=jsonb_set(jsonb_set(v_recipient,'{money}',v_recipient_money,true),'{silver}',to_jsonb((v_recipient_money->>'pa')::integer),true);
  update public.bastide_players set state=v_sender,updated_at=now() where id=p_sender_id;
  update public.bastide_players set state=v_recipient,updated_at=now() where id=p_recipient_id;
  insert into public.bastide_inventory_events(player_id,event_type,summary,details) values
    (p_sender_id,'money-transfer','Monnaie envoyée à '||v_recipient_name,jsonb_build_object('direction','sent','other_player_id',p_recipient_id,'amount',p_amount)),
    (p_recipient_id,'money-transfer','Monnaie reçue',jsonb_build_object('direction','received','other_player_id',p_sender_id,'amount',p_amount));
  return v_sender;
end $$;

revoke all on function public.bastide_transfer_money(text,text,jsonb) from public,anon,authenticated;
grant execute on function public.bastide_transfer_money(text,text,jsonb) to service_role;
