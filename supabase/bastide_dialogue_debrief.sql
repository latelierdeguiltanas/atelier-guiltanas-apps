-- Original conversations stay unchanged. Review metadata and profiles are MJ-only.
alter table public.bastide_mila_turns add column if not exists review_status text not null default 'new' check(review_status in ('new','useful','revise','done'));
alter table public.bastide_mila_turns add column if not exists mj_note text not null default '';
alter table public.bastide_mila_turns add column if not exists proposed_reply text not null default '';
alter table public.bastide_mila_turns add column if not exists reviewed_at timestamptz;
create table if not exists public.bastide_dialogue_profiles(
 player_id text primary key references bastide_players(id) on delete cascade,
 speech_notes text not null default '',expectations text not null default '',relationships text not null default '',campaign_notes text not null default '',updated_at timestamptz not null default now());
create table if not exists public.bastide_dialogue_debriefs(
 id uuid primary key default gen_random_uuid(),title text not null check(length(title) between 1 and 160),
 period_from timestamptz not null,period_to timestamptz not null,report text not null check(length(report)<=60000),mj_notes text not null default '',created_at timestamptz not null default now(),updated_at timestamptz not null default now(),check(period_from<=period_to));
alter table bastide_dialogue_profiles enable row level security;alter table bastide_dialogue_debriefs enable row level security;
revoke all on bastide_dialogue_profiles,bastide_dialogue_debriefs from public,anon,authenticated;
grant all on bastide_dialogue_profiles,bastide_dialogue_debriefs to service_role;
create or replace function public.bastide_dialogue_summary(p_from timestamptz,p_to timestamptz)
returns jsonb language sql stable set search_path=public as $$
 with selected as(select * from bastide_mila_turns where created_at>=p_from and created_at<=p_to),
 topics as(select player_id,coalesce(topic,'sans sujet') topic,count(*) n from selected group by player_id,topic),
 summary as(select p.id player_id,p.display_name,count(s.id) exchanges,
 count(s.id) filter(where s.topic like '%clarify%' or s.topic like '%unknown%' or s.topic like '%missing%' or s.reply is null) clarifications,
 count(s.id) filter(where s.review_status='useful') useful,
 count(s.id) filter(where s.review_status='revise') to_rework,
 count(s.id) filter(where s.review_status='new') unreviewed
 from bastide_players p left join selected s on s.player_id=p.id group by p.id,p.display_name)
 select coalesce(jsonb_agg(to_jsonb(summary)||jsonb_build_object('topics',(select coalesce(jsonb_agg(t),'[]') from(select topic,n from topics where topics.player_id=summary.player_id order by n desc,topic limit 5)t)) order by display_name),'[]') from summary;
$$;
revoke all on function bastide_dialogue_summary(timestamptz,timestamptz) from public,anon,authenticated;grant execute on function bastide_dialogue_summary(timestamptz,timestamptz) to service_role;
