(()=>{'use strict';
const $=s=>document.querySelector(s),$$=s=>Array.from(document.querySelectorAll(s)),Owner=window.GuiltanasOwnerAuth;
const ENDPOINT='https://jitatmdbipjkvjstcgdc.supabase.co/functions/v1/guiltanas-cockpit';
const ROOT='https://latelierdeguiltanas.github.io/atelier-guiltanas-apps/';
const REGISTRY='https://jitatmdbipjkvjstcgdc.supabase.co/functions/v1/guiltanas-registry';
const escapeHTML=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
let model=null,currentView='overview',selected=null,graphRepo='',search='',projectData=[],projectScan=null;
const nice=n=>Number(n||0).toLocaleString('fr-FR');
const time=s=>{if(!s)return 'Aucune date';try{return new Date(s).toLocaleString('fr-FR',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})}catch{return 'Date inconnue'}};
const repoFor=a=>model?.repos.find(r=>r.id===a.repo);
const codePublic=a=>repoFor(a)?.visibility==='public';
const names={overview:'Vue d’ensemble',projects:'Projets',applications:'Applications',repositories:'Dépôts GitHub',backend:'Supabase',usage:'Utilisation',devices:'Connexions'};
const viewDescriptions={overview:'de ton écosystème',projects:'de l’Atelier',applications:'de l’Atelier',repositories:'& projets',backend:'& stockage',usage:'réelle des outils',devices:'& sauvegardes'};
const glossary={
guide:{title:'Comprendre ton écosystème',content:'<p>Ton Atelier fonctionne comme une petite entreprise logicielle : <strong>GitHub conserve le code</strong>, <strong>GitHub Pages affiche les outils</strong>, <strong>Supabase partage les données</strong>, et les <strong>navigateurs gardent parfois des copies locales</strong>.</p><div class="story"><span>GitHub</span> → <span>Application web</span> ↔ <span>Supabase</span> ↔ <span>Autre appareil</span></div><p>Choisis ce que tu veux comprendre :</p><div class="guide-grid"><button data-term="repository">⌘ Dépôts & dossiers</button><button data-term="github">◈ Publication des sites</button><button data-term="supabase">◫ Base Supabase</button><button data-term="sync">⌁ Synchronisation</button><button data-term="session">▥ Mesurer les usages</button><button data-term="logs">▤ Journaux & erreurs</button><button data-term="access">◇ Identifiants & permissions</button><button data-term="privacy">♧ Public & commercial</button></div>'},

repository:{title:'Dépôt = repository',content:'<p>Ce sont <strong>deux mots pour la même chose</strong>. Un dépôt GitHub contient le code et son historique. Un dépôt peut héberger <strong>plusieurs applications</strong> : c’est le cas de <strong>atelier-guiltanas-apps</strong>.</p><div class="story"><span>Compte GitHub</span> → <span>Dépôt</span> → <span>Dossiers</span> → <span>Applications</span></div><p>Un dépôt <strong>public</strong> permet de voir son code. Un dépôt <strong>privé</strong> est réservé aux personnes autorisées. <strong>Archivé</strong> signifie conservé, mais normalement non développé.</p>'},
github:{title:'GitHub en une minute',content:'<p><strong>GitHub garde le code</strong> de tes outils et leurs différentes versions. GitHub Pages transforme des fichiers HTML, CSS et JavaScript du dépôt en sites accessibles par lien.</p><p>Il ne stocke pas automatiquement les messages des joueurs, les sauvegardes en ligne ou les sons importés uniquement sur ton téléphone.</p><div class="story"><span>Fichier modifié</span> → <span>Commit GitHub</span> → <span>Publication Pages</span> → <span>Site web</span></div>'},
supabase:{title:'Supabase en une minute',content:'<p><strong>Supabase est ton coffre de données en ligne.</strong> Tu disposes d’une organisation connectée sur l’offre <strong>Free</strong> et d’un projet actif nommé <strong>ile-aux-tempetes-hub</strong>.</p><p>Les personnages, messages, boutiques et campagnes génériques utilisent des tables ou fonctions protégées. Des outils peuvent aussi garder un cache local pour fonctionner hors connexion.</p><div class="story"><span>Application</span> → <span>Fonction/API</span> → <span>Table de données</span> → <span>Autre appareil</span></div><p>Identifiant public du projet : <strong>jitatmdbipjkvjstcgdc</strong>. Région : <strong>eu-west-3 (Paris)</strong>. Je peux gérer le projet via la connexion autorisée, mais je ne connais pas ton mot de passe personnel. <a href=\"https://supabase.com/dashboard/project/jitatmdbipjkvjstcgdc\" target=\"_blank\" rel=\"noopener noreferrer\">Voir la console Supabase ↗</a></p>'},
table:{title:'Tables et données',content:'<p>Une <strong>table</strong> est comme un onglet de classeur. Par exemple <strong>bastide_messages</strong> conserve des messages et <strong>bastide_shop_items</strong> les articles de la boutique.</p><p>Le préfixe <strong>bastide_</strong> correspond à la Bastide, <strong>nespresso_</strong> à l’autre table de jeu et <strong>hcfg_private</strong> au hub configurable. Les valeurs ci-dessous sont des comptages, jamais des messages ou secrets affichés.</p>'},
function:{title:'Fonctions serveur',content:'<p>Une <strong>fonction Supabase</strong> reçoit une demande et vérifie les droits avant de lire ou modifier les données. Exemple : <strong>bastide-session</strong> gère les échanges et l’état partagé des combats.</p><p>« Fonction active » veut dire déployée, <strong>pas que tous ses appels réussissent</strong>. Les journaux techniques détaillés se consultent dans Supabase.</p>'},
session:{title:'Session ≠ personne',content:'<p>Une <strong>session observée</strong> est une période d’usage d’un navigateur. Une personne peut avoir plusieurs sessions sur plusieurs appareils.</p><p>Une ouverture relevée il y a dix jours ne signifie pas « connecté maintenant ». Tant que l’application n’envoie pas de signal de présence fiable, le tableau de bord indique <strong>activité mesurée</strong>, pas utilisateurs en ligne.</p>'},
access:{title:'Accès et autorisations',content:'<p>Tu possèdes les accès aux services au moyen de tes comptes personnels. La connexion autorisée à ChatGPT permet, selon les permissions accordées, de <strong>lire et modifier des dépôts GitHub</strong> ainsi que de consulter ou administrer le projet Supabase connecté.</p><p>Le cockpit utilise pour l’instant <strong>ta clé privée MJ Bastide</strong> pour accéder aux statistiques de l’Atelier : c’est une protection initiale, pas encore un véritable compte administrateur indépendant.</p><p><strong>Ne partage jamais</strong> tes clés MJ, jetons, mots de passe ou liens privés. Tu peux gérer les connexions depuis les paramètres des applications connectées.</p>'},
privacy:{title:'Public, privé et vendable',content:'<p>Un code source <strong>public sur GitHub</strong> peut être consulté, mais cela ne signifie pas qu’il soit commercialisable ou que son application soit entièrement opérationnelle.</p><p>Un produit « envisagé » est un <strong>objectif</strong>, non une validation de licence. La diffusion commerciale dépend notamment des droits sur les règles, textes, illustrations et bibliothèques utilisées.</p>'},
sync:{title:'Que veut dire synchronisé ?',content:'<p><strong>Cloud :</strong> l’application lit et écrit auprès d’un serveur partagé.<br><strong>Hybride :</strong> serveur et données locales coexistent.<br><strong>Local :</strong> les données restent dans le navigateur ou sur l’appareil.<br><strong>À vérifier :</strong> la connexion réelle n’est pas démontrée.</p><p>La présence d’une connexion ne garantit pas que toutes les modifications hors ligne ont été transmises. Il faut comparer des versions ou confirmer le dernier enregistrement.</p>'},
logs:{title:'Logs et suivi',content:'<p>Les <strong>logs techniques</strong> sont les traces des requêtes, erreurs et exécutions. Le cockpit affiche actuellement des métriques applicatives et le statut déployé des fonctions.</p><p>Les logs complets se trouvent dans <a href=\"https://supabase.com/dashboard/project/jitatmdbipjkvjstcgdc/logs\" target=\"_blank\" rel=\"noopener noreferrer\">Supabase Logs ↗</a> et <a href=\"https://github.com/latelierdeguiltanas/atelier-guiltanas-apps/actions\" target=\"_blank\" rel=\"noopener noreferrer\">GitHub Actions ↗</a>. Un flux de journaux consolidé nécessiterait une connexion de supervision dédiée.</p>'}
};
let routeRestoring=false,currentHelpTopic=null,currentEditId=null,routeRestoredOnce=false;
function snapshotRoute(){
 const dialog=['glossary','project-editor','install-dialog'].find(id=>$('#'+id)?.open)||null;
 return {view:currentView,repo:graphRepo,selected:selected?{...selected}:null,
 drawer:$('#drawer').classList.contains('show'),dialog,
 help:dialog==='glossary'?currentHelpTopic:null,
 edit:dialog==='project-editor'?currentEditId:null};
}
function refreshBackButton(){
 const state=history.state;
 $('#cockpit-back').hidden=!(state?.pilotage===true && state.depth>0);
}
function pushRoute(){
 if(routeRestoring)return;
 const prior=history.state?.pilotage?history.state.depth:0;
 history.pushState({pilotage:true,depth:prior+1,route:snapshotRoute()},'',location.href);
 refreshBackButton();
}
function initRouteHistory(){
 if(!history.state?.pilotage)history.replaceState({pilotage:true,depth:0,route:snapshotRoute()},'',location.href);
 refreshBackButton();
 window.addEventListener('popstate',e=>restoreRoute(e.state?.pilotage?e.state.route:null));
 for(const dlg of document.querySelectorAll('dialog'))dlg.addEventListener('cancel',e=>{e.preventDefault();goBack()});
}
function hideDrawer(){
 $('#drawer').classList.remove('show');$('#drawer').setAttribute('aria-hidden','true');$('#shade').hidden=true;
}
function goBack(){
 if(history.state?.pilotage && history.state.depth>0){history.back();return}
 for(const dlg of document.querySelectorAll('dialog'))if(dlg.open)dlg.close();
 hideDrawer();selected=null;if(model)drawMap();refreshBackButton();
}
function restoreRoute(route){
 routeRestoring=true;
 try{
  for(const dlg of document.querySelectorAll('dialog'))if(dlg.open)dlg.close();
  hideDrawer();
  selected=null;
  const view=route?.view&&names[route.view]?route.view:'overview';
  setView(view,false);
  graphRepo=route?.repo||'';
  if(model?.repos && graphRepo && !model.repos.some(r=>r.id===graphRepo))graphRepo='';
  $('#graph-repo').value=graphRepo;
  selected=route?.selected||null;
  if(model)drawMap();
  if(model&&route?.drawer&&selected){
   const x=selected;
   if(x.kind==='app')showApp(x.id);
   else if(x.kind==='repo')showRepo(x.id);
   else if(x.kind==='project')openProject(x.id);
   else if(x.kind==='device')showDevice(x.id);
  }
  if(route?.dialog==='glossary')showHelp(route.help||'guide');
  if(route?.dialog==='project-editor')editProject(route.edit||null);
  if(route?.dialog==='install-dialog')openInstallGuide();
 }finally{routeRestoring=false;refreshBackButton()}
}
function setView(view,record=true){
 if(!names[view])return;
 const changed=view!==currentView;
 currentView=view;
 if(changed){hideDrawer();selected=null}
 $$('.view').forEach(x=>x.hidden=x.id!=='view-'+view);
 $$('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===view));
 $('#page-title').innerHTML=escapeHTML(names[view])+' <span class="slim">'+escapeHTML(viewDescriptions[view])+'</span>';
 if(changed&&!routeRestoring)scrollTo({top:0,behavior:'smooth'});
 if(changed&&model)drawMap();
 if(changed&&record)pushRoute();
}

function showHelp(which){currentHelpTopic=which;const d=glossary[which]||glossary.github;$('#term-title').textContent=d.title;$('#term-body').innerHTML=d.content;if(!$('#glossary').open)$('#glossary').showModal();pushRoute();}
function tag(text,style=''){return '<span class="tag '+style+'">'+escapeHTML(text)+'</span>'}
function link(url,title){return '<a href="'+escapeHTML(url)+'" target="_blank" rel="noopener noreferrer">'+escapeHTML(title)+' ↗</a>'}
function metric(value,label,hint){return '<div class="metric"><div class="metric-top"><strong>'+escapeHTML(value)+'</strong><small>'+escapeHTML(hint||'')+'</small></div><span>'+escapeHTML(label)+'</span></div>'}
function renderMetrics(){const m=model.metrics,r=model.repos;$('#metrics').innerHTML=metric(r.length,'dépôts GitHub',r.filter(x=>x.visibility==='private').length+' privés')+metric(model.apps.length,'outils répertoriés','inventaire')+metric('1','projet Supabase','offre Free')+metric(m.db_tables,'tables de données','2 schémas')+metric(m.generic_spaces,'espaces du hub générique','en ligne')}
function renderBrief(){const m=model.metrics;$('#brief-usage').innerHTML='<div class="micro-row"><span>Hub générique · sessions / 30 jours</span><b>'+nice(m.generic_sessions_30d)+'</b></div><div class="micro-row"><span>Dernier événement mesuré</span><b>'+time(m.generic_last_event)+'</b></div>';
const warnings=[['Notifications push enregistrées',m.push_subscriptions?'+'+m.push_subscriptions+' appareils':'Aucun appareil'],['Combats génériques stockés en ligne',m.generic_combat_spaces+' bibliothèque(s)'],['Soundboard', 'Fichiers audio locaux']];$('#alerts').innerHTML=warnings.map(x=>'<div class="micro-row"><span>'+escapeHTML(x[0])+'</span><b>'+escapeHTML(x[1])+'</b></div>').join('')}
function syncType(a){return a.sync==='cloud'?tag('Serveur','cloud'):a.sync==='hybrid'?tag('Hybride','warn'):a.sync==='local'?tag('Local','local'):a.sync==='partial'?tag('À vérifier','warn'):tag('Aucune synchro','')}
function renderApps(){const f=$('#app-filter').value;let apps=model.apps.filter(a=>{const q=(a.name+' '+a.what+' '+repoFor(a)?.name).toLowerCase();if(search&&!q.includes(search))return false;if(f==='cloud'&&!['cloud','hybrid'].includes(a.sync))return false;if(f==='local'&&a.sync!=='local')return false;if(f==='envisagé'&&!['envisagé','généralisable','à qualifier','travail'].includes(a.commercial))return false;if(f==='interne'&&a.commercial!=='interne')return false;return true});$('#app-table').innerHTML=apps.map(a=>'<div class="data-row" role="button" tabindex="0" data-app="'+a.id+'"><div class="row-name">'+escapeHTML(a.name)+'<small>'+escapeHTML(a.what)+'</small></div><span class="secondary">'+escapeHTML(repoFor(a)?.name||'—')+'</span><span class="secondary">'+escapeHTML(a.audience)+'</span>'+syncType(a)+'<span class="arrow">›</span></div>').join('')||'<div class="empty">Aucune application ne correspond à ta recherche.</div>'}
function renderRepos(){const list=model.repos;const priv=list.filter(x=>x.visibility==='private').length,arch=list.filter(x=>x.archived).length;$('#repo-summary').innerHTML='<div class="stat"><strong>'+list.length+'</strong><small>Dépôts inventoriés</small></div><div class="stat"><strong>'+(list.length-priv)+'</strong><small>Publics</small></div><div class="stat"><strong>'+priv+'</strong><small>Privés</small></div><div class="stat"><strong>'+arch+'</strong><small>Archivés</small></div>';
$('#repo-table').innerHTML=list.map(r=>{let count=model.apps.filter(a=>a.repo===r.id).length;return '<div class="data-row" data-repo="'+r.id+'" role="button" tabindex="0"><div class="row-name">'+escapeHTML(r.name)+'<small>'+escapeHTML(r.description)+'</small></div><span class="secondary">'+escapeHTML(r.role)+'</span><span class="secondary">'+count+' outil(s) catalogué(s)</span>'+tag(r.archived?'Archivé':r.visibility==='private'?'Privé':'Public',r.archived?'archive':r.visibility==='private'?'private':'cloud')+'<span class="arrow">›</span></div>'}).join('')}
function dataRow(name,sub,count,detail,appId){return '<div class="data-row" role="button" tabindex="0" data-app="'+appId+'"><div class="row-name">'+escapeHTML(name)+'<small>'+escapeHTML(sub)+'</small></div><span class="secondary">'+escapeHTML(detail)+'</span><span class="secondary">Données sauvegardées</span>'+tag(String(count)+' entrées','cloud')+'<span class="arrow">›</span></div>'}
function renderBackend(){const m=model.metrics,s=model.service.supabase;$('#backend-overview').innerHTML='<span class="big-icon">◫</span><div><strong>'+escapeHTML(s.project)+'</strong><small>Supabase · '+escapeHTML(s.region)+' · offre '+escapeHTML(s.plan)+'</small></div><div class="sep"></div><div><strong>'+nice(m.db_tables)+' tables</strong><small>public + hcfg_private</small></div><div class="sep"></div><div><strong>'+model.functions.length+' fonctions</strong><small>déployées au dernier audit</small></div><a class="smallbutton" href="'+escapeHTML(s.url)+'" target="_blank" rel="noopener noreferrer">Console Supabase ↗</a>';
$('#data-groups').innerHTML=[
dataRow('Hub Bastide','bastide_* · personnages',m.bastide_players,'6 PJ enregistrés','bastide'),
dataRow('Boutique Bastide','bastide_shop_items',m.bastide_shop,'Articles disponibles en base','bastide'),
dataRow('Messages Bastide','bastide_messages',m.bastide_messages,'Messages conservés','express'),
dataRow('Hub Nespresso','nespresso_inventories',m.nespresso_players,'Inventaires joueurs','nespresso'),
dataRow('Catalogue Nespresso','nespresso_shop',m.nespresso_shop,'Articles enregistrés','nespresso'),
dataRow('Hub configurable','hcfg_private.link_spaces',m.generic_spaces,'Espaces en ligne','generic'),
dataRow('Combats génériques','hcfg_private.combat_spaces',m.generic_combat_spaces,'Bibliothèques publiées','combat'),
dataRow('Suivi des usages','hcfg_private.usage_events',m.generic_events,'Événements collectés','generic'),
dataRow('Appareils de diagnostic','guiltanas_sync_devices',m.registered_devices,'Appareils enregistrés','cockpit')
].join('');
$('#functions').innerHTML=model.functions.map(f=>'<span class="fn" title="Fonction déployée lors du dernier inventaire">'+escapeHTML(f)+'</span>').join('')}
function renderUsage(){const m=model.metrics;$('#usage-kpis').innerHTML='<div class="stat"><strong>'+nice(m.generic_spaces)+'</strong><small>Campagnes / one-shots en ligne</small></div><div class="stat"><strong>'+nice(m.generic_spaces_used_30d)+'</strong><small>Espaces avec activité / 30 j</small></div><div class="stat"><strong>'+nice(m.generic_sessions_30d)+'</strong><small>Sessions observées / 30 j</small></div><div class="stat"><strong>'+nice(m.generic_events)+'</strong><small>Événements historiques mesurés</small></div>';
const days=m.generic_daily_events||[];const max=Math.max(1,...days.map(d=>Number(d.events)));$('#usage-chart').innerHTML=days.length?days.map(d=>'<div class="bar-row"><span class="bar-label">'+escapeHTML(d.day.slice(5))+'</span><div class="bar-track"><div class="bar-fill" style="width:'+((Number(d.events)/max)*100)+'%"></div></div><b class="bar-val">'+nice(d.events)+'</b></div>').join(''):'<div class="empty">Aucun événement sur cette période</div>';
const types=m.generic_event_types||[];const maxType=Math.max(1,...types.map(x=>Number(x.count)));$('#usage-types').innerHTML=types.map(d=>'<div class="bar-row"><span class="bar-label">'+escapeHTML(d.name)+'</span><div class="bar-track"><div class="bar-fill" style="width:'+100*Number(d.count)/maxType+'%"></div></div><b class="bar-val">'+nice(d.count)+'</b></div>').join('');
$('#usage-limit').textContent='Dernière activité relevée : '+time(m.generic_last_event)+'. Ce comptage ne donne ni le nombre de personnes uniques ni les sessions encore ouvertes.';
const coverage=[['Hub générique','Activité mesurée','generic'],['Hub Bastide','Données présentes, trafic non instrumenté de façon comparable','bastide'],['Hub Nespresso','Données présentes, trafic non instrumenté de façon comparable','nespresso'],['Forge of Heroes','Usage public non mesuré par ce cockpit','forge'],['Soundboard','Fichiers locaux et sessions non mesurés','sound'],['Site vitrine','Audience à vérifier dans les statistiques du site','siteweb']];
$('#coverage').innerHTML=coverage.map(x=>'<div class="data-row" role="button" tabindex="0" data-app="'+x[2]+'"><div class="row-name">'+escapeHTML(x[0])+'</div><span class="secondary">'+escapeHTML(x[1])+'</span><span class="secondary">Instrumentation</span>'+tag(x[2]==='generic'?'Mesurée':'Partielle',x[2]==='generic'?'cloud':'warn')+'<span class="arrow">›</span></div>').join('')}
function renderDevices(){const rows=model.devices||[];$('#device-rows').innerHTML=rows.map(d=>'<div class="data-row" role="button" tabindex="0" data-device="'+escapeHTML(d.device_label||'Appareil')+'"><div class="row-name">'+escapeHTML(d.device_label||'Appareil sans nom')+'<small>Dernier contrôle '+time(d.last_seen_at)+'</small></div><span class="secondary">Profil navigateur</span><span class="secondary">Dernier signal, pas connexion live</span>'+tag('Rapport reçu','cloud')+'<span class="arrow">›</span></div>').join('')||'<div class="empty">Aucun appareil n’a encore transmis de diagnostic.</div>';
$('#sync-flow').innerHTML='<div class="sync-step"><b>① Sur l’appareil</b><span>Clés locales, caches et changements en attente</span></div><div class="sync-arrow">→</div><div class="sync-step"><b>② Dans Supabase</b><span>Version partagée, autorisations et données</span></div><div class="sync-arrow">→</div><div class="sync-step"><b>③ Comparaison</b><span>Version identique, en attente ou conflit</span></div>'}
async function loadPlayerChecks(){
 const container=$('#player-rows');if(!container)return;
 container.innerHTML='<p class="empty">Contrôle des accès joueurs…</p>';
 try{
  if(!Owner.token())throw Error('Compte Atelier non connecté');
  const resp=await fetch('https://jitatmdbipjkvjstcgdc.supabase.co/functions/v1/guiltanas-player-check?action=status',{method:'GET',cache:'no-store',headers:{...Owner.headers()}});
  const d=await resp.json();if(!resp.ok)throw Error(d.error||'Contrôle indisponible');
  const current=Number(d.serverBattleRevision);
  container.innerHTML=(d.players||[]).map(p=>{
   const records=(d.checks||[]).filter(c=>c.player_id===p.id),last=records[0];
   const recent=last&&(Date.now()-Date.parse(last.last_checked_at)<10*60*1000);
   const stale=last&&d.serverBattleRevision!==null&&last.last_battle_revision!==null&&Number(last.last_battle_revision)<current;
   const state=!last?'Non vérifié':stale?'Combat à actualiser':recent?'Connexion récente':'Dernier test ancien';
   const cls=!last?'neutral':stale?'warn':recent?'good':'neutral';
   const detail=!last?'Aucun appareil de ce joueur n’a encore effectué de test.':time(last.last_checked_at)+' · '+records.length+' navigateur(s) connu(s) · combat révision '+String(last.last_battle_revision??'inconnue');
   return '<article class="player-line"><span class="player-avatar">'+escapeHTML((p.name||'?').slice(0,1))+'</span><div class="player-info"><b>'+escapeHTML(p.name)+'</b><small>'+escapeHTML(detail)+'</small></div><span class="tag '+cls+'">'+state+'</span></article>';
  }).join('');
  container.insertAdjacentHTML('beforeend','<div class="player-info-note">« Vérifié » signifie : lecture réussie du serveur lors du dernier test, pas téléphone constamment connecté. <button class="textbtn" id="copy-player-test">Copier le lien de test à envoyer aux joueurs</button></div>');
  $('#copy-player-test').onclick=async()=>{
   const url=ROOT+'ile-aux-tempetes-bastide/joueurs/verifier/';
   try{await navigator.clipboard.writeText(url);$('#copy-player-test').textContent='✓ Lien copié';}
   catch{$('#copy-player-test').textContent='Ouvre : '+url;}
  };
 }catch(e){container.innerHTML='<p class="empty">Contrôle des joueurs impossible : '+escapeHTML(e.message)+'</p>'}
}

const statuses={actif:'Actif',developpement:'Développement',brouillon:'Brouillon',pause:'En pause',idee:'Idée',archive:'Archivé'};
const publications={en_ligne:'En ligne',local:'Local',non_publie:'Non publié',inconnu:'À vérifier'};
function projectTag(value){return '<span class="project-pill p-'+escapeHTML(value)+'">'+escapeHTML(statuses[value]||value)+'</span>'}

/* Historical evidence layer: no verification percentages are inferred from lifecycle status.
   All project names/statuses still come from the authenticated private registry. */
const projectEvidence={
  forge:{
    headline:'N1 : certification exhaustive non démontrée sur la version actuelle',
    verified:'Dépôt de production et suites de tests automatisés retrouvés ; correctifs documentés et pack de 12 scénarios réels existant.',
    uncertain:'Des validations manuelles anciennes sont consignées, mais des changements ultérieurs ont eu lieu. La recette finale des 12 cas et toutes les combinaisons doivent être rapprochées de la version publiée.',
    next:'Relever la version actuelle et les résultats datés des 12 scénarios ; marquer séparément « testé automatiquement », « testé par Math » et « à rejouer ».',
    source:'https://github.com/latelierdeguiltanas/atelier-guiltanas-apps/blob/main/forge-of-heroes/MANUAL_FREEZE_PACK/README.md'
  },
  cockpit:{
    headline:'Cockpit opérationnel ; intégration du pilotage en cours',
    verified:'Interface authentifiée, inventaire Supabase, registre des projets, vues GitHub et diagnostics déjà présents dans le code.',
    uncertain:'La migration complète de l’historique des chats n’est pas réalisée ; l’authentification et la recette mobile sont à préserver et vérifier.',
    next:'Enrichir les projets existants du registre avec des jalons, preuves et liens vers les conversations récupérées.'
  },
  'fiches-pj':{
    headline:'Fiche interactive : développement disponible, recette complète à confirmer',
    verified:'Dossier fiches-personnages/ présent ; fiche et liaison cloud documentées dans le registre.',
    uncertain:'Le passage N2 d’un personnage réel et la reprise multi-appareils restent à attester.',
    next:'Faire une recette ciblée N1/N2 et récupération sur deux appareils.'
  },
  'hub-bastide':{
    headline:'Hub Bastide en ligne ; plusieurs modules sont encore en validation',
    verified:'Dépôt et document Drive de suivi retrouvés. Plusieurs fonctionnalités et tests techniques y sont documentés.',
    uncertain:'Les contrôles au clic sur appareils réels et les derniers parcours de dialogues/messagerie ne sont pas tous attestés.',
    next:'Consolider les validations des dernières interventions contre la version publiée.'
  }
};
function projectEvidenceMarkup(p){
  const e=projectEvidence[p.id];
  const title=e?e.headline:'État de validation : non audité individuellement';
  const yes=e?e.verified:'Cette fiche est classée dans le registre privé ; son statut n’est pas une preuve de recette.';
  const no=e?e.uncertain:'Les décisions issues des anciens chats, les preuves réelles et les critères de complétude restent à rapprocher.';
  const next=e?e.next:(p.next_action||'Identifier les critères de validation et les sources de preuve.');
  return '<section class="project-evidence"><h3>Validation et traçabilité</h3>'+
    '<strong class="fact">'+escapeHTML(title)+'</strong>'+
    '<p><span class="proof">✓ Éléments documentés :</span> '+escapeHTML(yes)+'</p>'+
    '<p><span class="uncertain">○ Non certifié :</span> '+escapeHTML(no)+'</p>'+
    '<p><b>Prochaine vérification :</b> '+escapeHTML(next)+'</p>'+
    (e?.source?'<p>'+link(e.source,'Voir le référentiel de tests')+'</p>':'')+
    '<p class="minihelp">Chats associés : inventaire incomplet. Aucun nombre de chats n’est inventé.</p>'+
    '<div class="detail-links project-resume"><button class="smallbutton primary" data-reprise-project="'+escapeHTML(p.id)+'">↗ Reprendre dans ChatGPT</button></div></section>';
}
function renderProjectAuditPulse(){
 const node=$('#project-audit-content');if(!node)return;
 const total=projectData.length;
 const n=lifecycle=>projectData.filter(p=>p.lifecycle===lifecycle).length;
 const abandoned=projectData.filter(p=>p.lifecycle==='abandonne'||p.lifecycle==='abandonné').length;
 node.innerHTML='<div class="project-audit-metrics">'+
   '<div class="project-audit-metric"><strong>'+total+'</strong><small>Fiches connues</small></div>'+
   '<div class="project-audit-metric"><strong>'+(n('actif')+n('developpement'))+'</strong><small>Actifs ou en chantier</small></div>'+
   '<div class="project-audit-metric"><strong>'+n('pause')+'</strong><small>En pause déclarée</small></div>'+
   '<div class="project-audit-metric"><strong>'+abandoned+'</strong><small>Abandons explicitement classés</small></div>'+
   '</div><div class="project-audit-focus"><div><strong>⚒ Forge : N1 non certifié dans le référentiel actuel</strong>'+
   '<p>Des tests sont documentés, mais le gel N1 ne doit pas être annoncé sans preuves rattachées à la version publiée.</p></div>'+
   '<button type="button" data-project-audit="forge">Voir les preuves</button></div>'+
   '<p class="project-audit-reliability">Source : registre privé Supabase · Ces chiffres classent des fiches, pas des fonctionnalités validées. Archives, brouillons et modules peuvent se recouper. Historique complet des chats non importé.</p>';
}
function projectResumeText(p){
 const evidence=projectEvidence[p.id];
 return 'REPRISE PAR PROJET — '+p.name+'\n\nConsulte le registre « Pilotage Guiltanas » et le document Drive « 00 — ÉTAT DU PROJET » de ce projet AVANT de modifier du code. Inscris le périmètre et le statut EN COURS dans Drive. À chaque jalon, inscris modification, commit, preuves, éventuels échecs et prochaine action. Mets à jour le registre existant, sans créer de projet doublon. Ne considère pas les affirmations des anciens chats comme preuves de validation.\n\nDernier état déclaré : '+(p.progress_note||p.summary||'non renseigné')+'\nStatut : '+(p.lifecycle||'inconnu')+'\nProchaine étape : '+(p.next_action||'à déterminer')+'\n'+(evidence?'\nÉtat de vérification : '+evidence.headline+'\nÀ vérifier : '+evidence.uncertain:'')+'\n\nPrends les sources existantes comme référence, préserve les autres projets et n’invente aucun pourcentage de validation.';
}
async function resumeProject(id){
 const p=projectData.find(x=>x.id===id);if(!p)return;
 const message=projectResumeText(p);
 const opened=window.open('https://chatgpt.com/','_blank','noopener,noreferrer');
 let copied=false;
 try{await navigator.clipboard.writeText(message);copied=true}catch(e){}
 if(!copied)window.prompt('Le navigateur a refusé la copie automatique. Copie le contexte de reprise :',message);
 else {const textEl=$('#project-sync-status');if(textEl)textEl.textContent='Contexte de « '+p.name+' » copié ; colle-le dans le nouveau chat.'}
}


/* Conversation inventory: metadata only, behind Atelier owner auth.
   ChatGPT does not provide this application with automatic live conversation health status. */
const CHATS_ENDPOINT='https://jitatmdbipjkvjstcgdc.supabase.co/functions/v1/guiltanas-chat-inventory';
let chatInventory=[],chatInventoryReady=false,chatInventoryError='',chatListTotal=0;
const chatStates={
 non_verifie:'Non vérifié',
 a_examiner:'À examiner (indice, pas un bug confirmé)',
 bloque_signale:'Bloqué — signalé',
 actif_confirme:'Utilisable — confirmé',
 archive_proposee:'À archiver',
 archive_confirmee:'Archivé — confirmé',
 cloture:'Clôturé pour le projet'
};
async function chatRequest(action,body){
 const endpoint=CHATS_ENDPOINT+'?action='+encodeURIComponent(action);
 const response=await fetch(endpoint,{method:body?'POST':'GET',headers:{'Content-Type':'application/json',...Owner.headers()},cache:'no-store',body:body?JSON.stringify(body):undefined});
 const data=await response.json();if(!response.ok)throw Error(data.error||'Inventaire indisponible');return data;
}
async function loadChatInventory(){
 if(!Owner.token())return;
 try{
  let entries=[],offset=0,total=0;
  while(offset<5000){
   const data=await chatRequest('list&offset='+offset+'&limit=250');
   entries.push(...(data.chats||[]));total=data.total||entries.length;
   if(!(data.chats||[]).length||entries.length>=total)break;
   offset+=data.chats.length;
  }
  chatInventory=entries;chatListTotal=total;chatInventoryReady=true;chatInventoryError='';
 }catch(err){chatInventoryError=String(err.message||err);chatInventoryReady=false}
 renderChatPanel();
}
function chatStatusCounts(){
 const count=s=>chatInventory.filter(c=>c.status===s).length;
 return {total:chatListTotal,blocked:count('bloque_signale'),suspect:count('a_examiner'),unknown:count('non_verifie'),usable:count('actif_confirme')};
}
function ecosystemMember(p){
 return !new Set(['budget','missions','enfants','messages-enfants']).has(p.id);
}
function ecosystemName(p){
 if(['cockpit','ghdir-guiltanas-control','site-atelier'].includes(p.id))return 'Pilotage et présence';
 if(p.family==='Créer & fabriquer')return 'Créations et ressources';
 return ecosystemMember(p)?'Applications et outils JDR':'Autres projets';
}
function chatRow(c){
 const pNames=(c.project_ids||[]).map(id=>projectData.find(p=>p.id===id)?.name||id);
 const canOpen=/^https:\/\/(chatgpt\.com|chat\.openai\.com)\//.test(c.chat_url||'');
 return '<div class="chat-entry" data-chat-id="'+escapeHTML(c.id)+'">'+
 '<div class="chat-entry-title"><strong>'+escapeHTML(c.title)+'</strong><small>'+escapeHTML(c.last_message_at?new Date(c.last_message_at).toLocaleDateString('fr-FR'):'Date non connue')+' · '+escapeHTML(c.message_count??'—')+' messages</small></div>'+
 '<div class="chat-entry-meta">'+escapeHTML(pNames.length?pNames.join(' · '):'Projet à classer')+'</div>'+
 '<div class="chat-entry-controls"><select class="chat-entry-state" aria-label="État de la conversation">'+
 Object.entries(chatStates).map(([id,label])=>'<option value="'+id+'"'+(c.status===id?' selected':'')+'>'+escapeHTML(label)+'</option>').join('')+'</select>'+
 (canOpen?'<a class="smallbutton" href="'+escapeHTML(c.chat_url)+'" target="_blank" rel="noopener noreferrer">Ouvrir</a>':'<span class="minihelp">Lien non disponible</span>')+
 '</div></div>';
}
function renderChatPanel(){
 const summary=$('#chat-health-count'),stats=$('#chat-health-stats'),note=$('#chat-inventory-note'),list=$('#chat-inventory-list');
 if(!summary||!stats||!list)return;
 if(chatInventoryError){summary.textContent='· indisponible';stats.textContent='Erreur de lecture du registre privé : '+chatInventoryError;list.innerHTML='';return}
 const counts=chatStatusCounts();
 summary.textContent='· '+counts.total+' recensée'+(counts.total>1?'s':'');
 stats.innerHTML='<div class="chat-summary-grid">'+
 '<div><strong>'+counts.total+'</strong><small>Chad(s) inventorié(s)</small></div>'+
 '<div><strong>'+counts.blocked+'</strong><small>Blocages signalés</small></div>'+
 '<div><strong>'+counts.suspect+'</strong><small>À examiner</small></div>'+
 '<div><strong>'+counts.unknown+'</strong><small>Non vérifiés</small></div></div>';
 if(note)note.textContent=counts.total?'Seules les conversations importées sont comptées. Les chats non importés restent invisibles ; un fil long est à examiner, pas forcément bloqué.':'Aucun historique ChatGPT importé. « Actualiser » relit ce registre, mais ne peut pas détecter les chats privés qui n’y figurent pas.';
 const f=$('#chat-status-filter')?.value||'all';
 const filtered=chatInventory.filter(c=>f==='all'||c.status===f);
 list.innerHTML=filtered.length?filtered.slice(0,70).map(chatRow).join('')+'<p class="minihelp">'+Math.min(filtered.length,70)+' affichées sur '+filtered.length+'. Choisis un projet pour son historique ciblé.</p>':'<div class="minihelp">Aucune conversation dans ce filtre.</div>';
}
function projectChatMarkup(p){
 if(!chatInventoryReady)return '<div class="project-chat-state">💬 Conversations : inventaire privé non disponible ou non importé</div>';
 const chats=chatInventory.filter(c=>(c.project_ids||[]).includes(p.id));
 const blocked=chats.filter(c=>c.status==='bloque_signale').length;
 const suspect=chats.filter(c=>c.status==='a_examiner').length;
 let html='<section class="project-evidence"><h3>💬 Conversations liées à ce projet</h3><p>'+chats.length+' retrouvée(s) dans l’inventaire privé · '+blocked+' signalée(s) bloquée(s) · '+suspect+' à examiner</p>';
 if(!chats.length)html+='<p>Aucune conversation attribuée. Cela ne signifie pas qu’il n’existe aucun ancien chat.</p>';
 else html+=chats.slice(0,8).map(c=>'<div class="project-chat-item">'+escapeHTML(c.title)+' <small>· '+escapeHTML(chatStates[c.status]||'Non vérifié')+'</small></div>').join('');
 return html+'<p class="minihelp">Un blocage ne peut être confirmé que par un signalement ou un test réel dans ChatGPT, jamais par la simple synchronisation.</p></section>';
}
const chatPatterns=[
 ['forge',/forge.of.heroes|forge.sorcier|forgesorcier|voie.du.pagne|création.de.personnage|création.niveau.1|passage.de.niveau|profil.hybride/i],
 ['fiches-pj',/fiche.*interactive|fiche.*personnage.*cloud|import.*pdf.*fiche|suivi.*pv.*pm/i],
 ['hub-bastide',/hub.*bastide|île.aux.tempêtes.*bastide|mila.*dialogue|zéphéline|scanlan|vivelame|prépotente/i],
 ['hub-nespresso',/hub.*nespresso|île.aux.tempêtes.*d&d|xp.fantôme|nespresso.*joueurs/i],
 ['hub-configurable',/hub.configurable|hub.générique|hub.universel|espace.mj.*personnel/i],
 ['combat-cof2',/gestionnaire.*combat.*cof2|frise.*initiative|combat.*givrefoliette/i],
 ['soundboard-generique',/soundboard.*officiel|soundboard.*générique|soundboard_final/i],
 ['soundboard-ile',/soundboard.*île.aux.tempêtes|son.*muet.*soundboard/i],
 ['cockpit',/pilotage.guiltanas|guiltanas.control|cockpit|centre.synchronisation|inventaire.*chats/i],
 ['site-atelier',/seo.*atelier|référencement.*atelier|site.*atelier.guiltanas/i],
 ['mj-express',/mj.express/i],['pj-express',/pj.express/i],['express-universel',/guiltanas.express/i],
 ['budget',/budget.guiltanas|tableau.*budget/i],
 ['missions',/tableau.*missions.*sécurisé|pdp.*permis.feu|asnr.*missions/i],
 ['dragonlance-cof2',/dragonlance.*cof2/i],
 ['deck-succes-critiques',/deck.*succès.critique/i]
];
function chatTopics(conversation){
 const title=String(conversation.title||'').slice(0,250);
 let userTexts='',messages=0;
 const nodes=Object.values(conversation.mapping||{});
 for(const node of nodes){
  const m=node&&node.message;if(!m)continue;messages++;
  if(m.author?.role!=='user'||userTexts.length>60000)continue;
  const parts=m.content?.parts||[];
  for(const x of parts)if(typeof x==='string'&&userTexts.length<60000)userTexts+=' '+x.slice(0,4000);
 }
 const tagged=[];
 for(const [id,pattern] of chatPatterns)if(pattern.test(title)||pattern.test(userTexts))tagged.push(id);
 return {projects:tagged.slice(0,10),messageCount:messages};
}
async function importChatExport(file){
 const progress=$('#chat-import-progress');
 if(!file)return;
 if(file.size>180000000){progress.textContent='Export JSON trop volumineux pour cet import navigateur (180 Mo maximum).';return}
 progress.textContent='Analyse locale des conversations : aucun texte de message ne sera envoyé au serveur.';
 let parsed;
 try{parsed=JSON.parse(await file.text());if(!Array.isArray(parsed))throw Error('Le fichier doit être conversations.json, pas une autre exportation.')}catch(e){progress.textContent='Impossible de lire conversations.json : '+e.message;return}
 if(!parsed.length){progress.textContent='Le fichier ne contient aucune conversation.';return}
 const prepared=[];
 for(let i=0;i<parsed.length;i++){
  const c=parsed[i],id=String(c?.id||c?.conversation_id||'');
  if(!/^[a-zA-Z0-9_-]{12,140}$/.test(id))continue;
  const analyzed=chatTopics(c);
  const date=typeof c.update_time==='number'?new Date(c.update_time*1000).toISOString():null;
  // A very long thread is flagged FOR REVIEW only, never confirmed "broken".
  const danger=analyzed.messageCount>=240;
  prepared.push({id,title:String(c.title||'Sans titre').slice(0,180),project_ids:analyzed.projects,
    message_count:analyzed.messageCount,last_message_at:date,status:danger?'a_examiner':'non_verifie'});
 }
 if(!prepared.length){progress.textContent='Aucun identifiant de conversation valide détecté.';return}
 try{
  for(let i=0;i<prepared.length;i+=120){
   await chatRequest('import',{chats:prepared.slice(i,i+120)});
   progress.textContent='Import sécurisé : '+Math.min(i+120,prepared.length)+' / '+prepared.length+' métadonnées enregistrées…';
  }
  progress.textContent='✓ '+prepared.length+' conversations indexées. Aucun message ni pièce jointe envoyé au serveur. Les correspondances par mots-clés restent à confirmer.';
  await loadChatInventory();
 }catch(e){progress.textContent='Import interrompu : '+String(e.message||e)+'. Les lots précédents restent enregistrés.'}
}

function renderProjects(){
 const box=$('#project-list');if(!box)return;
 const q=$('#project-search').value.trim().toLowerCase(),stage=$('#project-stage').value,family=$('#project-family').value;
 const projects=projectData.filter(p=>(stage==='all'||p.lifecycle===stage)&&(family==='all'||p.family===family)&&(!q||[p.name,p.summary,p.category,p.progress_note,p.repo,p.next_action].join(' ').toLowerCase().includes(q)));
 const count=k=>projectData.filter(x=>x.lifecycle===k).length;
 $('#project-summary').innerHTML='<span><b>'+projectData.length+'</b> projets connus</span><span><b>'+count('actif')+'</b> actifs</span><span><b>'+count('developpement')+'</b> en développement</span><span><b>'+count('pause')+'</b> en pause</span><span><b>'+(count('brouillon')+count('idee'))+'</b> brouillons / idées</span>';
 const groupNames=['Jouer & raconter','Créer & fabriquer','Vie numérique'];
 const order={actif:0,developpement:1,brouillon:2,pause:3,idee:4,archive:5};
 box.innerHTML=groupNames.map(group=>{
  const subset=projects.filter(p=>p.family===group).sort((a,b)=>(order[a.lifecycle]??9)-(order[b.lifecycle]??9)||a.name.localeCompare(b.name,'fr'));
  if(!subset.length)return '';
  return '<div class="project-family-title">'+escapeHTML(group)+' <small>'+subset.length+'</small></div>'+
   subset.map(p=>'<div class="project-row" data-project="'+escapeHTML(p.id)+'" role="button" tabindex="0"><div class="project-name"><b>'+escapeHTML(p.name)+'</b><small>'+escapeHTML(p.category)+' · '+escapeHTML(p.repo||'Aucun dépôt confirmé')+'</small></div><div class="project-meta">'+escapeHTML(p.progress_note||p.summary||'Étape non documentée')+'</div>'+projectTag(p.lifecycle)+'<span class="project-chevron">›</span></div>').join('');
 }).join('')||'<div class="empty">Aucun projet dans ce filtre.</div>';
}
function openProject(id){
 const p=projectData.find(x=>x.id===id);if(!p)return;selected={kind:'project',id};
 let content='<p class="drawer-desc">'+escapeHTML(p.summary||'Objectif à préciser')+'</p>';
 content+='<div class="detail-grid"><div class="detail-box"><small>Étape</small><b>'+escapeHTML(statuses[p.lifecycle]||p.lifecycle)+'</b></div><div class="detail-box"><small>Publication</small><b>'+escapeHTML(publications[p.publication]||p.publication)+'</b></div><div class="detail-box"><small>Famille</small><b>'+escapeHTML(p.family)+'</b></div><div class="detail-box"><small>Catégorie</small><b>'+escapeHTML(p.category)+'</b></div></div>';
 content+='<div class="detail-label">Dernier état consigné</div><p class="drawer-desc">'+escapeHTML(p.progress_note||'Aucun point de reprise documenté')+'</p>';
 content+='<div class="detail-label">Pour reprendre ce projet</div><p class="drawer-desc">'+escapeHTML(p.next_action||'Aucune prochaine étape notée')+'</p>';
 content+='<div class="detail-label">Emplacement connu</div><div class="subgraph">'+escapeHTML(p.repo?p.repo+'/'+(p.folder||''):'Aucun dépôt GitHub confirmé')+'</div>';
 if(p.source_url?.startsWith('https://'))content+='<div class="detail-links">'+link(p.source_url,'Source détectée')+'</div>';
 if(p.app_id){const app=model.apps.find(a=>a.id===p.app_id);if(app)content+='<div class="detail-links"><button class="smallbutton" data-drawer-app="'+escapeHTML(app.id)+'">Voir les connexions techniques</button></div>'}
 content+='<div class="detail-label">Suivi</div><div class="minihelp">Dernière modification du registre : '+time(p.updated_at)+' · '+escapeHTML(p.source)+'</div>';
 content+=projectEvidenceMarkup(p);content+=projectChatMarkup(p);
 content+='<div class="detail-links"><button class="smallbutton primary" data-edit-project="'+escapeHTML(p.id)+'">Modifier cette fiche</button></div>';
 showDrawer(p.name,'Projet',content);
}
function editProject(id){currentEditId=id||null;
 const p=projectData.find(x=>x.id===id)||{id:'',name:'',family:'Jouer & raconter',category:'',lifecycle:'brouillon',publication:'non_publie',summary:'',progress_note:'',next_action:'',repo:'',folder:'',app_id:''};
 const form=$('#project-form');form.reset();
 for(const field of ['id','name','family','category','lifecycle','publication','summary','progress_note','next_action','repo','folder','app_id']){if(form.elements.namedItem(field))form.elements.namedItem(field).value=p[field]||''}
 if(!p.id){form.elements.namedItem('lifecycle').value='brouillon';form.elements.namedItem('publication').value='non_publie';form.elements.namedItem('family').value='Jouer & raconter'}
 $('#project-editor-title').textContent=id?'Modifier un projet':'Nouveau projet';
 $('#project-form-result').textContent='';
 if(!$('#project-editor').open)$('#project-editor').showModal();pushRoute();
}
async function registryRequest(action,body){
 const r=await fetch(REGISTRY+'?action='+action,{method:body?'POST':'GET',cache:'no-store',headers:{'Content-Type':'application/json',...Owner.headers()},body:body?JSON.stringify(body):undefined});
 const d=await r.json();if(!r.ok)throw Error(d.error||'Registre indisponible');return d;
}
async function loadRegistry(force=false){
 const indicator=$('#project-sync-status');if(indicator)indicator.textContent='Recherche des nouveaux dépôts et lecture du registre…';
 try{
  const d=await registryRequest(force?'list&force=1':'list');projectData=d.projects||[];projectScan=d.scan||null;
  const scan=projectScan;
  if(indicator)indicator.textContent='Registre Supabase à jour · '+projectData.length+' projets · GitHub public : '+(scan?.last_error?'contrôle impossible ('+scan.last_error+')':'contrôlé le '+time(scan?.last_github_at))+' · dépôts privés à suivre via connexion autorisée';
  renderProjects();renderProjectAuditPulse();await loadChatInventory();
  if(model){const label=$('#metrics .metric:nth-child(2) strong');if(label)label.textContent=String(projectData.length);const cap=$('#metrics .metric:nth-child(2) span');if(cap)cap.textContent='projets catalogués'}
 }catch(e){if(indicator)indicator.textContent='Registre indisponible : '+e.message}
}
function showDrawer(title,kind,content){$('#drawer-kind').textContent=kind.toUpperCase();$('#drawer-content').innerHTML='<h2 class="drawer-title">'+escapeHTML(title)+'</h2>'+content;$('#drawer').classList.add('show');$('#drawer').setAttribute('aria-hidden','false');$('#shade').hidden=false;pushRoute();}
function closeDrawer(){if(history.state?.pilotage&&history.state?.route?.drawer&&history.state.depth>0){goBack();return}hideDrawer();selected=null;if(model)drawMap()}
function detailList(items){return '<div class="pill-row">'+(items.length?items.map(s=>'<span class="pill">'+escapeHTML(s)+'</span>').join(''):'<span class="minihelp">Aucun lien supplémentaire confirmé</span>')+'</div>'}
function showApp(id){const a=model.apps.find(x=>x.id===id);if(!a)return;selected={kind:'app',id};graphRepo=a.repo;$('#graph-repo').value=a.repo;drawMap();const r=repoFor(a),dest=a.repo==='apprepo'?ROOT+a.path:a.repo==='site'?'https://github.com/latelierdeguiltanas/latelierdeguiltanas-site':r?.url;const cloudInfo=a.sync==='cloud'?'Données serveur partagées':a.sync==='hybrid'?'Stockage local + serveur':a.sync==='local'?'Stockage local':'Liaison à vérifier';
const related=model.flows.filter(e=>e[0]===id||e[1]===id).map(e=>{const other=e[0]===id?e[1]:e[0];return (model.apps.find(a=>a.id===other)?.name||other)+' · '+e[2]});
let content='<p class="drawer-desc">'+escapeHTML(a.what)+'</p><div class="detail-grid"><div class="detail-box"><small>Usage</small><b>'+escapeHTML(a.audience)+'</b></div><div class="detail-box"><small>Synchronisation</small><b>'+escapeHTML(cloudInfo)+'</b></div><div class="detail-box"><small>Diffusion</small><b>'+escapeHTML(a.exposure==='private'?'Dépôt privé':'Code source public')+'</b></div><div class="detail-box"><small>Commercialisation</small><b>'+escapeHTML(a.commercial)+'</b></div></div>';
content+='<div class="detail-label">Où est le code ?</div><div class="subgraph"><div class="chain"><span>'+escapeHTML(r?.name||'?')+'</span><i>→</i><span>'+escapeHTML(a.path||'racine du dépôt')+'</span></div></div>';
content+='<div class="detail-label">Connexions avec les autres applications</div>'+detailList(related);
content+='<div class="detail-label">Données et fonctions reliées</div>'+detailList([...a.groups,...a.functions]);
content+='<div class="detail-label">État connu</div><p class="drawer-desc">'+escapeHTML(a.quality)+'</p>';
content+='<div class="detail-links">'+(dest?link(dest,a.repo==='apprepo'?'Ouvrir l’outil':'Voir le dépôt'):'')+(r?link(r.url,'Dépôt GitHub'):'')+(a.repo==='apprepo'?'<button class="smallbutton" data-check-online="'+a.id+'">Tester la page web</button>':'')+'</div><div id="online-test" class="minihelp" style="margin-top:10px">Test sur demande · seule la réponse HTTP de la page est contrôlée.</div><p class="minihelp" style="margin-top:12px">Code source public ≠ disponibilité confirmée du service ≠ droits commerciaux validés.</p>';
showDrawer(a.name,'Application',content)}
function showRepo(id){const r=model.repos.find(x=>x.id===id);if(!r)return;selected={kind:'repo',id};graphRepo=id;$('#graph-repo').value=id;drawMap();const children=model.apps.filter(a=>a.repo===id);const other=id==='apprepo'?['.github/workflows/ · publication du site','supabase/ · scripts SQL et fonctions','guiltanas-install/ · icônes et raccourcis']:id==='site'?['site.css · design','index.html · accueil']:[];const content='<p class="drawer-desc">'+escapeHTML(r.description)+'</p><div class="detail-grid"><div class="detail-box"><small>Visibilité</small><b>'+escapeHTML(r.visibility==='private'?'Privé':'Public')+'</b></div><div class="detail-box"><small>État</small><b>'+escapeHTML(r.archived?'Archivé':'Actif')+'</b></div></div><div class="detail-label">Hiérarchie du dépôt</div><div class="tree-root">▾ '+escapeHTML(r.name)+'/</div><div class="tree-branch">'+children.map(a=>'<div class="tree-item"><span>↳</span><a href="#" data-drawer-app="'+a.id+'">'+escapeHTML(a.path||a.name)+'</a></div>').join('')+other.map(x=>'<div class="tree-item"><span>↳</span><span>'+escapeHTML(x)+'</span></div>').join('')+'</div><div class="detail-links">'+link(r.url,'Ouvrir le dépôt GitHub')+'</div>';
showDrawer(r.name,'Dépôt GitHub',content)}
function showDevice(label){const d=(model.devices||[]).find(x=>x.device_label===label);if(!d)return;selected={kind:'device',id:label};const checks=Object.entries(d.diagnostics||{}).map(([k,v])=>'<div class="detail-activity"><strong>'+escapeHTML(k)+'</strong> · '+escapeHTML(v.state||'Non vérifié')+'<div class="minihelp">'+escapeHTML(v.details||'')+'</div></div>').join('');showDrawer(label,'Appareil','<p class="drawer-desc">Dernier diagnostic remonté : '+time(d.last_seen_at)+'. Cela ne prouve pas que l’appareil est actuellement allumé.</p><div class="detail-label">Contrôles remontés</div>'+checks+'<div class="detail-links">'+link(ROOT+'centre-synchronisation/diagnostic/','Ouvrir les diagnostics')+'</div>')}
function svgEl(tag,attrs={},textValue){const el=document.createElementNS('http://www.w3.org/2000/svg',tag);Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,String(v)));if(textValue!=null)el.textContent=textValue;return el}
function mobileDependencies(a){
 const items=[];
 if(['cloud','hybrid','partial'].includes(a.sync))items.push({label:'☁ Supabase',kind:'data'});
 if(['local','hybrid','partial'].includes(a.sync))items.push({label:'▣ Données locales',kind:'local'});
 for(const f of model.flows.filter(f=>f[0]===a.id||f[1]===a.id)){
  const other=f[0]===a.id?f[1]:f[0],app=model.apps.find(x=>x.id===other);
  if(app)items.push({label:'↔ '+app.name,kind:'link',target:other,description:f[2]});
 }
 return items;
}
function renderMobileExplorer(){
 if(!model)return;
 const list=$('#mobile-repos');if(!list)return;
 $('#mobile-repo-count').textContent=model.repos.length+' dépôts · sélection tactile';
 list.innerHTML=model.repos.map(r=>{
  const apps=model.apps.filter(a=>a.repo===r.id);
  const open=r.id===graphRepo;
  const archives=r.archived?' · archive':'';
  const status=r.visibility==='private'?'Privé':'Public';
  const cards=open?'<div class="mobile-apps">'+(apps.length?apps.map(a=>{
   const focus=selected?.kind==='app'&&selected.id===a.id;
   const deps=focus?mobileDependencies(a):[];
   const details=focus?'<div class="mobile-link-detail"><div class="mobile-link-head">Liaisons de '+escapeHTML(a.name)+'</div><div class="mobile-link-sub">Même dépôt ≠ données partagées. Seules les dépendances identifiées sont affichées.</div><div class="mobile-dep-list">'+(deps.length?deps.map(d=>d.target?'<button class="mobile-dep '+d.kind+'" title="'+escapeHTML(d.description)+'" data-mobile-link="'+escapeHTML(d.target)+'">'+escapeHTML(d.label)+'</button>':'<span class="mobile-dep '+d.kind+'">'+escapeHTML(d.label)+'</span>').join(''):'<span class="mobile-empty">Aucune dépendance directe identifiée</span>')+'</div><button type="button" data-mobile-full="'+escapeHTML(a.id)+'">Voir la fiche complète et le dépôt ↗</button></div>':'';
   return '<button type="button" class="mobile-app-row'+(focus?' current':'')+'" data-mobile-app="'+escapeHTML(a.id)+'" aria-expanded="'+focus+'"><span class="app-connector">↳</span><span class="mobile-app-info">'+escapeHTML(a.name)+'<small>'+escapeHTML(a.path||'Racine du dépôt')+'</small></span><span class="mobile-app-flag '+(a.sync==='local'?'local':'')+'">'+escapeHTML(a.sync==='cloud'?'Cloud':a.sync==='hybrid'?'Mixte':a.sync==='local'?'Local':'À vérifier')+'</span></button>'+details;
  }).join(''):'<div class="mobile-empty">Aucune application répertoriée dans ce dépôt.</div>')+'</div>':'';
  return '<div class="mobile-repo'+(open?' expanded':'')+(r.archived?' archived':'')+'" role="listitem"><button type="button" class="mobile-repo-head" data-mobile-repo="'+escapeHTML(r.id)+'" aria-expanded="'+open+'"><span class="mobile-repo-glyph">⌘</span><span class="mobile-repo-info"><strong>'+escapeHTML(r.name)+'</strong><small>'+apps.length+' outil'+(apps.length>1?'s':'')+' répertorié'+(apps.length>1?'s':'')+' · '+escapeHTML(status+archives)+'</small></span><span class="mobile-repo-chevron">›</span></button>'+cards+'</div>';
 }).join('');
}
function drawMap(){
 if(!model)return;
 renderMobileExplorer();
 const svg=$('#map');svg.replaceChildren();
 const repo=model.repos.find(r=>r.id===graphRepo);
 const apps=repo?model.apps.filter(a=>a.repo===repo.id):[];
 const appFocus=selected?.kind==='app'?model.apps.find(a=>a.id===selected.id&&a.repo===graphRepo):null;
 const deps=appFocus?mobileDependencies(appFocus):[];
 const h=repo?Math.max(350,apps.length*70+65,deps.length*61+75):420;
 const w=repo?(appFocus?1110:760):940;
 svg.setAttribute('viewBox','0 0 '+w+' '+h);
 const add=(tag,attrs,txt)=>svgEl(tag,attrs,txt);
 const title=(x,label)=>svg.append(add('text',{x,y:34,class:'graph-title'},label));
 const path=(from,to,focus=false)=>{
  const dx=(to.x-from.x)*.42;
  svg.append(add('path',{class:'graph-edge'+(focus?' focus':''),
   d:'M '+(from.x+103)+' '+from.y+' C '+(from.x+103+dx)+' '+from.y+' '+(to.x-103-dx)+' '+to.y+' '+(to.x-103)+' '+to.y}));
 };
 const node=(pt,label,sub,type,fn,focus=false,dim=false)=>{
  const g=add('g',{class:'graph-node '+(type==='repo'?'repo-node':type==='service'?'service-node':'')+(focus?' focus':'')+(dim?' dim':''),
   transform:'translate('+(pt.x-103)+','+(pt.y-27)+')',role:'button',tabindex:0,'aria-label':label});
  g.append(add('rect',{x:0,y:0,width:206,height:54,rx:type==='repo'?11:8}));
  g.append(add('text',{x:11,y:21},label.length>24?label.slice(0,23)+'…':label));
  g.append(add('text',{x:11,y:40,class:'node-sub'},sub.length>30?sub.slice(0,29)+'…':sub));
  g.addEventListener('click',fn);
  g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();fn()}});
  svg.append(g);
 };
 if(!repo){
  title(27,'MES DÉPÔTS GITHUB');
  model.repos.forEach((r,i)=>{
   const pt={x:166+(i%3)*302,y:112+Math.floor(i/3)*180};
   node(pt,r.name,(r.visibility==='private'?'Privé':'Public')+(r.archived?' · archive':''),'repo',()=>showRepo(r.id),false,r.archived);
  });
  $('#graph-hint').textContent='Six dépôts distincts. Sélectionne un dépôt pour révéler ses dossiers et applications.';
  return;
 }
 title(58,'DÉPÔT');title(350,'APPLICATIONS');
 if(appFocus)title(765,'LIENS DE '+appFocus.name.toUpperCase().slice(0,18));
 const rp={x:145,y:Math.max(130,h/2)};
 const positions=new Map(apps.map((a,i)=>[a.id,{x:472,y:80+i*70}]));
 if(apps.length){
  const trunkX=300,first=positions.get(apps[0].id).y,last=positions.get(apps[apps.length-1].id).y;
  const trunk=add('path',{class:'graph-edge'+(!appFocus?' focus':''),d:'M '+(rp.x+103)+' '+rp.y+' H '+trunkX+' M '+trunkX+' '+first+' V '+last});
  svg.append(trunk);
  for(const a of apps){
   const to=positions.get(a.id),active=!appFocus||appFocus.id===a.id;
   svg.append(add('path',{class:'graph-edge'+(active?' focus':''),d:'M '+trunkX+' '+to.y+' H '+(to.x-103)}));
  }
 }
 node(rp,repo.name,repo.archived?'Archivé':repo.visibility==='private'?'Privé':'Dépôt public','repo',()=>showRepo(repo.id),true);
 for(const a of apps){
  node(positions.get(a.id),a.name,a.path||'racine du dépôt','app',()=>showApp(a.id),appFocus?.id===a.id,!!appFocus&&appFocus.id!==a.id);
 }
 if(appFocus){
  deps.forEach((d,i)=>{
   const pt={x:905,y:Math.max(80,h/2-(deps.length-1)*30.5)+i*61};
   path(positions.get(appFocus.id),pt,true);
   const type=d.kind==='data'?'service':'app';
   node(pt,d.label,d.description||'Connexion directe',type,()=>d.target?showApp(d.target):showHelp(d.kind==='data'?'supabase':'sync'),false);
  });
 }
 $('#graph-hint').textContent=appFocus?'Dépôt '+repo.name+' · seules les dépendances de '+appFocus.name+' sont en évidence.':repo.name+' · '+apps.length+' applications. Sélectionne une application pour ses dépendances.';
}
function chooseMobileRepo(id){
 if(!model?.repos.some(r=>r.id===id))return;
 graphRepo=graphRepo===id?'':id;selected=null;hideDrawer();$('#graph-repo').value=graphRepo;drawMap();pushRoute();
}
function chooseMobileApp(id){
 const a=model?.apps.find(x=>x.id===id);if(!a)return;
 const already=selected?.kind==='app'&&selected.id===id;
 graphRepo=a.repo;selected=already?null:{kind:'app',id};hideDrawer();$('#graph-repo').value=graphRepo;drawMap();pushRoute();
 const row=$('#mobile-repos').querySelector('[data-mobile-app="'+id+'"]');
 if(row&&!already)row.scrollIntoView({block:'nearest',behavior:'smooth'});
}
function wire(){const explorer=$('#mobile-repos');
 explorer.addEventListener('click',e=>{
  const full=e.target.closest('[data-mobile-full]');if(full){showApp(full.dataset.mobileFull);return}
  const link=e.target.closest('[data-mobile-link]');if(link){chooseMobileApp(link.dataset.mobileLink);return}
  const app=e.target.closest('[data-mobile-app]');if(app){chooseMobileApp(app.dataset.mobileApp);return}
  const repo=e.target.closest('[data-mobile-repo]');if(repo)chooseMobileRepo(repo.dataset.mobileRepo);
 });
 const clickParent=e=>{const app=e.target.closest('[data-app]'),repo=e.target.closest('[data-repo]'),dev=e.target.closest('[data-device]');if(app)showApp(app.dataset.app);else if(repo)showRepo(repo.dataset.repo);else if(dev)showDevice(dev.dataset.device)};document.addEventListener('click',e=>{if(e.target.closest('.data-row'))clickParent(e);const target=e.target.closest('[data-drawer-app]');if(target){e.preventDefault();showApp(target.dataset.drawerApp)}});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.matches('.data-row'))clickParent(e);if(e.key==='Escape'&&!document.querySelector('dialog[open]')&&$('#drawer').classList.contains('show'))goBack()});
