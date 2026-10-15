-- Private beta usage counters. No campaign text, PDF fields, messages, IP or user agent.
begin;
create table hcfg_private.metrics_admin (id boolean primary key default true check(id),token_hash text not null);
create table hcfg_private.usage_events (
 event_id uuid primary key,space_id uuid not null references hcfg_private.link_spaces(id) on delete cascade,
 access_id text not null,role text not null,character_id text,event text not null,tool text,
 session_id uuid not null,created_at timestamptz not null default now()
);
create index hcfg_usage_space_time on hcfg_private.usage_events(space_id,created_at);
create index hcfg_usage_time on hcfg_private.usage_events(created_at);
alter table hcfg_private.metrics_admin enable row level security;
alter table hcfg_private.usage_events enable row level security;
revoke all on hcfg_private.metrics_admin,hcfg_private.usage_events from public,anon,authenticated;
create function hcfg_private.track_usage(p_space uuid,p_token text,p_events jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare k record;e jsonb;ev text;tl text;accepted integer=0;
begin
 if p_token is null or p_token !~ '^[a-f0-9]{64}$' then raise exception 'Accès invalide';end if;
 select * into k from hcfg_private.link_keys where space_id=p_space and token_hash=encode(extensions.digest(p_token,'sha256'),'hex');
 if not found then raise exception 'Accès invalide';end if;
 if jsonb_typeof(p_events)<>'array' or jsonb_array_length(p_events)>50 then raise exception 'Lot invalide';end if;
 delete from hcfg_private.usage_events where created_at<now()-interval '90 days';
 for e in select value from jsonb_array_elements(p_events) loop
  ev=e->>'event';tl=e->>'tool';
  if ev not in ('open','tool','character_open','import_success','import_error','sync_error','sync_conflict','backup','link_created') then continue;end if;
  if tl is not null and tl not in ('overview','settings','character','journal','document','message','note','item','feedback') then tl=null;end if;
  -- Bound accidental/flooded volume per valid link; telemetry never blocks app usage.
  if (select count(*) from hcfg_private.usage_events where space_id=p_space and access_id=encode(extensions.digest('usage:'||k.token_hash,'sha256'),'hex') and created_at>now()-interval '1 minute')>=60 then exit;end if;
  insert into hcfg_private.usage_events(event_id,space_id,access_id,role,character_id,event,tool,session_id)
  values((e->>'id')::uuid,p_space,encode(extensions.digest('usage:'||k.token_hash,'sha256'),'hex'),k.role,k.character_id,ev,tl,(e->>'session')::uuid)
  on conflict(event_id) do nothing;
  accepted=accepted+1;
 end loop;
 return jsonb_build_object('ok',true,'accepted',accepted);
end$$;
revoke all on function hcfg_private.track_usage(uuid,text,jsonb) from public;
grant execute on function hcfg_private.track_usage(uuid,text,jsonb) to anon,authenticated;
create function public.hcfg_track_usage(p_space uuid,p_token text,p_events jsonb) returns jsonb language sql security invoker set search_path='' as $$ select hcfg_private.track_usage(p_space,p_token,p_events) $$;
revoke all on function public.hcfg_track_usage(uuid,text,jsonb) from public;
grant execute on function public.hcfg_track_usage(uuid,text,jsonb) to anon,authenticated;
create function hcfg_private.usage_report(p_token text) returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb;
begin
 if p_token is null or p_token !~ '^[a-f0-9]{64}$' or not exists(select 1 from hcfg_private.metrics_admin where token_hash=encode(extensions.digest(p_token,'sha256'),'hex')) then raise exception 'Accès au suivi refusé';end if;
 with spaces as (
 select s.id,s.created_at,s.state#>>'{campaign,format}' as format,
 (select count(*) from jsonb_array_elements(s.state->'records') r where r->>'kind'='character') as characters,
 (select count(*) from jsonb_array_elements(s.state->'records') r where r->>'kind'='character' and (r#>>'{data,pdf}' is not null or r#>>'{data,source}' is not null)) as imported,
 (select count(*) from hcfg_private.link_keys k where k.space_id=s.id and k.role='pj') as player_links,
 (select max(created_at) from hcfg_private.usage_events e where e.space_id=s.id) as last_active,
 (select count(distinct session_id) from hcfg_private.usage_events e where e.space_id=s.id and e.event='open') as sessions,
 (select count(distinct access_id) from hcfg_private.usage_events e where e.space_id=s.id and e.event='open' and e.role='pj') as activated_player_links
 from hcfg_private.link_spaces s
 ),event_counts as (select event,role,count(*) as count from hcfg_private.usage_events group by event,role),
 tools as (select tool,role,count(*) as count from hcfg_private.usage_events where event='tool' group by tool,role),
 daily as (select (created_at at time zone 'Europe/Paris')::date as date,count(distinct space_id) as active_spaces,count(distinct (space_id,session_id)) filter(where event='open') as sessions from hcfg_private.usage_events where created_at>now()-interval '30 days' group by 1),
 accesses as (select space_id,role,character_id,left(access_id,10) as access_code,max(created_at) as last_active,count(distinct session_id) filter(where event='open') as sessions from hcfg_private.usage_events group by space_id,role,character_id,access_id)
 select jsonb_build_object('generated_at',now(),'retention_days',90,
 'totals',jsonb_build_object('spaces',(select count(*) from spaces),'campaigns',(select count(*) from spaces where format='campaign'),'oneshots',(select count(*) from spaces where format='oneshot'),'characters',coalesce((select sum(characters) from spaces),0),'player_links',coalesce((select sum(player_links) from spaces),0),'active_1d',(select count(*) from spaces where last_active>now()-interval '1 day'),'active_7d',(select count(*) from spaces where last_active>now()-interval '7 days'),'active_30d',(select count(*) from spaces where last_active>now()-interval '30 days'),'activated_player_links',coalesce((select sum(activated_player_links) from spaces),0),'returning_spaces',(select count(*) from (select space_id from hcfg_private.usage_events group by space_id having count(distinct (created_at at time zone 'Europe/Paris')::date)>1) x)),
 'spaces',coalesce((select jsonb_agg(to_jsonb(spaces) order by last_active desc nulls last) from spaces),'[]'),
 'events',coalesce((select jsonb_agg(to_jsonb(event_counts)) from event_counts),'[]'),
 'tools',coalesce((select jsonb_agg(to_jsonb(tools)) from tools),'[]'),
 'daily',coalesce((select jsonb_agg(to_jsonb(daily) order by date) from daily),'[]'),
 'accesses',coalesce((select jsonb_agg(to_jsonb(accesses) order by last_active desc) from accesses),'[]')) into result;
 return result;
end$$;
revoke all on function hcfg_private.usage_report(text) from public;
grant execute on function hcfg_private.usage_report(text) to anon,authenticated;
create function public.hcfg_usage_report(p_token text) returns jsonb language sql security invoker set search_path='' as $$ select hcfg_private.usage_report(p_token) $$;
revoke all on function public.hcfg_usage_report(text) from public;
grant execute on function public.hcfg_usage_report(text) to anon,authenticated;
commit;
