'use strict';
// The historical manager is retained untouched. This edition reuses its COF2 engine.
const BASE_MONSTERS=structuredClone(MONSTERS),ISLAND_ENCOUNTERS=structuredClone(ENCOUNTERS);

// Équilibrage maison Bastide / six PJ niveau 2 — uniquement pour le pack privé Île aux Tempêtes.
// Les profils communs, le gestionnaire historique et les combats déjà engagés restent inchangés.
const PACK_GROTTE_MONSTERS={
 'bastide-pieuvre-poussemer':{
  ...structuredClone(BASE_MONSTERS['spore-octopus']),
  id:'bastide-pieuvre-poussemer',name:'Pieuvre des spores — Bastide N2 (entrée)',
  status:'adapted',source:'Variante MJ Bastide · 6 PJ niveau 2 · non officielle',nc:2,
  def:16,pv:28,
  attacks:[{name:'Tentacules',bonus:5,damage:'1d6+3',text:'Allonge 5 m. Une attaque par action A. Étreinte possible selon la capacité.'}],
  notes:'B1 : gardien défensif, possibilité de contournement ou de retraite. Ne pas ajouter automatiquement des striges. NC indicatif, variante maison.'
 },
 'bastide-serpent-cristal':{
  ...structuredClone(BASE_MONSTERS['fire-snake']),
  id:'bastide-serpent-cristal',name:'Serpent de feu — Cristal Bastide N2 (boss)',
  status:'adapted',source:'Variante MJ Bastide · 6 PJ niveau 2 · non officielle',nc:3,
  def:16,pv:45,
  attacks:[{name:'Morsure brûlante',bonus:5,damage:'1d6+3',text:'Dégâts moitié physiques, moitié feu. Une attaque par action A.'}],
  notes:'Boss B6 contre 6 PJ niv. 2 : 45 PV et DEF 16, dégâts de base conservés. Corps brûlant / résistance feu / vulnérabilité froid à appliquer manuellement. NC 3 indicatif, non certifié COF2. Les guivres-follettes ne sont PAS ajoutées automatiquement au boss.'
 }
};
const PACK_GROTTE_ENCOUNTERS=structuredClone(ISLAND_ENCOUNTERS);
const GROTTE_TUNING={
 'b1-pieuvre':{
   defaultLevel:2,allowed:['spore-octopus','bastide-pieuvre-poussemer','stirge'],
   limits:{'spore-octopus':[0,1],'bastide-pieuvre-poussemer':[0,1],stirge:[0,6]},required:{},
   sixth:null,scalable:'stirge',
   variants:{1:{'spore-octopus':1},2:{'bastide-pieuvre-poussemer':1}},
   balance:'BASTIDE 6 PJ N2 : pieuvre d’entrée plus mesurée (DEF 16, 28 PV, DM 1d6+3). Pas de strige automatique. Rencontre défensive évitable. Difficile = +1 strige si besoin.'
 },
 'b2-thallophytes':{
   defaultLevel:2,sixth:null,
   variants:{1:{'violet-fungus':3},2:{'violet-fungus':4}},
   balance:'BASTIDE 6 PJ N2 : quatre thallophytes dangereuses, mais lentes et évitables. Les myconides ne sont PAS des ennemis. Difficile = 5 ; très dangereuse = 6.'
 },
 'b3-striges':{
   defaultLevel:2,sixth:null,
   variants:{1:{stirge:3},2:{stirge:3}},
   balance:'BASTIDE 6 PJ N2 : trois striges au départ ; 4 en difficile, 5 en très dangereuse. Drain suivi manuellement, pas de renfort automatique lié au nombre de PJ.'
 },
 'b4-myconides':{
   defaultLevel:2,sixth:null,scalable:'myconid-adult',
   variants:{1:{'myconid-adult':3},2:{'myconid-adult':2}},
   balance:'BASTIDE 6 PJ N2 : dialogue et entraide prioritaires. Combat UNIQUEMENT si agression des PJ ; deux défenseurs au départ, renforts seulement sur décision du MJ.'
 },
 'b5-sanctuaire':{
   defaultLevel:2,
   balance:'BASTIDE 6 PJ N2 : scène sociale / secours à Sinensa. Sinensa inconsciente ne rejoint jamais le combat. Les deux adultes ne combattent que si les PJ deviennent menaçants.'
 },
 'b6-arrivee':{
   defaultLevel:2,sixth:null,
   variants:{1:{'will-o-wyrm':2},2:{'will-o-wyrm':2}},
   balance:'BASTIDE 6 PJ N2 : deux guivres-follettes lors de la première vague (3 en difficile, 4 en très dangereuse). Aucun ajout automatique pour le sixième PJ.'
 },
 'b6-cristal':{
   defaultLevel:2,allowed:['fire-snake','bastide-serpent-cristal','will-o-wyrm'],
   limits:{'fire-snake':[0,1],'bastide-serpent-cristal':[0,1],'will-o-wyrm':[0,4]},required:{},
   sixth:null,scalable:'will-o-wyrm',
   variants:{1:{'fire-snake':1},2:{'bastide-serpent-cristal':1}},
   balance:'BASTIDE 6 PJ N2 : boss serpent du cristal (45 PV, DEF 16) seul en difficulté ordinaire, après les guivres de B6. Difficile = 1 guivre supplémentaire ; très dangereuse = 2. Ne pas charger les deux phases en même temps.'
 }
};
for(const [id,changes] of Object.entries(GROTTE_TUNING)){
 if(!PACK_GROTTE_ENCOUNTERS[id])throw Error('Rencontre absente du pack : '+id);
 Object.assign(PACK_GROTTE_ENCOUNTERS[id],changes);
}

