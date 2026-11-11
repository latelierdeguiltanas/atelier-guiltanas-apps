/* Module optionnel: import prive des ressources Bastide vers des tables isolees.
   Lecture seule de l'API historique; ne transmet et n'enregistre jamais les cles,
   personnages, inventaires joueurs, messages ou historique de partie. */
(function(){
'use strict';
const A=window.TableManagerAPI,D=window.TableDomain;if(!A||!D)return;
const ROOT='https://latelierdeguiltanas.github.io/atelier-guiltanas-apps/';
const API='https://jitatmdbipjkvjstcgdc.supabase.co/functions/v1/';
const PUBLIC_KEY='sb_publishable_XKVr4_kE2qsywCTgurH0CQ_GTXrEFeU';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const clip=v=>String(v??'').slice(0,700);
const key=()=>String(localStorage.getItem('iot_bastide_inventory_key_v1')||'').replace(/ /g,'+').trim();
const status={checking:false,loaded:false,players:0,shop:0,scenario:0,maps:0,encounters:0};
let importBusy=false;
function link(path){return ROOT+path}
async function api(fn,action,token){
 const r=await fetch(API+fn+'?action='+encodeURIComponent(action),{method:'GET',cache:'no-store',
 headers:{'apikey':PUBLIC_KEY,'Authorization':'Bearer '+PUBLIC_KEY,'x-bastide-key':token},signal:AbortSignal.timeout(25000)});
 let data={};try{data=await r.json()}catch{}
 if(!r.ok)throw Error(data.error||'Lecture Bastide indisponible ('+r.status+')');
 return data;
}
const only=(row,keys)=>Object.fromEntries(keys.map(k=>[k,row?.[k]]).filter(([,v])=>v!==undefined));
const SHOP=['id','name','base','category','description','price_silver','stock','charges_max','equipment','sort_order','active'];
const SCENARIO=['id','title','kind','category','description','image_url','mechanical_base','equipment','sort_order'];
const MAPS=['id','title','description','image_url','player_visible','sort_order'];
const NPC=['id','name','kind','summary','player_text','mj_notes','image_url','player_visible','sort_order'];
function buildPack(admin,npcs,combat){
 const shop=(admin.items||[]).filter(x=>x.active!==false).map(x=>only(x,SHOP));
 const scenarioItems=(admin.scenario||[]).filter(x=>x.active!==false).map(x=>only(x,SCENARIO));
 const maps=(admin.maps||[]).map(x=>only(x,MAPS));
 const encounters=(npcs.encounters||[]).map(x=>only(x,NPC));
 const customCombat=(combat.library?.campaigns||[]).map(c=>({name:c.name,format:c.format,
  monsters:c.monsters||{},encounters:c.encounters||{}}));
 // Modules inventaires, PAS une chronologie inventee. Le scenario complet sous licence n'est pas redistribue.
 const modules=[
  {name:'Cartes et lieux (catalogue)',duration:90,summary:'Cartes sauvegardees dans la Bastide ; organiser ensuite les etapes de la seance.',
   scenes:maps.map(m=>({title:m.title||'Lieu',description:m.description||'Carte disponible dans les ressources.',gmNotes:'Consulter la carte dans Ressources.',encounters:[]}))},
  {name:'Rencontres et PNJ (catalogue)',duration:90,summary:'Descriptions et notes de rencontres disponibles dans le hub original.',
   scenes:encounters.map(n=>({title:n.name||'Rencontre',description:n.summary||'',gmNotes:n.mj_notes||'',encounters:[]}))}
 ];
 return D.normalizedScenario({name:'L’Île aux Tempêtes',category:'campaign',system:'COF2',copyright:'external-personal-use',
 description:'Copie privee des ressources du MJ Bastide : boutique de Mila, objets de scenario, cartes, PNJ et preparations de combats. Aucun personnage, aucune cle, aucun inventaire joueur. Les chapitres officiels du scenario sont a consulter dans votre exemplaire autorise.',
 modules,assets:{shop,scenarioItems,maps,encounters,combat:customCombat,source:'Bastide — lecture seule',importedAt:new Date().toISOString()}});
}
async function importBastide(){
 if(importBusy)return;
 const token=key();
 if(!token){A.notify('Acces MJ prive absent sur cet appareil. Ouvre ton lien MJ Bastide une fois.');return}
 importBusy=true;
 const button=document.querySelector('[data-integration="import"]');if(button)button.disabled=true;
 try{
  const who=await api('bastide-inventory','identity',token);
  if(who.access!=='admin')throw Error('La cle de cet appareil n est pas un acces MJ Bastide.');
  const [admin,npcs,combat]=await Promise.all([
   api('bastide-inventory','admin',token),
   api('bastide-inventory','encounters-admin',token),
   api('bastide-session','combat-library',token)
  ]);
  const pack=buildPack(admin,npcs,combat);
  const assets=pack.assets;
  if(!confirm('Importer ce modele prive en LECTURE SEULE ?\n\n'+assets.shop.length+' articles de Mila\n'+assets.scenarioItems.length+' objets de scenario\n'+assets.maps.length+' cartes\n'+assets.encounters.length+' rencontres/PNJ\n'+assets.combat.length+' preparation(s) de combat\n\n0 PJ, 0 inventaire de PJ, 0 cle.\n\nLa Bastide ne sera pas modifiee.'))return;
  const db=A.getDb();
  // Import sans remplacement de pack existant: aucun risque pour les anciennes tables.
  db.scenarios.push(pack);A.save();A.showLibrary();
  A.notify('L’Île aux Tempêtes est dans tes scénarios, sans aucun PJ.');
  await window.MJAccount?.markBastideLinked?.();
 }catch(error){A.notify('Import Bastide impossible : '+error.message);}
 finally{importBusy=false;const b=document.querySelector('[data-integration="import"]');if(b)b.disabled=false;}
}
async function readLive(){
 if(status.checking)return;status.checking=true;
 const area=document.getElementById('bastide-live-data');if(area)area.textContent='Lecture de la Bastide…';
 try{
  const token=key();if(!token)throw Error('Ouvre ton lien MJ Bastide sur cet appareil.');
  const who=await api('bastide-inventory','identity',token);
  if(who.access!=='admin')throw Error('Acces MJ requis');
  const admin=await api('bastide-inventory','admin',token);
  status.players=(admin.players||[]).length;
  status.playerNames=(admin.players||[]).map(x=>String(x.display_name||'').slice(0,70)).filter(Boolean);
  status.shop=(admin.items||[]).filter(x=>x.active!==false).length;
  status.scenario=(admin.scenario||[]).length;
  status.maps=(admin.maps||[]).length;
  status.loaded=true;
  if(area)area.textContent=status.players+' PJ actifs · '+status.shop+' articles Mila · '+status.scenario+' objets de scenario · '+status.maps+' cartes (etat actuel, lecture seule). Personnages : '+(status.playerNames||[]).join(', ')+'.';
 }catch(error){if(area)area.textContent='Non connecte : '+error.message;}
 finally{status.checking=false;}
}
function homePanel(){
 const section=document.createElement('section');section.className='panel';section.id='bastide-legacy-panel';
 section.innerHTML='<div class="eyebrow">TABLE EXISTANTE · NON MIGREEE</div><h2>La Bastide — ma table actuelle</h2>'+
 '<p>Retrouve exactement les donnees et les personnages de ton hub historique. Cette carte ouvre le vrai hub : pas de copie concurrente.</p>'+
 '<div class="actions"><a class="button primary" href="'+link('ile-aux-tempetes-bastide/mj/')+'" target="_blank" rel="noopener">Ouvrir mon hub Bastide</a>'+
 '<a class="button" target="_blank" rel="noopener" href="'+link('ile-aux-tempetes-bastide/mj/boutique/')+'">Boutique Mila · Bastide</a>'+ '<a class="button" target="_blank" rel="noopener" href="'+link('gestionnaire-combat-cof2/multi/?space=ba571de0-0000-4000-8000-000000000001&name=Ile%20aux%20Tempetes&format=campaign&pack=island&source=bastide')+'">Combat Bastide</a>'+ '<button class="button" data-integration="status">Verifier les donnees actuelles</button>'+
 '<button class="button" data-integration="import">Importer le scenario sans PJ</button></div>'+
 '<p class="note" id="bastide-live-data">Aucun acces serveur partage avec les nouvelles tables.</p>';
 return section;
}
function packPanel(){
 const p=document.createElement('section');p.className='panel';p.id='bastide-pack-panel';
 p.innerHTML='<h2>Pack personnel · Île aux Tempêtes</h2><p>Importer <b>tes ressources</b> en lecture seule depuis la Bastide : boutique de Mila, objets, cartes, PNJ et preparations. Le pack obtenu reste sur cet appareil tant que tu ne l exportes pas. Aucun PJ n est repris.</p>'+
 '<div class="actions"><button class="button primary" data-integration="import">Importer depuis mon acces MJ Bastide</button><a class="button" href="'+link('ile-aux-tempetes-bastide/mj/')+'" target="_blank" rel="noopener">Ouvrir la Bastide</a></div>'+
 '<p class="note">Pour ton ami : une fois le pack importe, clique sur « Exporter » dans la bibliotheque et envoie-lui le fichier JSON. Il l importe dans « Scenarios », puis cree sa table avec ses propres PJ. Le pack n est pas publie publiquement.</p>';
 return p;
}
function summaryResources(t){
 const a=t.scenario.assets||{},counts=[['Boutique de Mila',a.shop?.length||0],['Objets de scenario',a.scenarioItems?.length||0],['Cartes',a.maps?.length||0],['PNJ / Rencontres',a.encounters?.length||0],['Combats personnalises',a.combat?.length||0]];
 const cards=counts.map(([name,count])=>'<div class="stat"><b>'+count+'</b><span>'+esc(name)+'</span></div>').join('');
 return '<div class="statrow">'+cards+'</div>';
}
function resourceRows(t){
 const a=t.scenario.assets||{};
 const shop=(a.shop||[]).map((x,i)=>'<div class="record resource-row" data-search="'+esc((x.name||'')+' '+(x.category||''))+'"><div><b>'+esc(x.name)+'</b><p>'+esc(x.category)+' · '+esc(x.description||'')+'</p><p>Prix : '+esc(x.price_silver)+' PA · Stock : '+(x.stock==null?'illimite':esc(x.stock))+'</p></div><div class="actions">'+(x.stock!=null?'<button class="button sm" data-integration="stock-minus" data-index="'+i+'">−1</button><button class="button sm" data-integration="stock-plus" data-index="'+i+'">+1</button>':'')+'</div></div>').join('')||'<p class="empty">Aucun article importe.</p>';
 const objs=(a.scenarioItems||[]).map(x=>'<details class="scene resource-row" data-search="'+esc((x.title||'')+' '+(x.category||''))+'"><summary>'+esc(x.title||x.name)+'</summary><p>'+esc(x.category||'')+'</p><p>'+esc(x.description||'')+'</p></details>').join('')||'<p class="empty">Aucun objet de scenario importe.</p>';
 const maps=(a.maps||[]).map(x=>'<article class="scene resource-row" data-search="'+esc(x.title)+'"><h4>'+esc(x.title)+'</h4><p>'+esc(x.description||'')+'</p>'+(x.image_url?'<a class="button sm" target="_blank" rel="noopener noreferrer" href="'+esc(x.image_url)+'">Voir la carte</a>':'')+'</article>').join('')||'<p class="empty">Aucune carte importee.</p>';
 const npc=(a.encounters||[]).map(x=>'<details class="scene resource-row" data-search="'+esc((x.name||'')+' '+(x.kind||''))+'"><summary>'+esc(x.name)+'</summary><p>'+esc(x.kind||'')+' · '+esc(x.summary||'')+'</p><p>'+esc(x.player_text||'')+'</p><div class="gm">'+esc(x.mj_notes||'Pas de note MJ.')+'</div></details>').join('')||'<p class="empty">Aucune rencontre importee.</p>';
 return '<section class="panel"><h2>Ressources de cette table</h2><p class="muted">Copie independante. Modifier les stocks ci-dessous ne touche jamais Mila sur la Bastide. Les achats PJ et envois automatiques demandent encore une connexion serveur propre a cette table.</p>'+summaryResources(t)+
 '<label class="field">Rechercher un element<input id="resource-search" placeholder="Objet, PNJ, carte…"></label>'+
 '<div class="tabs" id="resource-tabs">'+[['shop','Mila'],['objects','Objets'],['maps','Cartes'],['npcs','PNJ']].map(([k,v])=>'<button class="resource-tab'+(k==='shop'?' active':'')+'" data-integration="resource-tab" data-kind="'+k+'">'+v+'</button>').join('')+'</div>'+
 '<div data-resource-panel="shop">'+shop+'</div><div data-resource-panel="objects" hidden>'+objs+'</div><div data-resource-panel="maps" hidden>'+maps+'</div><div data-resource-panel="npcs" hidden>'+npc+'</div></section>';
}
function combatUrl(t){
 return link('gestionnaire-combat-cof2/multi/')+'?space='+encodeURIComponent(t.id)+'&name='+encodeURIComponent(t.name)+'&format=campaign';
}
function initCombat(t){
 if(!/^[a-f0-9-]{36}$/i.test(t.id))throw Error('Cette table a un ancien identifiant. Creer une table recente.');
 const store='guiltanas_cof2_campaigns_v1_'+t.id;
 if(!localStorage.getItem(store)){
  const combat=t.scenario.assets?.combat?.[0]||{},cid=crypto.randomUUID();
  const customMonsters=combat.monsters&&typeof combat.monsters==='object'?combat.monsters:{};
  const customEncounters=combat.encounters&&typeof combat.encounters==='object'?combat.encounters:{};
  const c={id:cid,name:t.name,format:'campaign',pack:false,monsters:customMonsters,encounters:customEncounters,
   state:{version:5,fighters:[],log:[],groupEffects:[],lastRecommendation:null,party:[]}};
  localStorage.setItem(store,JSON.stringify({version:1,selected:cid,campaigns:[c]}));
 }
}
function toolsPanel(t){
 const p=document.createElement('section');p.className='panel';p.id='table-isolated-tools';
 p.innerHTML='<h2>Outils relies a cette table</h2><div class="grid">'+
 '<article class="card"><h3>Combats COF2 · espace independant</h3><p>Le combat utilise son propre identifiant de table, aucun des six PJ Bastide n est installe. Les rencontres personnalisees sauvegardees peuvent etre reprises. Mode local sur cet appareil, pas encore partage aux joueurs.</p><button class="button primary" data-integration="combat">Ouvrir le combat de cette table</button></article>'+
 '<article class="card"><h3>La boutique de Mila · copie</h3><p>Consulte les articles et ajuste les stocks independamment dans Ressources. Les achats synchronises aux fiches arriveront avec le serveur multi-MJ.</p><button class="button" data-integration="show-resources">Ouvrir les ressources</button></article>'+
 '<article class="card"><h3>Soundboard</h3><p>Ouvre le soundboard existant dans un autre onglet. Les sons restent geres dans cet outil et ne sont pas synchronises avec les tables.</p><a class="button" target="_blank" rel="noopener noreferrer" href="https://latelierdeguiltanas.github.io/soundboard/">Ouvrir le Soundboard</a></article>'+
 '</div></section>';
 return p;
}
function decorate(ctx){
 const root=document.getElementById('app');if(!root)return;
 if(ctx.view==='home'){
  const hero=root.querySelector('.hero');if(hero&&(!!key()||window.MJAccount?.hasLinkedBastide?.()))hero.after(homePanel());
  return;
 }
 if(ctx.view==='library'){
  const hero=root.querySelector('.hero');if(hero&&(!!key()||window.MJAccount?.hasLinkedBastide?.()))hero.after(packPanel());
  return;
 }
 if(ctx.view!=='table'||!ctx.table)return;
 const t=ctx.table;
 if(ctx.tab==='overview'){
  const content=root.querySelector('.statrow');if(content){
   const b=document.createElement('div');b.className='alert';
   b.innerHTML='<b>Pack choisi :</b> '+esc(t.scenario.name)+' · '+(t.scenario.assets?.shop?.length||0)+' articles boutique · '+(t.scenario.assets?.scenarioItems?.length||0)+' objets de scenario. <button class="button sm" data-integration="show-resources">Voir les ressources</button>';
   content.after(b);
  }
 }
 const tabs=root.querySelector('.tabs[role="tablist"]');
 if(tabs){const tab=document.createElement('button');tab.setAttribute('role','tab');tab.className=ctx.tab==='resources'?'active':'';tab.textContent='Ressources';tab.dataset.integration='show-resources';tabs.append(tab);}
 const tools=tabs?.nextElementSibling;
 if(ctx.tab==='tools')root.append(toolsPanel(t));
 if(ctx.tab==='resources'){
  const holder=document.createElement('div');holder.innerHTML=resourceRows(t);root.append(...holder.children);
 }
 const action=root.querySelector('.row.between .actions');
 if(action){const b=document.createElement('button');b.className='button sm';b.textContent='Dupliquer sans PJ';b.dataset.integration='copy-clean';action.prepend(b);}
}
window.TableIntegration={decorate,buildPack};
document.addEventListener('click',async ev=>{
 const b=ev.target.closest('[data-integration]');if(!b)return;
 const action=b.dataset.integration,t=A.selectedTable();
 try{
  if(action==='import'){await importBastide();return}
  if(action==='status'){await readLive();return}
  if(action==='show-resources'){A.setTab('resources');return}
  if(action==='copy-clean'){
   if(!t)return;const clone=D.duplicateTable(A.getDb(),t.id,{withoutCharacters:true});A.save();A.openTable(clone.id);A.notify('Table dupliquee avec 0 PJ et 0 seance.');return;
  }
  if(action==='stock-plus'||action==='stock-minus'){
   if(!t)return;const item=t.scenario.assets?.shop?.[Number(b.dataset.index)];
   if(!item||item.stock==null)return;
   item.stock=Math.max(0,item.stock+(action==='stock-plus'?1:-1));A.save();A.refresh();return;
  }
  if(action==='resource-tab'){
   document.querySelectorAll('.resource-tab').forEach(x=>x.classList.toggle('active',x===b));
   document.querySelectorAll('[data-resource-panel]').forEach(x=>x.hidden=x.dataset.resourcePanel!==b.dataset.kind);
   const search=document.getElementById('resource-search');if(search)search.value='';
   document.querySelectorAll('.resource-row').forEach(x=>x.hidden=false);return;
  }
  if(action==='combat'){
   if(!t)return;initCombat(t);window.open(combatUrl(t),'_blank','noopener');return;
  }
 }catch(error){A.notify('Erreur : '+error.message);}
});
document.addEventListener('input',ev=>{
 if(ev.target.id!=='resource-search')return;
 const q=ev.target.value.trim().toLocaleLowerCase('fr');
 document.querySelectorAll('[data-resource-panel]:not([hidden]) .resource-row').forEach(x=>x.hidden=!x.dataset.search.toLocaleLowerCase('fr').includes(q));
});
A.refresh();
})();