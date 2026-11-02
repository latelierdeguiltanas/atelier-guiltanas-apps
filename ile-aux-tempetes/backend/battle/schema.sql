create table public.nespresso_battle (
 id boolean primary key default true check(id),revision bigint not null default 0,
 payload jsonb not null default '{"active":false,"order":[],"activeId":""}',updated_at timestamptz not null default now()
);
alter table public.nespresso_battle enable row level security;
create policy "deny direct access" on public.nespresso_battle for all to anon,authenticated using(false) with check(false);
revoke all on public.nespresso_battle from public,anon,authenticated;
grant all on public.nespresso_battle to service_role;
insert into public.nespresso_battle(id) values(true);
create function public.nespresso_publish_battle(p_actor text,p_revision bigint,p_payload jsonb,p_request uuid) returns jsonb
language plpgsql set search_path=public as $$
declare row public.nespresso_battle; cached public.nespresso_requests; signature jsonb; result jsonb;
begin
 if p_actor is null or p_actor not like 'mj:%' then raise exception 'Accès MJ requis';end if;
 if p_request is null then raise exception 'Identifiant de publication requis';end if;
 perform pg_advisory_xact_lock(642831987103);
 signature=jsonb_build_object('action','battle-publish','revision',p_revision,'payload',p_payload);
 select * into cached from nespresso_requests where actor=p_actor and request_id=p_request;
 if found then if cached.payload<>signature then raise exception 'Identifiant déjà utilisé';end if;return cached.result;end if;
 select * into row from nespresso_battle where id=true for update;
 if p_revision is distinct from row.revision then raise exception 'Conflit de combat : reconnecte ce gestionnaire avant de publier' using errcode='40001';end if;
 if jsonb_typeof(p_payload)<>'object' or jsonb_typeof(p_payload->'order')<>'array' or jsonb_typeof(p_payload->'active')<>'boolean' then raise exception 'Combat invalide';end if;
 update nespresso_battle set payload=p_payload,revision=revision+1,updated_at=now() where id=true returning * into row;
 result=jsonb_build_object('revision',row.revision,'payload',row.payload,'updatedAt',row.updated_at);
 insert into nespresso_requests(actor,request_id,payload,result) values(p_actor,p_request,signature,result);
 return result;
end;$$;
revoke all on function public.nespresso_publish_battle(text,bigint,jsonb,uuid) from public,anon,authenticated;
grant execute on function public.nespresso_publish_battle(text,bigint,jsonb,uuid) to service_role;
