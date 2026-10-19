// Synchronisation distante optionnelle : activée uniquement avec le lien MJ du hub.
(()=>{
const API='https://jitatmdbipjkvjstcgdc.supabase.co/rest/v1/rpc/hcfg_combat_api';
const KEY='sb_publishable_XKVr4_kE2qsywCTgurH0CQ_GTXrEFeU';
const accessKey='guiltanas_cof2_access_'+scope;
let token='',revision=0,timer=null,sending=false,pending=false,lastSerialized='';

function readAccess(){
 const p=new URLSearchParams(location.hash.slice(1)),hashSpace=p.get('space'),hashToken=p.get('key');
 if(hashSpace===scope&&/^[a-f0-9]{64}$/.test(hashToken||'')){
  token=hashToken;localStorage.setItem(accessKey,token);
  history.replaceState(null,'',location.pathname+location.search);
 }else token=localStorage.getItem(accessKey)||'';
 return /^[a-f0-9]{64}$/.test(token);
}
function badge(text,bad=false){
 let el=document.getElementById('cloudSyncStatus');
 if(!el){el=document.createElement('button');el.id='cloudSyncStatus';el.type='button';el.style.cssText='position:fixed;right:8px;bottom:8px;z-index:1000;padding:5px 8px;border-radius:999px;font-size:.68rem;box-shadow:0 3px 14px #0008';el.onclick=()=>syncNow(true);document.body.append(el);}
 el.textContent=text;el.style.borderColor=bad?'#e66':'#9c7';el.title='Cliquer pour synchroniser maintenant';
}
async function call(action,data={}){
 const r=await fetch(API,{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json'},body:JSON.stringify({p_action:action,p_space:scope,p_token:token,p_data:data}),signal:AbortSignal.timeout(25000)});
 const d=await r.json();if(!r.ok)throw Error(d.message||'Synchronisation indisponible');return d;
}
function validRemote(x){try{return !!validateLibrary({format:'guiltanas-cof2-campaigns-1',library:x});}catch{return false;}}
async function initialSync(){
 if(scope==='standalone'||!readAccess()){badge('Local uniquement',true);return;}
 badge('Synchronisation…');
 try{
  const remote=await call('get');revision=remote.revision||0;
  if(validRemote(remote.library)){
   library=remote.library;current=library.campaigns.find(c=>c.id===library.selected)||library.campaigns[0];
   localStorage.setItem(LIBRARY_KEY,JSON.stringify(library));lastSerialized=JSON.stringify(library);showCampaignHome();
  }else{
   lastSerialized='';pending=true;await upload();
  }
  badge('Synchronisé');
 }catch(e){badge('Hors ligne · données locales',true);console.warn(e);}
}
async function upload(){
 if(sending||!token)return;if(blocked){badge('Conflit à résoudre',true);return;}
 const serialized=JSON.stringify(library);if(serialized===lastSerialized&&!pending)return;
 sending=true;pending=false;badge('Enregistrement…');
 try{const d=await call('save',{library,expected:revision});revision=d.revision;lastSerialized=serialized;badge('Synchronisé');}
 catch(e){pending=true;if(String(e.message).includes('CONFLICT')){blocked=true;badge('Conflit entre appareils',true);alert('Cet espace de combat a été modifié sur un autre appareil. Tes données locales sont conservées : exporte-les avant de recharger la page.');}else badge('Hors ligne · en attente',true);}
 finally{sending=false;}
}
function schedule(){pending=true;clearTimeout(timer);timer=setTimeout(upload,700);}
async function syncNow(manual=false){
 if(!token)return manual&&alert('Ouvre le gestionnaire depuis ton hub MJ pour activer la synchronisation sur cet appareil.');
 if(pending||JSON.stringify(library)!==lastSerialized)return upload();
 try{const remote=await call('get');if(remote.revision>revision){library=remote.library;revision=remote.revision;current=library.campaigns.find(c=>c.id===library.selected)||library.campaigns[0];localStorage.setItem(LIBRARY_KEY,JSON.stringify(library));lastSerialized=JSON.stringify(library);showCampaignHome();}badge('Synchronisé');}catch{badge('Hors ligne · données locales',true);}
}

const localPersist=persistLibrary;
persistLibrary=function(){localPersist();schedule();};
window.addEventListener('online',()=>syncNow());
window.addEventListener('beforeunload',()=>{if(pending)upload();});
setInterval(()=>{if(!document.hidden)syncNow();},30000);
initialSync();
})();
