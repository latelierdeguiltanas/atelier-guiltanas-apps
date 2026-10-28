// No learning/profiling service: explicit MJ notes and representative, factual summaries only.
export async function dialogueAdmin(action:string,req:Request,url:URL,db:any,isAdmin:boolean,json:any){
 if(!isAdmin)return json({error:'Accès MJ requis'},401);
 const validDate=(v:unknown)=>typeof v==='string'&&Number.isFinite(Date.parse(v));
 if(action==='dialogue-history'&&req.method==='GET'){
  const offset=Math.max(0,Math.min(100000,Number(url.searchParams.get('offset'))||0));let q=db.from('bastide_mila_turns').select('id,player_id,message,reply,topic,created_at,review_status,mj_note,proposed_reply,reviewed_at',{count:'exact'}).order('created_at',{ascending:false}).order('id',{ascending:false});
  const pid=url.searchParams.get('playerId'),status=url.searchParams.get('status'),from=url.searchParams.get('from'),to=url.searchParams.get('to');
  if(pid)q=q.eq('player_id',pid);if(status&&['new','useful','revise','done'].includes(status))q=q.eq('review_status',status);if(from){if(!validDate(from))return json({error:'Date de début invalide'},400);q=q.gte('created_at',from);}if(to){if(!validDate(to))return json({error:'Date de fin invalide'},400);q=q.lte('created_at',to);}
  const{data,error,count}=await q.range(offset,offset+39);if(error)throw error;return json({turns:data||[],count:count||0,offset,pageSize:40});
 }
 if(action==='dialogue-review'&&req.method==='POST'){
  const b=await req.json();if(!b.id||!['new','useful','revise','done'].includes(b.status))return json({error:'Échange et état de relecture requis'},400);
  const{data,error}=await db.from('bastide_mila_turns').update({review_status:b.status,mj_note:String(b.note||'').slice(0,6000),proposed_reply:String(b.reply||'').slice(0,4000),reviewed_at:new Date().toISOString()}).eq('id',b.id).select('id').maybeSingle();if(error)throw error;if(!data)return json({error:'Échange introuvable'},404);return json({ok:true});
 }
 if(action==='dialogue-profile'&&req.method==='GET'){
  const playerId=url.searchParams.get('playerId');if(!playerId)return json({error:'PJ requis'},400);const{data,error}=await db.from('bastide_dialogue_profiles').select('*').eq('player_id',playerId).maybeSingle();if(error)throw error;return json({profile:data||{player_id:playerId,speech_notes:'',expectations:'',relationships:'',campaign_notes:''}});
 }
 if(action==='dialogue-profile'&&req.method==='POST'){
  const b=await req.json();if(!b.playerId)return json({error:'PJ requis'},400);const row:any={player_id:String(b.playerId),updated_at:new Date().toISOString()};for(const key of ['speech_notes','expectations','relationships','campaign_notes'])row[key]=String(b[key]||'').slice(0,6000);const{error}=await db.from('bastide_dialogue_profiles').upsert(row);if(error)throw error;return json({ok:true});
 }
 if(action==='dialogue-report'&&req.method==='GET'){
  const from=url.searchParams.get('from'),to=url.searchParams.get('to');if(!validDate(from)||!validDate(to)||Date.parse(from!)>Date.parse(to!))return json({error:'Période valide requise'},400);
  const[{data:summary,error:e1},{data:examples,error:e2},{data:profiles,error:e3}]=await Promise.all([
   db.rpc('bastide_dialogue_summary',{p_from:from,p_to:to}),
   db.from('bastide_mila_turns').select('id,player_id,message,reply,topic,created_at,review_status,mj_note,proposed_reply').gte('created_at',from).lte('created_at',to).or('review_status.eq.revise,reply.is.null,topic.ilike.%clarify%,topic.ilike.%unknown%,topic.ilike.%missing%').order('created_at',{ascending:false}).limit(30),
   db.from('bastide_dialogue_profiles').select('*')]);if(e1||e2||e3)throw(e1||e2||e3);return json({summary:summary||[],examples:examples||[],profiles:profiles||[],examplesLimit:30,from,to});
 }
 if(action==='dialogue-debriefs'&&req.method==='GET'){
  const{data,error}=await db.from('bastide_dialogue_debriefs').select('id,title,period_from,period_to,report,mj_notes,created_at,updated_at').order('updated_at',{ascending:false}).limit(30);if(error)throw error;return json({debriefs:data||[]});
 }
 if(action==='dialogue-debriefs'&&req.method==='POST'){
  const b=await req.json();if(!String(b.title||'').trim()||!validDate(b.from)||!validDate(b.to)||Date.parse(b.from)>Date.parse(b.to))return json({error:'Titre et période valides requis'},400);
  if(String(b.report||'').length>60000||String(b.notes||'').length>20000)return json({error:'Bilan trop long : limite de 60 000 caractères pour le bilan et 20 000 pour les décisions. Réduis le texte avant de sauvegarder.'},400);
  const row={title:String(b.title).trim().slice(0,160),period_from:b.from,period_to:b.to,report:String(b.report||'').slice(0,60000),mj_notes:String(b.notes||'').slice(0,20000),updated_at:new Date().toISOString()};const q=b.id?db.from('bastide_dialogue_debriefs').update(row).eq('id',b.id):db.from('bastide_dialogue_debriefs').insert(row);const{data,error}=await q.select('id').maybeSingle();if(error)throw error;if(!data)return json({error:'Débrief introuvable'},404);return json({ok:true,id:data.id});
 }
 return json({error:'Action de débrief inconnue'},404);
}
