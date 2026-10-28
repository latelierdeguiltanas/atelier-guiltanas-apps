-- Always run inside BEGIN/ROLLBACK. Never creates real requests or dialogue turns.
do $$
declare pid text:='audit-director';itemid uuid;a jsonb;b jsonb;c jsonb;rid uuid;key1 uuid;before_state jsonb;n integer;failed boolean;
begin
 perform bastide_set_shop_access(true,'Test rollback');update bastide_shop_rules set enabled=true where singleton;
 insert into bastide_players(id,display_name,token_hash,state) values(pid,'Audit director','audit-director-'||gen_random_uuid(),'{"money":{"po":100,"pa":0,"pc":0},"inventory":[]}');
 insert into bastide_character_levels(player_id,payload) select pid,payload from bastide_character_levels where player_id='prepotante';
 insert into bastide_shop_items(name,base,category,description,price_silver,stock,charges_max,equipment,active) values('Potion audit director','Potion audit','Consommable','Test',2,10,0,'{}',true) returning id into itemid;
 select state into before_state from bastide_players where id=pid;
 -- Immediate automatic resolution, then exact replay.
 update bastide_shop_director set presence_until=null where singleton;key1:=gen_random_uuid();a:=bastide_shop_submit_request(pid,key1,'negotiate','{"mode":"buy","approach":"baratin"}');
 if a->>'status'<>'resolved' or (a->'result'->>'die')::integer not between 1 and 20 then raise exception 'Auto incorrect %',a;end if;
 b:=bastide_shop_submit_request(pid,key1,'negotiate','{"mode":"buy","approach":"baratin"}');if a<>b then raise exception 'Idempotence auto incorrecte';end if;
 if (select state from bastide_players where id=pid)<>before_state then raise exception 'Négociation a touché aux biens';end if;
 -- MJ presence queues without creating any quote yet.
 update bastide_shop_director set presence_until=now()+interval '10 minutes',hold_seconds=60 where singleton;
 a:=bastide_shop_submit_request(pid,gen_random_uuid(),'negotiate','{"mode":"sell","approach":"seduction"}');rid:=(a->>'id')::uuid;
 if a->>'status'<>'pending' or exists(select 1 from bastide_shop_negotiations where player_id=pid and mode='sell') then raise exception 'Attente a déjà lancé';end if;
 b:=bastide_shop_resolve_request(rid,pid,false,50,true,'Faux paramètre PJ');if b->>'status'<>'pending' then raise exception 'PJ peut arbitrer avant délai';end if;
 failed:=false;begin perform bastide_shop_resolve_request(rid,'autre-pj',false);exception when others then failed:=true;end;if not failed then raise exception 'Lecture résolution autre PJ';end if;
 b:=bastide_shop_resolve_request(rid,null,true,17,null,'Accord du MJ');if b->>'resolved_by'<>'mj' or (b->'result'->>'rate')::integer<>17 then raise exception 'Tarif MJ ignoré';end if;
 c:=bastide_shop_resolve_request(rid,null,true,40,null,'Rejeu');if b<>c then raise exception 'Arbitrage répété';end if;
 -- Automatic timeout on theft changes stock exactly once.
 a:=bastide_shop_submit_request(pid,gen_random_uuid(),'steal',jsonb_build_object('itemId',itemid));rid:=(a->>'id')::uuid;
 update bastide_shop_requests set deadline=now()-interval '1 second' where id=rid;update bastide_character_levels set payload=jsonb_set(payload,'{character,stats,AGI}','100') where player_id=pid;perform setseed(0);
 b:=bastide_shop_resolve_request(rid,pid,false,50,false,'Tentative de forçage');if b->>'status'<>'resolved' or not (b->'result'->>'success')::boolean or b->>'resolved_by'<>'auto' then raise exception 'Délai ou injection incorrecte %',b;end if;
 c:=bastide_shop_resolve_request(rid,pid,false);if c<>b or (select stock from bastide_shop_items where id=itemid)<>9 then raise exception 'Vol double';end if;
 if (select state->'money' from bastide_players where id=pid)<>before_state->'money' then raise exception 'Monnaie changée';end if;
 -- Closure cancels pending action without effect, and old visit cannot revive it.
 perform bastide_set_shop_access(false,null);perform bastide_set_shop_access(true,null);
 a:=bastide_shop_submit_request(pid,gen_random_uuid(),'steal',jsonb_build_object('itemId',itemid));rid:=(a->>'id')::uuid;perform bastide_set_shop_access(false,null);
 b:=bastide_shop_resolve_request(rid,null,true,null,true);if b->>'status'<>'cancelled' or (select stock from bastide_shop_items where id=itemid)<>9 then raise exception 'Fermeture contournée';end if;
 perform bastide_set_shop_access(true,null);a:=bastide_shop_submit_request(pid,gen_random_uuid(),'steal',jsonb_build_object('itemId',itemid));rid:=(a->>'id')::uuid;
 -- Manual failure keeps stock, applies the existing x2 consequence.
 b:=bastide_shop_resolve_request(rid,null,true,null,false,'Pris sur le fait');if b->>'resolved_by'<>'mj' or (b->'result'->>'success')::boolean or (select surcharge from bastide_shop_relations where player_id=pid)<>2 or (select stock from bastide_shop_items where id=itemid)<>9 then raise exception 'Vol manuel incorrect %',b;end if;
 -- Conversation reservation idempotence, anti-double send and ownership isolation.
 key1:=gen_random_uuid();a:=bastide_mila_begin(pid,key1,'Bonjour Mila');b:=bastide_mila_begin(pid,key1,'Bonjour Mila');if a->>'id'<>b->>'id' or not (b->>'existing')::boolean then raise exception 'Dialogue doublonné';end if;
 failed:=false;begin perform bastide_mila_begin(pid,gen_random_uuid(),'Autre message');exception when others then failed:=true;end;if not failed then raise exception 'Dialogue concurrent autorisé';end if;
 update bastide_mila_turns set reply='Bonjour',engine='local' where id=(a->>'id')::uuid;
 for n in 1..19 loop a:=bastide_mila_begin(pid,gen_random_uuid(),'Message test '||n);update bastide_mila_turns set reply='Réponse test' where id=(a->>'id')::uuid;end loop;
 failed:=false;begin perform bastide_mila_begin(pid,gen_random_uuid(),'Trop de messages');exception when others then failed:=true;end;if not failed then raise exception 'Quota conversation ignoré';end if;
 if has_table_privilege('anon','bastide_mila_turns','select') or has_table_privilege('authenticated','bastide_shop_requests','update') or has_function_privilege('anon','bastide_shop_resolve_request(uuid,text,boolean,integer,boolean,text)','execute') then raise exception 'Tables/fonctions privées exposées';end if;
end $$;
