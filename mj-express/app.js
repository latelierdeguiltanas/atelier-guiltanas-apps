(()=>{'use strict';
const A=window.BastideInventory,$=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const PUSH='https://jitatmdbipjkvjstcgdc.supabase.co/functions/v1/guiltanas-push',keyStore='guiltanas_device_id_v1';
let players=[],messages=[],selected='',statusBusy=false,installPrompt=window.__MJDeferredInstall||null,registration=null,lastTestReceipt=null;const deviceId=()=>{let id=localStorage.getItem(keyStore);if(!id){id=crypto.randomUUID();localStorage.setItem(keyStore,id)}return id};
function status(s){$('#status').textContent=s}
function selectedName(id){return players.find(x=>x.id===id)?.display_name||id}
async function pcall(action,body,params){const query=new URLSearchParams({action,...params});const req=await fetch(PUSH+'?'+query,{method:body?'POST':'GET',cache:'no-store',headers:{'Content-Type':'application/json','x-bastide-key':A.accessKey()},body:body?JSON.stringify(body):undefined});const data=await req.json().catch(()=>({}));if(!req.ok)throw Error(data.error||'Service push indisponible');return data}
function setTab(tab){document.querySelectorAll('[id^="tab-"]').forEach(x=>x.hidden=x.id!=='tab-'+tab);document.querySelectorAll('[data-tab]').forEach(x=>x.classList.toggle('primary',x.dataset.tab===tab));if(tab==='shop')refreshShop();if(tab==='devices'){refreshDevices();diagnose();refreshPushHealth()}}
function renderList(){const unread=messages.filter(m=>m.direction==='player'&&!m.seen_at);$('#unread').textContent=unread.length;$('#thread-list').innerHTML=players.map(p=>{const all=messages.filter(m=>m.player_id===p.id),last=all[0],n=all.filter(m=>m.direction==='player'&&!m.seen_at).length;return '<button class="item '+(p.id===selected?'on':'')+'" data-thread="'+esc(p.id)+'"><span><b>'+esc(p.display_name)+'</b><br><small>'+esc((last?.content||'Aucun message').slice(0,75))+'</small></span>'+(n?'<b class="chip">'+n+'</b>':'')+'</button>'}).join('')}
function renderThread(){const p=players.find(p=>p.id===selected);$('#thread-title').textContent=p?'Conversation · '+p.display_name:'Choisis un personnage';$('#reply').hidden=!p;const filtered=messages.filter(m=>m.player_id===selected).slice().reverse();$('#messages').innerHTML=filtered.map(m=>'<article class="bubble '+(m.direction==='mj'?'mine':'')+'"><b>'+(m.direction==='mj'?'MJ':esc(p?.display_name))+'</b><small> · '+new Date(m.created_at).toLocaleString('fr-FR')+'</small><div>'+esc(m.content)+'</div>'+(m.attachment?'<small>Objet transmis · '+esc(m.attachment.name||'Pièce jointe')+'</small>':'')+'</article>').join('')||'<p>Aucun échange.</p>';$('#messages').scrollTop=$('#messages').scrollHeight}
async function refresh(){if(statusBusy)return;statusBusy=true;try{const r=await A.session('messages');messages=r.messages||[];renderList();renderThread();if(selected){const ids=messages.filter(m=>m.player_id===selected&&m.direction==='player'&&!m.seen_at).map(m=>m.id);if(ids.length){await A.session('messages-seen',{method:'POST',body:{ids}});for(const m of messages)if(ids.includes(m.id))m.seen_at=new Date().toISOString();renderList()}}status('Synchronisé avec la Bastide · '+new Date().toLocaleTimeString('fr-FR'))}catch(e){status('Échanges non actualisés : '+e.message)}finally{statusBusy=false}}
async function openThread(id){selected=id;await refresh()}
async function send(id,content,reqId){const before=messages.find(m=>m.player_id===id&&m.direction==='mj');await A.session('message',{method:'POST',body:{playerId:id,content,requestId:reqId}});const next=await A.session('messages&playerId='+encodeURIComponent(id));const match=(next.messages||[]).find(m=>m.direction==='mj'&&m.content===content&&m.id!==before?.id&&Date.now()-new Date(m.created_at).getTime()<100000);if(match)await pcall('dispatch',{messageId:match.id}).catch(()=>{});return match}
async function refreshShop(){try{const s=await A.call('shop-status');$('#shop-state').textContent=s.open?'OUVERTE aux joueurs':'FERMÉE aux joueurs';$('#shop-state').style.color=s.open?'#a7f0ae':'#f2b0a5';$('#shop-message').value=s.message||'';$('#shop-open').disabled=s.open;$('#shop-close').disabled=!s.open}catch(e){$('#shop-state').textContent='État non vérifié · '+e.message}}
async function updateShop(open){const buttons=[$('#shop-open'),$('#shop-close')];buttons.forEach(b=>b.disabled=true);try{await A.call('shop-access',{method:'POST',body:{open,message:$('#shop-message').value}});await refreshShop();status('Boutique mise à jour et confirmée par le serveur.')}catch(e){status('Erreur boutique : '+e.message);await refreshShop()}}
function b64ToArr(v){const normalized=String(v||'').replace(/-/g,'+').replace(/_/g,'/');const s=atob(normalized+'='.repeat((4-normalized.length%4)%4));return Uint8Array.from(s,c=>c.charCodeAt(0))}
async function service(){
 if(!('serviceWorker'in navigator))throw Error('Service worker non disponible dans ce navigateur.');
 registration=await navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'});
 return registration;
}
let lastPermissionResponse=null;
let pushSnapshot=null;
async function inspectPush(){
 const details={
  notificationApi:!!window.Notification,
  notificationPermission:window.Notification?.permission??'indisponible',
  requestResult:lastPermissionResponse,
  browserPermission:'indisponible',
  pushPermission:'indisponible',
  serviceWorker:false,
  subscription:false,
  serverSubscription:false,
  error:null
 };
 if(navigator.permissions?.query){
  try{const permission=await navigator.permissions.query({name:'notifications'});details.browserPermission=permission.state;}
  catch{details.browserPermission='non exposée';}
 }
 try{
  const r=await service();details.serviceWorker=true;
  if(!r.pushManager){details.error='PushManager indisponible sur le service worker';return details;}
  if(typeof r.pushManager.permissionState==='function'){
   try{details.pushPermission=await r.pushManager.permissionState({userVisibleOnly:true});}
   catch{details.pushPermission='non exposée';}
  }
  const local=await r.pushManager.getSubscription();
  details.subscription=!!local;
  if(local){
   const server=await pcall('devices');
   // Cross-check endpoint on the server rather than just a per-browser random deviceId.
   // The server deliberately returns no private endpoint: compare deviceId and active state.
   details.serverSubscription=(server.devices||[]).some(d=>d.device_id===deviceId()&&!d.disabled_at);
  }
 }catch(e){details.error=String(e?.message||e);}
 return details;
}
function showPushRepair(reason){
 const dialog=$('#push-repair-guide');
 $('#push-repair-reason').textContent=reason||'La permission du navigateur n’est pas confirmée pour MJ Express.';
 if(dialog&&!dialog.open)dialog.showModal();
}
function paintPushHealth(d){
 pushSnapshot=d;
 const chip=$('#push-status'),out=$('#push-health');
 const confirmed=d.subscription&&d.serverSubscription;
 const allowed=[d.requestResult,d.notificationPermission,d.browserPermission,d.pushPermission].includes('granted');
 const denied=[d.notificationPermission,d.browserPermission,d.pushPermission].includes('denied');
 $('#push-repair-help').style.display=denied?'inline-block':'none';
 if(confirmed){chip.textContent='✓ Abonnement Push local et serveur confirmé';chip.style.color='#9aefad';}
 else if(d.subscription){chip.textContent='⚠ Abonnement local non confirmé sur Supabase';chip.style.color='#f3d08c';}
 else if(d.serviceWorker&&allowed){chip.textContent='⚠ Permission accordée, abonnement absent';chip.style.color='#f3d08c';}
 else if(denied){chip.textContent='✗ Autorisation bloquée';chip.style.color='#f4aba4';}
 else{chip.textContent='⚠ Abonnement Push non confirmé';chip.style.color='#f3d08c';}
 out.textContent='Navigateur : '+d.notificationPermission+' · Permission Android/site : '+d.browserPermission+' · Push : '+d.pushPermission+' · Abonnement : '+(d.subscription?'oui':'non')+' · Serveur : '+(d.serverSubscription?'oui':'non')+(d.error?' · Erreur : '+d.error:'');
}
async function refreshPushHealth(){
 const info=await inspectPush();paintPushHealth(info);return info;
}
function requestPermissionFromClick(){
 const api=window.Notification;
 if(!api||typeof api.requestPermission!=='function')return Promise.reject(new Error('API Notification indisponible dans ce navigateur.'));
 if(api.permission==='granted')return Promise.resolve('granted');
 if(api.permission==='denied')return Promise.resolve('denied');
 // IMPORTANT: some mobile browsers still return undefined and notify via callback.
 // Do not subscribe until the actual permission response arrives.
 return new Promise((resolve,reject)=>{
  let finished=false;
  const finish=value=>{if(finished)return;finished=true;clearTimeout(timeout);resolve(value||api.permission||'default');};
  const fail=err=>{if(finished)return;finished=true;clearTimeout(timeout);reject(err);};
  const timeout=setTimeout(()=>finish(api.permission||'default'),30000);
  try{
   const result=api.requestPermission(finish);
   if(result&&typeof result.then==='function')result.then(finish,fail);
   else if(typeof result==='string')finish(result);
  }catch(err){fail(err);}
 });
}
async function enable(){
 const btn=$('#push-enable');btn.disabled=true;
 let phase='permission';
 try{
  const asked=requestPermissionFromClick();
  const result=await asked;
  lastPermissionResponse=result;
  if(result==='denied'){
   showPushRepair('Le navigateur bloque les notifications pour ce site. Les autorisations Android seules ne suffisent pas.');
   throw Error('Permission du site refusée. Utilise le guide « Réparer les autorisations ».');
  }
  if(result!=='granted'){
   showPushRepair('Le navigateur n’a pas confirmé la permission après la validation.');
   throw Error('Permission non confirmée ('+String(result)+').');
  }
  phase='service worker';
  const r=await service();
  if(!r.pushManager)throw Error('Samsung Internet ne présente pas PushManager pour ce site.');
  phase='vérification serveur';
  const d=await pcall('status');
  phase='abonnement navigateur';
  let sub=await r.pushManager.getSubscription();
  if(!sub){
   try{sub=await r.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64ToArr(d.publicKey)});}
   catch(err){throw Error('Abonnement refusé par le navigateur : '+String(err?.message||err));}
  }
  phase='enregistrement Supabase';
  await pcall('subscribe',{subscription:sub.toJSON(),deviceId:deviceId(),deviceLabel:'MJ Express',browserLabel:navigator.userAgent.slice(0,80)});
  status('Abonnement Push enregistré. Le prochain test vérifiera la réception réelle.');
  $('#push-progress').textContent='✓ Abonnement accepté. Vérifie maintenant l’affichage local, puis l’envoi du serveur.';
  await refreshDevices();
 }catch(e){
  status('Notifications : erreur à l’étape « '+phase+' » : '+e.message);
  $('#push-progress').textContent='✗ '+phase+' : '+e.message+' · Permission renvoyée : '+String(lastPermissionResponse??'inconnue');
 }finally{btn.disabled=false;await refreshPushHealth();}
}
async function disable(){
 try{
  const r=await service(),sub=await r.pushManager?.getSubscription();
  if(sub){await pcall('unsubscribe',{endpoint:sub.endpoint});await sub.unsubscribe();}
  status('Abonnement désactivé sur cet appareil.');$('#push-progress').textContent='Désactivé.';
  await refreshDevices();
 }catch(e){status('Désactivation impossible : '+e.message)}
 finally{await refreshPushHealth();}
}
async function refreshDevices(){
 try{
  const d=await pcall('devices');
  $('#devices-list').innerHTML=(d.devices||[]).map(x=>'<div class="item"><b>'+esc(x.device_label||'Appareil sans nom')+'</b> · '+(x.disabled_at?'Désactivé':'Abonné')+'<div class="meta">Vu le '+new Date(x.last_seen_at).toLocaleString('fr-FR')+'</div></div>').join('')||'<div class="meta">Aucun appareil inscrit aux notifications.</div>';
 }catch(e){$('#devices-list').textContent='Impossible de vérifier les appareils : '+e.message;}
}
async function localNotificationTest(){
 const target=$('#push-progress');
 try{
  const r=await service();
  await r.showNotification('MJ Express · test local',{
   body:'Le cor enchanté annonce tes messages !',
   icon:new URL('./icons/mj-express-192.png?v=2',location.href).href,
   badge:new URL('./icons/mj-express-192.png?v=2',location.href).href,
   tag:'mj-express-local-'+Date.now(),renotify:true,
   data:{url:location.href}
  });
  target.textContent='✓ Demande d’affichage local acceptée par le navigateur. Si Android ne montre rien, vérifie les notifications Samsung Internet, les catégories et le mode Ne pas déranger.';
 }catch(e){
  target.textContent='✗ Affichage local refusé : '+e.message+' (ce test ne dépend pas du serveur Push).';
 }finally{await refreshPushHealth();}
}
async function checkTestReceipt(id,quiet=false){
 if(!id)return false;
 const target=$('#push-progress');
 try{
  const x=await pcall('test-status',null,{receiptId:id});
  if(x.workerReceived&&x.displayRequested){
   target.textContent='✓ Push reçu par le service worker, affichage demandé à Android. Si la barre reste vide, vérifie les paramètres de notifications Samsung Internet.';
   return true;
  }
  if(x.workerReceived&&x.workerError){
   target.textContent='✗ Push reçu, mais affichage refusé : '+x.workerError;
   return true;
  }
  if(!quiet)target.textContent=x.gatewayAccepted?'Passerelle Push acceptée, mais aucune confirmation du service worker sur ce téléphone.':'Envoi non confirmé.';
  return false;
 }catch(e){if(!quiet)target.textContent='Vérification du reçu impossible : '+e.message;return false;}
}
async function serverNotificationTest(){
 const btn=$('#push-test');btn.disabled=true;
 try{
  const r=await service(),sub=await r.pushManager?.getSubscription();
  if(!sub)throw Error('Aucun abonnement Push local. Utilise d’abord « Activer les notifications ».');
  // Resynchronize existing subscription, including phones that reinstalled the application.
  await pcall('subscribe',{subscription:sub.toJSON(),deviceId:deviceId(),deviceLabel:'MJ Express',browserLabel:navigator.userAgent.slice(0,80)});
  const d=await pcall('test',{deviceId:deviceId()});
  if(!d.accepted||!d.receiptId)throw Error('Envoi rejeté par la passerelle.');
  lastTestReceipt=d.receiptId;
  sessionStorage.setItem('mj_express_last_push_receipt',lastTestReceipt);
  $('#push-progress').textContent='Étape 1 : passerelle acceptée. Attente du service worker…';
  for(let n=0;n<9;n++){
   if(document.hidden)return;
   await new Promise(resolve=>setTimeout(resolve,2500));
   if(await checkTestReceipt(lastTestReceipt,true))return;
  }
  await checkTestReceipt(lastTestReceipt);
 }catch(e){$('#push-progress').textContent='✗ Test Push serveur : '+e.message;}
 finally{btn.disabled=false;await refreshPushHealth();}
}
async function diagnose(){const out=$('#diagnostics');out.textContent='Vérification en cours…';const checks=[];async function ck(title,fn){try{const data=await fn();checks.push({title,ok:true,detail:data})}catch(e){checks.push({title,ok:false,detail:e.message})}}
await ck('Accès privé MJ',async()=>{const r=await A.call('identity');if(r.access!=='admin')throw Error('Cet appareil ne possède pas un lien MJ');return 'Autorisé'});
await ck('Messages Bastide',async()=>{await A.session('notifications');return 'Serveur accessible'});
await ck('État combat partagé',async()=>{const r=await A.session('battle');return 'Révision '+(r.revision??'?')+' · '+(r.payload?.active?'Combat publié':'Aucun combat publié')});
await ck('Inscription Web Push',async()=>{await pcall('status');return 'Service serveur accessible'});
out.innerHTML=checks.map(c=>'<div class="item"><b>'+(c.ok?'✓ ':'! ')+esc(c.title)+'</b><div class="meta">'+esc(c.detail)+'</div></div>').join('')+'<p class="meta">La présence en ligne d’un joueur et ses modifications locales non envoyées ne sont pas observables depuis ces tests.</p>'}
const isStandalone=()=>window.matchMedia?.('(display-mode: standalone)')?.matches||navigator.standalone===true;
const browserIsSamsung=/SamsungBrowser/i.test(navigator.userAgent);
const browserIsAndroid=/Android/i.test(navigator.userAgent);
const browserIsIOS=/iPhone|iPad|iPod/i.test(navigator.userAgent);
function showInstallMessage(text){$('#install-help').textContent=text;}
function paintInstallSteps(){
 const box=$('#install-steps'),chrome=$('#install-in-chrome');
 if(isStandalone()){
  box.innerHTML='<p>✓ MJ Express est déjà ouvert en mode application. Tu peux retrouver son icône parmi tes applications.</p>';
  chrome.style.display='none';return;
 }
 if(browserIsSamsung){
  box.innerHTML='<p><b>1.</b> Dans Samsung Internet, touche l’icône <b>＋ / Installer</b> près de la barre d’adresse si elle apparaît.</p><p><b>2.</b> Sinon, ouvre le menu <b>☰</b> de Samsung Internet → <b>Ajouter la page à</b> → <b>Écran d’accueil</b> ou <b>Applications</b>.</p><p><b>3.</b> Confirme « Installer ». Si Samsung ne le propose pas, le bouton ci-dessous permet d’essayer Chrome et son installation Android native.</p>';
  const address=location.origin+location.pathname;
  chrome.href='intent://'+address.replace(/^https?:\/\//,'')+'#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url='+encodeURIComponent(address)+';end';
  chrome.style.display='block';
 }else if(browserIsIOS){
  box.innerHTML='<p><b>1.</b> Ouvre cette page dans Safari.</p><p><b>2.</b> Touche <b>Partager</b> puis <b>Sur l’écran d’accueil</b>.</p><p><b>3.</b> Confirme l’icône du cor enchanté.</p>';
  chrome.style.display='none';
 }else if(browserIsAndroid){
  box.innerHTML='<p><b>1.</b> Ouvre le menu <b>⋮</b> de Chrome.</p><p><b>2.</b> Choisis <b>Installer l’application</b> ou <b>Ajouter à l’écran d’accueil</b>.</p><p><b>3.</b> Valide l’installation Android de MJ Express.</p>';
  chrome.style.display='none';
 }else{
  box.innerHTML='<p>Dans Chrome ou Edge, ouvre le menu ⋮ puis <b>Installer cette page comme application</b>. Le système crée son propre raccourci.</p>';
  chrome.style.display='none';
 }
}
async function checkInstallStatus(){
 const lines=[];
 lines.push(isStandalone()?'✓ Mode application autonome':'○ Page actuellement ouverte dans le navigateur');
 try{
  const response=await fetch('./manifest.webmanifest?v=4',{cache:'no-store'});
  const m=await response.json();
  lines.push(response.ok&&m.display==='standalone'&&m.icons?.length>=2?'✓ Manifeste PWA avec icônes reconnu':'⚠ Manifeste incomplet (ou réponse invalide)');
 }catch(e){lines.push('✗ Manifeste indisponible : '+e.message);}
 try{
  const reg=await service();
  lines.push(reg?.active?'✓ Service worker actif':reg?.installing?'○ Installation du service worker en cours':'○ Service worker en attente');
 }catch(e){lines.push('✗ Service worker : '+e.message);}
 lines.push(installPrompt?'✓ Invitation d’installation native proposée':'○ Ce navigateur ne propose pas actuellement d’invitation automatique');
 $('#install-check').textContent=lines.join(' · ');
}
window.addEventListener('beforeinstallprompt',e=>{
 e.preventDefault();installPrompt=e;window.__MJDeferredInstall=e;
 showInstallMessage('✓ Installation native disponible : appuie sur le bouton Installer MJ Express.');
});
window.addEventListener('appinstalled',()=>{
 installPrompt=null;
 $('#install').textContent='✓ MJ Express installé';
 showInstallMessage('✓ MJ Express installé. Retrouve le cor enchanté dans tes applications.');
 if($('#install-guide').open)checkInstallStatus();
});
$('#install-guide-close').onclick=()=>$('#install-guide').close();
$('#install-guide-check').onclick=checkInstallStatus;
$('#push-repair-help').onclick=()=>showPushRepair('Le navigateur ou l’application Android indique une autorisation refusée. Il faut la modifier dans les réglages du site, ce que JavaScript ne peut pas faire à ta place.');
$('#push-repair-close').onclick=()=>$('#push-repair-guide').close();
$('#push-repair-recheck').onclick=async()=>{await refreshPushHealth();$('#push-repair-reason').textContent='Nouvelle vérification terminée : '+$('#push-health').textContent;};
$('#push-repair-copy-url').onclick=async()=>{try{await navigator.clipboard.writeText(location.origin);$('#push-repair-copy-url').textContent='✓ Domaine copié';}catch{$('#push-repair-copy-url').textContent=location.origin;}};

$('#copy-push-diag').onclick=async()=>{
 const d=pushSnapshot||await inspectPush();
 const copy=[
  'MJ Express · diagnostic de connexion (aucun identifiant privé)',
  'Date : '+new Date().toISOString(),
  'Adresse : '+location.origin+location.pathname,
  'Navigateur : '+navigator.userAgent.slice(0,160),
  'Application installée : '+String(isStandalone()),
  'API Notification : '+d.notificationApi,
  'Notification.permission : '+d.notificationPermission,
  'Résultat permission après clic : '+String(d.requestResult??'non demandé ici'),
  'Permission site/Android : '+d.browserPermission,
  'PushManager.permissionState : '+d.pushPermission,
  'Service worker : '+d.serviceWorker,
  'Abonnement local : '+d.subscription,
  'Abonnement Supabase : '+d.serverSubscription,
  'Erreur : '+(d.error||'aucune constatée'),
  'Invite installation : '+!!installPrompt,
  'Dernier diagnostic : '+$('#push-progress').textContent
 ].join('\n');
 try{await navigator.clipboard.writeText(copy);$('#copy-push-diag').textContent='✓ Diagnostic copié';}
 catch{$('#copy-push-diag').textContent='Copie impossible dans ce navigateur';}
};

$('#install').onclick=()=>{
 if(isStandalone()){
  paintInstallSteps();$('#install-guide').showModal();checkInstallStatus();return;
 }
 if(installPrompt){
  const prompt=installPrompt;installPrompt=null;
  try{const native=prompt.prompt();Promise.resolve(native).then(()=>prompt.userChoice).then(choice=>{if(choice?.outcome!=='accepted'){paintInstallSteps();$('#install-guide').showModal();checkInstallStatus();}}).catch(err=>{showInstallMessage('Installation automatique impossible : '+err.message);paintInstallSteps();$('#install-guide').showModal();checkInstallStatus();});}catch(err){showInstallMessage('Installation automatique impossible : '+err.message);paintInstallSteps();$('#install-guide').showModal();checkInstallStatus();}
  return;
 }
 paintInstallSteps();
 $('#install-guide').showModal();
 checkInstallStatus();
};
document.querySelectorAll('[data-tab]').forEach(x=>x.onclick=()=>setTab(x.dataset.tab));
$('#refresh').onclick=refresh;$('#thread-list').onclick=e=>{const el=e.target.closest('[data-thread]');if(el)openThread(el.dataset.thread)};
$('#reply').onsubmit=async e=>{e.preventDefault();if(!selected)return;const content=$('#reply-text').value.trim();if(!content)return;const b=e.submitter;b.disabled=true;try{await send(selected,content,crypto.randomUUID());$('#reply-text').value='';await refresh()}catch(ex){status('Envoi impossible : '+ex.message)}finally{b.disabled=false}};
$('#group-open').onclick=()=>{$('#group').hidden=false;$('#group').scrollIntoView({behavior:'smooth'})};
$('#group-cancel').onclick=()=>$('#group').hidden=true;
$('#select-all').onchange=e=>document.querySelectorAll('[data-group-target]').forEach(x=>x.checked=e.target.checked);
$('#group-form').onsubmit=async e=>{e.preventDefault();const text=$('#group-text').value.trim(),ids=[...document.querySelectorAll('[data-group-target]:checked')].map(x=>x.value);if(!text||!ids.length)return status('Choisis au moins un joueur et écris ton message.');if(!confirm('Envoyer '+ids.length+' message(s) privé(s) distinct(s) ?'))return;const b=$('#group-submit');b.disabled=true;let done=0;try{for(const id of ids){await send(id,text,crypto.randomUUID());done++}$('#group-text').value='';$('#group').hidden=true;status(done+' messages envoyés.');await refresh()}catch(ex){status(done+' message(s) envoyé(s), puis interruption : '+ex.message+' — vérifie les fils avant de relancer.')}finally{b.disabled=false}};
$('#shop-open').onclick=()=>updateShop(true);$('#shop-close').onclick=()=>updateShop(false);
$('#push-enable').onclick=enable;$('#push-disable').onclick=disable;$('#push-local-test').onclick=localNotificationTest;$('#push-test').onclick=serverNotificationTest;$('#devices-refresh').onclick=refreshDevices;$('#diag-refresh').onclick=diagnose;document.addEventListener('visibilitychange',()=>{if(!document.hidden){refreshPushHealth();const id=sessionStorage.getItem('mj_express_last_push_receipt');if(id)checkTestReceipt(id,true)}});
service().catch(e=>console.warn('MJ Express PWA :',e?.message||e));
(async()=>{try{const who=await A.call('identity');if(who.access!=='admin')throw Error('Accès MJ requis');const data=await A.call('admin');players=data.players||[];if(!players.length)throw Error('Aucun personnage disponible');$('#locked').hidden=true;$('#app').hidden=false;$('#group-targets').innerHTML=players.map(p=>'<label><input data-group-target checked type="checkbox" value="'+esc(p.id)+'"> '+esc(p.display_name)+'</label>').join('');await refresh();await service().catch(()=>{});await refreshPushHealth();setInterval(()=>{if(!document.hidden)refresh()},15000)}catch(e){$('#locked').querySelector('p').textContent='Accès non disponible : '+e.message+'. Ouvre d’abord ton lien privé MJ depuis le hub.'}})();
})();
