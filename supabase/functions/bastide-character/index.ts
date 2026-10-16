import {createClient} from "npm:@supabase/supabase-js@2.57.4";
import "./core.js";
import catalog from "./catalog.json" with {type:"json"};
const C=(globalThis as any).FOHProgression.create(catalog);
const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false}});
const ids=['prepotante','scanlan','wilfried','vivelame','zepheline','faelar'];
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization,apikey,content-type,x-bastide-key','Access-Control-Allow-Methods':'GET,POST,OPTIONS'};
const json=(x:unknown,status=200)=>new Response(JSON.stringify(x),{status,headers:{...cors,'Content-Type':'application/json','Cache-Control':'no-store'}});
async function identity(req:Request){
 const token=(req.headers.get('x-bastide-key')||'').replace(/ /g,'+').trim();if(!token||token.length>512)return null;
 const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token)),hash=[...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('');
 const {data:a,error:ae}=await db.from('bastide_admin_tokens').select('token_hash').eq('token_hash',hash).is('revoked_at',null).maybeSingle();if(ae)throw ae;if(a)return{admin:true,id:''};
 const {data:p,error}=await db.from('bastide_players').select('id').eq('token_hash',hash).maybeSingle();if(error)throw error;return p?{admin:false,id:p.id}:null;
}
Deno.serve(async req=>{try{
 if(req.method==='OPTIONS')return new Response('ok',{headers:cors});
 const user=await identity(req);if(!user)return json({error:'Accès personnel requis.'},401);
 const requested=new URL(req.url).searchParams.get('playerId')||user.id;
 if(!ids.includes(requested)||(!user.admin&&requested!==user.id))return json({error:'Ce personnage ne correspond pas à ton accès.'},403);
 if(!['GET','POST'].includes(req.method))return json({error:'Méthode refusée.'},405);
 const {data:old,error:oe}=await db.from('bastide_character_levels').select('payload,revision,updated_at').eq('player_id',requested).maybeSingle();if(oe)throw oe;
 if(req.method==='GET')return json({character:old?.payload.character||null,progression:old?.payload.progression||null,revision:old?.revision||0});
 if(Number(req.headers.get('content-length')||0)>1000000)return json({error:'Fichier trop volumineux.'},413);
 const raw=await req.text();if(raw.length>1000000)return json({error:'Fichier trop volumineux.'},413);
 const body=JSON.parse(raw),value=body.transfer;
 if(value?.format!=='FOH_HUB_CHARACTER'||value.version!==1)return json({error:'Exporte « Fiche niveau 2 pour le hub » dans Forge.'},400);
 const rec=value.progression;C.validate(rec);
 if(rec.base.recovery.sourceId!==requested||rec.head.level!==2)return json({error:'Personnage ou niveau incorrect.'},400);
 const verified=C.exportHub(rec);
 if(C.canonical(value.character)!==C.canonical(verified.character))return json({error:'La fiche ne correspond pas aux choix validés dans Forge.'},400);
 if(old){C.merge(old.payload.progression,rec);if(C.canonical(old.payload)===C.canonical(verified))return json({character:old.payload.character,revision:old.revision,unchanged:true});}
 if(Number(body.revision)!==(old?.revision||0))return json({error:'La fiche a changé. Recharge avant de réimporter.'},409);
 const {data,error}=await db.rpc('bastide_character_level_save',{p_player:requested,p_revision:Number(body.revision),p_payload:verified});
 if(error)throw error;if(data?.conflict)return json({error:'Modification concurrente. Recharge avant de continuer.'},409);
 return json({character:verified.character,revision:data.revision});
}catch(e){return json({error:e instanceof Error?e.message:'Import impossible.'},400);}});
