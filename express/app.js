(()=>{'use strict';
const $=s=>document.querySelector(s),ROOT=new URL('../',location.href);
const STORAGE='guiltanas_express_settings_v1';
const safeData=()=>{try{const x=JSON.parse(localStorage.getItem(STORAGE)||'{}');return x&&typeof x==='object'?x:{}}catch{return{}}};
let saved=safeData(),role=saved.role==='mj'?'mj':'pj',installPrompt=window.__GuiltanasInstallPrompt||null;
const campaigns=[
 {id:'solo',name:'Mes personnages',details:'COF2 · Partie indépendante',roles:['pj'],href:'fiches-personnages/',state:'active'},
 {id:'bastide',name:'Bastide',details:'COF2 · Île aux Tempêtes',roles:['pj','mj'],href:'mj-express/',state:'active'},
 {id:'nespresso',name:'Nespresso',details:'D&D · Campagne',roles:['pj','mj'],href:'ile-aux-tempetes/',state:'partial'},
 {id:'configurable',name:'Hub configurable',details:'Campagnes personnalisées',roles:['pj','mj'],href:'hub-configurable/',state:'partial'}
];
function persist(){saved.role=role;localStorage.setItem(STORAGE,JSON.stringify(saved));}
function linkOK(value){
 try{
  const link=new URL(value,location.href);
  const prefixes=['/atelier-guiltanas-apps/ile-aux-tempetes-bastide/','/atelier-guiltanas-apps/ile-aux-tempetes/','/atelier-guiltanas-apps/hub-configurable/'];
  if(link.origin!==location.origin||!prefixes.some(p=>link.pathname.startsWith(p)))throw Error('Lien extérieur non autorisé');
  if(link.username||link.password)throw Error('Lien invalide');
  return link.href;
 }catch{return null}
}
function campaignLink(c){
 if(role==='mj')return new URL(c.id==='bastide'?'mj-express/':c.id==='nespresso'?'ile-aux-tempetes/mj/':'hub-configurable/',ROOT).href;
 if(c.id==='solo')return new URL('fiches-personnages/',ROOT).href;
 return saved.links?.[c.id]||null;
}
function render(){
 for(const type of ['mj','pj']){const b=$('#role-'+type);b.classList.toggle('active',role===type);b.setAttribute('aria-selected',String(role===type));}
 $('#pj-shortcuts').hidden=role!=='pj';$('#link-section').hidden=role!=='pj';$('#mj-note').hidden=role!=='mj';
 $('#campaigns').replaceChildren();
 for(const c of campaigns.filter(x=>x.roles.includes(role))){
  const btn=document.createElement('button');const direct=!!campaignLink(c),working=c.id==='bastide'&&role==='mj'||c.id==='solo'||(role==='pj'&&direct);
  btn.dataset.state=working?'active':'planned';
  btn.innerHTML='<strong>'+c.name+'</strong><small>'+c.details+'</small><small>'+(working?'✓ Espace disponible':role==='pj'?'↗ Lien joueur à relier':'↗ Ouvrir le hub (Express à connecter)')+'</small>';
  btn.addEventListener('click',()=>{
   const url=campaignLink(c);
   if(!url){$('#link-status').textContent='Colle d’abord ton lien personnel '+c.name+' dans le champ ci-dessous.';$('#player-link').focus();return;}
   openFrame(url,c.name);
  });$('#campaigns').append(btn);
 }
}
function openFrame(url,title){
 const link=new URL(url);
 if(link.origin!==location.origin)return;
 $('#frame-title').textContent=title;$('#frame').src=link.href;
 $('#frame-wrap').hidden=false;history.pushState({express:true,frame:true,url:link.href,title},'',location.href);
}
function back(){if(history.state?.frame){history.back();return}closeFrame();}
function closeFrame(){$('#frame-wrap').hidden=true;$('#frame').src='about:blank'}
window.addEventListener('popstate',e=>{
 if(e.state?.frame){$('#frame-title').textContent=e.state.title||'Mon espace';$('#frame').src=e.state.url;$('#frame-wrap').hidden=false;}
 else closeFrame();
});
for(const type of ['pj','mj'])$('#role-'+type).onclick=()=>{role=type;persist();render();};
$('#open-sheet').onclick=()=>openFrame(new URL('fiches-personnages/',ROOT),'Mes personnages · COF2');
$('#open-forge').onclick=()=>openFrame(new URL('forge-of-heroes/',ROOT),'Forge of Heroes');
$('#save-link').onclick=()=>{
 const value=linkOK($('#player-link').value.trim());
 if(!value){$('#link-status').textContent='Lien non reconnu. Utilise le lien joueur personnel d’un hub Guiltanas.';return}
 const pathname=new URL(value).pathname;
 const id=pathname.includes('/ile-aux-tempetes-bastide/')?'bastide':pathname.includes('/ile-aux-tempetes/')?'nespresso':'configurable';
 saved.links=saved.links||{};saved.links[id]=value;persist();$('#player-link').value='';
 $('#link-status').textContent='✓ Lien '+id+' enregistré sur cet appareil. Aucune clé transmise à ce lanceur.';render();
};
$('#frame-back').onclick=back;
$('#frame-external').onclick=()=>{if($('#frame').src!=='about:blank')window.open($('#frame').src,'_blank','noopener')};
function installed(){return window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true}
function guide(){
 if(installed())return'Guiltanas Express est déjà lancé comme application.';
 if(/SamsungBrowser/i.test(navigator.userAgent))return'Samsung Internet → menu ☰ → Ajouter la page à → Écran d’accueil / Applications.';
 if(/Android/i.test(navigator.userAgent))return'Chrome → menu ⋮ → Installer l’application / Ajouter à l’écran d’accueil.';
 if(/iPhone|iPad/i.test(navigator.userAgent))return'Safari → Partager → Sur l’écran d’accueil.';
 return'Chrome ou Edge → menu ⋮ → Installer cette page comme application.';
}
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;$('#install-help').textContent='Installation native prête. Utilise le bouton Installer.'});
window.addEventListener('appinstalled',()=>{$('#install-help').textContent='✓ Installation terminée.';$('#install').textContent='✓ Installée';installPrompt=null});
$('#install').onclick=()=>{
 if(installed()){$('#install-help').textContent=guide();return}
 if(installPrompt){const prompt=installPrompt;installPrompt=null;try{const result=prompt.prompt();Promise.resolve(result).then(()=>prompt.userChoice).then(x=>{if(x?.outcome!=='accepted')$('#install-help').textContent=guide()}).catch(()=>{$('#install-help').textContent=guide()});}catch{$('#install-help').textContent=guide()}}else $('#install-help').textContent=guide();
};
if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(e=>{$('#install-help').textContent='Service worker non actif : '+e.message});
if(!history.state?.express)history.replaceState({express:true,frame:false},'',location.href);
render();
})();