-- Execute with both definitions in BEGIN ... ROLLBACK. No real trades are kept.
do $$
declare s jsonb; t jsonb; item uuid; gift uuid; pid uuid; before_state jsonb; before_stock integer; failed boolean; a jsonb; sumq integer;
begin
 insert into bastide_players(id,display_name,token_hash,state) values('audit-pack','Pack test','audit-pack-'||gen_random_uuid(),'{"money":{"po":10,"pa":0,"pc":0},"inventory":[]}'),('audit-pack-other','Other','audit-pack-'||gen_random_uuid(),'{"money":{"pa":0},"inventory":[]}');
 insert into bastide_shop_items(name,base,category,description,price_silver,stock,charges_max,equipment,active,sort_order) values('Potion test packs','Potion test packs','Consommable','Effet test identique',8,20,0,'{}',true,999) returning id into item;
 insert into bastide_shop_items(name,base,category,description,price_silver,stock,charges_max,equipment,active,sort_order) values('Cadeau test','Cadeau test','Consommable','Cadeau test',4,10,0,'{}',true,999) returning id into gift;
 s:=bastide_purchase('audit-pack',item,1);s:=bastide_purchase('audit-pack',item,2);
 if jsonb_array_length(s->'inventory')<>1 or (s->'inventory'->0->>'quantity')::integer<>3 then raise exception 'Achats non cumulés';end if;
 -- Old purchase without modern shop metadata joins the same stack.
 update bastide_players set state=jsonb_set(state,'{inventory}',(state->'inventory')||jsonb_build_array(jsonb_build_object('id','old-potion','name','Potion test packs','base','Potion test packs','category','Consommable','notes','Effet test identique','source','mila','quantity',2,'equipped',false,'equipment','{}'::jsonb))) where id='audit-pack';
 s:=bastide_purchase('audit-pack',item,1);
 if jsonb_array_length(s->'inventory')<>1 or (s->'inventory'->0->>'quantity')::integer<>6 then raise exception 'Anciennes potions non cumulées';end if;
 a:=s->'inventory'->0;
 t:=bastide_stack_consumables(jsonb_build_array(a,a||'{"id":"different-effect","notes":"Autre effet"}',a||'{"id":"different-price","salePriceSilver":100}',a||'{"id":"different-bag","containerId":"other-bag"}',a||'{"id":"different-charges","chargesMax":1,"charges":1}'));
 if jsonb_array_length(t)<>5 then raise exception 'Objets distincts fusionnés';end if;
 if bastide_stack_consumables(s->'inventory')<>s->'inventory' then raise exception 'Cumul non idempotent';end if;
 -- One paid potion + two gifts: only the paid line receives the 25 percent discount.
 t:=bastide_save_shop_pack(jsonb_build_object('name','Test pack','lines',jsonb_build_array(jsonb_build_object('itemId',item,'quantity',1,'gift',false),jsonb_build_object('itemId',gift,'quantity',2,'gift',true)),'pricingMode','percent','discountPercent',25,'stock',1,'recipientId','audit-pack'));
 pid:=(t->>'id')::uuid;if (t->>'price_pa')::numeric<>6 or (t->>'regular_pa')::numeric<>16 then raise exception 'Prix/remise/cadeaux incorrect';end if;
 select state into before_state from bastide_players where id='audit-pack';
 s:=bastide_purchase_pack('audit-pack',pid);
 if s->'money'<>'{"po":6,"pa":2,"pc":0}'::jsonb then raise exception 'Mauvais débit %',s->'money';end if;
 select sum((x->>'quantity')::integer) into sumq from jsonb_array_elements(s->'inventory') x;
 if sumq<>9 or (select stock from bastide_shop_packs where id=pid)<>0 then raise exception 'Livraison/stock pack incorrect';end if;
 failed:=false;begin perform bastide_purchase_pack('audit-pack',pid);exception when others then failed:=true;end;if not failed then raise exception 'Pack épuisé racheté';end if;
 -- Failing second component must roll back earlier catalogue deductions.
 update bastide_shop_packs set stock=1 where id=pid;update bastide_shop_items set stock=0 where id=gift;
 select state into before_state from bastide_players where id='audit-pack';select stock into before_stock from bastide_shop_items where id=item;
 failed:=false;begin perform bastide_purchase_pack('audit-pack',pid);exception when others then failed:=true;end;
 if not failed or (select state from bastide_players where id='audit-pack')<>before_state or (select stock from bastide_shop_items where id=item)<>before_stock then raise exception 'Achat partiel non atomique';end if;
 failed:=false;begin perform bastide_purchase_pack('audit-pack-other',pid);exception when others then failed:=true;end;if not failed then raise exception 'Pack privé accessible';end if;
 -- An unaffordable public pack must leave inventory, purse and stock unchanged.
 t:=bastide_save_shop_pack(jsonb_build_object('name','Too expensive','lines',jsonb_build_array(jsonb_build_object('itemId',item,'quantity',1)),'pricingMode','fixed','price',1000,'stock',1));
 select state into before_state from bastide_players where id='audit-pack-other';select stock into before_stock from bastide_shop_items where id=item;
 failed:=false;begin perform bastide_purchase_pack('audit-pack-other',(t->>'id')::uuid);exception when others then failed:=true;end;
 if not failed or (select state from bastide_players where id='audit-pack-other')<>before_state or (select stock from bastide_shop_items where id=item)<>before_stock then raise exception 'Échec de paiement non atomique';end if;
 -- A delivery and a player transfer also join existing stacks.
 perform bastide_deliver_bundle('audit-pack-other','[{"name":"Envoi potion test","category":"Consommable","quantity":2,"notes":"identique"}]','{}','Test');
 perform bastide_deliver_bundle('audit-pack-other','[{"name":"Envoi potion test","category":"Consommable","quantity":3,"notes":"identique"}]','{}','Test');
 select state into s from bastide_players where id='audit-pack-other';
 if jsonb_array_length(s->'inventory')<>1 or (s->'inventory'->0->>'quantity')::integer<>5 then raise exception 'Envois MJ non cumulés';end if;
 perform bastide_deliver_bundle('audit-pack','[{"name":"Envoi potion test","category":"Consommable","quantity":1,"notes":"identique"}]','{}','Test');
 select value into a from jsonb_array_elements((select state->'inventory' from bastide_players where id='audit-pack')) where value->>'name'='Envoi potion test';
 perform bastide_transfer_item('audit-pack','audit-pack-other',a->>'id',1);
 select state into s from bastide_players where id='audit-pack-other';
 if jsonb_array_length(s->'inventory')<>1 or (s->'inventory'->0->>'quantity')::integer<>6 then raise exception 'Transfert non cumulé';end if;
 update bastide_players set state=jsonb_set(state,'{inventory}','[]') where id='audit-pack-other';
 -- Completely free pack works without money, and direct RPCs are private.
 update bastide_shop_items set stock=10 where id=gift;
 t:=bastide_save_shop_pack(jsonb_build_object('name','Cadeau','lines',jsonb_build_array(jsonb_build_object('itemId',gift,'quantity',1,'gift',true)),'pricingMode','fixed','price',0,'stock',1));
 s:=bastide_purchase_pack('audit-pack-other',(t->>'id')::uuid);
 if s->'money'<>'{"po":0,"pa":0,"pc":0}'::jsonb or jsonb_array_length(s->'inventory')<>1 then raise exception 'Cadeau gratuit incorrect';end if;
 if has_function_privilege('anon','bastide_purchase_pack(text,uuid)','execute') or has_function_privilege('authenticated','bastide_save_shop_pack(jsonb)','execute') then raise exception 'RPC privée exposée';end if;
end $$;
