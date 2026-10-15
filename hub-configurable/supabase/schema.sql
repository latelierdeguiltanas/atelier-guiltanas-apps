-- Hub configurable beta 1. Additive and isolated: no existing hub objects modified.
begin;
create schema if not exists hcfg_private;
revoke all on schema hcfg_private from public;
grant usage on schema hcfg_private to authenticated;

create table public.hcfg_campaigns (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id),
 name text not null check(length(name) between 1 and 100), description text not null default '' check(length(description)<=4000),
 settings jsonb not null default '{}' check(jsonb_typeof(settings)='object' and octet_length(settings::text)<=20000),
 revision integer not null default 1, created_at timestamptz not null default now()
);
create table public.hcfg_members (
 campaign_id uuid not null references public.hcfg_campaigns(id) on delete cascade,
 user_id uuid not null references auth.users(id), display_name text not null check(length(display_name) between 1 and 80),
 primary key(campaign_id,user_id), joined_at timestamptz not null default now()
);
create table public.hcfg_records (
 id uuid primary key default gen_random_uuid(), campaign_id uuid not null references public.hcfg_campaigns(id) on delete cascade,
 kind text not null check(kind in ('character','journal','document','message','note','item','feedback')),
 title text not null check(length(title) between 1 and 160), body text not null default '' check(length(body)<=30000),
 data jsonb not null default '{}' check(jsonb_typeof(data)='object' and octet_length(data::text)<=100000),
 visibility text not null default 'group' check(visibility in ('group','mj')),
 owner_id uuid not null default auth.uid() references auth.users(id), revision integer not null default 1,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index hcfg_records_campaign_kind on public.hcfg_records(campaign_id,kind,created_at);
create index hcfg_members_user on public.hcfg_members(user_id,campaign_id);
create index hcfg_campaign_owner on public.hcfg_campaigns(owner_id);
create table hcfg_private.invites (
 token_hash text primary key, campaign_id uuid not null references public.hcfg_campaigns(id) on delete cascade,
 expires_at timestamptz not null, created_at timestamptz not null default now()
);
alter table public.hcfg_campaigns enable row level security;
alter table public.hcfg_members enable row level security;
alter table public.hcfg_records enable row level security;
alter table hcfg_private.invites enable row level security;
revoke all on hcfg_private.invites from public,anon,authenticated;

create function hcfg_private.is_owner(cid uuid) returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(select 1 from public.hcfg_campaigns where id=cid and owner_id=auth.uid())
$$;
create function hcfg_private.is_member(cid uuid) returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and (hcfg_private.is_owner(cid) or exists(select 1 from public.hcfg_members where campaign_id=cid and user_id=auth.uid()))
$$;
revoke all on function hcfg_private.is_owner(uuid),hcfg_private.is_member(uuid) from public;
grant execute on function hcfg_private.is_owner(uuid),hcfg_private.is_member(uuid) to authenticated;

create policy hcfg_campaign_read on public.hcfg_campaigns for select to authenticated using(hcfg_private.is_member(id));
create policy hcfg_campaign_update on public.hcfg_campaigns for update to authenticated using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()));
create policy hcfg_member_read on public.hcfg_members for select to authenticated using(hcfg_private.is_member(campaign_id));
create policy hcfg_member_remove on public.hcfg_members for delete to authenticated using(hcfg_private.is_owner(campaign_id) and user_id<>(select auth.uid()));
create policy hcfg_record_read on public.hcfg_records for select to authenticated using(hcfg_private.is_owner(campaign_id) or (visibility='group' and hcfg_private.is_member(campaign_id)));
create policy hcfg_record_insert on public.hcfg_records for insert to authenticated with check(
 hcfg_private.is_owner(campaign_id) or (hcfg_private.is_member(campaign_id) and owner_id=(select auth.uid()) and visibility='group' and kind in ('character','message','feedback')));
create policy hcfg_record_update on public.hcfg_records for update to authenticated using(
 hcfg_private.is_owner(campaign_id) or (hcfg_private.is_member(campaign_id) and owner_id=(select auth.uid()) and visibility='group' and kind in ('character','message','feedback')))
 with check(hcfg_private.is_owner(campaign_id) or (hcfg_private.is_member(campaign_id) and owner_id=(select auth.uid()) and visibility='group' and kind in ('character','message','feedback')));
create policy hcfg_record_delete on public.hcfg_records for delete to authenticated using(hcfg_private.is_owner(campaign_id) or (hcfg_private.is_member(campaign_id) and owner_id=(select auth.uid()) and visibility='group' and kind in ('character','message','feedback')));

