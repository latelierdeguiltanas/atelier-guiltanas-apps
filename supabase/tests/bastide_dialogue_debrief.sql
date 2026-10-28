-- Run inside BEGIN/ROLLBACK: no real dialogue or profile is edited.
do $$
declare pid text:='audit-dialogue';r jsonb;t uuid;before_reply text;
begin
 insert into bastide_players(id,display_name,token_hash,state) values(pid,'Dialogue audit','audit-dialogue-'||gen_random_uuid(),'{"money":{"po":0,"pa":0,"pc":0},"inventory":[]}');
 insert into bastide_mila_turns(player_id,client_id,message,reply,topic,created_at) values(pid,gen_random_uuid(),'Question claire','Réponse originale','self:job','2001-01-01T12:00:00Z') returning id into t;
 insert into bastide_mila_turns(player_id,client_id,message,reply,topic,review_status,created_at) values(pid,gen_random_uuid(),'Question ambiguë','Précise un peu','clarify','revise','2001-01-01T13:00:00Z');
 insert into bastide_mila_turns(player_id,client_id,message,reply,topic,created_at) values(pid,gen_random_uuid(),'Hors période','Ancienne réponse','self:who','2000-01-01T12:00:00Z');
 select reply into before_reply from bastide_mila_turns where id=t;
 update bastide_mila_turns set review_status='useful',mj_note='Note privée',proposed_reply='Proposition à valider',reviewed_at=now() where id=t;
 if (select reply from bastide_mila_turns where id=t)<>before_reply then raise exception 'Relecture a écrasé la conversation';end if;
 insert into bastide_dialogue_profiles(player_id,speech_notes,expectations,relationships,campaign_notes) values(pid,'Préférences validées','Questions concrètes','Lien avec Laylee','Fait accepté');
 select value into r from jsonb_array_elements(bastide_dialogue_summary('2001-01-01T00:00:00Z','2001-01-01T23:59:59.999Z')) where value->>'player_id'=pid;
 if (r->>'exchanges')::int<>2 or (r->>'clarifications')::int<>1 or (r->>'useful')::int<>1 or (r->>'to_rework')::int<>1 then raise exception 'Agrégats ou période incorrects %',r;end if;
 insert into bastide_dialogue_debriefs(title,period_from,period_to,report,mj_notes) values('Session test','2001-01-01','2001-01-02','Bilan test','Décision MJ');
 if has_table_privilege('anon','bastide_dialogue_profiles','select') or has_table_privilege('authenticated','bastide_dialogue_debriefs','select') or has_function_privilege('anon','bastide_dialogue_summary(timestamptz,timestamptz)','execute') then raise exception 'Notes MJ exposées';end if;
end $$;
