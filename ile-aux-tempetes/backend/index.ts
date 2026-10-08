import { createClient } from 'npm:@supabase/supabase-js@2.57.4';
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'content-type,x-campaign-token','Access-Control-Allow-Methods':'GET,POST,OPTIONS'};
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,'Content-Type':'application/json','Cache-Control':'no-store'}});
const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false}});
async function identity(req:Request){
 const token=(req.headers.get('x-campaign-token')||'').trim();if(token.length<32)return null;
 const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token));const hash=[...new Uint8Array(bytes)].map(x=>x.toString(16).padStart(2,'0')).join('');
 const {data:admin,error:e1}=await db.from('campaign_admin_tokens').select('id').eq('token_hash',hash).is('revoked_at',null).maybeSingle();if(e1)throw e1;
 if(admin)return{actor:'mj:'+admin.id,admin:true,playerId:null};
 const {data:p,error:e2}=await db.from('campaign_player_tokens').select('id,player_id').eq('token_hash',hash).is('revoked_at',null).maybeSingle();if(e2)throw e2;
 if(!p||!['vax','hammerz','lelio','loris'].includes(p.player_id))return null;
 const {error}=await db.from('campaign_player_tokens').update({last_used_at:new Date().toISOString()}).eq('id',p.id);if(error)throw error;
 return{actor:p.player_id,admin:false,playerId:p.player_id};
}
Deno.serve(async req=>{try{
 if(req.method==='OPTIONS')return new Response('ok',{headers:cors});
 const url=new URL(req.url),action=url.searchParams.get('action')||'state';
 if(action==='catalog'&&req.method==='GET'){const{data,error}=await db.from('nespresso_shop').select('*').eq('active',true).order('sort_order');if(error)throw error;return json({items:data});}
 const who=await identity(req);if(!who)return json({error:'Ouvre ton lien personnel Nespresso sur ce téléphone.'},401);
 if(action==='identity'&&req.method==='GET')return json({access:who.admin?'admin':'player',playerId:who.playerId});
 if(action==='state'&&req.method==='GET'){
 const id=who.admin?url.searchParams.get('playerId'):who.playerId;
 if(!who.admin&&url.searchParams.get('playerId')&&url.searchParams.get('playerId')!==id)return json({error:'Cet espace appartient à un autre joueur.'},403);
 const[{data:p,error:e1},{data:inventory,error:e2},{data:events,error:e3},{data:recipients,error:e4}]=await Promise.all([
 db.from('campaign_players').select('id,display_name').eq('id',id).maybeSingle(),db.from('nespresso_inventories').select('*').eq('player_id',id).maybeSingle(),
 db.from('nespresso_events').select('*').eq('player_id',id).order('created_at',{ascending:false}).limit(50),db.from('campaign_players').select('id,display_name').in('id',['vax','hammerz','lelio','loris']).neq('id',id).order('sort_order')]);
 if(e1||e2||e3||e4)throw e1||e2||e3||e4;if(!p||!inventory)return json({error:'Personnage introuvable'},404);
 return json({access:who.admin?'admin':'player',player:{...p,...inventory},events,recipients});}
 if(action==='admin'&&req.method==='GET'){
 if(!who.admin)return json({error:'Accès MJ requis'},403);
 const[{data:players,error:e1},{data:inventories,error:e2},{data:tokens,error:e3},{data:items,error:e4},{data:events,error:e5}]=await Promise.all([
 db.from('campaign_players').select('id,display_name').in('id',['vax','hammerz','lelio','loris']).order('sort_order'),db.from('nespresso_inventories').select('*'),
 db.from('campaign_player_tokens').select('player_id,created_at,last_used_at').is('revoked_at',null),db.from('nespresso_shop').select('*').order('sort_order'),db.from('nespresso_events').select('*').order('created_at',{ascending:false}).limit(100)]);
 if(e1||e2||e3||e4||e5)throw e1||e2||e3||e4||e5;
 return json({players:(players||[]).map(p=>({...p,...inventories?.find(i=>i.player_id===p.id),links:tokens?.filter(t=>t.player_id===p.id)})),items,events});}
 if(req.method==='POST'&&['bootstrap','item-save','item-delete','transfer-money','transfer-item','change','purchase','sell','send','shop-save','seen'].includes(action)){
 if(!who.admin&&['send','shop-save'].includes(action))return json({error:'Accès MJ requis'},403);
 const body=await req.json();const requestId=body.requestId;delete body.requestId;
 if(!/^[0-9a-f-]{36}$/i.test(String(requestId||'')))return json({error:'Identifiant de transaction requis'},400);
 if(who.admin&&!['send','shop-save','seen'].includes(action))return json({error:'Consultation MJ en lecture seule.'},403);
 const {data,error}=await db.rpc('nespresso_mutate',{p_actor:who.actor,p_admin:who.admin,p_action:action,p_body:body,p_request:requestId});if(error)return json({error:error.message},400);return json(data);
 }
 return json({error:'Action inconnue'},404);
}catch(e){console.error(e);return json({error:'Le service Nespresso est momentanément indisponible. Réessaie sans modifier ton sac local.'},500);}});
