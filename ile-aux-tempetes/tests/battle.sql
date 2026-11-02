begin;
do $$
declare oldrev bigint; r jsonb; req uuid=gen_random_uuid(); fail boolean; p jsonb='{"active":true,"order":[{"id":"pj","name":"Vax","playerId":"vax"},{"id":"m","name":"Zombie","playerId":""}],"activeId":"pj"}';
begin
 select revision into oldrev from nespresso_battle where id=true;
 r=nespresso_publish_battle('mj:test',oldrev,p,req);
 if (r->>'revision')::bigint<>oldrev+1 then raise exception 'FAIL revision';end if;
 perform nespresso_publish_battle('mj:test',oldrev,p,req);
 if (select revision from nespresso_battle where id=true)<>oldrev+1 then raise exception 'FAIL idempotency';end if;
 fail=false;begin perform nespresso_publish_battle('mj:other',oldrev,p,gen_random_uuid());exception when sqlstate '40001' then fail=true;end;
 if not fail then raise exception 'FAIL multi-device conflict';end if;
 fail=false;begin perform nespresso_publish_battle('vax',oldrev+1,p,gen_random_uuid());exception when others then fail=true;end;
 if not fail then raise exception 'FAIL player publication';end if;
 perform nespresso_publish_battle('mj:test',oldrev+1,'{"active":false,"order":[],"activeId":""}',gen_random_uuid());
 if (select (payload->>'active')::boolean from nespresso_battle where id=true) then raise exception 'FAIL hide';end if;
 if has_table_privilege('anon','nespresso_battle','select') or has_function_privilege('anon','nespresso_publish_battle(text,bigint,jsonb,uuid)','execute') then raise exception 'FAIL direct access';end if;
end;$$;
select 'PASS: publish/hide, revision, idempotency, multi-device conflict and permissions' as result;
rollback;
