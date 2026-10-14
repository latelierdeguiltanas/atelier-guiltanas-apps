-- Tools shared by the Nespresso campaign only; no rule-system data.
create table public.nespresso_messages (
 id uuid primary key default gen_random_uuid(),thread_id text not null references public.nespresso_inventories(player_id),
 author text not null check(author in ('player','mj')),content text not null default '' check(length(content)<=6000),
 link_url text not null default '',attachment jsonb,returned_at timestamptz,
 created_at timestamptz not null default now(),seen_at timestamptz
);
create index on public.nespresso_messages(thread_id,created_at,id);
create table public.nespresso_posts (
 id uuid primary key default gen_random_uuid(),author text not null,title text not null check(length(title) between 1 and 120),
 content text not null default '' check(length(content)<=30000),link_url text not null default '',
 audience text[] not null default '{}',status text not null default 'draft' check(status in ('draft','published','archived')),
 revision bigint not null default 1,created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
create table public.nespresso_post_reads (
 post_id uuid not null references public.nespresso_posts(id) on delete cascade,
 player_id text not null references public.nespresso_inventories(player_id),seen_revision bigint not null,seen_at timestamptz not null default now(),primary key(post_id,player_id)
);
create table public.nespresso_backgrounds (
 player_id text primary key references public.nespresso_inventories(player_id),
 history text not null default '',summary text not null default '',triggers text not null default '',
 situation text not null default '',next_scene text not null default '',log text not null default '',
 revision bigint not null default 0,updated_at timestamptz not null default now()
);
alter table public.nespresso_messages enable row level security;
alter table public.nespresso_posts enable row level security;
alter table public.nespresso_post_reads enable row level security;
alter table public.nespresso_backgrounds enable row level security;
create policy "deny direct access" on public.nespresso_messages for all to anon,authenticated using(false) with check(false);
create policy "deny direct access" on public.nespresso_posts for all to anon,authenticated using(false) with check(false);
create policy "deny direct access" on public.nespresso_post_reads for all to anon,authenticated using(false) with check(false);
create policy "deny direct access" on public.nespresso_backgrounds for all to anon,authenticated using(false) with check(false);
revoke all on public.nespresso_messages,public.nespresso_posts,public.nespresso_post_reads,public.nespresso_backgrounds from public,anon,authenticated;
grant all on public.nespresso_messages,public.nespresso_posts,public.nespresso_post_reads,public.nespresso_backgrounds to service_role;
insert into public.nespresso_backgrounds(player_id) select player_id from public.nespresso_inventories;

create function public.nespresso_social_mutate(p_actor text,p_admin boolean,p_action text,p_body jsonb,p_request uuid)
returns jsonb language plpgsql set search_path=public as $$
declare payload jsonb; cached public.nespresso_requests; result jsonb; thread text; item jsonb; inv public.nespresso_inventories;
 msg public.nespresso_messages; post public.nespresso_posts; bg public.nespresso_backgrounds; quantity numeric;
 v_content text; v_link text; recipients text[]; v_revision bigint; ids uuid[]; snapshot jsonb;
begin
 perform pg_advisory_xact_lock(642831987102);
 if p_actor is null or p_admin is null or (not p_admin and p_actor not in ('vax','hammerz','lelio','loris')) then raise exception 'Accès Nespresso requis';end if;
 if p_request is null then raise exception 'Identifiant de transaction requis';end if;
 payload=jsonb_build_object('socialAction',p_action,'admin',p_admin,'body',p_body);
 select * into cached from nespresso_requests where actor=p_actor and request_id=p_request;
 if found then if cached.payload<>payload then raise exception 'Identifiant déjà utilisé';end if;return cached.result;end if;
 thread=case when p_admin then p_body->>'playerId' else p_actor end;
 if p_action='message' then
 if thread not in ('vax','hammerz','lelio','loris') or thread is null then raise exception 'Conversation requise';end if;
 if not p_admin and p_body ? 'playerId' and p_body->>'playerId'<>p_actor then raise exception 'Conversation privée';end if;
 v_content=trim(coalesce(p_body->>'content',''));v_link=trim(coalesce(p_body->>'link',''));
 if length(v_content)>6000 or length(v_link)>1000 or (v_link<>'' and v_link!~'^https?://') then raise exception 'Message ou lien invalide';end if;
 if p_admin and coalesce(p_body->>'itemId','')<>'' then raise exception 'Utilise les envois MJ pour remettre un objet';end if;
 if v_content='' and v_link='' and coalesce(p_body->>'itemId','')='' then raise exception 'Message vide';end if;
 if (select count(*) from nespresso_messages where thread_id=thread and author=case when p_admin then 'mj' else 'player' end and created_at>now()-interval '1 minute')>=30 then raise exception 'Trop de messages : réessaie dans une minute';end if;
 if coalesce(p_body->>'itemId','')<>'' then
 quantity=(p_body->>'quantity')::numeric;
 if quantity is null or quantity<1 or quantity<>trunc(quantity) then raise exception 'Quantité entière requise';end if;
 select * into inv from nespresso_inventories where player_id=p_actor for update;
 if not inv.initialized then raise exception 'Synchronise ton sac avant de remettre un objet';end if;
 select value into item from jsonb_array_elements(inv.state->'inventory') where value->>'id'=p_body->>'itemId';
 if item is null or (item->>'qty')::numeric<quantity then raise exception 'Objet ou quantité indisponible';end if;
 if coalesce((item->>'equipped')::boolean,false) then raise exception 'Déséquipe cet objet avant de le remettre';end if;
 if exists(select 1 from jsonb_array_elements(inv.state->'inventory') where value->>'containerId'=item->>'id') then raise exception 'Vide le conteneur avant de le remettre';end if;
 snapshot=item||jsonb_build_object('id',gen_random_uuid()::text,'qty',quantity,'containerId','','equipped',false,'weight',coalesce((item->>'weight')::numeric,0)*quantity/(item->>'qty')::numeric);
 update nespresso_inventories set state=jsonb_set(state,'{inventory}',coalesce((select jsonb_agg(case when value->>'id'=item->>'id' then value||jsonb_build_object('qty',(value->>'qty')::numeric-quantity,'weight',coalesce((value->>'weight')::numeric,0)*((value->>'qty')::numeric-quantity)/(value->>'qty')::numeric) else value end) from jsonb_array_elements(state->'inventory') where value->>'id'<>item->>'id' or (value->>'qty')::numeric>quantity),'[]')),revision=revision+1,updated_at=now() where player_id=p_actor;
 insert into nespresso_events(player_id,action,summary,details) values(p_actor,'to-mj','Objet remis au MJ : '||(item->>'name'),jsonb_build_object('quantity',quantity,'requestId',p_request));
 end if;
 insert into nespresso_messages(thread_id,author,content,link_url,attachment) values(thread,case when p_admin then 'mj' else 'player' end,v_content,v_link,snapshot) returning * into msg;
 result=jsonb_build_object('id',msg.id);
 elsif p_action='return-item' then
 if not p_admin then raise exception 'Accès MJ requis';end if;
 select * into msg from nespresso_messages where id=(p_body->>'id')::uuid for update;
 if not found or msg.attachment is null then raise exception 'Objet reçu introuvable';end if;
 if msg.returned_at is null then
 select * into inv from nespresso_inventories where player_id=msg.thread_id for update;
 update nespresso_inventories set state=jsonb_set(state,'{inventory}',(state->'inventory')||jsonb_build_array(msg.attachment)),revision=revision+1,updated_at=now() where player_id=msg.thread_id;
 update nespresso_messages set returned_at=now() where id=msg.id;
 insert into nespresso_events(player_id,action,summary,details) values(msg.thread_id,'from-mj','Objet rendu par le MJ : '||(msg.attachment->>'name'),jsonb_build_object('quantity',msg.attachment->'qty','requestId',p_request));
 end if;result=jsonb_build_object('ok',true,'returned',true);
 elsif p_action='messages-seen' then
 if thread not in ('vax','hammerz','lelio','loris') or thread is null then raise exception 'Conversation requise';end if;
 select coalesce(array_agg(value::uuid),'{}') into ids from jsonb_array_elements_text(coalesce(p_body->'ids','[]'));
 update nespresso_messages set seen_at=now() where thread_id=thread and id=any(ids) and seen_at is null and author=case when p_admin then 'player' else 'mj' end;
 result=jsonb_build_object('ok',true);
 elsif p_action='post-save' then
 if coalesce(p_body->>'id','')<>'' then select * into post from nespresso_posts where id=(p_body->>'id')::uuid for update;if not found then raise exception 'Information introuvable';end if;
 if not p_admin and post.author<>p_actor then raise exception 'Modification réservée à l’auteur';end if;
 if (p_body->>'revision')::bigint is distinct from post.revision then raise exception 'Information modifiée ailleurs : recharge avant d’enregistrer';end if;end if;
 v_content=coalesce(p_body->>'content','');v_link=trim(coalesce(p_body->>'link_url',''));
 if length(trim(coalesce(p_body->>'title',''))) not between 1 and 120 or length(v_content)>30000 or length(v_link)>1000 or (v_link<>'' and v_link!~'^https?://') then raise exception 'Titre, texte ou lien invalide';end if;
 select coalesce(array_agg(distinct value),'{}') into recipients from jsonb_array_elements_text(coalesce(p_body->'audience','[]'));
 if not recipients<@array['vax','hammerz','lelio','loris'] then raise exception 'Destinataire étranger à Nespresso';end if;
 if p_body->>'status' not in ('draft','published','archived') or p_body->>'status' is null then raise exception 'État invalide';end if;
 if p_body->>'status'='published' and cardinality(recipients)=0 then raise exception 'Choisis les destinataires';end if;
 if post.id is null then
 insert into nespresso_posts(author,title,content,link_url,audience,status) values(case when p_admin then 'mj' else p_actor end,trim(p_body->>'title'),v_content,v_link,recipients,p_body->>'status') returning * into post;
 else update nespresso_posts set title=trim(p_body->>'title'),content=v_content,link_url=v_link,audience=recipients,status=p_body->>'status',revision=nespresso_posts.revision+1,updated_at=now() where id=post.id returning * into post;end if;
 result=jsonb_build_object('id',post.id,'revision',post.revision);
 elsif p_action='post-seen' then
 if p_admin then raise exception 'La consultation MJ ne marque pas les informations joueur comme lues';end if;
 select * into post from nespresso_posts where id=(p_body->>'id')::uuid;
 if not found or post.status<>'published' or not p_actor=any(post.audience) then raise exception 'Information non accessible';end if;
 if (p_body->>'revision')::bigint is distinct from post.revision then raise exception 'Cette information a changé : recharge-la';end if;
 insert into nespresso_post_reads(post_id,player_id,seen_revision) values(post.id,p_actor,post.revision)
 on conflict(post_id,player_id) do update set seen_revision=excluded.seen_revision,seen_at=now();result=jsonb_build_object('ok',true);
 elsif p_action='background-save' then
 if not p_admin then raise exception 'Accès MJ requis';end if;
 select * into bg from nespresso_backgrounds where player_id=thread for update;if not found then raise exception 'Personnage introuvable';end if;
 if (p_body->>'revision')::bigint is distinct from bg.revision then raise exception 'Dossier modifié ailleurs : recharge avant d’enregistrer';end if;
 if exists(select 1 from unnest(array['history','summary','triggers','situation','next_scene','log']) k where length(coalesce(p_body->>k,''))>30000) then raise exception 'Texte trop long';end if;
 update nespresso_backgrounds set history=coalesce(p_body->>'history',''),summary=coalesce(p_body->>'summary',''),triggers=coalesce(p_body->>'triggers',''),situation=coalesce(p_body->>'situation',''),next_scene=coalesce(p_body->>'next_scene',''),log=coalesce(p_body->>'log',''),revision=nespresso_backgrounds.revision+1,updated_at=now() where player_id=thread returning nespresso_backgrounds.revision into v_revision;
 result=jsonb_build_object('ok',true,'revision',v_revision);
 else raise exception 'Action inconnue';end if;
 insert into nespresso_requests(actor,request_id,payload,result) values(p_actor,p_request,payload,result);
 return result;
end;$$;
revoke all on function public.nespresso_social_mutate(text,boolean,text,jsonb,uuid) from public,anon,authenticated;
grant execute on function public.nespresso_social_mutate(text,boolean,text,jsonb,uuid) to service_role;
