(function(root){'use strict';
const L=root.FOHPlayerLibrary;
const ID='guiltanas_player_cloud_v1';
const URL='https://jitatmdbipjkvjstcgdc.supabase.co/functions/v1/guiltanas-player-vault';
const tokenFormat=(text)=>String(text||'').replace(/[^0-9a-f]/gi,'').toLowerCase();
function nowConfig(){try{return JSON.parse(localStorage.getItem(ID)||'null')}catch{return null}}
function setConfig(c){localStorage.setItem(ID,JSON.stringify(c));}
function summary(message,error=false){const el=document.getElementById('cloud-status');if(el){el.textContent=message;el.classList.toggle('error',error)}}
function count(){try{return Object.keys(L.read().data.entries).length}catch{return 0}}
function fingerprint(){return JSON.stringify(L.read().data)}
function codeFormat(v){return String(v).match(/.{1,8}/g)?.join('-')||''}
function randomCode(){const x=crypto.getRandomValues(new Uint8Array(32));return [...x].map(c=>c.toString(16).padStart(2,'0')).join('')}
async function api(action,body){
 const ctrl=new AbortController();const timer=setTimeout(()=>ctrl.abort(),12000);
 try{
  const r=await fetch(URL+'?action='+action,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:ctrl.signal});
  const d=await r.json();if(!r.ok)throw Object.assign(new Error(d.error||'Erreur serveur'),{conflict:d.conflict===true});
  return d;
 }finally{clearTimeout(timer)}
}
let busy=false,delayed=null;
async function create(){
 if(busy)return;busy=true;
 try{
  const initial=L.read().data,code=randomCode(),result=await api('create',{key:code,payload:initial});
  setConfig({key:code,revision:result.revision,fingerprint:fingerprint()});
  const area=document.getElementById('cloud-code');
  if(area){area.hidden=false;area.value=codeFormat(code);area.select();}
  summary('✓ Coffre personnel créé en ligne. Copie et conserve ton code privé pour ouvrir tes fiches sur un autre appareil.');
  render();
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
  setConfig({key:code,revision:cloud.revision,fingerprint:fingerprint()});
  summary('✓ Appareil relié. '+Object.keys(cloud.payload.entries).length+' fiche(s) récupérée(s) depuis Supabase.');
  render();root.dispatchEvent(new CustomEvent('guiltanas-player-cloud-updated'));
 }catch(e){summary('Connexion au coffre impossible : '+e.message+'. Fiches locales conservées.',true)}
 finally{busy=false}
}
async function sync({quiet=false}={}){
 if(busy)return;
 const config=nowConfig();
 if(!config?.key)return;
 busy=true;
 try{
  const remote=await api('pull',{key:config.key});
  const local= L.read().data,actual=fingerprint(),dirty=actual!==config.fingerprint;
  if(remote.revision!==config.revision){
   if(dirty)throw new Error('CONFLIT : la fiche a été modifiée sur deux appareils. Aucun contenu n’a été écrasé. Fais une sauvegarde JSON locale avant toute restauration.');
   L.restore(remote.payload);
   setConfig({...config,revision:remote.revision,fingerprint:fingerprint()});
   if(!quiet)summary('✓ Fiches actualisées depuis le serveur.');
   root.dispatchEvent(new CustomEvent('guiltanas-player-cloud-updated'));
  }else if(dirty){
   const answer=await api('push',{key:config.key,expectedRevision:config.revision,payload:local});
   setConfig({...config,revision:answer.revision,fingerprint:actual});
   if(!quiet)summary('✓ Modifications sauvegardées sur Supabase · version '+answer.revision+'.');
  }else if(!quiet)summary('✓ À jour sur cet appareil et sur le serveur.');
  render();
 }catch(e){
  summary('⚠ Synchronisation non confirmée : '+e.message+' Tes données locales restent disponibles.',true);
 }finally{busy=false}
}
function trigger(){if(!nowConfig()?.key)return;clearTimeout(delayed);delayed=setTimeout(()=>sync({quiet:false}),1600);}
function render(){
 const config=nowConfig(),connected=!!config?.key;
 for(const [id,show] of [['cloud-create',!connected],['cloud-link',!connected],['cloud-sync',connected],['cloud-disconnect',connected],['cloud-copy',connected]]){
  const el=document.getElementById(id);if(el)el.hidden=!show;
 }
 const meta=document.getElementById('cloud-meta');if(meta)meta.textContent=connected?'Coffre en ligne relié · version '+config.revision+' · '+count()+' fiche(s)':'Aucun coffre relié. Les fiches restent enregistrées uniquement sur ce navigateur.';
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
 if(nowConfig()?.key)sync({quiet:false});
}
root.GuiltanasPlayerCloud={create,connect,sync,trigger,render,setup,config:nowConfig};
})(window);