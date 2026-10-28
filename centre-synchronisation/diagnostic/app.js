(()=>{'use strict';
const $=q=>document.querySelector(q),Owner=window.GuiltanasOwnerAuth,URL='https://jitatmdbipjkvjstcgdc.supabase.co/functions/v1/guiltanas-sync',GENERIC='https://jitatmdbipjkvjstcgdc.supabase.co/rest/v1/rpc/hcfg_link_api',ANON='sb_publishable_XKVr4_kE2qsywCTgurH0CQ_GTXrEFeU';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const states={};let scanning=false,authenticated=false,deviceId=localStorage.getItem('guiltanas_sync_device_id_v1');if(!deviceId){deviceId=crypto.randomUUID();localStorage.setItem('guiltanas_sync_device_id_v1',deviceId)}
$('#device-label').value=localStorage.getItem('guiltanas_sync_label_v1')||'';
$('#this-device').textContent='Profil de navigateur : '+deviceId.slice(0,8)+' · '+(navigator.userAgent.includes('Android')?'Android':navigator.userAgent.includes('Windows')?'Windows':'Autre environnement');
function note(s){$('#notice').textContent=s}
function stamp(s){try{return new Date(s).toLocaleString('fr-FR')}catch{return 'Date inconnue'}}
function state(key,value,details){states[key]={state:value,details:String(details||'')};const el=$('#diag-'+key);if(!el)return;const label=value==='ok'?'Vérifié':value==='pending'?'Données en attente':value==='error'?'En erreur':'Non vérifié';const tone=value==='ok'?'good':value==='pending'?'warn':value==='error'?'bad':'neutral';el.innerHTML='<div class="tool"><div class="toolhead"><h3>'+esc(({bastide:'Accès MJ',combat:'Combat publié & bibliothèque',messages:'Messagerie',shop:'Boutique',hubGeneric:'Données de cet appareil',soundboard:'Fichiers son'}[key]||key))+'</h3><span class="status '+tone+'">'+label+'</span></div><div class="details">'+esc(details||'')+'</div></div>';drawOverall()}
function drawOverall(){const values=Object.values(states).map(x=>x.state),bad=values.filter(x=>x==='error').length,waiting=values.filter(x=>x==='pending').length,good=values.filter(x=>x==='ok').length;$('#overall').innerHTML='<div class="row"><span class="status good">'+good+' contrôles positifs</span><span class="status warn">'+waiting+' à surveiller</span><span class="status bad">'+bad+' erreurs</span></div><p class="mini">'+values.filter(x=>x==='unknown').length+' domaines non vérifiés.</p>'}
async function api(action,body){const resp=await fetch(URL+'?action='+action,{method:body?'POST':'GET',cache:'no-store',headers:{'Content-Type':'application/json',...Owner.headers()},body:body?JSON.stringify(body):undefined});const d=await resp.json();if(!resp.ok)throw Error(d.error||'Connexion au centre indisponible');return d}
async function getIndexedDBItems(){
 if(!('indexedDB'in window))throw Error('IndexedDB indisponible');
 if(typeof indexedDB.databases!=='function')throw Error('Ce navigateur ne permet pas de détecter les bases IndexedDB en lecture seule');
 const names=await indexedDB.databases();
 if(!names.some(x=>x.name==='guiltanas-hub-configurable-v2'))return [];
 return new Promise((resolve,reject)=>{
  const open=indexedDB.open('guiltanas-hub-configurable-v2');
  open.onerror=()=>reject(open.error);
  open.onsuccess=()=>{
   const db=open.result;if(!db.objectStoreNames.contains('spaces')){db.close();resolve([]);return}
   const tx=db.transaction('spaces','readonly'),req=tx.objectStore('spaces').getAll();
   req.onsuccess=()=>{db.close();resolve(req.result||[])};
   req.onerror=()=>{db.close();reject(req.error)};
  };
 });
}
async function genericRead(w){const r=await fetch(GENERIC,{method:'POST',cache:'no-store',headers:{apikey:ANON,'Content-Type':'application/json'},body:JSON.stringify({p_action:'get',p_space:w.space_id||w.id?.split('-').slice(0,5).join('-'),p_token:w.token,p_data:{}})});const d=await r.json();if(!r.ok)throw Error(d.message||'Accès serveur impossible');return d}
async function genericScan(){try{const stored=await getIndexedDBItems();let pending=0,online=0,match=0,different=0,failed=0;const lines=[];for(const raw of stored.slice(0,20)){const w={...raw,id:raw.space_id||raw.id},queued=w.queue?.length||0;pending+=queued;let desc='Seulement local';let flag='pending';if(w.remote&&w.token){try{const remote=await genericRead(w);online++;const compare=x=>JSON.stringify({campaignRev:x?.campaign?.revision,records:(x?.records||[]).map(z=>[z.id,z.revision]).sort((a,b)=>String(a[0]).localeCompare(String(b[0])))});if(queued===0&&compare(remote.state)===compare(w.state)){match++;flag='ok';desc='Révisions vérifiées sur le serveur'}else{different++;desc=queued?'Envois locaux à publier : '+queued:'Données serveur différentes du cache';}}catch(e){failed++;flag='error';desc='Contrôle distant impossible : '+e.message;}}else if(!w.remote){desc='Campagne non encore publiée';}lines.push({name:w.state?.campaign?.name||'Espace inconnu',role:w.role||'?',desc,flag});}
const total=stored.length;$('#generic-spaces').innerHTML=lines.map(x=>'<div class="tool"><div class="toolhead"><strong>'+esc(x.name)+'</strong><span class="status '+(x.flag==='ok'?'good':x.flag==='error'?'bad':'warn')+'">'+esc(x.role)+'</span></div><div class="details">'+esc(x.desc)+'</div></div>').join('')+(stored.length>20?'<p class="mini">Liste limitée aux 20 premiers espaces.</p>':'');
if(!total)state('hubGeneric','unknown','Aucun espace de ce navigateur. Cela ne signifie pas que le serveur est vide.');
else if(pending||different)state('hubGeneric','pending',total+' espace(s) local(aux), '+pending+' modification(s) en attente, '+match+' révision(s) concordante(s).');
else if(failed)state('hubGeneric','error',failed+' espace(s) non vérifiables. Aucune donnée écrasée.');
else if(match===total)state('hubGeneric','ok',total+' espace(s) contrôlé(s), révisions concordantes.');
else state('hubGeneric','unknown',total+' espace(s), '+match+' copie(s) vérifiée(s) sur le serveur.');}catch(e){state('hubGeneric','unknown','Diagnostic local indisponible : '+e.message)}}
async function scan(){if(scanning)return;scanning=true;$('#scan').disabled=true;note('Lecture des données locales et tests du serveur…');try{
authenticated=await Owner.validate();
if(!authenticated){note('Connecte-toi au compte Atelier sur la page principale du cockpit avant de lancer le diagnostic.');return}
$('#server-state').textContent='Compte Atelier connecté · '+new Date().toLocaleTimeString('fr-FR');
try{
 const status=await api('modules');
 state('bastide','ok','Données Bastide consultées depuis le serveur, sans lien MJ local.');
 state('combat',status.bastide?.battleRevision!=null?'ok':'unknown','Combat partagé côté serveur : révision '+(status.bastide?.battleRevision??'inconnue')+'. Le cache local du gestionnaire reste à contrôler.');
 state('messages','ok',String(status.bastide?.messages??0)+' messages Bastide sauvegardés, sans en exposer le contenu.');
 state('shop','ok',status.bastide?.shopOpen?'Boutique Bastide ouverte':'Boutique Bastide fermée');
}catch(e){for(const type of ['bastide','combat','messages','shop'])state(type,'error','Lecture serveur impossible : '+e.message)}
await genericScan();state('soundboard','unknown','Bibliothèque audio locale : cette page ne peut pas confirmer la présence des mêmes fichiers sur les autres appareils.');
if(authenticated)await report(false);
note('Diagnostic terminé à '+new Date().toLocaleTimeString('fr-FR')+'. Aucune donnée de campagne modifiée.');
}catch(e){note('Diagnostic incomplet : '+e.message)}finally{scanning=false;$('#scan').disabled=false;}}
async function report(show=true){if(!authenticated){if(show)note('Connecte-toi au compte Atelier pour publier les diagnostics.');return}try{const diagnostics=Object.fromEntries(Object.entries(states).map(([k,v])=>[k,{state:v.state,details:v.details.slice(0,150)}]));await api('report',{deviceId,label:$('#device-label').value.trim()||'Appareil sans nom',sessionLabel:$('#device-label').value.trim(),clientInfo:navigator.userAgent.slice(0,120),diagnostics});if(show)note('État de cet appareil enregistré dans le centre.');await loadDevices()}catch(e){if(show)note('Rapport non enregistré : '+e.message)}}
function renderDevices(data){const list=data.devices||[];const html=list.map(x=>{const age=Date.now()-new Date(x.last_seen_at).getTime(),recent=age<120000,current=x.device_id===deviceId;const entries=Object.entries(x.diagnostics||{}).map(([k,v])=>'<span class="status '+(v.state==='ok'?'good':v.state==='error'?'bad':v.state==='pending'?'warn':'neutral')+'">'+esc(({bastide:'Bastide',combat:'Combat',messages:'Messages',shop:'Boutique',hubGeneric:'Hub générique',soundboard:'Audio'}[k]||k))+'</span>').join(' ');return '<article class="device"><div class="row" style="justify-content:space-between"><strong>'+esc(x.device_label||'Appareil sans nom')+(current?' · Cet appareil':'')+'</strong><span class="status '+(recent?'good':'neutral')+'">'+(recent?'Vu récemment':'Dernier rapport')+'</span></div><div class="details">Dernier rapport : '+stamp(x.last_seen_at)+'</div><div class="row" style="margin-top:8px">'+entries+'</div></article>'}).join('');$('#devices-list').innerHTML=html||'<div class="device">Aucun appareil enregistré. Lance un diagnostic depuis ton téléphone puis depuis chacun de tes deux profils Windows pour les voir apparaître.</div>'}
async function loadDevices(){if(!authenticated){$('#devices-list').innerHTML='<div class="device">Connexion propriétaire Atelier requise pour voir les appareils.</div>';return}try{renderDevices(await api('list'))}catch(e){$('#devices-list').innerHTML='<div class="device">Lecture distante impossible : '+esc(e.message)+'</div>'}}
$('#save-label').onclick=async()=>{localStorage.setItem('guiltanas_sync_label_v1',$('#device-label').value.trim());note('Nom de ce profil enregistré sur cet appareil.');await report()};
$('#scan').onclick=scan;$('#refresh-devices').onclick=loadDevices;$('#report').onclick=()=>report();
for(const type of ['bastide','combat','messages','shop','hubGeneric','soundboard'])state(type,'unknown','Contrôle non lancé.');
scan();
setInterval(()=>{if(!document.hidden&&authenticated)report(false)},90000);
window.addEventListener('online',()=>{if(!document.hidden)scan()});
})();
