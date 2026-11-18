// Atelier WoW — Passerelle OAuth Battle.net (Supabase Edge Function).
// À déployer UNIQUEMENT après configuration d'un client développeur Blizzard
// et sur un backend distinct des hubs JDR.
// verify_jwt=false : /start et /callback sont publics par conception.
// /characters et /logout exigent un jeton de session aléatoire valide en base.
import { createClient } from "npm:@supabase/supabase-js@2.95.0";

const getEnv=(name:string)=>{const v=Deno.env.get(name);if(!v)throw Error("Configuration manquante : "+name);return v;};
const safeError=(err:unknown)=>{console.error("AtelierWoW OAuth error",String(err).replace(/Bearer\s+\S+/gi,"Bearer [masqué]"));};
const FRONTEND = getEnv("ATW_FRONTEND_URL");
const FRONT_ORIGIN = new URL(FRONTEND).origin;
const CLIENT_ID = getEnv("ATW_BLIZZARD_CLIENT_ID");
const CLIENT_SECRET = getEnv("ATW_BLIZZARD_CLIENT_SECRET");
const REDIRECT = getEnv("ATW_REDIRECT_URI");
const ENCRYPT_KEY = getEnv("ATW_TOKEN_ENCRYPT_KEY"); // clé AES 256 en base64
const SUPA = getEnv("SUPABASE_URL");
const SERVICE = getEnv("SUPABASE_SERVICE_ROLE_KEY");
const sdb = createClient(SUPA,SERVICE,{auth:{persistSession:false,autoRefreshToken:false}});
const enc = new TextEncoder();
const dec = new TextDecoder();
const toBase64=(a:Uint8Array)=>btoa(String.fromCharCode(...a));
const fromBase64=(s:string)=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
const rand=(n=32)=>toBase64(crypto.getRandomValues(new Uint8Array(n))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=/g,"");
async function sha(s:string){const h=await crypto.subtle.digest("SHA-256",enc.encode(s));return Array.from(new Uint8Array(h)).map(x=>x.toString(16).padStart(2,"0")).join("");}
async function aesKey(){const bytes=fromBase64(ENCRYPT_KEY);if(bytes.length!==32)throw Error("ATW_TOKEN_ENCRYPT_KEY doit contenir 32 octets");return crypto.subtle.importKey("raw",bytes,"AES-GCM",false,["encrypt","decrypt"]);}
async function seal(s:string){const iv=crypto.getRandomValues(new Uint8Array(12));const cipher=await crypto.subtle.encrypt({name:"AES-GCM",iv},await aesKey(),enc.encode(s));return toBase64(iv)+"."+toBase64(new Uint8Array(cipher));}
async function unseal(s:string){const [iv,cipher]=s.split(".");if(!iv||!cipher)throw Error("Session corrompue");const plain=await crypto.subtle.decrypt({name:"AES-GCM",iv:fromBase64(iv)},await aesKey(),fromBase64(cipher));return dec.decode(plain);}
function cors(req:Request){const origin=req.headers.get("Origin");return {...(origin===FRONT_ORIGIN?{"Access-Control-Allow-Origin":FRONT_ORIGIN}:{}),"Access-Control-Allow-Methods":"GET, POST, OPTIONS","Access-Control-Allow-Headers":"Authorization, Content-Type","Vary":"Origin","Cache-Control":"no-store"};}
function json(req:Request,payload:unknown,status=200){return new Response(JSON.stringify(payload),{status,headers:{...cors(req),"Content-Type":"application/json; charset=utf-8"}});}
function redirect(url:string,cookie?:string){const h:Record<string,string>={"Location":url,"Cache-Control":"no-store","Referrer-Policy":"no-referrer"};if(cookie)h["Set-Cookie"]=cookie;return new Response(null,{status:302,headers:h});}
function getCookie(req:Request,name:string){const cookies=req.headers.get("Cookie")||"";for(const p of cookies.split(";")){const [k,...v]=p.trim().split("=");if(k===name)return v.join("=")}return null;}
function cookie(value:string,maxAge:number){return "atw_oauth_state="+encodeURIComponent(value)+"; Path=/; Max-Age="+maxAge+"; HttpOnly; Secure; SameSite=Lax";}
function clean(){return cookie("",0);}
function blizzardURL(state:string){const url=new URL("https://oauth.battle.net/authorize");url.searchParams.set("client_id",CLIENT_ID);url.searchParams.set("redirect_uri",REDIRECT);url.searchParams.set("response_type","code");url.searchParams.set("scope","openid wow.profile");url.searchParams.set("state",state);return url.toString();}
async function blizzardToken(code:string){
 const body=new URLSearchParams({grant_type:"authorization_code",code,redirect_uri:REDIRECT});
 const resp=await fetch("https://oauth.battle.net/token",{method:"POST",headers:{"Authorization":"Basic "+btoa(CLIENT_ID+":"+CLIENT_SECRET),"Content-Type":"application/x-www-form-urlencoded"},body,signal:AbortSignal.timeout(15000)});
 if(!resp.ok)throw Error("Blizzard a refusé la connexion ("+resp.status+")");
 const data=await resp.json();if(!data.access_token)throw Error("Aucun jeton fourni par Blizzard");return data;
}
async function accountInfo(token:string){const r=await fetch("https://oauth.battle.net/userinfo",{headers:{Authorization:"Bearer "+token},signal:AbortSignal.timeout(12000)});return r.ok?await r.json():{};}
async function loadCharacters(token:string){
 const url="https://eu.api.blizzard.com/profile/user/wow?namespace=profile-forever-eu&locale=fr_FR";
 const r=await fetch(url,{headers:{Authorization:"Bearer "+token,Accept:"application/json"},signal:AbortSignal.timeout(15000)});
 if(r.status===404)return [];
 if(!r.ok)throw Error("Profil Forever inaccessible ("+r.status+")");
 const data=await r.json();const arr=Array.isArray(data.characters)?data.characters:[];
 return arr.map((x:Record<string,unknown>)=>{
   const c=x as any;
   return {id:c.id,name:c.name,surname:c.surname||"",level:c.level||null,
     class:c.playable_class?.name||c.character_class?.name||"",
     faction:c.faction?.name||c.faction?.type||"",
     ruleset:c.ruleset||null};
 }).filter((c:Record<string,unknown>)=>typeof c.name==="string");
}
async function getSession(req:Request){
 const header=req.headers.get("Authorization")||"";
 const m=/^Bearer ([A-Za-z0-9_-]{24,256})$/.exec(header);
 if(!m)throw Error("Session absente");
 const hash=await sha(m[1]);
 const {data,error}=await sdb.from("atelierwow_bnet_sessions").select("id,access_token_cipher,session_expires_at,account_id,account_battletag").eq("session_hash",hash).gt("session_expires_at",new Date().toISOString()).maybeSingle();
 if(error)throw Error("Erreur de session");if(!data)throw Error("Session expirée");
 return data;
}
Deno.serve(async(req:Request)=>{
 if(req.method==="OPTIONS")return new Response(null,{headers:cors(req)});
 const action=new URL(req.url).searchParams.get("action");
 try{
  if(action==="start"&&req.method==="GET"){
   const state=rand();return redirect(blizzardURL(state),cookie(state,600));
  }
  if(action==="callback"&&req.method==="GET"){
   const u=new URL(req.url);
   const state=u.searchParams.get("state"),code=u.searchParams.get("code");
   const cookieState=getCookie(req,"atw_oauth_state");
   // Comparaison d'état non triviale : state aléatoire et valeur stockée en cookie HttpOnly.
   if(!code||!state||!cookieState||cookieState!==encodeURIComponent(state))return redirect(FRONTEND+"#bnet_error=invalid_state",clean());
   const token=await blizzardToken(code);
   const info=await accountInfo(token.access_token);
   const handoff=rand(32);
   const duration=Math.max(120,Math.min(Number(token.expires_in)||3600,3600)-60);
   const {error}=await sdb.from("atelierwow_bnet_sessions").insert({
      handoff_hash:await sha(handoff),
      handoff_expires_at:new Date(Date.now()+180000).toISOString(),
      access_token_cipher:await seal(token.access_token),
      session_expires_at:new Date(Date.now()+duration*1000).toISOString(),
      account_id:String(info.sub||info.id||""),
      account_battletag:String(info.battletag||"")
   });
   if(error)throw Error("Enregistrement de session impossible");
   // Jamais de jeton Blizzard dans le navigateur ; seulement un code d'échange à usage unique.
   return redirect(FRONTEND+"#bnet_handoff="+encodeURIComponent(handoff),clean());
  }
  if(action==="exchange"&&req.method==="POST"){
   const body=await req.json();
   if(typeof body.handoff!=="string"||body.handoff.length>256)return json(req,{error:"Code invalide"},400);
   const hash=await sha(body.handoff);
   const {data,error}=await sdb.from("atelierwow_bnet_sessions")
     .select("id,session_expires_at").eq("handoff_hash",hash).gt("handoff_expires_at",new Date().toISOString()).is("session_hash",null).maybeSingle();
   if(error||!data)return json(req,{error:"Code expiré ou déjà utilisé"},401);
   const session=rand(48);
   const {data:updated,error:updateError}=await sdb.from("atelierwow_bnet_sessions")
     .update({session_hash:await sha(session),handoff_hash:null,handoff_expires_at:null})
     .eq("id",data.id).eq("handoff_hash",hash).is("session_hash",null).select("id").maybeSingle();
   if(updateError||!updated)return json(req,{error:"Code déjà utilisé"},401);
   return json(req,{session,expiresAt:data.session_expires_at});
  }
  if(action==="characters"&&req.method==="GET"){
   let session;try{session=await getSession(req)}catch(_){return json(req,{error:"Session invalide ou expirée"},401)}
   const token=await unseal(session.access_token_cipher);
   const characters=await loadCharacters(token);
   return json(req,{account:{id:session.account_id,battletag:session.account_battletag},characters});
  }
  if(action==="logout"&&req.method==="POST"){
    const session=await getSession(req);
    await sdb.from("atelierwow_bnet_sessions").delete().eq("id",session.id);
    return json(req,{ok:true});
  }
  return json(req,{error:"Route inconnue"},404);
 }catch(err){safeError(err);return json(req,{error:"Service Battle.net indisponible ou mal configuré"},503)}
});
