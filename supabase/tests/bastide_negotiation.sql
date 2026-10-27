-- Run after definitions in a rollback transaction.
do $$
declare c jsonb;s jsonb;r jsonb;testitem uuid;gift jsonb;failed boolean;before_s jsonb;n integer;
begin
 insert into bastide_players(id,display_name,token_hash,state) values('audit-neg','Negotiation test','audit-neg-'||gen_random_uuid(),'{"money":{"po":2,"pa":0,"pc":0},"inventory":[]}');
 insert into bastide_character_levels(player_id,payload) select 'audit-neg',payload from bastide_character_levels where player_id='prepotante';
 c:=bastide_social_bonus('audit-neg','baratin');if (c->>'pathBonus')::integer<>3 then raise exception 'Bonus adventurier incorrect %',c;end if;
 r:=bastide_negotiate('audit-neg','buy','baratin');if (r->>'die')::integer not between 1 and 20 or (r->>'bonus')::integer<>(c->>'total')::integer then raise exception 'Jet/bonus incorrect';end if;
 failed:=false;begin perform bastide_negotiate('audit-neg','buy','seduction');exception when others then failed:=true;end;if not failed then raise exception 'Relance autorisée';end if;
 update bastide_shop_negotiations set rate=10 where player_id='audit-neg' and mode='buy';
 insert into bastide_shop_items(name,base,category,description,price_silver,stock,charges_max,equipment,active,sort_order) values('Potion de test négociation','Potion test','Consommable','Rend des PV test.',8,10,0,'{}',true,999) returning bastide_shop_items.id into testitem;
 s:=bastide_checkout('audit-neg',jsonb_build_array(jsonb_build_object('itemId',testitem,'quantity',2)),null);
 if s->'money'<>'{"po":0,"pa":5,"pc":6}'::jsonb then raise exception 'Tarif négocié/conversion incorrect %',s->'money';end if;
 if (select consumed_at from bastide_shop_negotiations where player_id='audit-neg' and mode='buy') is null then raise exception 'Tarif non consommé';end if;
 -- A failed basket neither consumes its quote nor deducts its first line.
 update bastide_shop_negotiations set consumed_at=null,rate=20 where player_id='audit-neg' and mode='buy';select state into before_s from bastide_players where bastide_players.id='audit-neg';
 failed:=false;begin perform bastide_checkout('audit-neg',jsonb_build_array(jsonb_build_object('itemId',testitem,'quantity',1),jsonb_build_object('itemId',gen_random_uuid(),'quantity',1)),null);exception when others then failed:=true;end;
 if not failed or (select state from bastide_players where bastide_players.id='audit-neg')<>before_s or (select consumed_at from bastide_shop_negotiations where player_id='audit-neg' and mode='buy') is not null then raise exception 'Panier partiel ou tarif consommé sur échec';end if;
 -- Loot from outside the shop adopts the catalogue mechanics but does not touch stock.
 perform bastide_deliver_bundle('audit-neg','[{"name":"Potion de test négociation","quantity":1}]','{}','Butin');
 select state into s from bastide_players where bastide_players.id='audit-neg';
 if jsonb_array_length(s->'inventory')<>1 or (s->'inventory'->0->>'quantity')::integer<>3 or (select stock from bastide_shop_items where bastide_shop_items.id=testitem)<>8 then raise exception 'Butin non cumulé ou stock modifié';end if;
 -- Player-created names cannot acquire an approved price by using the catalogue matcher.
 c:=bastide_catalog_item('{"name":"Potion de test négociation","quantity":1,"source":"joueur"}');if c ? 'salePriceApproved' then raise exception 'Joueur fabrique un prix approuvé';end if;
 -- Selling with +10% pays the negotiated total, exactly once.
 r:=bastide_negotiate('audit-neg','sell','baratin');update bastide_shop_negotiations set rate=10 where player_id='audit-neg' and mode='sell';
 s:=bastide_sell_items('audit-neg',jsonb_build_array(jsonb_build_object('itemId',s->'inventory'->0->>'id','quantity',1)));
 if s->'money'<>'{"po":1,"pa":0,"pc":0}'::jsonb then raise exception 'Tarif de vente incorrect %',s->'money';end if;
 if (select consumed_at from bastide_shop_negotiations where player_id='audit-neg' and mode='sell') is null then raise exception 'Vente ne consomme pas le tarif';end if;
 -- Disabling the house rule removes all pricing effects without changing inventory.
 update bastide_shop_rules set enabled=false;
 if bastide_negotiated_price('audit-neg','buy',100)<>100 then raise exception 'Règle désactivée encore appliquée';end if;
 if has_function_privilege('anon','bastide_checkout(text,jsonb,uuid)','execute') or has_table_privilege('authenticated','bastide_shop_negotiations','select') then raise exception 'Négociation accessible directement';end if;
end $$;
