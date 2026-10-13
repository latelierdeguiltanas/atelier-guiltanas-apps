-- The pollen satchel is Zéphéline's primary inventory container.
begin;
select id from bastide_players where id='zepheline' for update;
update bastide_players set state=jsonb_set(state,'{inventory}',(
 select jsonb_agg(case when x->>'id'='zepheline-besace-pollen' then x||jsonb_build_object('name','Sac de pollen','notes','Sac personnel principal de Zéphéline. Les objets rangés ici sont miniaturisés ; les objets sortis retrouvent leur taille normale.') else x||jsonb_build_object('containerId','zepheline-besace-pollen') end order by n)
 from jsonb_array_elements(state->'inventory') with ordinality as items(x,n) where x->>'id'<>'starter-sac'
)),updated_at=now() where id='zepheline' and exists(select 1 from jsonb_array_elements(state->'inventory') x where x->>'id'='zepheline-besace-pollen');
commit;
