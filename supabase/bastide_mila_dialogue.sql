-- Private, bounded conversations. Text never authorizes transactions.
create table if not exists public.bastide_mila_turns(id uuid primary key default gen_random_uuid(),player_id text not null references bastide_players(id) on delete cascade,client_id uuid not null,message text not null check(length(message) between 1 and 1000),reply text,engine text,topic text,created_at timestamptz not null default now(),replied_at timestamptz,unique(player_id,client_id));
create index if not exists bastide_mila_recent on bastide_mila_turns(player_id,created_at desc);
alter table bastide_mila_turns enable row level security;revoke all on bastide_mila_turns from public,anon,authenticated;grant all on bastide_mila_turns to service_role;
create or replace function public.bastide_mila_begin(p_player_id text,p_client_id uuid,p_message text)
returns jsonb language plpgsql set search_path=public as $$
declare r bastide_mila_turns%rowtype;
begin
 perform bastide_assert_shop_open();perform 1 from bastide_players where id=p_player_id for update;if not found then raise exception 'Joueur introuvable';end if;
 select * into r from bastide_mila_turns where player_id=p_player_id and client_id=p_client_id;if found then return to_jsonb(r)||jsonb_build_object('existing',true);end if;
 if nullif(trim(p_message),'') is null or length(p_message)>1000 then raise exception 'Message attendu, 1000 caractères maximum';end if;
 if exists(select 1 from bastide_mila_turns where player_id=p_player_id and reply is null and created_at>now()-interval '30 seconds') then raise exception 'Mila prépare déjà sa réponse';end if;
 if (select count(*) from bastide_mila_turns where player_id=p_player_id and created_at>now()-interval '10 minutes')>=20 then raise exception 'Mila doit aussi tenir sa boutique : réessaie dans quelques minutes';end if;
 insert into bastide_mila_turns(player_id,client_id,message) values(p_player_id,p_client_id,trim(p_message)) returning * into r;return to_jsonb(r)||jsonb_build_object('existing',false);
end $$;
revoke all on function bastide_mila_begin(text,uuid,text) from public,anon,authenticated;grant execute on function bastide_mila_begin(text,uuid,text) to service_role;
