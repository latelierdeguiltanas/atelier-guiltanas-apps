/* Pont de synchronisation COF2 : une copie cloud par proprietaire et par table.
   Ne modifie jamais le moteur COF2 partagé ni aucune donnée Bastide. */
(function(){
'use strict';
const API='https://jitatmdbipjkvjstcgdc.supabase.co';
const PUBLISHABLE='sb_publishable_XKVr4_kE2qsywCTgurH0CQ_GTXrEFeU';
const $=id=>document.getElementById(id);
const params=new URLSearchParams(location.search),tableId=params.get('table')||'';
const validUUID=id=>/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
const key='guiltanas_cof2_campaigns_v1_'+tableId;
const draftKey='guiltanas.mj.combat-draft.'+tableId;
const maxSize=2400000;
let client,ownerId='',table,revision=0,dirty=false,conflict=false,sending=false,lastSaved='',timer=null,lastRemoteAt=0;
const status=(value,bad=false)=>{$('status').textContent=value;$('status').classList.toggle('bad',!!bad)};
const info=(value,error=false)=>{$('feedback').textContent=value;$('feedback').classList.toggle('error',!!error);$('feedback').hidden=false};
const parsed=s=>{try{return JSON.parse(s||'null')}catch{return null}};
const safeName=s=>String(s||'').replace(/[^a-z0-9_.-]/gi,'-').slice(0,80);
function validLibrary(data){
 if(!data||data.version!==1||!Array.isArray(data.campaigns)||data.campaigns.length<1||data.campaigns.length>100)return false;
 return JSON.stringify(data).length<maxSize;
}
function readLocal(){const v=parsed(localStorage.getItem(key));return validLibrary(v)?v:null}
function readDraft(){
 const d=parsed(localStorage.getItem(draftKey));
 return d&&Number.isInteger(d.baseRevision)&&validLibrary(d.library)?d:null;
}
function preserveDraft(lib){
 try{localStorage.setItem(draftKey,JSON.stringify({baseRevision:revision,library:lib,savedAt:new Date().toISOString()}))}
 catch(error){status('Stockage local saturé : exporte une sauvegarde !',true)}
}
function snapshot(){const d=readLocal();return d?JSON.stringify(d):''}
function saveFile(){
 const data=readLocal();
 if(!data){info('Aucune préparation locale à exporter.',true);return}
 const b=new Blob([JSON.stringify(data,null,2)],{type:'application/json;charset=utf-8'});
 const u=URL.createObjectURL(b),a=document.createElement('a');
 a.href=u;a.download='combat-'+safeName(table?.name||tableId)+'-'+new Date().toISOString().slice(0,10)+'.json';
 document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000);
}
function basicLibrary(t){
 const base=t.scenario?.assets?.combat||[];
 const campaigns=(base.length?base:[{name:t.name,format:'campaign',monsters:{},encounters:{}}]).slice(0,30).map(c=>({
  id:crypto.randomUUID(),name:String(c.name||t.name).slice(0,100),
  format:c.format==='oneshot'?'oneshot':'campaign',pack:false,
  monsters:c.monsters&&typeof c.monsters==='object'?c.monsters:{},
  encounters:c.encounters&&typeof c.encounters==='object'?c.encounters:{},
  state:{version:5,fighters:[],log:[],groupEffects:[],lastRecommendation:null,party:[]}
 }));
 return {version:1,selected:campaigns[0].id,campaigns};
}
async function fetchRemote(){
 const r=await client.from('guiltanas_mj_combat_states').select('library,revision,updated_at').eq('owner_id',ownerId).eq('table_id',tableId).maybeSingle();
 if(r.error)throw r.error;
 return r.data;
}
async function insertIfMissing(library){
 const r=await client.from('guiltanas_mj_combat_states').upsert({owner_id:ownerId,table_id:tableId,library,revision:1},{onConflict:'owner_id,table_id',ignoreDuplicates:true});
 if(r.error)throw r.error;
 return await fetchRemote();
}
async function upload(){
 if(!ownerId||!dirty||sending||conflict)return;
 sending=true;status('Combat : sauvegarde en cours…');
 const content=snapshot(),baseRevision=revision;
 try{
  if(!content||content.length>maxSize)throw Error('Préparation invalide ou trop volumineuse.');
  const r=await client.from('guiltanas_mj_combat_states').update({library:JSON.parse(content),revision:baseRevision+1,updated_at:new Date().toISOString()})
   .eq('owner_id',ownerId).eq('table_id',tableId).eq('revision',baseRevision).select('revision').maybeSingle();
  if(r.error)throw r.error;
  if(!r.data){conflict=true;status('Conflit entre appareils — sauvegarde nécessaire',true);$('reload').hidden=false;info('Un autre appareil a enregistré un combat entre-temps. Exporte ta copie locale, puis recharge la version du cloud. Rien n’est écrasé automatiquement.',true);return}
  revision=r.data.revision;lastSaved=content;dirty=snapshot()!==content;
  if(!dirty)localStorage.removeItem(draftKey);
  else preserveDraft(readLocal());
  status(dirty?'Nouveaux changements en attente':'Combat enregistré sur le cloud ✓');
 }catch(error){
  status('Combats conservés localement, envoi en attente',true);
  info('Sauvegarde distante indisponible : '+error.message+' — garde cette page ouverte ou exporte le combat.',true);
 }finally{
  sending=false;
  if(dirty&&!conflict){clearTimeout(timer);timer=setTimeout(upload,4500)}
 }
}
function changed(){
 if(!ownerId)return;
 const content=snapshot();if(!content||content===lastSaved)return;
 dirty=true;const d=readLocal();if(d)preserveDraft(d);
 status('Modifications du combat à synchroniser…');
 clearTimeout(timer);timer=setTimeout(upload,800);
}
async function checkOtherDevice(){
 if(!ownerId||dirty||sending||conflict||document.hidden||Date.now()-lastRemoteAt<8500)return;
 lastRemoteAt=Date.now();
 try{
  const r=await fetchRemote();
  if(r&&r.revision>revision){
   conflict=true;$('reload').hidden=false;
   status('Une autre session a modifié ce combat',true);
   info('Pour éviter d’effacer des actions, ferme le combat après avoir exporté ta copie si nécessaire, puis clique sur « Recharger depuis le cloud ».',true);
  }
 }catch{/* Ne pas masquer le combat en cas de perte de connexion. */}
}
async function init(){
 if(!validUUID(tableId))throw Error('Identifiant de table invalide : ouvre le combat depuis ton espace MJ.');
 if(!window.supabase?.createClient)throw Error('Module de connexion indisponible.');
 client=window.supabase.createClient(API,PUBLISHABLE,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
 const {data:{user},error:authError}=await client.auth.getUser();
 if(authError||!user)throw Error('Compte MJ non connecté sur cet appareil. Connecte-toi dans le Gestionnaire de tables.');
 ownerId=user.id;
 const ws=await client.from('guiltanas_mj_workspaces').select('payload').eq('owner_id',ownerId).single();
 if(ws.error)throw ws.error;
 table=(ws.data?.payload?.tables||[]).find(t=>t.id===tableId);
 if(!table)throw Error('Cette table ne fait pas partie de ton compte MJ.');
 $('heading').textContent='Combat · '+table.name;
 $('return').href='../?table='+encodeURIComponent(tableId);
 let remote=await fetchRemote(),local=readLocal();
 if(!remote){remote=await insertIfMissing(local||basicLibrary(table));}
 if(!remote||!validLibrary(remote.library))throw Error('Bibliothèque de combat distante invalide. Aucune donnée locale écrasée.');
 revision=remote.revision;
 const draft=readDraft();
 if(draft){
  // Never discard an offline draft simply because cloud changed elsewhere.
  if(draft.baseRevision!==revision)conflict=true;
  local=draft.library;
  dirty=true;
 }else local=remote.library;
 if(!validLibrary(local))throw Error('Bibliothèque de combat locale invalide.');
 localStorage.setItem(key,JSON.stringify(local));
 lastSaved=JSON.stringify(remote.library);
 window.addEventListener('storage',e=>{if(e.key===key)changed()});
 $('battle').src='../../gestionnaire-combat-cof2/multi/?space='+encodeURIComponent(tableId)+'&name='+encodeURIComponent(table.name)+'&format=campaign';
 $('battle').hidden=false;$('feedback').hidden=true;
 status(conflict?'Conflit : exporte la préparation avant de recharger':'Combat connecté à ton compte MJ ✓',conflict);
 if(conflict){$('reload').hidden=false;info('Une préparation de cet appareil n’est pas identique à celle du cloud. Exporte-la avant de choisir la copie à garder.',true)}
 else if(dirty){clearTimeout(timer);timer=setTimeout(upload,1200)}
 setInterval(checkOtherDevice,12000);
}
$('backup').addEventListener('click',saveFile);
$('reload').addEventListener('click',async()=>{
 saveFile();
 if(!confirm('Une sauvegarde de la copie locale a été déclenchée. Recharger le combat depuis le serveur ? Les modifications locales non enregistrées ne seront pas reprises.'))return;
 try{
  const r=await fetchRemote();if(!r||!validLibrary(r.library))throw Error('Combat distant introuvable');
  localStorage.removeItem(draftKey);
  location.reload();
 }catch(e){info('Actualisation impossible : '+e.message,true)}
});
window.addEventListener('online',()=>{if(dirty)upload();else checkOtherDevice()});
window.addEventListener('pagehide',()=>{if(dirty){const lib=readLocal();if(lib)preserveDraft(lib)}});
init().catch(error=>{status('Connexion indisponible',true);info(error.message,true);$('return').hidden=false});
})();