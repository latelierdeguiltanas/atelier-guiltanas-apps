import { createClient } from 'npm:@supabase/supabase-js@2.57.4';
const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false}});
const ids=['vax','hammerz','lelio','loris'];
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'content-type,x-campaign-token','Access-Control-Allow-Methods':'GET,POST,OPTIONS'};
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,'Content-Type':'application/json','Cache-Control':'no-store'}});
async function identity(req:Request){const token=(req.headers.get('x-campaign-token')||'').trim();if(token.length<32)return null;
 const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token)),hash=[...new Uint8Array(bytes)].map(x=>x.toString(16).padStart(2,'0')).join('');
 const{data:admin,error:e1}=await db.from('campaign_admin_tokens').select('id').eq('token_hash',hash).is('revoked_at',null).maybeSingle();if(e1)throw e1;
 if(admin)return{admin:true,actor:'mj:'+admin.id,playerId:null};
 const{data:p,error:e2}=await db.from('campaign_player_tokens').select('id,player_id').eq('token_hash',hash).is('revoked_at',null).maybeSingle();if(e2)throw e2;
 if(!p||!ids.includes(p.player_id))return null;return{admin:false,actor:p.player_id,playerId:p.player_id};
}
function visible(post:any,who:any){return who.admin||post.author===who.playerId||(post.status==='published'&&Array.isArray(post.audience)&&post.audience.includes(who.playerId));}
Deno.serve(async req=>{try{
 if(req.method==='OPTIONS')return new Response('ok',{headers:cors});
 const who=await identity(req);if(!who)return json({error:'Ouvre ton accès personnel Nespresso sur cet appareil.'},401);
 const url=new URL(req.url),action=url.searchParams.get('action')||'summary';
 if(action==='identity'&&req.method==='GET'){const{data:players,error}=await db.from('campaign_players').select('id,display_name').in('id',ids).order('sort_order');if(error)throw error;return json({access:who.admin?'admin':'player',playerId:who.playerId,players});}
 if(action==='messages'&&req.method==='GET'){
 const thread=who.admin?url.searchParams.get('playerId'):who.playerId;
 if(!thread||!ids.includes(thread))return json({error:'Choisis une conversation Nespresso.'},400);
 if(!who.admin&&url.searchParams.get('playerId')&&url.searchParams.get('playerId')!==who.playerId)return json({error:'Conversation privée.'},403);
 const before=url.searchParams.get('before');let q=db.from('nespresso_messages').select('*').eq('thread_id',thread).order('created_at',{ascending:false}).order('id',{ascending:false}).limit(51);
 // Cursor uses both time and ID so identical timestamps never skip a message.
 if(before){let cursor;try{cursor=JSON.parse(before);}catch{return json({error:'Page invalide'},400);}
 if(!/^\d{4}-\d{2}-\d{2}T[\d:.+-]+Z?$/.test(String(cursor.time))||!/^[0-9a-f-]{36}$/i.test(String(cursor.id)))return json({error:'Page invalide'},400);
 q=q.or(`created_at.lt.${cursor.time},and(created_at.eq.${cursor.time},id.lt.${cursor.id})`);}
 const{data,error}=await q;if(error)throw error;const rows=(data||[]).slice(0,50),oldest=rows[rows.length-1];
 return json({access:who.admin?'admin':'player',playerId:thread,messages:rows.reverse(),next:(data||[]).length>50&&oldest?{time:oldest.created_at,id:oldest.id}:null});}
 if(action==='posts'&&req.method==='GET'){
 const offset=Math.max(0,Math.floor(Number(url.searchParams.get('offset'))||0));
 let q=db.from('nespresso_posts').select('*',{count:'exact'}).order('updated_at',{ascending:false}).order('id').range(offset,offset+29);
 if(!who.admin)q=q.or(`author.eq.${who.playerId},and(status.eq.published,audience.cs.{${who.playerId}})`);
 const{data,error,count}=await q;if(error)throw error;const posts=(data||[]).filter(p=>visible(p,who));
 const postIds=posts.map(p=>p.id);let reads:any[]=[];
 if(postIds.length){let rq=db.from('nespresso_post_reads').select('post_id,player_id,seen_revision,seen_at').in('post_id',postIds);if(!who.admin)rq=rq.eq('player_id',who.playerId);const r=await rq;if(r.error)throw r.error;reads=r.data||[];}
 return json({posts:posts.map(p=>({...p,reads:reads.filter(r=>r.post_id===p.id)})),offset,total:count});}
 if(action==='backgrounds'&&req.method==='GET'){
 if(!who.admin)return json({error:'Dossiers réservés au MJ.'},403);
 const{data,error}=await db.from('nespresso_backgrounds').select('*').order('player_id');if(error)throw error;return json({backgrounds:data});}
 if(action==='summary'&&req.method==='GET'){
 let mq=db.from('nespresso_messages').select('id,thread_id,created_at').is('seen_at',null).eq('author',who.admin?'player':'mj');if(!who.admin)mq=mq.eq('thread_id',who.playerId);
 let pq=db.from('nespresso_posts').select('id,revision,audience,author,status').eq('status','published');if(!who.admin)pq=pq.contains('audience',[who.playerId]);
 const[{data:messages,error:e1},{data:posts,error:e2}]=await Promise.all([mq,pq]);if(e1||e2)throw e1||e2;
 let reads:any[]=[];if(!who.admin&&(posts||[]).length){const r=await db.from('nespresso_post_reads').select('post_id,seen_revision').eq('player_id',who.playerId).in('post_id',(posts||[]).map(p=>p.id));if(r.error)throw r.error;reads=r.data||[];}
 let events:any[]=[];if(!who.admin){const r=await db.from('nespresso_events').select('id,action,summary,details,created_at').eq('player_id',who.playerId).is('seen_at',null).order('created_at',{ascending:false}).limit(50);if(r.error)throw r.error;events=(r.data||[]).filter(e=>['send','from-mj'].includes(e.action)||(e.details?.sender&&['transfer-item','transfer-money'].includes(e.action)));}
 return json({messages:messages||[],posts:who.admin?[]:(posts||[]).filter(p=>visible(p,who)&&p.author!==who.playerId&&!reads.some(r=>r.post_id===p.id&&r.seen_revision>=p.revision)).map(p=>({id:p.id,revision:p.revision})),events});}
 const allowed=['message','messages-seen','return-item','post-save','post-seen','background-save'];
 if(req.method==='POST'&&allowed.includes(action)){
 if(!who.admin&&['return-item','background-save'].includes(action))return json({error:'Accès MJ requis.'},403);
 if(who.admin&&action==='post-seen')return json({error:'Consultation MJ sans marquer les lectures joueur.'},403);
 const body=await req.json(),request=body.requestId;delete body.requestId;
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(request||'')))return json({error:'Identifiant de transaction requis.'},400);
 if(!who.admin&&body.playerId&&body.playerId!==who.playerId)return json({error:'Conversation privée.'},403);
 const{data,error}=await db.rpc('nespresso_social_mutate',{p_actor:who.actor,p_admin:who.admin,p_action:action,p_body:body,p_request:request});if(error)return json({error:error.message},400);return json(data);}
 return json({error:'Action inconnue.'},404);
}catch(e){console.error(e);return json({error:'Les échanges Nespresso sont momentanément indisponibles. Ton brouillon reste sur cet appareil.'},500);}});
