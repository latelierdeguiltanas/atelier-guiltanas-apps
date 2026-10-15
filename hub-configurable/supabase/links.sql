-- Beta 2: explicitly authorized bearer links; no Auth account, email or service key.
begin;
create table hcfg_private.link_spaces(id uuid primary key,state jsonb not null,created_at timestamptz not null default now());
create table hcfg_private.link_keys(token_hash text primary key,space_id uuid not null references hcfg_private.link_spaces(id) on delete cascade,role text not null check(role in ('mj','pj')),character_id text);
create index hcfg_link_keys_space on hcfg_private.link_keys(space_id);
create table hcfg_private.link_operations(space_id uuid not null references hcfg_private.link_spaces(id) on delete cascade,op_id uuid not null,result jsonb not null,primary key(space_id,op_id));
alter table hcfg_private.link_spaces enable row level security;
alter table hcfg_private.link_keys enable row level security;
alter table hcfg_private.link_operations enable row level security;
revoke all on hcfg_private.link_spaces,hcfg_private.link_keys,hcfg_private.link_operations from public,anon,authenticated;
create function hcfg_private.link_api(p_action text,p_space uuid,p_token text,p_data jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare s jsonb; k record; rec jsonb; old jsonb; rows jsonb; cid text; tok text; result jsonb; op uuid; cr integer;
begin
 if p_token is null or p_token !~ '^[a-f0-9]{64}$' then raise exception 'Lien d’accès invalide'; end if;
 if p_data is null or jsonb_typeof(p_data)<>'object' or octet_length(p_data::text)>5000000 then raise exception 'Données invalides ou trop volumineuses'; end if;
 if p_action='create' then
  insert into hcfg_private.link_spaces(id,state) values(p_space,jsonb_build_object('campaign',jsonb_build_object('id',p_space,'name',left(coalesce(nullif(btrim(p_data->>'name'),''),'Nouvelle aventure'),100),'description','','format',case when p_data->>'format'='oneshot' then 'oneshot' else 'campaign' end,'settings','{}'::jsonb,'revision',1,'owner_id','mj'),'records','[]'::jsonb)) on conflict(id) do nothing;
  if not exists(select 1 from hcfg_private.link_keys where space_id=p_space) then
   insert into hcfg_private.link_keys(token_hash,space_id,role) values(encode(extensions.digest(p_token,'sha256'),'hex'),p_space,'mj');
  end if;
 end if;
 select * into k from hcfg_private.link_keys where space_id=p_space and token_hash=encode(extensions.digest(p_token,'sha256'),'hex');
 if not found then raise exception 'Lien désactivé ou espace introuvable'; end if;
 select state into s from hcfg_private.link_spaces where id=p_space for update;
 if p_action not in ('get','create') then
  op=(p_data->>'op_id')::uuid;
  if op is null then raise exception 'Identifiant d’opération manquant'; end if;
  select o.result into result from hcfg_private.link_operations o where o.space_id=p_space and o.op_id=op;
  if found then return result; end if;
  if p_action='save' then
   rec=p_data->'record';cid=rec->>'id';
   if cid is null or cid !~ '^[a-f0-9-]{36}$' or coalesce(rec->>'kind','') not in ('character','journal','document','message','note','item','feedback') or coalesce(length(btrim(rec->>'title')),0) not between 1 and 160 or coalesce(length(rec->>'body'),0)>30000 or jsonb_typeof(rec->'data')<>'object' or coalesce(rec->>'visibility','') not in ('group','mj') then raise exception 'Contenu invalide'; end if;
   select value into old from jsonb_array_elements(s->'records') where value->>'id'=cid;
   cr=coalesce((old->>'revision')::integer,0);
   if cr<>coalesce((p_data->>'expected')::integer,-1) then raise exception 'CONFLICT: ce contenu a été modifié sur un autre appareil'; end if;
   if k.role='pj' then
    if rec->>'visibility'<>'group' or (old is not null and (old->>'kind'<>rec->>'kind' or old->>'visibility'<>'group')) or not ((rec->>'kind'='character' and cid=k.character_id and old is not null) or (rec->>'kind' in ('message','feedback') and (old is null or old->>'owner_id'=k.character_id))) then raise exception 'Ce lien ne permet pas cette modification'; end if;
    rec=jsonb_set(rec,'{owner_id}',to_jsonb(k.character_id));
   end if;
   if old is not null and old->>'kind'<>rec->>'kind' then raise exception 'Type non modifiable'; end if;
   if rec->>'kind'='note' then rec=jsonb_set(rec,'{visibility}','"mj"'); end if;
   rec=rec||jsonb_build_object('revision',cr+1,'created_at',coalesce(old->>'created_at',now()::text),'updated_at',now()::text);
   select coalesce(jsonb_agg(value),'[]'::jsonb) into rows from jsonb_array_elements(s->'records') where value->>'id'<>cid;
   s=jsonb_set(s,'{records}',rows||jsonb_build_array(rec));
  elsif p_action='delete' then
   cid=p_data->>'id';select value into old from jsonb_array_elements(s->'records') where value->>'id'=cid;
   if old is null or (old->>'revision')::integer<>(p_data->>'expected')::integer then raise exception 'CONFLICT: contenu modifié ou supprimé'; end if;
   if k.role<>'mj' and not (old->>'kind' in ('message','feedback') and old->>'owner_id'=k.character_id) then raise exception 'Accès MJ requis'; end if;
   select coalesce(jsonb_agg(value),'[]'::jsonb) into rows from jsonb_array_elements(s->'records') where value->>'id'<>cid;
   s=jsonb_set(s,'{records}',rows);
   delete from hcfg_private.link_keys where space_id=p_space and character_id=cid;
  elsif p_action='settings' then
   if k.role<>'mj' then raise exception 'Accès MJ requis'; end if;
   cr=(s#>>'{campaign,revision}')::integer;
   if cr<>(p_data->>'expected')::integer then raise exception 'CONFLICT: réglages modifiés ailleurs'; end if;
   rec=p_data->'campaign';
   if coalesce(length(btrim(rec->>'name')),0) not between 1 and 100 or coalesce(length(rec->>'description'),0)>4000 or coalesce(rec->>'format','') not in ('campaign','oneshot') or jsonb_typeof(rec->'settings')<>'object' then raise exception 'Réglages invalides'; end if;
   s=jsonb_set(s,'{campaign}',rec||jsonb_build_object('id',p_space,'owner_id','mj','revision',cr+1));
  elsif p_action='link' then
   if k.role<>'mj' then raise exception 'Accès MJ requis'; end if;
   cid=p_data->>'character_id';tok=p_data->>'token';
   if tok is null or tok !~ '^[a-f0-9]{64}$' or not exists(select 1 from jsonb_array_elements(s->'records') where value->>'id'=cid and value->>'kind'='character') then raise exception 'Personnage ou lien invalide'; end if;
   delete from hcfg_private.link_keys where space_id=p_space and character_id=cid;
   insert into hcfg_private.link_keys(token_hash,space_id,role,character_id) values(encode(extensions.digest(tok,'sha256'),'hex'),p_space,'pj',cid);
  elsif p_action='revoke' then
   if k.role<>'mj' then raise exception 'Accès MJ requis'; end if;
   delete from hcfg_private.link_keys where space_id=p_space and character_id=p_data->>'character_id';
  else raise exception 'Action inconnue'; end if;
  if octet_length(s::text)>16000000 then raise exception 'Espace trop volumineux pour cette bêta'; end if;
  update hcfg_private.link_spaces set state=s where id=p_space;
  result=jsonb_build_object('ok',true);
  insert into hcfg_private.link_operations(space_id,op_id,result) values(p_space,op,result);
  return result;
 end if;
 if k.role='pj' then
  select coalesce(jsonb_agg(value),'[]'::jsonb) into rows from jsonb_array_elements(s->'records') where value->>'visibility'='group' and value->>'kind'<>'note' and (value->>'kind'<>'character' or value->>'id'=k.character_id);
  s=jsonb_set(s,'{records}',rows);
 end if;
 return jsonb_build_object('state',s,'role',k.role,'character_id',k.character_id);
end$$;
revoke all on function hcfg_private.link_api(text,uuid,text,jsonb) from public;
grant execute on function hcfg_private.link_api(text,uuid,text,jsonb) to anon,authenticated;
grant usage on schema hcfg_private to anon;
create function public.hcfg_link_api(p_action text,p_space uuid,p_token text,p_data jsonb default '{}') returns jsonb language sql security invoker set search_path='' as $$select hcfg_private.link_api(p_action,p_space,p_token,p_data)$$;
revoke all on function public.hcfg_link_api(text,uuid,text,jsonb) from public;
grant execute on function public.hcfg_link_api(text,uuid,text,jsonb) to anon,authenticated;
commit;
