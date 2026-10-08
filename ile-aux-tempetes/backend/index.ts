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

async function readState(id:string){
 const[{data:p,error:e1},{data:inventory,error:e2},{data:events,error:e3},{data:recipients,error:e4}]=await Promise.all([
 db.from('campaign_players').select('id,display_name').eq('id',id).maybeSingle(),db.from('nespresso_inventories').select('*').eq('player_id',id).maybeSingle(),
 db.from('nespresso_events').select('*').eq('player_id',id).order('created_at',{ascending:false}).limit(50),db.from('campaign_players').select('id,display_name').in('id',['vax','hammerz','lelio','loris']).neq('id',id).order('sort_order')]);
 if(e1||e2||e3||e4)throw e1||e2||e3||e4;if(!p||!inventory)throw new Error('Personnage introuvable');

 return {player:{...p,...inventory},events,recipients};
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
 const state=await readState(id!);
 // A MJ consultation must never count as player activity or mark a delivery as read.
 if(!who.admin){const {error}=await db.from('nespresso_activity').upsert({player_id:id,state_read_at:new Date().toISOString()});if(error)throw error;}
 return json({access:who.admin?'admin':'player',...state});}
 if(action==='activity'&&req.method==='POST'){
 if(who.admin)return json({error:'Activité réservée au joueur'},403);
 const body=await req.json();if(body.playerId!==who.playerId)return json({error:'Identité de fiche incorrecte'},403);const now=new Date().toISOString(),row:any={player_id:who.playerId,last_seen_at:now,last_page:['sheet','hub','inventory','shop'].includes(body.page)?body.page:'hub'};
 if(body.page==='sheet')row.sheet_opened_at=now;
 if(body.saved)row.sheet_saved_at=now;
 if(typeof body.notes==='string'){row.notes=body.notes.slice(0,30000);row.notes_at=now;}
 if(body.syncError){row.last_sync_error=String(body.syncError).slice(0,500);row.sync_error_at=now;}
 // Keep the last reported incident; state_read_at tells the MJ if a later read recovered.
 if(body.snapshot&&typeof body.snapshot==='object'&&!Array.isArray(body.snapshot)){
 if(JSON.stringify(body.snapshot).length>60000)return json({error:'État personnel trop volumineux'},400);
 row.snapshot=body.snapshot;row.snapshot_at=now;}
 const {error}=await db.from('nespresso_activity').upsert(row);if(error)throw error;return json({ok:true});}
 if(action==='diagnostics'&&req.method==='GET'){
 if(!who.admin)return json({error:'Accès MJ requis'},403);
 const checkedAt=new Date().toISOString(),results=[];
 const {data:links,error}=await db.from('campaign_player_tokens').select('player_id,created_at,last_used_at,token_hash').is('revoked_at',null);if(error)throw error;
 const {data:catalog,error:catalogError}=await db.from('nespresso_shop').select('id,price_copper,stock').eq('active',true);
 const {error:requestsError}=await db.from('nespresso_requests').select('actor',{head:true,count:'exact'});
 for(const id of ['vax','hammerz','lelio','loris']){try{
 const state=await readState(id),inv=state.player.state;
 const valid=Array.isArray(inv.inventory)&&['PC','PA','PE','PO','PP'].every(k=>Number.isInteger(inv.money?.[k])&&inv.money[k]>=0);
 const {count,error:e}=await db.from('campaign_handout_assignments').select('handout_id',{count:'exact',head:true}).eq('player_id',id).is('revoked_at',null);if(e)throw e;
 results.push({playerId:id,serverReadable:true,inventoryValid:valid,activeLinks:(links||[]).filter(x=>x.player_id===id&&/^[0-9a-f]{64}$/i.test(x.token_hash)).length,initialized:state.player.initialized,revision:state.player.revision,handoutCount:count});
 }catch(e){results.push({playerId:id,serverReadable:false,error:e instanceof Error?e.message:'Lecture impossible'});}}
 return json({checkedAt,results,services:{catalogReadable:!catalogError,catalogItems:(catalog||[]).length,transactionRegistryReadable:!requestsError},scope:'Lecture serveur MJ, registre des accès et données. Ne teste pas les clés privées sur les téléphones.'});}
 if(action==='supervision'&&req.method==='GET'){
 if(!who.admin)return json({error:'Accès MJ requis'},403);
 const id=url.searchParams.get('playerId')||'';if(!['vax','hammerz','lelio','loris'].includes(id))return json({error:'Personnage requis'},400);
 const offset=Math.max(0,Math.floor(Number(url.searchParams.get('offset'))||0));const state=await readState(id);
 const[{data:activity,error:e1},{data:events,count,error:e2},{data:assignments,error:e3}]=await Promise.all([
 db.from('nespresso_activity').select('*').eq('player_id',id).maybeSingle(),db.from('nespresso_events').select('*',{count:'exact'}).eq('player_id',id).order('created_at',{ascending:false}).order('id').range(offset,offset+49),
 db.from('campaign_handout_assignments').select('handout_id,assigned_at,delivered_at,viewed_at,revoked_at,campaign_handouts(id,kind,title,content_text,storage_path)').eq('player_id',id).order('assigned_at',{ascending:false})]);
 if(e1||e2||e3)throw e1||e2||e3;
 const handouts=await Promise.all((assignments||[]).map(async a=>{const h:any=a.campaign_handouts;let imageUrl=null;if(h?.storage_path){const{data,error}=await db.storage.from('campaign-handouts').createSignedUrl(h.storage_path,3600);if(error)throw error;imageUrl=data.signedUrl;}return{...a,campaign_handouts:undefined,handout:{id:h?.id,title:h?.title,kind:h?.kind,content_text:h?.content_text,imageUrl}};}));
 return json({access:'admin',readOnly:true,player:state.player,activity,handouts,events,offset,totalEvents:count,checkedAt:new Date().toISOString()});}
 if(action==='admin'&&req.method==='GET'){
 if(!who.admin)return json({error:'Accès MJ requis'},403);
 const[{data:players,error:e1},{data:inventories,error:e2},{data:tokens,error:e3},{data:items,error:e4},{data:events,error:e5},{data:activities,error:e6}]=await Promise.all([
 db.from('campaign_players').select('id,display_name').in('id',['vax','hammerz','lelio','loris']).order('sort_order'),db.from('nespresso_inventories').select('*'),
 db.from('campaign_player_tokens').select('player_id,created_at,last_used_at').is('revoked_at',null),db.from('nespresso_shop').select('*').order('sort_order'),db.from('nespresso_events').select('*').order('created_at',{ascending:false}).limit(100),db.from('nespresso_activity').select('player_id,last_seen_at,last_page,sheet_opened_at,sheet_saved_at,state_read_at,last_sync_error,sync_error_at,snapshot_at')]);
 if(e1||e2||e3||e4||e5||e6)throw e1||e2||e3||e4||e5||e6;
 return json({players:(players||[]).map(p=>({...p,...inventories?.find(i=>i.player_id===p.id),links:tokens?.filter(t=>t.player_id===p.id),activity:activities?.find(a=>a.player_id===p.id)||null})),items,events});}
 if(req.method==='POST'&&['bootstrap','item-save','item-delete','transfer-money','transfer-item','change','purchase','sell','send','shop-save','seen'].includes(action)){
 if(!who.admin&&['send','shop-save'].includes(action))return json({error:'Accès MJ requis'},403);
 const body=await req.json();const requestId=body.requestId;delete body.requestId;
 if(!/^[0-9a-f-]{36}$/i.test(String(requestId||'')))return json({error:'Identifiant de transaction requis'},400);
 if(who.admin&&!['send','shop-save','seen'].includes(action))return json({error:'Consultation MJ en lecture seule.'},403);
 const {data,error}=await db.rpc('nespresso_mutate',{p_actor:who.actor,p_admin:who.admin,p_action:action,p_body:body,p_request:requestId});if(error)return json({error:error.message},400);return json(data);
 }
 return json({error:'Action inconnue'},404);
}catch(e){console.error(e);return json({error:'Le service Nespresso est momentanément indisponible. Réessaie sans modifier ton sac local.'},500);}});