create function hcfg_private.bump_revision() returns trigger language plpgsql set search_path='' as $$
begin new.revision=old.revision+1; if tg_table_name='hcfg_records' then new.updated_at=now(); end if; return new; end $$;
create trigger hcfg_campaign_revision before update on public.hcfg_campaigns for each row execute function hcfg_private.bump_revision();
create trigger hcfg_record_revision before update on public.hcfg_records for each row execute function hcfg_private.bump_revision();
revoke all on function hcfg_private.bump_revision() from public;

create function hcfg_private.create_campaign(p_name text,p_display_name text) returns uuid language plpgsql security definer set search_path='' as $$
declare cid uuid;
begin
 if auth.uid() is null then raise exception 'Connexion requise'; end if;
 if (select count(*) from public.hcfg_campaigns where owner_id=auth.uid())>=20 then raise exception 'Limite de 20 campagnes atteinte'; end if;
 insert into public.hcfg_campaigns(owner_id,name) values(auth.uid(),btrim(p_name)) returning id into cid;
 insert into public.hcfg_members(campaign_id,user_id,display_name) values(cid,auth.uid(),btrim(p_display_name));
 return cid;
end $$;
create function hcfg_private.create_invite(p_campaign_id uuid) returns text language plpgsql security definer set search_path='' as $$
declare token text;
begin
 if auth.uid() is null or not hcfg_private.is_owner(p_campaign_id) then raise exception 'Accès MJ requis'; end if;
 delete from hcfg_private.invites where campaign_id=p_campaign_id;
 token=encode(extensions.gen_random_bytes(32),'hex');
 insert into hcfg_private.invites(token_hash,campaign_id,expires_at) values(encode(extensions.digest(token,'sha256'),'hex'),p_campaign_id,now()+interval '30 days');
 return token;
end $$;
create function hcfg_private.join_campaign(p_token text,p_display_name text) returns uuid language plpgsql security definer set search_path='' as $$
declare cid uuid;
begin
 if auth.uid() is null then raise exception 'Connexion requise'; end if;
 if length(p_token)<>64 then raise exception 'Invitation invalide'; end if;
 select campaign_id into cid from hcfg_private.invites where token_hash=encode(extensions.digest(p_token,'sha256'),'hex') and expires_at>now();
 if cid is null then raise exception 'Invitation expirée ou remplacée : demander un nouveau lien au MJ'; end if;
 insert into public.hcfg_members(campaign_id,user_id,display_name) values(cid,auth.uid(),btrim(p_display_name)) on conflict(campaign_id,user_id) do nothing;
 return cid;
end $$;
create function hcfg_private.revoke_invite(p_campaign_id uuid) returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or not hcfg_private.is_owner(p_campaign_id) then raise exception 'Accès MJ requis'; end if;
 delete from hcfg_private.invites where campaign_id=p_campaign_id;
end $$;
revoke all on function hcfg_private.create_campaign(text,text),hcfg_private.create_invite(uuid),hcfg_private.join_campaign(text,text),hcfg_private.revoke_invite(uuid) from public;
grant execute on function hcfg_private.create_campaign(text,text),hcfg_private.create_invite(uuid),hcfg_private.join_campaign(text,text),hcfg_private.revoke_invite(uuid) to authenticated;

create function public.hcfg_create_campaign(p_name text,p_display_name text) returns uuid language sql security invoker set search_path='' as $$select hcfg_private.create_campaign(p_name,p_display_name)$$;
create function public.hcfg_create_invite(p_campaign_id uuid) returns text language sql security invoker set search_path='' as $$select hcfg_private.create_invite(p_campaign_id)$$;
create function public.hcfg_join_campaign(p_token text,p_display_name text) returns uuid language sql security invoker set search_path='' as $$select hcfg_private.join_campaign(p_token,p_display_name)$$;
create function public.hcfg_revoke_invite(p_campaign_id uuid) returns void language sql security invoker set search_path='' as $$select hcfg_private.revoke_invite(p_campaign_id)$$;
revoke all on function public.hcfg_create_campaign(text,text),public.hcfg_create_invite(uuid),public.hcfg_join_campaign(text,text),public.hcfg_revoke_invite(uuid) from public,anon;
grant execute on function public.hcfg_create_campaign(text,text),public.hcfg_create_invite(uuid),public.hcfg_join_campaign(text,text),public.hcfg_revoke_invite(uuid) to authenticated;
revoke all on public.hcfg_campaigns,public.hcfg_members,public.hcfg_records from anon,authenticated;
grant select on public.hcfg_campaigns,public.hcfg_members,public.hcfg_records to authenticated;
grant update(name,description,settings) on public.hcfg_campaigns to authenticated;
grant insert(campaign_id,kind,title,body,data,visibility,owner_id),update(title,body,data,visibility,owner_id),delete on public.hcfg_records to authenticated;
grant delete on public.hcfg_members to authenticated;
commit;
