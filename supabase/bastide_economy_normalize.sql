-- Value-preserving, replayable repair. No appraisal or retrospective repricing.
begin;
do $$
declare p record; m jsonb;s jsonb;inv jsonb;total bigint;
begin
 for p in select id,state from bastide_players order by id for update loop
  m:=bastide_normalize_money(coalesce(p.state->'money',jsonb_build_object('pa',coalesce((p.state->>'silver')::numeric,0))));
  total:=(m->>'po')::bigint*100+(m->>'pa')::bigint*10+(m->>'pc')::bigint;
  s:=p.state||jsonb_build_object('money',m,'silver',floor(total::numeric/10));
  if s<>p.state then
   update bastide_players set state=s,updated_at=now() where id=p.id;
   insert into bastide_inventory_events(player_id,event_type,summary,details) values(p.id,'currency-normalized','Conversion PO / PA / PC — valeur conservée',jsonb_build_object('money_before',p.state->'money','money_after',m,'total_pc',total,'value_change_pc',0));
  end if;
 end loop;
 select state into s from bastide_players where id='zepheline' for update;
 if exists(select 1 from jsonb_array_elements(s->'inventory') i where i->>'id'='zepheline-besace-pollen' and i->>'containerType'='pollen-bag') then
  select coalesce(jsonb_agg(case when i->>'id'='zepheline-besace-pollen' then i||jsonb_build_object('containerId','') when not coalesce((i->>'equipped')::boolean,false) and coalesce(i->>'containerId','')='' then i||jsonb_build_object('containerId','zepheline-besace-pollen') else i end order by n),'[]'::jsonb) into inv from jsonb_array_elements(s->'inventory') with ordinality t(i,n) where i->>'id'<>'starter-sac';
  if inv<>s->'inventory' then
   update bastide_players set state=jsonb_set(s,'{inventory}',inv),updated_at=now() where id='zepheline';
   insert into bastide_inventory_events(player_id,event_type,summary,details) values('zepheline','container-repair','Rangement dans la besace — objets et quantités conservés','{"containerId":"zepheline-besace-pollen"}');
  end if;
 end if;
end $$;
commit;
