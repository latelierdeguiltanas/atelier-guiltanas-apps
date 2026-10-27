-- Run after bastide_economy_repair.sql, in a transaction that is always rolled back.
do $$
declare s jsonb;i jsonb;failed boolean;before_sale jsonb; shopid uuid;oldstock integer;
begin
 if bastide_normalize_money('{"pa":117,"pc":12}') <> '{"po":11,"pa":8,"pc":2}'::jsonb then raise exception 'Conversion incorrecte';end if;
 insert into bastide_players(id,display_name,token_hash,state) values
 ('audit-economy-src','Test source','audit-'||gen_random_uuid(),'{"money":{"po":0,"pa":9,"pc":8},"inventory":[{"id":"audit-gem","name":"Gemme de test hors catalogue","quantity":2,"equipped":false,"salePriceSilver":2.5,"salePriceApproved":true,"documentUrl":"https://example.test/doc"}]}'),
 ('audit-economy-dst','Test destination','audit-'||gen_random_uuid(),'{"money":{"po":0,"pa":0,"pc":0},"inventory":[]}');
 s:=bastide_item_mutation('audit-economy-src','upsert','{"id":"audit-gem","name":"Gemme de test hors catalogue","quantity":2,"notes":"éditée","salePriceSilver":99999,"salePriceApproved":true}');
 select value into i from jsonb_array_elements(s->'inventory') where value->>'id'='audit-gem';
 if (i->>'salePriceSilver')::numeric<>2.5 or i->>'documentUrl'<>'https://example.test/doc' then raise exception 'Prix falsifié ou métadonnées perdues';end if;
 s:=bastide_sell_items('audit-economy-src','[{"itemId":"audit-gem","quantity":1}]');
 if s->'money'<>'{"po":1,"pa":2,"pc":3}'::jsonb or (s->>'silver')::numeric<>12 then raise exception 'Vente/conversion incorrecte';end if;
 before_sale:=s;failed:=false;
 begin perform bastide_sell_items('audit-economy-src','[{"itemId":"audit-gem","quantity":1},{"itemId":"absent","quantity":1}]');exception when others then failed:=true;end;
 if not failed or (select state from bastide_players where id='audit-economy-src')<>before_sale then raise exception 'Panier partiel non atomique';end if;
 s:=bastide_transfer_money('audit-economy-src','audit-economy-dst','{"pa":1,"pc":5}');
 if s->'money'<>'{"po":1,"pa":0,"pc":8}'::jsonb or (select state->'money' from bastide_players where id='audit-economy-dst')<>'{"po":0,"pa":1,"pc":5}'::jsonb then raise exception 'Transfert/conservation incorrect';end if;
 s:=bastide_deliver_bundle('audit-economy-dst','[{"name":"Butin test","quantity":1,"salePriceSilver":3,"salePriceApproved":true}]','{"pa":25}','test');
 if s->'state'->'money'<>'{"po":2,"pa":6,"pc":5}'::jsonb then raise exception 'Envoi non converti';end if;
 select value into i from jsonb_array_elements(s->'state'->'inventory') where value->>'name'='Butin test';
 if i->>'salePriceApproved'<>'true' or (i->>'salePriceSilver')::numeric<>3 then raise exception 'Prix non transmis';end if;
 perform bastide_set_resale_price('audit-economy-dst',i->>'id',7);
 s:=bastide_sell_items('audit-economy-dst',jsonb_build_array(jsonb_build_object('itemId',i->>'id','quantity',1)));
 if s->'money'<>'{"po":3,"pa":3,"pc":5}'::jsonb then raise exception 'Estimation MJ non appliquée';end if;
 -- Existing satchel is used, while all modifications are rolled back by the caller.
 s:=bastide_item_mutation('zepheline','create','{"id":"audit-pollen","name":"Objet de test","quantity":1,"containerId":"zepheline-besace-pollen","documentUrl":"https://example.test/test"}');
 select value into i from jsonb_array_elements((select state->'inventory' from bastide_players where id='zepheline')) where value->>'id'='audit-pollen';
 if i->>'containerId'<>'zepheline-besace-pollen' then raise exception 'Rangement perdu après relecture';end if;
 s:=bastide_item_mutation('zepheline','upsert',i||'{"containerId":""}'::jsonb);
 select value into i from jsonb_array_elements(s->'inventory') where value->>'id'='audit-pollen';
 if i->>'containerId'<>'' then raise exception 'Sortie de besace impossible';end if;
 s:=bastide_transfer_item('audit-economy-src','zepheline','audit-gem',1);
 select value into i from jsonb_array_elements((select state->'inventory' from bastide_players where id='zepheline')) where value->>'name'='Gemme de test hors catalogue';
 if i->>'containerId'<>'zepheline-besace-pollen' or (i->>'salePriceSilver')::numeric<>2.5 then raise exception 'Transfert perd contenant ou prix';end if;
 failed:=false;begin perform bastide_item_mutation('zepheline','delete','{"id":"zepheline-besace-pollen"}');exception when others then failed:=true;end;if not failed then raise exception 'Besace supprimable';end if;
 select id into shopid from bastide_shop_items where active and stock is not null limit 1;
 if shopid is not null then
  update bastide_shop_items set stock=10 where id=shopid;
  update bastide_players set state=state||'{"money":{"po":10000,"pa":0,"pc":0}}'::jsonb where id='audit-economy-src';
  s:=bastide_purchase('audit-economy-src',shopid,1);
  select value into i from jsonb_array_elements(s->'inventory') where value->>'shopItemId'=shopid::text limit 1;
  if i is null then raise exception 'Métadonnées achat perdues';end if;
  perform bastide_sell_items('audit-economy-src',jsonb_build_array(jsonb_build_object('itemId',i->>'id','quantity',1)));
  if (select stock from bastide_shop_items where id=shopid)<>10 then raise exception 'Stock non restauré à la revente';end if;
 end if;
 if has_function_privilege('anon','bastide_set_resale_price(text,text,numeric)','execute') or has_function_privilege('authenticated','bastide_set_resale_price(text,text,numeric)','execute') then raise exception 'Estimation accessible hors MJ';end if;
end $$;
