import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {createClient} from "npm:@supabase/supabase-js@2.57.4";
import {HEROES} from './heroes.ts';
const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false}});
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization,apikey,content-type,x-bastide-key','Access-Control-Allow-Methods':'GET,POST,OPTIONS'};
const json=(x:unknown,status=200)=>new Response(JSON.stringify(x),{status,headers:{...cors,'Content-Type':'application/json','Cache-Control':'no-store'}});
const txt=(x:unknown,n=12000)=>String(x??'').slice(0,n);
async function identity(req:Request){const key=txt(req.headers.get('x-bastide-key'),512).replace(/ /g,'+').trim();if(!key)return null;const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(key));const h=[...new Uint8Array(bytes)].map(x=>x.toString(16).padStart(2,'0')).join('');const{data:a}=await db.from('bastide_admin_tokens').select('token_hash').eq('token_hash',h).is('revoked_at',null).maybeSingle();if(a)return{admin:true,id:''};const{data:p}=await db.from('bastide_players').select('id').eq('token_hash',h).maybeSingle();return p?{admin:false,id:p.id}:null}
function battleTurn(b:any){const count=Array.isArray(b.order)?Math.min(b.order.length,100):0,index=b.currentIndex;return{currentIndex:Number.isInteger(index)&&index>=0&&index<count?index:null,round:Number.isInteger(b.round)&&b.round>0?Math.min(b.round,9999):1}}
export function cleanBattle(b:any){const ids=Object.keys(HEROES),effects:Record<string,any[]>={};for(const id of ids){effects[id]=(Array.isArray(b.effects?.[id])?b.effects[id]:[]).slice(0,30).map((e:any)=>({name:txt(e.name,120),description:txt(e.description,1200),duration:txt(e.duration,120),origin:txt(e.origin,120),nature:['bonus','penalty','neutral'].includes(e.nature)?e.nature:(e.origin==='MJ · buff de groupe'?'bonus':'neutral')}))}return{active:b.active===true,order:(Array.isArray(b.order)?b.order:[]).slice(0,100).map((x:any)=>({name:txt(x.name,120)})),effects,...battleTurn(b)}}
export function playerBattle(payload:any,id:string){return{...battleTurn(payload||{}),active:payload?.active===true,order:(payload?.order||[]).map((x:any)=>({name:txt(x.name,120)})),effects:(payload?.effects?.[id]||[]).map((e:any)=>({name:txt(e.name,120),description:txt(e.description,1200),duration:txt(e.duration,120),origin:txt(e.origin,120),nature:['bonus','penalty','neutral'].includes(e.nature)?e.nature:(e.origin==='MJ · buff de groupe'?'bonus':'neutral')}))}}
Deno.serve(async req=>{try{
 if(req.method==='OPTIONS')return new Response('ok',{headers:cors});
 const user=await identity(req);if(!user)return json({error:'Accès personnel requis'},401);
 const url=new URL(req.url),action=url.searchParams.get('action')||'battle';
 const requested=url.searchParams.get('playerId')||'',pid=user.admin?requested:user.id;
 if(!user.admin&&requested&&requested!==user.id)return json({error:'Accès refusé'},403);
 if(action==='combat-library'){
  if(!user.admin)return json({error:'Accès MJ requis'},403);
  if(req.method==='GET'){
   const{data,error}=await db.from('bastide_combat_library').select('library,revision,updated_at').eq('id','island').maybeSingle();if(error)throw error;
   return json(data||{library:null,revision:0,updated_at:null});
  }
  if(req.method==='POST'){
   const b=await req.json(),library=b.library,expected=Number(b.expected);
   if(!library||typeof library!=='object'||!Array.isArray(library.campaigns)||library.campaigns.length<1||library.campaigns.length>100||JSON.stringify(library).length>12000000)return json({error:'Bibliothèque de combat invalide'},400);
   const{data:old,error:readError}=await db.from('bastide_combat_library').select('revision').eq('id','island').maybeSingle();if(readError)throw readError;
   if(!old){if(expected!==0)return json({error:'CONFLICT: les combats ont été créés sur un autre appareil'},409);const{data,error}=await db.from('bastide_combat_library').insert({id:'island',library,revision:1}).select('revision').single();if(error)return json({error:error.code==='23505'?'CONFLICT: les combats ont été créés sur un autre appareil':error.message},error.code==='23505'?409:400);return json(data);}
   if(old.revision!==expected)return json({error:'CONFLICT: les combats ont été modifiés sur un autre appareil'},409);
   const{data,error}=await db.from('bastide_combat_library').update({library,revision:old.revision+1,updated_at:new Date().toISOString()}).eq('id','island').eq('revision',old.revision).select('revision');if(error)throw error;if(!data?.length)return json({error:'CONFLICT: les combats ont été modifiés sur un autre appareil'},409);return json(data[0]);
  }
 }
 if(action==='battle'&&req.method==='GET'){
  const{data:r,error}=await db.from('bastide_battle').select('payload,revision,updated_at').eq('id','current').single();if(error)throw error;
  let q=db.from('bastide_resources').select('*');if(!user.admin)q=q.eq('player_id',user.id);const{data:resources,error:re}=await q;if(re)throw re;
  return json({...r,payload:user.admin?r.payload:playerBattle(r.payload,user.id),resources:resources||[],heroes:user.admin?HEROES:undefined});
 }
 if(action==='battle'&&req.method==='POST'){
  if(!user.admin)return json({error:'Le MJ pilote le combat'},403);const b=await req.json();const payload=cleanBattle(b.payload);
  const{data,error}=await db.from('bastide_battle').update({payload,revision:Number(b.revision)+1,updated_at:new Date().toISOString()}).eq('id','current').eq('revision',Number(b.revision)).select('revision,updated_at');if(error)throw error;
  if(!data?.length)return json({error:'Le combat a changé dans une autre fenêtre. Recharge la liaison avant de publier.'},409);return json(data[0]);
 }
 if(action==='resources'&&req.method==='POST'){
  const b=await req.json(),id=user.admin?txt(b.playerId,80):user.id;if(!user.admin&&b.playerId&&b.playerId!==user.id)return json({error:'Accès refusé'},403);const hero=HEROES[id as keyof typeof HEROES];if(!hero)return json({error:'Personnage inconnu'},400);
  if(b.initialize){const{error}=await db.from('bastide_resources').upsert({player_id:id,hp:Math.min(hero.combat.pvMax,Math.max(0,Number(b.hp)||0)),pm:Math.min(hero.combat.pmMax,Math.max(0,Number(b.pm)||0)),hp_max:hero.combat.pvMax,pm_max:hero.combat.pmMax},{onConflict:'player_id',ignoreDuplicates:true});if(error)throw error;const{data,error:e}=await db.from('bastide_resources').select('*').eq('player_id',id).single();if(e)throw e;return json({resource:data});}
  const{data,error}=await db.rpc('bastide_resource_change',{p_player:id,p_revision:Number(b.revision),p_hp:b.hp==null?null:Number(b.hp),p_pm:b.pm==null?null:Number(b.pm)});if(error)throw error;return json(data,data?.conflict?409:200);
 }
 if(action==='messages'&&req.method==='GET'){
  let q=db.from('bastide_messages').select('id,player_id,direction,content,attachment,returned_at,seen_at,created_at').order('created_at',{ascending:false}).limit(200);if(!user.admin||pid)q=q.eq('player_id',pid);const{data,error}=await q;if(error)throw error;
  return json({messages:data||[],access:user.admin?'admin':'player'});
 }
 if(action==='message'&&req.method==='POST'){
  const b=await req.json(),id=user.admin?txt(b.playerId,80):user.id;if(!HEROES[id as keyof typeof HEROES])return json({error:'Destinataire requis'},400);
  if(!user.admin&&b.playerId&&b.playerId!==user.id)return json({error:'Accès refusé'},403);
  if(user.admin&&b.itemId)return json({error:'Utilise les envois MJ pour donner un objet'},400);
  const{data,error}=await db.rpc('bastide_message_send',{p_player:id,p_direction:user.admin?'mj':'player',p_content:txt(b.content),p_item_id:user.admin?'':txt(b.itemId,160),p_quantity:Math.floor(Number(b.quantity)||0),p_request:b.requestId});if(error)return json({error:error.message},400);return json(data);
 }
 if(action==='messages-seen'&&req.method==='POST'){
  const b=await req.json();let q=db.from('bastide_messages').update({seen_at:new Date().toISOString()}).in('id',Array.isArray(b.ids)?b.ids.slice(0,200):[]).eq('direction',user.admin?'player':'mj');if(!user.admin)q=q.eq('player_id',user.id);const{error}=await q;if(error)throw error;return json({ok:true});
 }
 if(action==='return-item'&&req.method==='POST'){if(!user.admin)return json({error:'Accès MJ requis'},403);const b=await req.json();const{data,error}=await db.rpc('bastide_message_return',{p_id:b.id});if(error)throw error;return json(data)}
 if(action.startsWith('pact')){
  if(!user.admin&&user.id!=='wilfried')return json({error:'Ce carnet appartient à Wilfried'},403);
  if(action==='pact'&&req.method==='GET'){
   let q=db.from('bastide_pact_entries').select('*').eq('player_id','wilfried').order('created_at',{ascending:false});
   if(!user.admin)q=q.in('status',['published','proposal','rejected']);
   const{data,error}=await q;if(error)throw error;
   return json({entries:user.admin?(data||[]):(data||[]).map(e=>({...e,history:(e.history||[]).filter((v:any)=>v.status==='published')})),access:user.admin?'admin':'player'});
  }
  if(action==='pact-save'&&req.method==='POST'){
   const b=await req.json(),title=txt(b.title,161).trim(),content=txt(b.content,20001).trim();
   if(!title||title.length>160||!content||content.length>20000)return json({error:'Titre ou texte invalide (160 / 20 000 caractères maximum)'},400);
   const status=user.admin?b.status:'proposal';
   if(!['proposal','draft','published','rejected'].includes(status))return json({error:'État invalide'},400);
   if(!user.admin&&b.status&&b.status!=='proposal')return json({error:'Seul le MJ valide une conséquence'},403);
   if(!/^[0-9a-f-]{36}$/i.test(b.id||''))return json({error:'Identifiant invalide'},400);
   const{data:old,error:oe}=await db.from('bastide_pact_entries').select('*').eq('id',b.id).maybeSingle();if(oe)throw oe;
   if(old){
    if(old.player_id!=='wilfried'||(!user.admin&&(old.author!=='player'||old.status!=='proposal')))return json({error:'Cette entrée ne peut être modifiée que par le MJ'},403);
    if(old.revision!==Number(b.revision))return json({error:'Cette entrée a changé. Actualise avant de modifier.'},409);
    const history=[...(old.history||[]),{title:old.title,content:old.content,status:old.status,revision:old.revision,updated_at:old.updated_at,changed_by:user.admin?'mj':'player'}];
    const{data,error}=await db.from('bastide_pact_entries').update({title,content,status,revision:old.revision+1,history,updated_at:new Date().toISOString()}).eq('id',old.id).eq('revision',old.revision).select('id,revision');if(error)throw error;if(!data?.length)return json({error:'Modification concurrente. Actualise.'},409);return json(data[0]);
   }
   if(Number(b.revision)!==0)return json({error:'Entrée inexistante. Actualise.'},409);
   const{data,error}=await db.from('bastide_pact_entries').insert({id:b.id,player_id:'wilfried',title,content,status,author:user.admin?'mj':'player'}).select('id,revision').single();if(error)return json({error:error.code==='23505'?'Cet envoi existe déjà. Actualise.':error.message},error.code==='23505'?409:400);return json(data);
  }
  if(action==='pact-seen'&&req.method==='POST'){
   if(user.admin)return json({ok:true});const b=await req.json();
   const{error}=await db.from('bastide_pact_entries').update({seen_revision:Number(b.revision)}).eq('id',b.id).eq('player_id',user.id).eq('status','published').eq('revision',Number(b.revision));if(error)throw error;return json({ok:true});
  }
 }
 if(action==='backgrounds'&&req.method==='GET'){
  if(!user.admin)return json({error:'Accès MJ requis'},403);const[{data,error},{data:entries,error:e}]=await Promise.all([db.from('bastide_backgrounds').select('*').order('player_id'),db.from('bastide_personal_entries').select('owner_id,title,content,kind').order('owner_id')]);if(error||e)throw(error||e);return json({backgrounds:data||[],entries:entries||[],heroes:HEROES});
 }
 if(action==='background'&&req.method==='POST'){
  if(!user.admin)return json({error:'Accès MJ requis'},403);const b=await req.json();if(!HEROES[b.playerId as keyof typeof HEROES])return json({error:'Personnage inconnu'},400);
  const row:any={revision:Number(b.revision)+1,updated_at:new Date().toISOString()};for(const k of ['source_text','summary','triggers','current_status','next_step','journal'])row[k]=txt(b[k],k==='source_text'?20000:12000);
  const{data,error}=await db.from('bastide_backgrounds').update(row).eq('player_id',b.playerId).eq('revision',Number(b.revision)).select('revision');if(error)throw error;if(!data?.length)return json({error:'Cette histoire a changé. Recharge avant de modifier.'},409);return json(data[0]);
 }
 return json({error:'Action inconnue'},404);
}catch(e){console.error(e);return json({error:e instanceof Error?e.message:'Erreur serveur'},500)}});
