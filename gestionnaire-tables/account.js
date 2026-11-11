/* L'Atelier de Guiltanas — comptes MJ / espace personnel / packs prives */
(function(){
'use strict';
const A=window.TableManagerAPI,D=window.TableDomain;
const gate=document.getElementById('mj-account-gate');
const URL='https://jitatmdbipjkvjstcgdc.supabase.co';
const KEY='sb_publishable_XKVr4_kE2qsywCTgurH0CQ_GTXrEFeU';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
if(!A||!D||!gate||!window.supabase?.createClient){
  gate.innerHTML='<div class="mj-auth-card"><h1>Connexion indisponible</h1><p>Le module sécurisé n’a pas chargé. Vérifie la connexion Internet et actualise. Aucune table n’a été supprimée.</p></div>';
  return;
}
const client=window.supabase.createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
window.MJCloudClient=client;
let mode='login',uid='',displayName='',bastideLinked=false,revision=0,dirty=false,syncing=false,conflict=false,syncTimer=0,loadSeq=0,lastSaved='',active=false;
const state=()=>A.getDb();
const syncEl=()=>document.getElementById('mj-cloud-status');
function status(s,bad=false){const el=syncEl();if(el){el.textContent=s;el.style.color=bad?'#f5b6a6':'#d5e3cf'}}
function notice(s){const message=document.getElementById('mj-auth-message');if(!message)return;message.textContent=s;message.hidden=!s;}
function authBody(){
 gate.innerHTML='<section class="mj-auth-card"><div class="eyebrow">L’ATELIER DE GUILTANAS</div><h1>Mon espace Maître du jeu</h1><p>Un compte par MJ. Chaque table et chaque scénario restent privés et séparés des autres maîtres du jeu.</p>'+
 '<div class="toggle"><button id="mj-mode-login" type="button" class="active">Se connecter</button><button id="mj-mode-register" type="button">Créer un compte</button></div>'+
 '<form id="mj-auth-form"><label id="mj-name-wrap" hidden>Nom du MJ<input name="display_name" maxlength="80" autocomplete="nickname" placeholder="Ex. Mathieu"></label>'+
 '<label>Adresse e-mail<input name="email" type="email" required autocomplete="email" maxlength="254"></label>'+
 '<label>Mot de passe<input name="password" type="password" minlength="8" required autocomplete="current-password"></label>'+
 '<button class="primary" id="mj-auth-submit" type="submit">Connexion</button></form>'+
 '<p class="message" id="mj-auth-message" role="status" hidden></p>'+
 '<p>Les nouveaux comptes peuvent nécessiter une confirmation par e-mail. Les mots de passe sont gérés par Supabase Auth, pas par le navigateur de cette application.</p></section>';
}
function showGate(){document.body.classList.add('mj-auth-locked');gate.hidden=false;document.getElementById('mj-account-bar')?.remove();}
function hideGate(){gate.hidden=true;document.body.classList.remove('mj-auth-locked');}
function setMode(v){mode=v;document.getElementById('mj-mode-login').classList.toggle('active',v==='login');document.getElementById('mj-mode-register').classList.toggle('active',v==='register');document.getElementById('mj-name-wrap').hidden=v!=='register';document.getElementById('mj-auth-submit').textContent=v==='register'?'Créer mon compte MJ':'Connexion';document.querySelector('#mj-auth-form [name="password"]').setAttribute('autocomplete',v==='register'?'new-password':'current-password');notice('')}
function scopedStorage(id){const prefix='guiltanas.mj.'+id+'.';return {getItem:k=>localStorage.getItem(prefix+k),setItem:(k,v)=>localStorage.setItem(prefix+k,v)};}
async function saveCloud(){
 if(!active||!uid||!dirty||syncing||conflict)return;
 syncing=true;status('Sauvegarde en ligne…');
 const snapshot=JSON.stringify(state()),targetRevision=revision;
 try{
  let result=await client.from('guiltanas_mj_workspaces').update({payload:JSON.parse(snapshot),revision:revision+1,updated_at:new Date().toISOString()}).eq('owner_id',uid).eq('revision',revision).select('revision').maybeSingle();
  if(result.error)throw result.error;
  if(!result.data){conflict=true;status('Conflit entre appareils : aucune donnée écrasée. Exporter la sauvegarde avant de recharger.',true);return;}
  revision=result.data.revision;lastSaved=snapshot;
  dirty=JSON.stringify(state())!==snapshot;
  status(dirty?'Nouveaux changements à envoyer':'Sauvegardé en ligne ✓');
 }catch(e){status('Sauvegarde distante indisponible — copie locale conservée : '+e.message,true)}
 finally{syncing=false;if(dirty&&!conflict){clearTimeout(syncTimer);syncTimer=setTimeout(saveCloud,3500)}}
}
function schedule(){if(!active||!uid)return;dirty=true;status('Modifications en attente…');clearTimeout(syncTimer);syncTimer=setTimeout(saveCloud,950);}
window.addEventListener('guiltanas:tables-changed',schedule);
async function openAccount(user){
 const seq=++loadSeq;active=false;showGate();gate.innerHTML='<section class="mj-auth-card"><h1>Ouverture de ton espace MJ</h1><p>Chargement des tables personnelles sécurisées…</p></section>';
 try{
  const id=user.id;
  let profile=await client.from('guiltanas_mj_profiles').select('display_name,bastide_linked').eq('user_id',id).maybeSingle();
  if(profile.error)throw profile.error;
  const nickname=String(user.user_metadata?.display_name||user.email?.split('@')[0]||'MJ').slice(0,80);
  if(!profile.data){const inserted=await client.from('guiltanas_mj_profiles').upsert({user_id:id,display_name:nickname},{onConflict:'user_id'}).select('display_name').single();if(inserted.error)throw inserted.error;profile.data=inserted.data}
  let remote=await client.from('guiltanas_mj_workspaces').select('payload,revision').eq('owner_id',id).maybeSingle();
  if(remote.error)throw remote.error;
  if(!remote.data){
   const inserted=await client.from('guiltanas_mj_workspaces').upsert({owner_id:id,payload:D.seed(),revision:1},{onConflict:'owner_id',ignoreDuplicates:true}).select('payload,revision').maybeSingle();
   if(inserted.error)throw inserted.error;
   remote=await client.from('guiltanas_mj_workspaces').select('payload,revision').eq('owner_id',id).single();
   if(remote.error)throw remote.error;
  }
  if(seq!==loadSeq)return;
  uid=id;displayName=profile.data.display_name;bastideLinked=!!profile.data.bastide_linked;revision=remote.data.revision;dirty=false;conflict=false;
  window.GuiltanasMJActiveStorage=scopedStorage(uid);
  A.loadAccountData(remote.data.payload);
  lastSaved=JSON.stringify(state());
  active=true;
  hideGate();renderAccountBar();A.refresh();
  const requested=new URLSearchParams(location.search).get('table');
  if(requested&&state().tables.some(t=>t.id===requested))A.openTable(requested);
  status('Sauvegardé en ligne ✓');
 }catch(e){
  uid='';active=false;window.GuiltanasMJActiveStorage=null;authBody();notice('Impossible d’ouvrir cet espace : '+e.message+'. Les données des autres MJ ne sont pas affichées.');
 }
}
function renderAccountBar(){
 document.getElementById('mj-account-bar')?.remove();
 const el=document.createElement('div');el.id='mj-account-bar';el.className='mj-account-bar';
 el.innerHTML='<span>Compte MJ : <b id="mj-profile-display">'+esc(displayName)+'</b></span><button data-mj-action="rename">Renommer</button><button data-mj-action="sync">Synchroniser</button><span class="sync" id="mj-cloud-status">Connecté</span><button data-mj-action="logout">Déconnexion</button>';
 document.querySelector('.workspace')?.prepend(el);
}
async function getRemote(){
 if(!active||dirty||syncing||conflict)return;
 const r=await client.from('guiltanas_mj_workspaces').select('payload,revision').eq('owner_id',uid).single();
 if(r.error){status('Vérification distante indisponible',true);return;}
 if(r.data.revision>revision){
  A.loadAccountData(r.data.payload);revision=r.data.revision;lastSaved=JSON.stringify(state());
  status('Actualisé depuis le serveur ✓');
 }
}
async function markBastideLinked(){if(!active||!uid)return;const r=await client.from('guiltanas_mj_profiles').update({bastide_linked:true}).eq('user_id',uid);if(r.error)throw r.error;bastideLinked=true;A.refresh();}
async function rename(){
 const name=prompt('Nom à afficher pour ce compte MJ :',displayName);
 if(!name||!name.trim())return;
 const r=await client.from('guiltanas_mj_profiles').update({display_name:name.trim().slice(0,80)}).eq('user_id',uid);
 if(r.error)throw r.error;
 displayName=name.trim().slice(0,80);
 document.getElementById('mj-profile-display').textContent=displayName;
}
async function logout(){
 clearTimeout(syncTimer);
 if(dirty&&!conflict)await saveCloud();
 if(dirty&&!confirm('La sauvegarde en ligne n’est pas confirmée. Quitter quand même ?'))return;
 active=false;uid='';loadSeq++;window.GuiltanasMJActiveStorage=null;
 await client.auth.signOut();
 authBody();showGate();notice('');
}
function libraryAccountPanel(){
 const p=document.createElement('section');p.className='mj-account-panel';
 p.innerHTML='<h2>Importer un scénario privé d’un autre MJ</h2><p>Colle le code de partage reçu. Le modèle sera copié dans ton compte et une table sans personnage sera créée automatiquement.</p>'+
 '<input id="mj-pack-import-code" inputmode="text" placeholder="Code privé à 64 caractères" autocomplete="off" spellcheck="false">'+
 '<div class="controls"><button class="primary" data-mj-action="redeem">Importer et créer ma table</button></div>'+
 '<p class="note">Le pack « Île aux Tempêtes » reste privé et n’est pas proposé dans la boutique commerciale. Chaque MJ doit disposer des droits d’utilisation du scénario.</p>';
 return p;
}
function accountHomePanel(ctx){
 const p=document.createElement('section');p.className='mj-account-panel';
 p.innerHTML='<h2>Bienvenue dans ton espace MJ, '+esc(displayName)+'</h2><p>'+ctx.db.tables.length+' table(s) personnelles. Tes scénarios et les PJ de tes tables ne sont pas accessibles aux autres MJ.</p>'+
 '<div class="controls"><button data-mj-action="show-library" class="primary">Importer / choisir un scénario</button></div>';
 return p;
}
function decorate(ctx){
 if(!active)return;
 const root=document.getElementById('app');
 if(ctx.view==='home'){const hero=root.querySelector('.hero');if(hero)hero.after(accountHomePanel(ctx));}
 if(ctx.view==='library'){
  const hero=root.querySelector('.hero');if(hero)hero.after(libraryAccountPanel());
  const cards=root.querySelectorAll('.grid .card');
  ctx.db.scenarios.forEach((sc,i)=>{
   if(!cards[i])return;
   const btn=document.createElement('button');
   btn.className='button sm';btn.dataset.mjAction='share';btn.dataset.id=sc.id;
   btn.textContent='Partager ce scénario (code privé)';
   cards[i].querySelector('.card-actions')?.append(btn);
  });
 }
 if(ctx.view==='table'&&ctx.table){
  const title=root.querySelector('.tabletitle');
  if(title){
   const span=document.createElement('div');span.className='note';
   span.textContent='Hub personnel de cette table — enregistré sur ton compte MJ. Les modules joueurs partagés restent à raccorder.';
   title.after(span);
  }
 }
}
function generateCode(){
 const bytes=crypto.getRandomValues(new Uint8Array(32));
 return [...bytes].map(x=>x.toString(16).padStart(2,'0')).join('');
}
async function digest(v){
 const d=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(v));
 return [...new Uint8Array(d)].map(x=>x.toString(16).padStart(2,'0')).join('');
}
async function shareScenario(id){
 const sc=state().scenarios.find(s=>s.id===id);if(!sc)throw Error('Scénario introuvable');
 if(sc.copyright==='external-personal-use'&&!confirm('Ce scénario contient des contenus destinés à un usage privé autorisé. Vérifie que ton ami a le droit de les utiliser. Générer un code valable 7 jours pour un seul import ?'))return;
 const response=await client.from('guiltanas_mj_packs').insert({owner_id:uid,title:sc.name,payload:sc}).select('id').single();
 if(response.error)throw response.error;
 const code=generateCode(),hash=await digest(code);
 const end=new Date(Date.now()+7*86400000).toISOString();
 const added=await client.from('guiltanas_mj_pack_shares').insert({owner_id:uid,pack_id:response.data.id,token_hash:hash,expires_at:end,max_uses:1});
 if(added.error)throw added.error;
 const dialog=document.getElementById('mj-share-dialog');dialog.innerHTML='<h2>Code de partage privé</h2><p>À communiquer uniquement au MJ destinataire. Un import, valable 7 jours ; aucune clé Bastide ni fiche PJ n’est transmise.</p><input readonly id="mj-copy-code" value="'+code+'"><div class="actions"><button class="button primary" data-mj-action="copy-code">Copier le code</button><button class="button" data-mj-action="close-code">Fermer</button></div>';
 dialog.showModal();
}
async function redeem(){
 const input=document.getElementById('mj-pack-import-code');
 const code=String(input?.value||'').toLowerCase().replace(/[-\s]/g,'');
 if(!/^[a-f0-9]{64}$/.test(code))throw Error('Code privé de 64 caractères attendu.');
 const {data:{session}}=await client.auth.getSession();
 if(!session?.access_token)throw Error('Session expirée. Reconnecte-toi.');
 const response=await fetch(URL+'/functions/v1/guiltanas-mj-redeem-pack',{method:'POST',
  headers:{apikey:KEY,Authorization:'Bearer '+session.access_token,'Content-Type':'application/json'},
  body:JSON.stringify({code}),signal:AbortSignal.timeout(20000)});
 let result={};try{result=await response.json()}catch{}
 if(!response.ok)throw Error(result.error||'Import non autorisé');
 const sc=D.normalizedScenario(result.scenario);
 const db=state();db.scenarios.push(sc);
 const table=D.createTable(db,{name:'Ma table — '+sc.name.replace(/\s*[—-].*$/,'').slice(0,65),system:sc.system,scenarioId:sc.id});
 A.save();A.openTable(table.id);
 A.notify('Scénario importé dans ton compte ; table créée avec 0 PJ.');
}
document.addEventListener('click',async ev=>{
 const el=ev.target.closest('[data-mj-action]');if(!el||!active)return;
 const action=el.dataset.mjAction;el.disabled=true;
 try{
  if(action==='rename')await rename();
  if(action==='sync'){if(dirty)await saveCloud();else await getRemote();}
  if(action==='logout')await logout();
  if(action==='show-library')A.showLibrary();
  if(action==='share')await shareScenario(el.dataset.id);
  if(action==='redeem')await redeem();
  if(action==='copy-code'){const input=document.getElementById('mj-copy-code');await navigator.clipboard.writeText(input.value);A.notify('Code copié');}
  if(action==='close-code')document.getElementById('mj-share-dialog').close();
 }catch(e){A.notify('Compte MJ : '+e.message);}
 finally{el.disabled=false;}
});
function bindGate(){
 gate.addEventListener('click',ev=>{if(ev.target?.id==='mj-mode-login')setMode('login');if(ev.target?.id==='mj-mode-register')setMode('register')});
 gate.addEventListener('submit',async ev=>{
  if(ev.target?.id!=='mj-auth-form')return;ev.preventDefault();const form=ev.target,fields=Object.fromEntries(new FormData(form));const btn=document.getElementById('mj-auth-submit');
  btn.disabled=true;notice('Vérification…');
  try{
   if(mode==='register'){
    const n=String(fields.display_name||'').trim();if(!n||n.length>80)throw Error('Indique un nom de MJ.');
    const r=await client.auth.signUp({email:String(fields.email||'').trim(),password:String(fields.password||''),options:{data:{display_name:n},emailRedirectTo:location.origin+location.pathname}});
    if(r.error)throw r.error;
    if(r.data.session){await openAccount(r.data.user);return;}
    notice('Compte demandé. Vérifie ta boîte e-mail et confirme ton adresse, puis reviens ici pour te connecter.');
   }else{
    const r=await client.auth.signInWithPassword({email:String(fields.email||'').trim(),password:String(fields.password||'')});
    if(r.error)throw r.error;
    await openAccount(r.data.user);
   }
  }catch(e){notice(e.message)}
  finally{btn.disabled=false;}
 });
}
const oldDecorate=window.TableIntegration?.decorate;
if(window.TableIntegration)window.TableIntegration.decorate=function(ctx){oldDecorate?.(ctx);decorate(ctx)};
authBody();bindGate();
client.auth.getSession().then(async r=>{
 if(r.error){notice(r.error.message);return;}
 if(r.data.session?.user)await openAccount(r.data.session.user);
}).catch(e=>notice(e.message));
client.auth.onAuthStateChange((evt,session)=>{
 if(evt==='SIGNED_OUT'&&active){active=false;uid='';window.GuiltanasMJActiveStorage=null;authBody();showGate();}
 if(evt==='SIGNED_IN'&&session?.user&&!active){setTimeout(()=>{if(!active)openAccount(session.user)},0);}
});
setInterval(()=>{if(active&&document.visibilityState==='visible'&&!dirty&&!syncing)getRemote()},45000);
window.addEventListener('online',()=>{if(active){if(dirty)saveCloud();else getRemote();}});
window.MJAccount={client,active:()=>active,hasLinkedBastide:()=>bastideLinked,markBastideLinked,shareScenario,redeem,refresh:getRemote};
})();
