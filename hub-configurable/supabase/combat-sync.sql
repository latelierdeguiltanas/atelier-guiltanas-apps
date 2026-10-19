-- Synchronisation du gestionnaire de combat par l'accès MJ existant du hub.
begin;

create table if not exists hcfg_private.combat_spaces(
  space_id uuid primary key references hcfg_private.link_spaces(id) on delete cascade,
  library jsonb not null,
  revision integer not null default 1,
  updated_at timestamptz not null default now()
);

alter table hcfg_private.combat_spaces enable row level security;
revoke all on hcfg_private.combat_spaces from public, anon, authenticated;

create or replace function hcfg_private.combat_api(
  p_action text,
  p_space uuid,
  p_token text,
  p_data jsonb
) returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare
  k record;
  row_data record;
  expected_revision integer;
  incoming jsonb;
begin
  if p_token is null or p_token !~ '^[a-f0-9]{64}$' then
    raise exception 'Lien d’accès invalide';
  end if;
  if p_data is null or jsonb_typeof(p_data) <> 'object' or octet_length(p_data::text) > 12000000 then
    raise exception 'Données invalides ou trop volumineuses';
  end if;

  select role into k
  from hcfg_private.link_keys
  where space_id=p_space
    and token_hash=encode(extensions.digest(p_token,'sha256'),'hex');

  if not found then raise exception 'Lien désactivé ou espace introuvable'; end if;
  if k.role <> 'mj' then raise exception 'Accès MJ requis'; end if;

  if p_action='get' then
    select library,revision,updated_at into row_data
    from hcfg_private.combat_spaces where space_id=p_space;
    if not found then
      return jsonb_build_object('library',null,'revision',0,'updated_at',null);
    end if;
    return jsonb_build_object('library',row_data.library,'revision',row_data.revision,'updated_at',row_data.updated_at);
  end if;

  if p_action <> 'save' then raise exception 'Action inconnue'; end if;
  incoming=p_data->'library';
  expected_revision=coalesce((p_data->>'expected')::integer,-1);
  if incoming is null or jsonb_typeof(incoming)<>'object' or jsonb_typeof(incoming->'campaigns')<>'array' then
    raise exception 'Bibliothèque de combat invalide';
  end if;
  if jsonb_array_length(incoming->'campaigns')<1 or jsonb_array_length(incoming->'campaigns')>100 then
    raise exception 'Nombre de campagnes invalide';
  end if;

  select library,revision,updated_at into row_data
  from hcfg_private.combat_spaces where space_id=p_space for update;
  if not found then
    if expected_revision<>0 then raise exception 'CONFLICT: les combats ont été créés sur un autre appareil'; end if;
    insert into hcfg_private.combat_spaces(space_id,library,revision) values(p_space,incoming,1);
    return jsonb_build_object('ok',true,'revision',1);
  end if;
  if row_data.revision<>expected_revision then
    raise exception 'CONFLICT: les combats ont été modifiés sur un autre appareil';
  end if;
  update hcfg_private.combat_spaces
    set library=incoming,revision=row_data.revision+1,updated_at=now()
    where space_id=p_space;
  return jsonb_build_object('ok',true,'revision',row_data.revision+1);
end$$;

revoke all on function hcfg_private.combat_api(text,uuid,text,jsonb) from public;
grant execute on function hcfg_private.combat_api(text,uuid,text,jsonb) to anon,authenticated;

create or replace function public.hcfg_combat_api(
  p_action text,
  p_space uuid,
  p_token text,
  p_data jsonb default '{}'
) returns jsonb
language sql
security invoker
set search_path=''
as $$ select hcfg_private.combat_api(p_action,p_space,p_token,p_data) $$;

revoke all on function public.hcfg_combat_api(text,uuid,text,jsonb) from public;
grant execute on function public.hcfg_combat_api(text,uuid,text,jsonb) to anon,authenticated;

commit;