$$('[data-view]').forEach(b=>b.onclick=()=>setView(b.dataset.view));$$('[data-view-go]').forEach(b=>b.onclick=()=>setView(b.dataset.viewGo));$('#graph-repo').onchange=e=>{graphRepo=e.target.value;selected=null;hideDrawer();drawMap();pushRoute()};$('#graph-reset').onclick=()=>{graphRepo='';selected=null;hideDrawer();$('#graph-repo').value='';drawMap();pushRoute()};
$('#project-search').oninput=renderProjects;$('#project-stage').onchange=renderProjects;$('#project-family').onchange=renderProjects;$('#project-new').onclick=()=>editProject(null);$('#project-scan').onclick=()=>loadRegistry(true);$('#project-refresh').onclick=()=>loadRegistry(false);
 $('#chat-import-trigger').onclick=()=>$('#chat-import-file').click();
 $('#chat-import-file').onchange=e=>{importChatExport(e.target.files?.[0]);e.target.value=''};
 $('#chat-status-filter').onchange=renderChatPanel;
 $('#chat-inventory-list').addEventListener('change',async e=>{
  const sel=e.target.closest('.chat-entry-state');if(!sel)return;
  const row=sel.closest('[data-chat-id]');const c=chatInventory.find(x=>x.id===row?.dataset.chatId);if(!c)return;
  sel.disabled=true;const old=c.status;
  try{const saved=await chatRequest('mark',{id:c.id,status:sel.value});c.status=saved.chat.status;renderChatPanel()}
  catch(err){c.status=old;sel.value=old;alert('Statut non enregistré : '+String(err.message||err))}
  finally{sel.disabled=false}
 });document.addEventListener('click',e=>{const audit=e.target.closest('[data-project-audit]');if(audit){openProject(audit.dataset.projectAudit);return}const resume=e.target.closest('[data-reprise-project]');if(resume){e.preventDefault();resumeProject(resume.dataset.repriseProject)}});$('#project-close').onclick=$('#project-cancel').onclick=goBack;$('#project-form').onsubmit=async e=>{e.preventDefault();const f=e.target,b=$('#project-submit');b.disabled=true;$('#project-form-result').textContent='Sauvegarde sur le serveur…';try{const body=Object.fromEntries(new FormData(f));const d=await registryRequest('save',body);$('#project-form-result').textContent='Fiche enregistrée.';$('#project-editor').close();if(history.state?.pilotage&&history.state.route?.dialog==='project-editor'){history.replaceState({...history.state,route:{...history.state.route,dialog:null,edit:null}},'',location.href)}await loadRegistry();openProject(d.project.id)}catch(err){$('#project-form-result').textContent=err.message}finally{b.disabled=false}};$('#project-list').addEventListener('click',e=>{const row=e.target.closest('[data-project]');if(row)openProject(row.dataset.project)});$('#project-list').addEventListener('keydown',e=>{if(e.key==='Enter'){const row=e.target.closest('[data-project]');if(row)openProject(row.dataset.project)}});document.addEventListener('click',e=>{const b=e.target.closest('[data-edit-project]');if(b)editProject(b.dataset.editProject)});$('#app-search').oninput=e=>{search=e.target.value.trim().toLowerCase();renderApps()};$('#app-filter').onchange=renderApps;
