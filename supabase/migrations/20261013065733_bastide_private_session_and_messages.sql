-- Private data: only the authenticated Edge service may access these tables/RPCs.
create table if not exists public.bastide_messages (
 id uuid primary key default gen_random_uuid(), player_id text not null references public.bastide_players(id),
 direction text not null check(direction in ('player','mj')), content text not null default '',
 attachment jsonb, returned_at timestamptz, seen_at timestamptz, created_at timestamptz not null default now(),
 request_id uuid not null unique
);
create index if not exists bastide_messages_thread_idx on public.bastide_messages(player_id,created_at desc);
create table if not exists public.bastide_battle (
 id text primary key default 'current' check(id='current'), payload jsonb not null default '{}',
 revision bigint not null default 0, updated_at timestamptz not null default now()
);
insert into public.bastide_battle(id) values ('current') on conflict do nothing;
create table if not exists public.bastide_resources (
 player_id text primary key references public.bastide_players(id), hp integer not null, pm integer not null,
 hp_max integer not null, pm_max integer not null, revision bigint not null default 0, updated_at timestamptz not null default now(),
 check(hp>=0 and hp<=hp_max and pm>=0 and pm<=pm_max)
);
create table if not exists public.bastide_backgrounds (
 player_id text primary key references public.bastide_players(id), source_text text not null default '',
 summary text not null default '', triggers text not null default '', current_status text not null default '',
 next_step text not null default '', journal text not null default '', revision bigint not null default 0, updated_at timestamptz not null default now()
);
alter table public.bastide_scenario_items add column if not exists player_description text not null default '';
alter table public.bastide_scenario_items add column if not exists mj_notes text not null default '';
alter table public.bastide_messages enable row level security;
alter table public.bastide_battle enable row level security;
alter table public.bastide_resources enable row level security;
alter table public.bastide_backgrounds enable row level security;
revoke all on public.bastide_messages,public.bastide_battle,public.bastide_resources,public.bastide_backgrounds from public,anon,authenticated;
grant all on public.bastide_messages,public.bastide_battle,public.bastide_resources,public.bastide_backgrounds to service_role;

create or replace function public.bastide_message_send(p_player text,p_direction text,p_content text,p_item_id text,p_quantity integer,p_request uuid)
returns jsonb language plpgsql security invoker set search_path=public as $$
declare s jsonb; inv jsonb; item jsonb; remaining integer; mid uuid;
begin
 perform pg_advisory_xact_lock(hashtextextended(p_request::text,0));
 select id into mid from bastide_messages where request_id=p_request and player_id=p_player and direction=p_direction;
 if mid is not null then return jsonb_build_object('id',mid,'kept',true); end if;
 if p_direction not in ('player','mj') or length(p_content)>12000 then raise exception 'Message invalide'; end if;
 if coalesce(p_item_id,'')<>'' then
  if p_direction<>'player' or p_quantity<1 then raise exception 'Transfert invalide'; end if;
  select state into s from bastide_players where id=p_player for update;
  inv:=coalesce(s->'inventory','[]'::jsonb);
  select x into item from jsonb_array_elements(inv) x where x->>'id'=p_item_id;
  if item is null or item->>'containerType'='pollen-bag' then raise exception 'Objet indisponible'; end if;
  if exists(select 1 from jsonb_array_elements(inv) x where x->>'containerId'=p_item_id) then raise exception 'Vide le conteneur avant de l’envoyer'; end if;
  remaining:=coalesce((item->>'quantity')::integer,0)-p_quantity;
  if remaining<0 then raise exception 'Quantité insuffisante'; end if;
  select coalesce(jsonb_agg(case when x->>'id'=p_item_id then jsonb_set(x,'{quantity}',to_jsonb(remaining)) else x end),'[]'::jsonb) into inv from jsonb_array_elements(inv) x where x->>'id'<>p_item_id or remaining>0;
  update bastide_players set state=jsonb_set(s,'{inventory}',inv),updated_at=now() where id=p_player;
  item:=item||jsonb_build_object('quantity',p_quantity,'equipped',false,'containerId','');
 end if;
 if trim(p_content)='' and item is null then raise exception 'Message vide'; end if;
 insert into bastide_messages(player_id,direction,content,attachment,request_id) values(p_player,p_direction,p_content,item,p_request) returning id into mid;
 if item is not null then insert into bastide_inventory_events(player_id,event_type,summary,details) values(p_player,'to-mj','Objet envoyé au MJ : '||(item->>'name'),jsonb_build_object('messageId',mid,'quantity',p_quantity)); end if;
 return jsonb_build_object('id',mid);
end $$;
create or replace function public.bastide_message_return(p_id uuid)
returns jsonb language plpgsql security invoker set search_path=public as $$
declare m bastide_messages%rowtype; s jsonb; item jsonb;
begin
 select * into m from bastide_messages where id=p_id for update;
 if m.id is null or m.attachment is null or m.direction<>'player' then raise exception 'Objet introuvable'; end if;
 if m.returned_at is not null then return jsonb_build_object('kept',true); end if;
 select state into s from bastide_players where id=m.player_id for update;
 item:=m.attachment||jsonb_build_object('id','retour-mj-'||m.id,'source','mj','receivedAt',now(),'equipped',false,'containerId',case when m.player_id='zepheline' then 'zepheline-besace-pollen' else '' end);
 update bastide_players set state=jsonb_set(s,'{inventory}',coalesce(s->'inventory','[]')||jsonb_build_array(item)),updated_at=now() where id=m.player_id;
 update bastide_messages set returned_at=now() where id=m.id;
 insert into bastide_inventory_events(player_id,event_type,summary,details) values(m.player_id,'from-mj','Objet rendu par le MJ : '||(item->>'name'),jsonb_build_object('messageId',m.id));
 return jsonb_build_object('ok',true);
end $$;
create or replace function public.bastide_resource_change(p_player text,p_revision bigint,p_hp integer,p_pm integer)
returns jsonb language plpgsql security invoker set search_path=public as $$
declare r bastide_resources%rowtype;
begin
 select * into r from bastide_resources where player_id=p_player for update;
 if r.player_id is null then raise exception 'Ressources non initialisées'; end if;
 if r.revision<>p_revision then return jsonb_build_object('conflict',true,'resource',to_jsonb(r)); end if;
 update bastide_resources set hp=least(hp_max,greatest(0,coalesce(p_hp,hp))),pm=least(pm_max,greatest(0,coalesce(p_pm,pm))),revision=revision+1,updated_at=now() where player_id=p_player returning * into r;
 return jsonb_build_object('resource',to_jsonb(r));
end $$;
revoke all on function public.bastide_message_send(text,text,text,text,integer,uuid),public.bastide_message_return(uuid),public.bastide_resource_change(text,bigint,integer,integer) from public,anon,authenticated;
grant execute on function public.bastide_message_send(text,text,text,text,integer,uuid),public.bastide_message_return(uuid),public.bastide_resource_change(text,bigint,integer,integer) to service_role;
