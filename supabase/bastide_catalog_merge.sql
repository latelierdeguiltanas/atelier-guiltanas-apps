-- Match manually created catalogue loot without touching Mila's stock.
create or replace function public.bastide_catalog_item(p_item jsonb)
returns jsonb language plpgsql stable set search_path=public as $$
declare matches integer; s bastide_shop_items%rowtype; key text;
begin
 if coalesce(p_item->>'containerType','')<>'' or coalesce((p_item->>'equipped')::boolean,false) or coalesce((p_item->>'chargesMax')::integer,0)>0 then return p_item;end if;
 if coalesce(p_item->>'shopItemId','')<>'' then return p_item;end if;
 if coalesce(p_item->>'source','') not in ('mj','mila') then return p_item;end if;
 key:=replace(lower(trim(p_item->>'name')),'soins','soin');
 select count(*) into matches from bastide_shop_items where active and replace(lower(trim(name)),'soins','soin')=key and category='Consommable';
 if matches<>1 then return p_item;end if;
 select * into s from bastide_shop_items where active and replace(lower(trim(name)),'soins','soin')=key and category='Consommable';
 -- Preserve deliberate customized effects. Short shorthand/empty descriptions adopt the catalogue rule.
 if length(coalesce(p_item->>'notes',''))>40 and p_item->>'notes'<>s.description then return p_item;end if;
 return p_item||jsonb_build_object('name',s.name,'base',s.base,'category',s.category,'notes',s.description,'shopItemId',s.id,'purchasePriceSilver',s.price_silver,'salePriceApproved',true,'salePriceSilver',case when coalesce((p_item->>'salePriceApproved')::boolean,false) then (p_item->>'salePriceSilver')::numeric else greatest(1,floor(s.price_silver::numeric/2)) end,'equipment',s.equipment,'catalogLoot',true);
end $$;
revoke all on function public.bastide_catalog_item(jsonb) from public,anon,authenticated;
grant execute on function public.bastide_catalog_item(jsonb) to service_role;