document.addEventListener('click',async e=>{const b=e.target.closest('[data-check-online]');if(!b)return;const a=model?.apps.find(x=>x.id===b.dataset.checkOnline),target=$('#online-test');if(!a||!target)return;b.disabled=true;target.textContent='Test en cours…';try{const u=ROOT+a.path;const r=await fetch(u,{method:'HEAD',cache:'no-store'});target.textContent=r.ok?'✓ Page accessible depuis cet appareil ('+r.status+'). Fonctionnalités internes non testées.':'⚠ Page non confirmée (HTTP '+r.status+').';}catch(err){target.textContent='⚠ Test impossible : '+err.message;}finally{b.disabled=false}});
$('#drawer-close').onclick=closeDrawer;$('#shade').onclick=closeDrawer;$('#cockpit-back').onclick=goBack;$('#help').onclick=$('#open-guide').onclick=()=>showHelp('guide');$('#term-close').onclick=goBack;document.addEventListener('click',e=>{const b=e.target.closest('[data-term]');if(b)showHelp(b.dataset.term)});$('#refresh-players').onclick=loadPlayerChecks;$('#reload').onclick=load}
function populate(){const chooser=$('#graph-repo');chooser.innerHTML='<option value="">Vue des dépôts</option>'+model.repos.map(r=>'<option value="'+escapeHTML(r.id)+'">'+escapeHTML(r.name)+'</option>').join('');if(graphRepo&&!model.repos.some(r=>r.id===graphRepo))graphRepo='';chooser.value=graphRepo;renderMetrics();renderBrief();renderApps();renderRepos();renderBackend();renderUsage();renderDevices();drawMap();loadPlayerChecks();$('#freshness').textContent='Données serveur : '+time(model.metrics.generated_at)+' · dépôts : audit '+model.inventoryUpdated}
async function load(){
 const reload=$('#reload');reload.disabled=true;$('#live-status').className='online';$('#live-status').innerHTML='<i></i> Connexion…';
 try{
  if(!Owner.token()){await window.GuiltanasLogin.show();return}
  const r=await fetch(ENDPOINT,{method:'GET',cache:'no-store',headers:Owner.headers()});
  const data=await r.json();
  if(!r.ok){
   if(r.status===401||r.status===403){Owner.clear();model=null;await window.GuiltanasLogin.show('Session expirée. Reconnecte-toi.');return}
   throw Error(data.error||'Service indisponible');
  }
  if(!Array.isArray(data.repos)||!Array.isArray(data.apps)||!data.metrics)throw Error('Inventaire incomplet');
  model=data;$('#locked').hidden=true;$('#content').hidden=false;$('#owner-logout').hidden=false;
  $('#live-status').className='online ok';$('#live-status').innerHTML='<i></i> À jour';
  populate();await loadRegistry();
  if(!routeRestoredOnce){routeRestoredOnce=true;if(history.state?.pilotage&&history.state?.route)restoreRoute(history.state.route)}
 }catch(e){
  $('#live-status').className='online bad';$('#live-status').innerHTML='<i></i> Indisponible';
  if(!model){await window.GuiltanasLogin.show('Erreur de chargement : '+e.message)}
  else alert('Actualisation impossible : '+e.message);
 }finally{reload.disabled=false}
}
let installRequest=null;
const standalone=()=>window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
function installationGuide(){
 const ua=navigator.userAgent;
 const ios=/iPad|iPhone|iPod/.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
 const samsung=/SamsungBrowser/i.test(ua);
 const android=/Android/i.test(ua);
 const withinApp=/wv\)|; wv|ChatGPT|FBAN|Instagram/i.test(ua);
 const lines=standalone()
  ?['✓ Pilotage Guiltanas est déjà ouvert comme application installée.']
  :ios?['1. Ouvre cette adresse dans Safari.','2. Touche Partager (icône carré avec flèche).','3. Choisis « Sur l’écran d’accueil » puis confirme.']
  :samsung?['1. Ouvre le cockpit dans Samsung Internet.','2. Menu ☰ → « Ajouter la page à ».','3. Sélectionne « Écran d’accueil » et confirme.']
  :android?['1. Ouvre le cockpit dans Chrome (pas dans le navigateur intégré à une autre application).','2. Menu ⋮ en haut à droite.','3. « Installer l’application » ou « Ajouter à l’écran d’accueil », puis confirme.']
  :['1. Ouvre le cockpit dans Chrome ou Microsoft Edge.','2. Menu du navigateur ⋮ → « Installer cette page comme application ».','3. Confirme la création du raccourci.'];
 return '<p class="minihelp">'+(withinApp?'Ce lien semble ouvert dans un navigateur intégré. Ouvre-le directement dans Chrome/Samsung Internet avant l’installation.':'Le navigateur ne propose pas actuellement son assistant automatique d’installation.')+'</p>'+lines.map(x=>'<p class="install-step">'+escapeHTML(x)+'</p>').join('')+'<p class="minihelp">L’installation ne peut pas être imposée par un site : le navigateur doit proposer ou confirmer le raccourci. Tu n’as pas à créer un autre compte.</p>';
}
function openInstallGuide(){const dlg=$('#install-dialog');$('#install-instructions').innerHTML=installationGuide();if(!dlg.open)dlg.showModal();pushRoute();}
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installRequest=e;$('#install-app').title='Installer le cockpit en un clic';});
window.addEventListener('appinstalled',()=>{installRequest=null;$('#install-app').innerHTML='✓ <span>Installée</span>';$('#install-app').title='Application installée';});
$('#install-app').onclick=async()=>{
 if(standalone()){openInstallGuide();return}
 if(installRequest){const p=installRequest;installRequest=null;
  try{await p.prompt();const outcome=await p.userChoice;if(outcome?.outcome!=='accepted')openInstallGuide();}
  catch{openInstallGuide()}
 }else openInstallGuide();
};
$('#install-close').onclick=goBack;
$('#copy-cockpit-link').onclick=async()=>{try{await navigator.clipboard.writeText(ROOT+'centre-synchronisation/');$('#copy-cockpit-link').textContent='✓ Adresse copiée';}catch{$('#copy-cockpit-link').textContent=ROOT+'centre-synchronisation/';}};
if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(()=>{});
initRouteHistory();wire();window.PilotageReload=load;load();
})();