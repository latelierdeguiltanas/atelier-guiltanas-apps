-- Integration checks. Synthetic users/data are rolled back at the end.
begin;
create temp table hcfg_test (key text primary key,value text);
grant all on hcfg_test to authenticated;
insert into hcfg_test values('a',gen_random_uuid()::text),('b',gen_random_uuid()::text),('p',gen_random_uuid()::text);
insert into auth.users(id,aud,role) select value::uuid,'authenticated','authenticated' from hcfg_test;
set local role authenticated;
select set_config('request.jwt.claim.sub',(select value from hcfg_test where key='a'),true);
insert into hcfg_test values('ca',public.hcfg_create_campaign('Test A','MJ A')::text);
insert into hcfg_test values('invite',public.hcfg_create_invite((select value::uuid from hcfg_test where key='ca')));
insert into public.hcfg_records(campaign_id,kind,title,visibility) values
 ((select value::uuid from hcfg_test where key='ca'),'note','Secret A','mj'),
 ((select value::uuid from hcfg_test where key='ca'),'journal','Partagé A','group');
select set_config('request.jwt.claim.sub',(select value from hcfg_test where key='b'),true);
insert into hcfg_test values('cb',public.hcfg_create_campaign('Test B','MJ B')::text);
do $$begin
 if (select count(*) from public.hcfg_campaigns)<>1 then raise exception 'FAIL: other campaign visible'; end if;
 if (select count(*) from public.hcfg_records)<>0 then raise exception 'FAIL: other records visible'; end if;
 begin perform public.hcfg_create_invite((select value::uuid from hcfg_test where key='ca')); raise exception 'FAIL: other MJ invite'; exception when raise_exception then if sqlerrm like 'FAIL:%' then raise; end if; end;
end$$;
select set_config('request.jwt.claim.sub',(select value from hcfg_test where key='p'),true);
select public.hcfg_join_campaign((select value from hcfg_test where key='invite'),'PJ A');
do $$begin
 if (select count(*) from public.hcfg_campaigns)<>1 then raise exception 'FAIL: player campaigns'; end if;
 if (select count(*) from public.hcfg_records)<>1 then raise exception 'FAIL: player secret visibility'; end if;
 if exists(select 1 from public.hcfg_records where visibility='mj') then raise exception 'FAIL: secret leaked'; end if;
 begin insert into public.hcfg_records(campaign_id,kind,title,visibility) values((select value::uuid from hcfg_test where key='ca'),'note','Illegal note','mj'); raise exception 'FAIL: private insert'; exception when insufficient_privilege then null; end;
 begin insert into public.hcfg_records(campaign_id,kind,title) values((select value::uuid from hcfg_test where key='cb'),'message','Intrusion'); raise exception 'FAIL: cross campaign insert'; exception when insufficient_privilege then null; end;
end$$;
insert into public.hcfg_records(campaign_id,kind,title) values((select value::uuid from hcfg_test where key='ca'),'character','PJ test');
do $$declare affected integer; begin
 update public.hcfg_records set title='Hacked' where kind='journal';get diagnostics affected=row_count;
 if affected<>0 then raise exception 'FAIL: player changed MJ journal'; end if;
 update public.hcfg_records set body='Saved' where kind='character' and revision=1;get diagnostics affected=row_count;
 if affected<>1 then raise exception 'FAIL: player edit own character'; end if;
 update public.hcfg_records set body='Stale' where kind='character' and revision=1;get diagnostics affected=row_count;
 if affected<>0 then raise exception 'FAIL: stale write accepted'; end if;
 begin update public.hcfg_records set visibility='mj' where kind='character'; raise exception 'FAIL: player private escalation'; exception when insufficient_privilege then null; end;
end$$;
select set_config('request.jwt.claim.sub',(select value from hcfg_test where key='a'),true);
select public.hcfg_revoke_invite((select value::uuid from hcfg_test where key='ca'));
delete from public.hcfg_members where user_id=(select value::uuid from hcfg_test where key='p');
select set_config('request.jwt.claim.sub',(select value from hcfg_test where key='p'),true);
do $$begin
 if exists(select 1 from public.hcfg_records) then raise exception 'FAIL: removed member access'; end if;
 begin perform public.hcfg_join_campaign((select value from hcfg_test where key='invite'),'PJ A'); raise exception 'FAIL: revoked invite'; exception when raise_exception then if sqlerrm like 'FAIL:%' then raise; end if; end;
end$$;
reset role;
do $$begin
 if has_table_privilege('anon','public.hcfg_records','SELECT') then raise exception 'FAIL: anonymous table privilege'; end if;
 if has_function_privilege('anon','public.hcfg_create_campaign(text,text)','EXECUTE') then raise exception 'FAIL: anonymous RPC'; end if;
end$$;
select 'PASS: isolated campaigns, MJ secrets, player ownership, stale writes, removed member, revoked invitation and anonymous denial' as result;
rollback;
