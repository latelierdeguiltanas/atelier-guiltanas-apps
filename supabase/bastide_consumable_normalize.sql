-- Value-preserving repair: audit the full inventory before and after every changed player.
do $$
declare p record; before_items jsonb; after_items jsonb; before_q numeric; after_q numeric;
begin
 for p in select id,state from public.bastide_players order by id for update loop
  before_items:=coalesce(p.state->'inventory','[]');after_items:=public.bastide_stack_consumables(before_items);
  select coalesce(sum((i->>'quantity')::numeric),0) into before_q from jsonb_array_elements(before_items) i;
  select coalesce(sum((i->>'quantity')::numeric),0) into after_q from jsonb_array_elements(after_items) i;
  if before_q<>after_q then raise exception 'Conservation des quantités impossible pour %',p.id;end if;
  if before_items<>after_items then
   update public.bastide_players set state=jsonb_set(state,'{inventory}',after_items),updated_at=now() where id=p.id;
   insert into public.bastide_inventory_events(player_id,event_type,summary,details,seen_at)
   values(p.id,'inventory_stacked','Consommables identiques regroupés',jsonb_build_object('before',before_items,'after',after_items,'quantity_before',before_q,'quantity_after',after_q,'money_changed',false),now());
  end if;
 end loop;
end $$;
