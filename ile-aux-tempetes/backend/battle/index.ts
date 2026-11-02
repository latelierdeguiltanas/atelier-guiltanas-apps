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

export function cleanBattle(input:any){
 if(!input||typeof input!=='object'||typeof input.active!=='boolean'||!Array.isArray(input.order)||input.order.length>100)throw Error('Combat invalide');
 if(!input.active)return{active:false,order:[],activeId:''};
 const order=input.order.map((f:any)=>{if(!f||!String(f.id||'').trim()||!String(f.name||'').trim())throw Error('Combattant invalide');const playerId=String(f.playerId||'');if(playerId&&!ids.includes(playerId))throw Error('Personnage étranger à Nespresso');return{id:String(f.id).slice(0,100),name:String(f.name).slice(0,120),playerId};});
 if(!order.length||new Set(order.map((f:any)=>f.id)).size!==order.length)throw Error('Ordre de combat invalide');
 const players=order.map((f:any)=>f.playerId).filter(Boolean);if(new Set(players).size!==players.length)throw Error('Un personnage ne peut être lié qu’à un combattant');
 const activeId=String(input.activeId||'');if(activeId&&!order.some((f:any)=>f.id===activeId))throw Error('Tour actif invalide');
 return{active:true,order,activeId};
}
export function projectBattle(row:any,who:any){const payload=cleanBattle(row.payload);const involved=who.admin||payload.order.some((f:any)=>f.playerId===who.playerId);
 return{revision:row.revision,updatedAt:row.updated_at,payload:involved?payload:{active:false,order:[],activeId:''},playerId:who.playerId,access:who.admin?'admin':'player'};}
Deno.serve(async req=>{try{
 if(req.method==='OPTIONS')return new Response('ok',{headers:cors});
 const who=await identity(req);if(!who)return json({error:'Ouvre ton accès personnel Nespresso sur cet appareil.'},401);
 if(req.method==='GET'){const{data,error}=await db.from('nespresso_battle').select('revision,payload,updated_at').eq('id',true).single();if(error)throw error;return json(projectBattle(data,who));}
 if(req.method==='POST'){
 if(!who.admin)return json({error:'Seul le MJ peut partager ou masquer le combat.'},403);
 const body=await req.json();if(!Number.isSafeInteger(body.revision)||body.revision<0||!/^[0-9a-f-]{36}$/i.test(String(body.requestId||'')))return json({error:'Publication invalide'},400);
 let payload;try{payload=cleanBattle(body.payload);}catch(e){return json({error:e instanceof Error?e.message:'Combat invalide'},400);}
 const{data,error}=await db.rpc('nespresso_publish_battle',{p_actor:who.actor,p_revision:body.revision,p_payload:payload,p_request:body.requestId});if(error)return json({error:error.message},error.code==='40001'?409:400);return json(data);}
 return json({error:'Méthode inconnue'},405);
}catch(e){console.error(e);return json({error:'Liaison de combat indisponible. Le gestionnaire local reste utilisable.'},500);}});
