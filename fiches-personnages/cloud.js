(function(root){'use strict';
const L=root.FOHPlayerLibrary;
const ID='guiltanas_player_cloud_v1';
const API_URL='https://jitatmdbipjkvjstcgdc.supabase.co/functions/v1/guiltanas-player-vault';
const tokenFormat=(text)=>String(text||'').replace(/[^0-9a-f]/gi,'').toLowerCase();
function nowConfig(){try{return JSON.parse(localStorage.getItem(ID)||'null')}catch{return null}}
function setConfig(c){localStorage.setItem(ID,JSON.stringify(c));}
function summary(message,error=false){for(const id of ['cloud-status','cloud-play-status']){const el=document.getElementById(id);if(el){el.textContent=message;el.classList.toggle('error',error)}}}
function count(){try{return Object.keys(L.read().data.entries).length}catch{return 0}}
function fingerprint(){return JSON.stringify(L.read().data)}
function codeFormat(v){return String(v).match(/.{1,8}/g)?.join('-')||''}
function randomCode(){const x=crypto.getRandomValues(new Uint8Array(32));return [...x].map(c=>c.toString(16).padStart(2,'0')).join('')}
async function api(action,body){
 const ctrl=new AbortController();const timer=setTimeout(()=>ctrl.abort(),12000);
 try{
  const r=await fetch(API_URL+'?action='+action,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:ctrl.signal});
  const d=await r.json();if(!r.ok)throw Object.assign(new Error(d.error||'Erreur serveur'),{conflict:d.conflict===true});
  return d;
 }finally{clearTimeout(timer)}
}
// Compare JSON values independently of JSONB key ordering. Ignore only bookkeeping metadata.
function canonical(v){if(Array.isArray(v))return '['+v.map(canonical).join(',')+']';if(v&&typeof v==='object')return '{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+canonical(v[k])).join(',')+'}';return JSON.stringify(v);}
function content(e){if(!e)return null;const {updatedAt,createdAt,revision,playRevision,...rest}=e;return rest;}
const sameEntry=(a,b)=>canonical(content(a))===canonical(content(b));
function mergeVault(base,local,remote){
 if(!base?.entries||!local?.entries||!remote?.entries)throw Error('Impossible de comparer les versions du coffre.');
 const next=JSON.parse(JSON.stringify(remote)),device=JSON.parse(JSON.stringify(local)),baseline=JSON.parse(JSON.stringify(remote)),conflicts=[];
 const keys=new Set([...Object.keys(base.entries),...Object.keys(local.entries),...Object.keys(remote.entries)]);
 for(const id of keys){const b=base.entries[id],l=local.entries[id],r=remote.entries[id];let chosen;
  // No deletion operation exists in this library: preserve entries present on either side.
  if(!l&&!r)continue;
  if(!l||!r)chosen=l||r;
  else if(sameEntry(l,r))chosen=(Number(l.revision||0)>Number(r.revision||0)||Number(l.playRevision||0)>Number(r.playRevision||0))?l:r;
  else if(b&&sameEntry(l,b)&&r.character.level>=l.character.level)chosen=r;
  else if(b&&sameEntry(r,b)&&l.character.level>=r.character.level)chosen=l;
  else{conflicts.push({id,name:l.character?.name||r.character?.name||id});if(b)baseline.entries[id]=b;else delete baseline.entries[id];continue;}
  next.entries[id]=chosen;device.entries[id]=chosen;baseline.entries[id]=chosen;
 }
 return {remote:next,device,baseline,conflicts};
}
// Compatibility helper for older QA scripts; a genuine overlap remains a conflict.
function mergeNewEntries(base,local,remote){const result=mergeVault(base,local,remote);return result.conflicts.length?null:result.remote;}
let busy=false,delayed=null,pending=false,conflicted=false;
async function create(){
 if(busy)return;busy=true;
 try{
  const initial=L.read().data,code=randomCode(),result=await api('create',{key:code,payload:initial});
  setConfig({key:code,revision:result.revision,fingerprint:JSON.stringify(initial)});
  const area=document.getElementById('cloud-code');
  if(area){area.hidden=false;area.value=codeFormat(code);area.select();}
  summary('✓ Coffre personnel créé en ligne. Copie et conserve ton code privé pour ouvrir tes fiches sur un autre appareil.');
  render();return result;
 }catch(e){summary('Création cloud impossible : '+e.message,true)}
 finally{busy=false}
}
async function connect(text){
 if(busy)return;busy=true;
 try{
  const code=tokenFormat(text);
  if(!/^[a-f0-9]{64}$/.test(code))throw Error('Le code doit contenir 64 caractères hexadécimaux.');
  const cloud=await api('pull',{key:code});
  const local=L.read().data;
  if(Object.keys(local.entries).length&&!confirm('Importer les fiches en ligne sur cet appareil ? Les fiches portant le même identifiant seront remplacées uniquement si elles ne sont pas de niveau supérieur.'))return;
  L.restore(cloud.payload);
  setConfig({key:code,revision:cloud.revision,fingerprint:JSON.stringify(cloud.payload)});
  summary('✓ Appareil relié. '+Object.keys(cloud.payload.entries).length+' fiche(s) récupérée(s) depuis Supabase.');
  render();root.dispatchEvent(new CustomEvent('guiltanas-player-cloud-updated'));
 }catch(e){summary('Connexion au coffre impossible : '+e.message+'. Fiches locales conservées.',true)}
 finally{busy=false}
}
async function sync({quiet=false}={}){
 if(busy){pending=true;return;}
 const config=nowConfig();
 if(!config?.key)return;
 if(navigator.onLine===false){summary('○ Hors connexion : modifications conservées sur cet appareil. Reprise au retour du réseau.');return;}
 busy=true;
 try{
  const remote=await api('pull',{key:config.key});
  if(nowConfig()?.key!==config.key)throw Error('Le coffre a changé pendant la synchronisation.');
  const local=L.read().data,actual=JSON.stringify(local);let base;
  try{base=JSON.parse(config.fingerprint)}catch{}
  // A missing historical snapshot cannot prove that a differing sheet is safe to replace.
  if(!base?.entries)base={...local,entries:{}};
  const plan=mergeVault(base,local,remote.payload);
  const changed=canonical(plan.remote)!==canonical(remote.payload);
  let revision=remote.revision;
  if(changed){const answer=await api('push',{key:config.key,expectedRevision:remote.revision,payload:plan.remote});revision=answer.revision;}
  if(nowConfig()?.key!==config.key||fingerprint()!==actual){pending=true;throw Error('Des fiches ont changé pendant la synchronisation. Les modifications sont conservées ; nouvelle vérification nécessaire.');}
  if(canonical(plan.device)!==canonical(local))L.restore(plan.device);
  // Keep the old common ancestor for unresolved per-sheet conflicts, even at the new revision.
  setConfig({...config,revision,fingerprint:JSON.stringify(plan.baseline)});
  conflicted=plan.conflicts.length>0;
  if(conflicted){summary('⚠ '+(changed?'Les fiches sans conflit ont été sauvegardées. ':'Les fiches sans conflit sont à jour. ')+'Versions à vérifier : '+plan.conflicts.map(x=>x.name).join(', ')+'. Les deux versions sont conservées. Fais une sauvegarde JSON avant toute restauration.',true);}
  else if(!quiet||changed)summary(changed?'✓ Modifications sauvegardées sur Supabase · version '+revision+'.':'✓ À jour sur cet appareil et sur le serveur.');
  render();if(canonical(plan.device)!==canonical(local))root.dispatchEvent(new CustomEvent('guiltanas-player-cloud-updated'));

 }catch(e){
  summary('⚠ Synchronisation non confirmée : '+e.message+' Tes données locales restent disponibles.',true);
 }finally{busy=false;if(pending){pending=false;trigger();}}
}
function trigger(){if(!nowConfig()?.key)return;pending=false;clearTimeout(delayed);delayed=setTimeout(()=>sync({quiet:false}),1600);}
function render(){
 const config=nowConfig(),connected=!!config?.key;
 for(const [id,show] of [['cloud-create',!connected],['cloud-link',!connected],['cloud-sync',connected],['cloud-disconnect',connected],['cloud-copy',connected]]){
  const el=document.getElementById(id);if(el)el.hidden=!show;
 }
 const meta=document.getElementById('cloud-meta');if(meta)meta.textContent=connected?'Coffre en ligne relié · version '+config.revision+' · '+count()+' fiche(s)':'Aucun coffre relié. Les fiches restent enregistrées uniquement sur ce navigateur.';
 const badge=document.getElementById('cloud-play-status');if(badge&&!badge.textContent.includes('⚠')&&!badge.textContent.includes('CONFLIT'))badge.textContent=connected?'☁ Coffre relié · v'+config.revision:'○ Fiche sur cet appareil uniquement';
}
function setup(){
 const createBtn=document.getElementById('cloud-create'),connectBtn=document.getElementById('cloud-link');
 if(!createBtn)return;
 createBtn.onclick=create;
 connectBtn.onclick=async()=>{
  const entered=prompt('Colle ton code de coffre (64 caractères). Il donne accès à toutes les fiches de ce coffre : garde-le privé.');
  if(entered)await connect(entered);
 };
 document.getElementById('cloud-sync').onclick=()=>sync();
 document.getElementById('cloud-copy').onclick=async()=>{
  const c=nowConfig();if(!c)return;
  try{await navigator.clipboard.writeText(codeFormat(c.key));summary('✓ Code de liaison copié. Ne le partage qu’avec tes propres appareils.');}
  catch{const area=document.getElementById('cloud-code');area.hidden=false;area.value=codeFormat(c.key);area.select();}
 };
 document.getElementById('cloud-disconnect').onclick=()=>{
  if(!confirm('Déconnecter le coffre sur cet appareil ? Les fiches locales sont conservées. Pour te reconnecter, il faudra ton code privé.'))return;
  localStorage.removeItem(ID);summary('Connexion cloud retirée de cet appareil. Données locales conservées.');render();
 };
 render();
 document.getElementById('play-sync').onclick=()=>{conflicted=false;sync({quiet:false});};
 document.getElementById('play-library').onclick=()=>{history.pushState(null,'',new URL('./',location.href));window.dispatchEvent(new Event('popstate'));};
 window.addEventListener('online',()=>{if(nowConfig()?.key)sync({quiet:false})});
 window.addEventListener('offline',()=>{summary('○ Hors connexion : modifications conservées sur cet appareil.');});
 window.addEventListener('visibilitychange',()=>{if(!document.hidden&&nowConfig()?.key)sync({quiet:true})});
 const address=new root.URL(location.href),incoming=new URLSearchParams(address.hash.slice(1)).get('vault');
 const fromForge=address.searchParams.get('fromForge')==='1';address.searchParams.delete('fromForge');history.replaceState(null,'',address.href);
 if(incoming){if(!/^[a-f0-9]{64}$/.test(incoming)){summary('Lien personnel invalide.',true);return;}if(nowConfig()?.key===incoming)sync({quiet:false});else connect(incoming);}
 else if(nowConfig()?.key)sync({quiet:false});
 else if(fromForge)create();
}
root.GuiltanasPlayerCloud={create,connect,sync,trigger,render,setup,config:nowConfig,mergeNewEntries,mergeVault};
})(window);