const query=new URLSearchParams(location.search),scope=/^[a-f0-9-]{36}$/.test(query.get('space')||'')?query.get('space'):'standalone';
const ISLAND_PARTY=[
 {id:'prepotante',name:'Prépôtante',pv:9,def:16,init:15,selected:true},
 {id:'scanlan',name:'Scanlan',pv:9,def:14,init:10,selected:true},
 {id:'wilfried',name:'Wilfried',pv:8,def:17,init:10,selected:true},
 {id:'zepheline',name:'Zéphéline',pv:4,def:13,init:11,selected:true},
 {id:'vivelame',name:'Vivelame',pv:9,def:16,init:10,selected:true},
 {id:'fylar',name:'Faëlar',pv:10,def:14,init:14,selected:true},
 {id:'fylar-wolf',name:'Loup de Faëlar',pv:4,def:13,init:14,selected:true,role:'companion'}
];
const LIBRARY_KEY='guiltanas_cof2_campaigns_v1_'+scope;
function blankCombat(){return {version:5,fighters:[],log:[],groupEffects:[],lastRecommendation:null,party:[]};}
function newCampaign(name,format='campaign',pack=false){return {id:crypto.randomUUID(),name:String(name).slice(0,100),format,pack,monsters:{},encounters:{},state:blankCombat()};}
let library;
try{const raw=localStorage.getItem(LIBRARY_KEY);library=raw?JSON.parse(raw):null;}catch(e){alert('Les préparations locales sont illisibles. Aucune donnée ne sera écrasée.');throw e;}
// Première ouverture depuis un hub sur l'appareil déjà utilisé : reprendre la bibliothèque autonome.
if(!library&&scope!=='standalone'){try{const previous=JSON.parse(localStorage.getItem('guiltanas_cof2_campaigns_v1_standalone')||'null');if(previous?.version===1&&Array.isArray(previous.campaigns)&&previous.campaigns.length)library=structuredClone(previous);}catch{/* Une ancienne copie illisible ne remplace jamais un espace hub. */}}
if(!library){const c=newCampaign(query.get('name')||'Ma campagne',query.get('format')==='oneshot'?'oneshot':'campaign');library={version:1,selected:c.id,campaigns:[c]};}
if(!Array.isArray(library.campaigns)||!library.campaigns.length)throw Error('Bibliothèque de combat invalide.');
let current=library.campaigns.find(c=>c.id===library.selected)||library.campaigns[0],blocked=false;
const islandAccess=query.get('pack')==='island'||library.campaigns.some(c=>c.pack);
function persistLibrary(){if(blocked)throw Error('Cet espace a changé dans un autre onglet. Rechargez la page.');localStorage.setItem(LIBRARY_KEY,JSON.stringify(library));}
window.addEventListener('storage',e=>{if(e.key===LIBRARY_KEY&&!blocked){blocked=true;alert('Les préparations ont changé dans un autre onglet. Rechargez cette page avant de continuer.');}});
save=function(){current.state=state;persistLibrary();};
const baseRecommend=recommend,baseBestiary=renderBestiary,baseMonster=openMonster;
recommend=function(){if(!ENCOUNTERS[encounter.value]){state.lastRecommendation=null;recommendation.innerHTML='<p class="result">Aucun combat préparé. Créez une rencontre, ou ajoutez la campagne Île aux Tempêtes.</p>';return;}baseRecommend();if(current.encounters[encounter.value])recommendation.querySelector('.why').textContent='Composition manuelle du MJ : ajustez les quantités et validez la difficulté en fonction de votre groupe. Aucun renfort automatique.';};
showEncounterSource=function(){const e=ENCOUNTERS[encounter.value];if(!e)return;modalTitle.textContent=e.name;modalBody.innerHTML=`<p>${esc(e.zone||'')}</p><p>${esc(e.original||'')}</p><p>${esc(e.balance||'Composition choisie manuellement par le MJ.')}</p>`;modal.showModal();};
renderBestiary=function(){baseBestiary();document.querySelectorAll('#bestiary .bestCard').forEach(card=>{const open=card.querySelector('button'),id=open?.getAttribute('onclick')?.match(/openMonster\('([^']+)'\)/)?.[1];if(!id)return;const b=document.createElement('button');b.textContent=current.monsters[id]?'Modifier mon monstre':'Créer une variante';b.onclick=()=>editMonster(id);card.append(b);});};
openMonster=function(id){baseMonster(id);if(MONSTERS[id]?.status==='custom')modalBody.innerHTML=modalBody.innerHTML.replaceAll('Adaptation Île aux Tempêtes','Création du MJ');};
function selectCampaign(id){current=library.campaigns.find(c=>c.id===id)||current;if(current.pack&&!current.state.party.length)current.state.party=structuredClone(ISLAND_PARTY);library.selected=current.id;state=current.state;STATE_KEY=LIBRARY_KEY;for(const k of Object.keys(MONSTERS))delete MONSTERS[k];Object.assign(MONSTERS,structuredClone(BASE_MONSTERS),...(current.pack?[structuredClone(PACK_GROTTE_MONSTERS)]:[]),structuredClone(current.monsters));for(const k of Object.keys(ENCOUNTERS))delete ENCOUNTERS[k];Object.assign(ENCOUNTERS,current.pack?structuredClone(PACK_GROTTE_ENCOUNTERS):{},structuredClone(current.encounters));document.body?.classList.remove('campaign-home');document.getElementById('campaignHome')?.remove();init();campaignSelect.innerHTML=library.campaigns.map(c=>`<option value="${c.id}" ${c.id===current.id?'selected':''}>${esc(c.name)} · ${c.format==='oneshot'?'One-shot':'Campagne'}</option>`).join('');const islandButton=document.getElementById('islandPackButton');if(islandButton)islandButton.hidden=!islandAccess;if(ENCOUNTERS[current.selectedEncounter])encounter.value=current.selectedEncounter;partyLevel.value=ENCOUNTERS[encounter.value]?.defaultLevel||1;recommend();encounter.onchange=()=>{current.selectedEncounter=encounter.value;partyLevel.value=ENCOUNTERS[encounter.value]?.defaultLevel||1;recommend();save();};addPartyButton.textContent='Ajouter un PJ';renderBestiary();save();}
function switchCampaign(id){save();modal.close();selectCampaign(id);}
function createCampaign(defaultFormat='campaign'){modalTitle.textContent='Nouvelle aventure';modalBody.innerHTML=`<form id="campaignForm"><label>Nom<input name="name" required maxlength="100"></label><label>Format<select name="format"><option value="campaign" ${defaultFormat==='campaign'?'selected':''}>Campagne</option><option value="oneshot" ${defaultFormat==='oneshot'?'selected':''}>One-shot</option></select></label><button class="primary">Créer</button></form>`;modal.showModal();document.getElementById('campaignForm').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target),name=f.get('name').trim();if(!name)return;save();const c=newCampaign(name,f.get('format'));library.campaigns.push(c);modal.close();selectCampaign(c.id);};}
function legacyIslandState(){try{const old=JSON.parse(localStorage.getItem('guiltanas_cof2_combat_v1')||'null');if(old&&Array.isArray(old.fighters)&&Array.isArray(old.party)&&Array.isArray(old.log)){old.groupEffects=Array.isArray(old.groupEffects)?old.groupEffects:[];return old;}}catch{}return null;}
function installIsland(){if(!islandAccess)return;const existing=library.campaigns.find(c=>c.pack);if(existing){if(!existing.state.party.length)existing.state.party=structuredClone(ISLAND_PARTY);switchCampaign(existing.id);return;}save();const c=newCampaign('Île aux Tempêtes','campaign',true),legacy=legacyIslandState();c.state=legacy||blankCombat();if(!c.state.party.length)c.state.party=structuredClone(ISLAND_PARTY);library.campaigns.push(c);selectCampaign(c.id);}
function showCampaignHome(){if(typeof document==='undefined'||!document.body)return;try{save();}catch{}document.body.classList.add('campaign-home');document.getElementById('campaignHome')?.remove();const home=document.createElement('section');home.id='campaignHome';home.className='campaignHome';const cards=library.campaigns.map(c=>`<button class="campaignChoice ${c.pack?'island':''}" onclick="switchCampaign('${c.id}')"><span>${c.format==='oneshot'?'ONE-SHOT':'CAMPAGNE'}${c.pack?' · ESPACE PRIVÉ':''}</span><strong>${esc(c.name)}</strong><span>${c.pack?'19 rencontres préconfigurées · équipe et bestiaire COF2':'PJ, monstres et rencontres propres à cet environnement'}</span><em>Ouvrir →</em></button>`).join('');const islandCard=islandAccess&&!library.campaigns.some(c=>c.pack)?`<button class="campaignChoice island" onclick="installIsland()"><span>CAMPAGNE PRÉCONFIGURÉE · ACCÈS PRIVÉ</span><strong>Île aux Tempêtes</strong><span>Retrouver les rencontres, les PJ et le bestiaire préparés pour la campagne.</span><em>Installer et ouvrir →</em></button>`:'';home.innerHTML=`<div class="campaignHomeInner">${query.get('source')==='bastide'?'<p><a class="button" style="color:var(--gold)" href="../../ile-aux-tempetes-bastide/mj/">← Retour à la Bastide</a></p>':''}<span class="pill">CHRONIQUES OUBLIÉES FANTASY 2</span><h1>Gestionnaire de combat</h1><p class="campaignHomeLead">Choisissez votre environnement. Chaque campagne conserve séparément ses personnages, ses rencontres, ses créations et son combat en cours.</p><div class="campaignCards">${cards}${islandCard}</div><div class="campaignHomeActions"><button class="primary" onclick="createCampaign()">+ Créer une campagne</button><button onclick="createCampaign('oneshot')">+ Créer un one-shot</button></div><p class="campaignHomeNote">Le moteur COF2, les règles et le bestiaire commun sont disponibles dans chaque environnement. Les campagnes des autres MJ ne sont jamais proposées dans cet accueil.</p></div>`;document.body.append(home);}
function inputField(name,label,value='',type='text',extra=''){return `<label>${label}<input name="${name}" type="${type}" value="${esc(value)}" ${extra}></label>`;}
function textField(name,label,value=''){return `<label>${label}<textarea name="${name}" maxlength="30000">${esc(value)}</textarea></label>`;}
function editPrepared(id){const e=ENCOUNTERS[id],own=!!current.encounters[id],composition=e?(state.lastRecommendation?.encounter===id?state.lastRecommendation.composition:e.variants[e.defaultLevel]):{};modalTitle.textContent=own?'Modifier le combat':'Préparer un combat';modalBody.innerHTML=`<form id="preparedForm">${inputField('name','Nom',e?.name||'','text','required maxlength="160"')}${textField('notes','Lieu, préparation et consignes MJ',e?.original||'')}${inputField('level','Niveau de référence',e?.defaultLevel||1,'number','min="1" max="5"')}<h3>Composition</h3><p class="tiny">Quantités manuelles : aucune difficulté n’est garantie automatiquement.</p><input id="monsterFilter" placeholder="Rechercher une créature"><div id="compositionList">${Object.values(MONSTERS).map(m=>`<label data-monster-row>${esc(m.name)} · NC ${m.nc}<input name="count-${m.id}" type="number" min="0" max="100" step="1" value="${composition[m.id]||0}"></label>`).join('')}</div><button class="primary">Enregistrer la préparation</button></form>`;modal.showModal();document.getElementById('monsterFilter').oninput=e=>{const q=e.target.value.toLocaleLowerCase('fr');modalBody.querySelectorAll('[data-monster-row]').forEach(row=>row.hidden=!row.textContent.toLocaleLowerCase('fr').includes(q));};document.getElementById('preparedForm').onsubmit=ev=>{ev.preventDefault();const f=new FormData(ev.target),name=f.get('name').trim(),level=Number(f.get('level')),c={};if(!name)return;for(const m of Object.values(MONSTERS)){const n=Number(f.get('count-'+m.id));if(n>0)c[m.id]=Math.min(100,Math.floor(n));}if(!Object.keys(c).length)return alert('Ajoutez au moins une créature.');const key=own?id:'custom-'+crypto.randomUUID();const rec={name,zone:'Préparation MJ',original:f.get('notes'),balance:'Composition manuelle du MJ. Aucun équilibrage automatique.',defaultLevel:level,allowed:Object.keys(c),limits:Object.fromEntries(Object.keys(c).map(k=>[k,[0,100]])),variants:{[level]:c}};current.encounters[key]=rec;current.selectedEncounter=key;modal.close();selectCampaign(current.id);};}
function deletePrepared(){const id=encounter.value;if(!current.encounters[id])return alert('Les rencontres du pack sont conservées. Créez une copie pour les adapter.');if(!confirm('Supprimer cette préparation ? Le combat en cours sera conservé.'))return;delete current.encounters[id];current.selectedEncounter=null;selectCampaign(current.id);}
function editMonster(id){const m=MONSTERS[id],own=!!current.monsters[id];modalTitle.textContent=own?'Modifier mon monstre':'Créer un monstre ou une variante';modalBody.innerHTML=`<form id="monsterForm">${inputField('name','Nom',m?.name||'','text','required maxlength="160"')}<div class="grid">${[['nc','NC',0],['pv','PV maximum',10],['def','DEF',10],['init','Initiative',10],...['agi','con','for','per','cha','int','vol'].map(k=>[k,k.toUpperCase(),0])].map(([k,l,v])=>inputField(k,l,m?.[k]??v,'number',k==='pv'?'min="1" max="100000" required':k==='nc'?'min="0" max="100" step="0.25" required':'min="-10000" max="10000" required')).join('')}</div>${inputField('type','Type',m?.type||'Créature')}${inputField('size','Taille',m?.size||'Moyenne')}${inputField('move','Déplacement',m?.move||'')}${textField('attacks','Attaques — une ligne par attaque : nom | bonus | dégâts | effet',m?.attacks.map(a=>[a.name,a.bonus,a.damage,a.text].join(' | ')).join('\n')||'')}${textField('abilities','Capacités — une ligne par capacité : nom | description',m?.abilities.map(a=>[a.name,a.text].join(' | ')).join('\n')||'')}${textField('notes','Notes MJ',m?.notes||'')}${inputField('source','Source / référence',m?.source||'Création personnelle du MJ')}<button class="primary">Enregistrer le monstre</button></form>`;modal.showModal();document.getElementById('monsterForm').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target),key=own?id:'custom-'+crypto.randomUUID(),v={id:key,status:'custom',side:'hostile'};for(const k of ['name','type','size','move','notes','source'])v[k]=f.get(k).trim();if(!v.name)return;for(const k of ['nc','pv','def','init','agi','con','for','per','cha','int','vol'])v[k]=Number(f.get(k));v.attacks=f.get('attacks').split('\n').filter(x=>x.trim()).map(line=>{const [name,bonus,damage,...text]=line.split('|').map(x=>x.trim());return {name,bonus:Number(bonus)||0,damage:damage||'',text:text.join(' | ')};});v.abilities=f.get('abilities').split('\n').filter(x=>x.trim()).map(line=>{const [name,...text]=line.split('|').map(x=>x.trim());return {name,text:text.join(' | ')};});current.monsters[key]=v;MONSTERS[key]=v;save();modal.close();renderBestiary();};}
const oldBestiary=renderBestiary;renderBestiary=function(){oldBestiary();document.querySelectorAll('#bestiary .bestCard').forEach(card=>{if(card.textContent.includes('Création personnelle du MJ')||card.querySelector('button:last-child')?.textContent==='Modifier mon monstre'){const tag=card.querySelector('.adapted,.custom');if(tag)tag.textContent='Création du MJ';}});};
function downloadLibrary(){save();const a=document.createElement('a'),u=URL.createObjectURL(new Blob([JSON.stringify({format:'guiltanas-cof2-campaigns-1',library},null,2)],{type:'application/json'}));a.href=u;a.download='combats-campagnes-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),2000);}
exportJSON=downloadLibrary;
function validateLibrary(value){if(value?.format!=='guiltanas-cof2-campaigns-1'||!Array.isArray(value.library?.campaigns)||!value.library.campaigns.length||value.library.campaigns.length>100)throw Error('Sauvegarde de campagnes invalide.');const validID=x=>typeof x==='string'&&/^[a-zA-Z0-9-]{1,80}$/.test(x);const ids=new Set();for(const c of value.library.campaigns){if(!validID(c.id)||ids.has(c.id)||typeof c.name!=='string'||!['campaign','oneshot'].includes(c.format)||typeof c.pack!=='boolean'||!c.monsters||!c.encounters||!Array.isArray(c.state?.fighters)||!Array.isArray(c.state?.party)||!Array.isArray(c.state?.log)||!Array.isArray(c.state?.groupEffects))throw Error('Campagne invalide.');ids.add(c.id);const monsters={...BASE_MONSTERS,...(c.pack?PACK_GROTTE_MONSTERS:{}),...c.monsters};for(const [id,m] of Object.entries(c.monsters)){if(!id.startsWith('custom-')||!validID(id)||m.id!==id||typeof m.name!=='string'||!['nc','pv','def','init','agi','con','for','per','cha','int','vol'].every(k=>Number.isFinite(m[k]))||m.pv<1||!Array.isArray(m.attacks)||!Array.isArray(m.abilities))throw Error('Profil de monstre invalide.');if(m.attacks.some(a=>typeof a.name!=='string'||!Number.isFinite(a.bonus)||typeof a.damage!=='string'||typeof a.text!=='string')||m.abilities.some(a=>typeof a.name!=='string'||typeof a.text!=='string'))throw Error('Attaque ou capacité invalide.');m.status='custom';}for(const [id,e] of Object.entries(c.encounters)){if(!validID(id)||!id.startsWith('custom-')||typeof e.name!=='string'||!Number.isInteger(e.defaultLevel)||e.defaultLevel<1||e.defaultLevel>5||!e.limits||!Array.isArray(e.allowed)||!e.variants)throw Error('Rencontre invalide.');for(const composition of Object.values(e.variants))for(const [ref,n] of Object.entries(composition)){if(!monsters[ref]||!Number.isInteger(n)||n<0||n>100)throw Error('Composition invalide.');}if((e.scalable&&!monsters[e.scalable])||(e.sixth&&!monsters[e.sixth]))throw Error('Renfort invalide.');if(e.allowed.some(id=>!monsters[id]))throw Error('Créature manquante.');}for(const g of c.state.groupEffects)if(!validID(g.id)||!Array.isArray(g.targetUids)||g.targetUids.some(id=>!validID(id)))throw Error('Buff invalide.');for(const f of c.state.fighters){if(!['player','monster'].includes(f.kind)||!['player','hostile','ally'].includes(f.side)||!['pv','maxPv','def','initiative','initBase','initDie','officialInit'].every(k=>f[k]==null||Number.isFinite(f[k]))||f.effects?.some(e=>!Number.isFinite(e.remaining))||!validID(f.uid)||typeof f.name!=='string'||!Array.isArray(f.conditions)||!Array.isArray(f.effects)||f.kind==='monster'&&!monsters[f.ref])throw Error('Combattant invalide.');}for(const p of c.state.party)if(!validID(p.id)||typeof p.name!=='string'||!['pv','def','init'].every(k=>Number.isFinite(p[k])))throw Error('Participant invalide.');}return value.library;}
importJSON=async function(input){const file=input.files[0];if(!file)return;try{if(file.size>5*1024*1024)throw Error('Sauvegarde limitée à 5 Mo.');const incoming=validateLibrary(JSON.parse(await file.text()));if(!confirm('Ajouter ces campagnes comme copies indépendantes ? Vos préparations actuelles seront conservées.'))return;save();for(const c of incoming.campaigns){c.id=crypto.randomUUID();c.name+=' (import)';library.campaigns.push(c);}selectCampaign(incoming.campaigns[0].id);alert('Campagnes importées.');}catch(e){alert('Import impossible : '+e.message);}input.value='';};
resetAll=function(){if(!confirm('Vider uniquement le combat en cours ? Les préparations, monstres et PJ seront conservés.'))return;state.fighters=[];state.log=[];state.groupEffects=[];state.lastRecommendation=null;save();renderAll();};
for(const k of Object.keys(ENCOUNTERS))delete ENCOUNTERS[k];state=current.state;showCampaignHome();

function importHubParty(){try{const rows=JSON.parse(localStorage.getItem('hcfg.combat.roster.'+scope)||'[]');if(!rows.length)return alert('Aucun PJ disponible. Ouvrez le gestionnaire depuis Outils de séance dans votre hub après avoir créé vos fiches.');if(!confirm('Actualiser les valeurs de préparation des PJ ? Le combat en cours ne sera pas modifié.'))return;for(const p of rows){const old=state.party.find(x=>x.id===p.id);if(old)Object.assign(old,p);else state.party.push(p);}save();renderPartyPicker();recommend();}catch(e){alert('Import des PJ impossible : '+e.message);}}
