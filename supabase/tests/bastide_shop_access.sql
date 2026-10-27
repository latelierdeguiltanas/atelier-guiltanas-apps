-- Test in a rollback transaction. All custom players/items are temporary.
do $$
declare itemid uuid;packid uuid;s jsonb;before_s jsonb;failed boolean;outcome jsonb;n integer;stock_before integer;
begin
 perform bastide_set_shop_access(true,'Ouvert pour test');
 insert into bastide_players(id,display_name,token_hash,state) values('audit-shop-gate','Gate test','audit-gate-'||gen_random_uuid(),'{"money":{"po":100,"pa":0,"pc":0},"inventory":[]}');
 insert into bastide_character_levels(player_id,payload) select 'audit-shop-gate',payload from bastide_character_levels where player_id='prepotante';
 insert into bastide_shop_items(name,base,category,description,price_silver,stock,charges_max,equipment,active,sort_order) values('Petit objet test vol','Petit objet test vol','Consommable','Description catalogue test.',2,10,0,'{}',true,999) returning id into itemid;
 s:=bastide_save_shop_pack(jsonb_build_object('name','Pack accès test','lines',jsonb_build_array(jsonb_build_object('itemId',itemid,'quantity',1)),'pricingMode','fixed','price',2,'stock',5));packid:=(s->>'id')::uuid;
 perform bastide_set_shop_access(false,'Dans les grottes');select state into before_s from bastide_players where id='audit-shop-gate';
 for n in 1..6 loop
  failed:=false;begin
   if n=1 then perform bastide_checkout('audit-shop-gate',jsonb_build_array(jsonb_build_object('itemId',itemid,'quantity',1)),null);
   elsif n=2 then perform bastide_checkout('audit-shop-gate',null,packid);
   elsif n=3 then perform bastide_sell_items('audit-shop-gate','[]');
   elsif n=4 then perform bastide_negotiate('audit-shop-gate','buy','baratin');
   elsif n=5 then perform bastide_attempt_theft('audit-shop-gate',itemid);
   else perform bastide_purchase('audit-shop-gate',itemid,1);end if;
  exception when others then if sqlerrm not like 'Boutique fermée%' then raise;end if;failed:=true;end;
  if not failed then raise exception 'Accès fermé contourné %',n;end if;
 end loop;
 if (select state from bastide_players where id='audit-shop-gate')<>before_s or (select stock from bastide_shop_items where id=itemid)<>10 then raise exception 'Fermeture a laissé modifier des valeurs';end if;
 perform bastide_set_shop_access(true,null);update bastide_shop_rules set theft_dc=5 where singleton;
 -- Deterministic success: a huge test-only AGI removes randomness except natural 1; choose a seed whose first die is not 1.
 update bastide_character_levels set payload=jsonb_set(payload,'{character,stats,AGI}','100') where player_id='audit-shop-gate';perform setseed(0);
 outcome:=bastide_attempt_theft('audit-shop-gate',itemid);
 if not (outcome->>'success')::boolean then raise exception 'Seed test inattendue';end if;
 if (select stock from bastide_shop_items where id=itemid)<>9 or (select state->'money' from bastide_players where id='audit-shop-gate')<>before_s->'money' then raise exception 'Vol ne conserve pas argent ou ne retire pas stock';end if;
 failed:=false;begin perform bastide_attempt_theft('audit-shop-gate',itemid);exception when others then failed:=true;end;if not failed then raise exception 'Vol relançable';end if;
 -- New visit allows a new attempt; a failure persists across later reopenings.
 perform bastide_set_shop_access(false,null);perform bastide_set_shop_access(true,null);
 update bastide_character_levels set payload=jsonb_set(payload,'{character,stats,AGI}','-100') where player_id='audit-shop-gate';perform setseed(0);update bastide_shop_rules set theft_dc=40 where singleton;
 outcome:=bastide_attempt_theft('audit-shop-gate',itemid);if (outcome->>'success')::boolean then raise exception 'Seed test inattendue';end if;
 if (select surcharge from bastide_shop_relations where player_id='audit-shop-gate')<>2 or (select stock from bastide_shop_items where id=itemid)<>9 then raise exception 'Échec sans conséquence ou stock perdu';end if;
 failed:=false;begin perform bastide_negotiate('audit-shop-gate','buy','baratin');exception when others then failed:=true;end;if not failed then raise exception 'Méfiance négociable';end if;
 select state into before_s from bastide_players where id='audit-shop-gate';s:=bastide_checkout('audit-shop-gate',jsonb_build_array(jsonb_build_object('itemId',itemid,'quantity',1)),null);
 if (s->'money'->>'po')::integer*100+(s->'money'->>'pa')::integer*10+(s->'money'->>'pc')::integer<>9960 then raise exception 'Tarif non doublé %',s->'money';end if;
 if has_function_privilege('anon','bastide_attempt_theft(text,uuid)','execute') or has_function_privilege('authenticated','bastide_set_shop_access(boolean,text)','execute') then raise exception 'Contrôle MJ ou vol accessible directement';end if;
end $$;
