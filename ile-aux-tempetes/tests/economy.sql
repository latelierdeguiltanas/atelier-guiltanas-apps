-- Run inside a rolled-back transaction; never persist test inventories or events.
begin;
do $$
declare r jsonb; before_state jsonb; req uuid=gen_random_uuid(); v bigint; rev bigint; failed boolean;
begin
 -- Delivery before a player's first import must survive that import.
 perform nespresso_mutate('test-admin',true,'send','{"playerId":"hammerz","money":{"PO":2},"items":[{"id":"gift","name":"Lettre","qty":1}]}',gen_random_uuid());
 perform nespresso_mutate('hammerz',false,'bootstrap','{"money":{"PO":3},"inventory":[]}',gen_random_uuid());
 select state into r from nespresso_inventories where player_id='hammerz';
 if nespresso_value(r->'money')<>500 or jsonb_array_length(r->'inventory')<>1 then raise exception 'FAILED pending gift merge';end if;
 perform nespresso_mutate('vax',false,'bootstrap','{"money":{"PO":10,"PE":2},"inventory":[{"id":"dagger","name":"Dague","qty":3,"shopItemId":"i1"},{"id":"box","name":"Boîte","qty":1},{"id":"inside","name":"Lettre","qty":1,"containerId":"box"}]}',gen_random_uuid());
 -- Retrying bootstrap cannot mint money or duplicate inventory.
 perform nespresso_mutate('vax',false,'bootstrap','{"money":{"PO":99999},"inventory":[]}',gen_random_uuid());
 select nespresso_value(state->'money') into v from nespresso_inventories where player_id='vax';if v<>1100 then raise exception 'FAILED bootstrap once';end if;
 perform nespresso_mutate('vax',false,'transfer-money','{"recipientId":"hammerz","amount":{"PE":1}}',req);
 perform nespresso_mutate('vax',false,'transfer-money','{"recipientId":"hammerz","amount":{"PE":1}}',req);
 select nespresso_value(state->'money') into v from nespresso_inventories where player_id='vax';if v<>1050 then raise exception 'FAILED idempotency';end if;
 failed=false;begin perform nespresso_mutate('vax',false,'transfer-money','{"recipientId":"hammerz","amount":{"PO":1}}',req);exception when others then failed=true;end;if not failed then raise exception 'FAILED request payload conflict';end if;
 perform nespresso_mutate('vax',false,'transfer-item','{"recipientId":"hammerz","itemId":"dagger","quantity":1}',gen_random_uuid());
 select state into r from nespresso_inventories where player_id='vax';if (select (value->>'qty')::int from jsonb_array_elements(r->'inventory') where value->>'id'='dagger')<>2 then raise exception 'FAILED item debit';end if;
 -- Offline recipients may receive without being initialised.
 perform nespresso_mutate('vax',false,'transfer-money','{"recipientId":"loris","amount":{"PE":1}}',gen_random_uuid());
 select nespresso_value(state->'money') into v from nespresso_inventories where player_id='loris';if v<>50 then raise exception 'FAILED pending recipient';end if;
 failed=false;begin perform nespresso_mutate('vax',false,'transfer-item','{"recipientId":"hammerz","itemId":"box","quantity":1}',gen_random_uuid());exception when others then failed=true;end;if not failed then raise exception 'FAILED nonempty container';end if;
 failed=false;begin perform nespresso_mutate('vax',false,'transfer-item','{"recipientId":"hammerz","itemId":"dagger","quantity":1.5}',gen_random_uuid());exception when others then failed=true;end;if not failed then raise exception 'FAILED fractional quantity';end if;
 failed=false;begin perform nespresso_mutate('vax',false,'transfer-money','{"recipientId":"scanlan","amount":{"PO":1}}',gen_random_uuid());exception when others then failed=true;end;if not failed then raise exception 'FAILED Bastide recipient isolation';end if;
 failed=false;begin perform nespresso_mutate('vax',false,'send','{"playerId":"vax","money":{"PO":100}}',gen_random_uuid());exception when others then failed=true;end;if not failed then raise exception 'FAILED player MJ action';end if;
 failed=false;begin perform nespresso_mutate('vax',false,'transfer-money','{"recipientId":"hammerz","amount":{"PO":100}}',gen_random_uuid());exception when others then failed=true;end;if not failed then raise exception 'FAILED overdraft';end if;
 failed=false;begin perform nespresso_mutate('vax',false,'transfer-money','{"recipientId":"vax","amount":{"PO":1}}',gen_random_uuid());exception when others then failed=true;end;if not failed then raise exception 'FAILED self transfer';end if;
 select state into before_state from nespresso_inventories where player_id='vax';
 update nespresso_shop set stock=2 where id='i1';
 failed=false;begin perform nespresso_mutate('vax',false,'purchase','{"lines":[{"itemId":"i1","quantity":1},{"itemId":"i32","quantity":1}]}',gen_random_uuid());exception when others then failed=true;end;
 if not failed or (select state from nespresso_inventories where player_id='vax')<>before_state or (select stock from nespresso_shop where id='i1')<>2 then raise exception 'FAILED atomic basket rollback';end if;
 perform nespresso_mutate('vax',false,'purchase','{"lines":[{"itemId":"i1","quantity":2}]}',gen_random_uuid());
 if (select stock from nespresso_shop where id='i1')<>0 then raise exception 'FAILED stock debit';end if;
 perform nespresso_mutate('vax',false,'sell','{"lines":[{"itemId":"dagger","quantity":1}]}',gen_random_uuid());
 if (select stock from nespresso_shop where id='i1')<>1 then raise exception 'FAILED sell restock';end if;
 select revision into rev from nespresso_inventories where player_id='vax';
 failed=false;begin perform nespresso_mutate('vax',false,'item-save',jsonb_build_object('revision',rev-1,'item',jsonb_build_object('name','Old state')),gen_random_uuid());exception when others then failed=true;end;if not failed then raise exception 'FAILED optimistic revision';end if;
 perform nespresso_mutate('vax',false,'item-save',jsonb_build_object('revision',rev,'item',jsonb_build_object('id','equipped','name','Dague','qty',1,'equipped',true)),gen_random_uuid());
 failed=false;begin perform nespresso_mutate('vax',false,'sell','{"lines":[{"itemId":"equipped","quantity":1}]}',gen_random_uuid());exception when others then failed=true;end;if not failed then raise exception 'FAILED equipped sale';end if;
 failed=false;begin perform nespresso_mutate('vax',false,'transfer-item','{"recipientId":"hammerz","itemId":"equipped","quantity":1}',gen_random_uuid());exception when others then failed=true;end;if not failed then raise exception 'FAILED equipped transfer';end if;
 perform nespresso_mutate('vax',false,'change','{}',gen_random_uuid());
 perform nespresso_mutate('vax',false,'seen','{}',gen_random_uuid());
 if exists(select 1 from nespresso_events where player_id='vax' and seen_at is null) then raise exception 'FAILED seen events';end if;
 if has_function_privilege('anon','public.nespresso_mutate(text,boolean,text,jsonb,uuid)','execute') or has_table_privilege('anon','public.nespresso_inventories','select') then raise exception 'FAILED direct privileges';end if;
end;$$;
select 'PASS: pending delivery/import, bootstrap once, idempotency, payload conflict, coins, item debit, offline recipient, containers, integer quantities, campaign isolation, MJ authorization, overdraft, self-transfer, basket rollback, stock, sale, stale revision, equipped sale/transfer, change, event read, direct privileges' as result;
rollback;
