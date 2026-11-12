'use strict';
/* Mesure la COUVERTURE CERTIFIEE de Forge, jamais le pourcentage de code écrit.
 * Cible unique : forge-of-heroes/index.html, SHA exigé pour chaque preuve.
 * Sept domaines de même poids ; pas de faux 100% via un seul profil.
 */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..');
const forge=path.join(root,'forge-of-heroes');
const store=path.join(root,'centre-synchronisation');
const source=path.join(forge,'index.html');
const focusPath=path.join(store,'forge-n1/focus.json');
const gatesPath=path.join(store,'data/forge-global-gates.json');
const dest=path.join(store,'data/forge-global-progress.json');
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const html=fs.readFileSync(source,'utf8');
const indexSha256=sha(html);
function extract(id){
 const i=html.indexOf('id="'+id+'"');
 if(i<0)throw Error('Bloc moteur ou base absent : '+id);
 const from=html.indexOf('>',i)+1,to=html.indexOf('</script>',from);
 if(from<=i||to<=from)throw Error('Bloc incomplet : '+id);
 return html.slice(from,to);
}
const engineSha256=sha(extract('FOH_ENGINE_BUNDLE'));
const databaseSha256=sha(extract('FOH_DB_JSON'));
const focus=JSON.parse(fs.readFileSync(focusPath,'utf8'));
const gateRegistry=JSON.parse(fs.readFileSync(gatesPath,'utf8'));
const sourceCurrent=focus.canonicalIndexSha256===indexSha256&&focus.engineSha256===engineSha256&&focus.databaseSha256===databaseSha256;
const hasRaceInputs=focus.racialOptionsCurrent?.valid===true&&focus.racialOptionsCurrent?.passed===392&&focus.racialOptionsCurrent?.total===392&&focus.peoplesEvidenceCurrent===true;
const normalized=entry=>entry?.status==='ACQUIS';
const plan=focus.certificationPlan;
const queue=plan?.queue||[];
const profiles=[focus.profile,...(plan?.archivedProfiles||[]),plan?.priorityProgress].filter(Boolean);
const profilesByName=new Map(profiles.map(profile=>[profile.name,profile]));
const profileWeight=16;
const raceRows=Array.isArray(focus.peoples)?focus.peoples:[];
const profileShape=queue.length===14&&new Set(queue.map(row=>row.name)).size===14&&
 profilesByName.size===profiles.length&&profiles.every(profile=>queue.some(row=>row.name===profile.name)&&
  profile.checks?.length>0&&profile.total===profile.checks.length&&profile.passed===profile.checks.filter(normalized).length)&&
 queue.every(row=>{
  const profile=profilesByName.get(row.name);
  return row.certified?profile?.completed===true&&profile.passed===profile.total:
   !profile?.completed;
 });
const peoplesShape=raceRows.length===8&&raceRows.every(r=>r.total===10&&r.checks?.length===10&&r.passed===r.checks.filter(normalized).length);
if(!profileShape||!peoplesShape)throw Error('Registre de critères N1 incomplet : aucun pourcentage global ne peut être inventé');
const provenProfiles=sourceCurrent?Number(profiles.reduce((sum,profile)=>
 sum+profileWeight*profile.passed/profile.total,0).toFixed(4)):0;
const provenPeoples=sourceCurrent&&hasRaceInputs?raceRows.reduce((n,r)=>n+r.checks.filter(normalized).length,0):0;
const gateSpecs=[
 {id:'n1-modes',name:'N1 · hybrides et sans profil',checks:[
  ['hybrides','Hybridations de profils dans les deux sens, caractéristiques, rangs et contraintes'],
  ['sans-profil','Créations sans profil, voies à la carte, âge, calculs et sauvegarde']]},
 {id:'niveau-2',name:'Passage N1 → N2',checks:[
  ['n2-rangs','Acquisition et coût des rangs de niveau 2 dans tous les profils'],
  ['n2-caracs','Calculs et conditions de pouvoirs N2, peuples et hybrides'],
  ['n2-sauvegarde','Sauvegarde, remplacement et réouverture après passage N2'],
  ['n2-pdf','PDF officiel N2 et annexes complètes'],
  ['n2-clic','Parcours réels au clic N1 → N2 sur mobile et navigateur']]},
 {id:'niveau-3',name:'Passage N2 → N3',checks:[
  ['n3-rangs','Rangs et choix autorisés de niveau 3 pour tous les profils'],
  ['n3-caracs','Calculs de rangs et pouvoirs conditionnels, peuples et hybrides'],
  ['n3-sauvegarde','Sauvegarde, reprise et absence de régression N2 → N3'],
  ['n3-pdf','PDF officiel N3 et annexes complètes'],
  ['n3-clic','Parcours réels N2 → N3 sur mobile et navigateur']]},
 {id:'export',name:'Fiches officielles et annexes',checks:[
  ['pdf-n1','Export de tous les personnages N1 du Livre de base'],
  ['pdf-n2','Export exhaustif des personnages N2'],
  ['pdf-n3','Export exhaustif des personnages N3'],
  ['pdf-rangs','Fidélité des textes de voies et seuls rangs acquis dans les annexes'],
  ['pdf-deux-pages','Valeurs correctes sur les deux pages du modèle COF2 officiel']]},
 {id:'liaison',name:'Sauvegardes et liaison Hub',checks:[
  ['save-last','Dernier état du personnage conservé, brouillon inclus'],
  ['save-version','Reprise et migration des sauvegardes existantes sans pertes'],
  ['hub-export','Ouverture d’une fiche interactive depuis la Forge'],
  ['hub-level','Propagation des passages de niveau aux fiches Hub'],
  ['hub-devices','Cohérence multi-appareils et droits des joueurs']]}
];
const listed=new Map((gateRegistry.gates||[]).map(r=>[r.id,r]));
function validGate(id){
 const r=listed.get(id);
 if(!sourceCurrent||!r||r.status!=='PASS'||r.indexSha256!==indexSha256||typeof r.evidence!=='string'||!r.evidence.startsWith('forge-of-heroes/QA/'))return false;
 const file=path.resolve(root,r.evidence);
 if(!file.startsWith(path.resolve(root,'forge-of-heroes/QA/')+path.sep)||!fs.existsSync(file))return false;
 let j;try{j=JSON.parse(fs.readFileSync(file,'utf8'))}catch{return false;}
 return j.schema==='FOH_GLOBAL_GATE_EVIDENCE_V1'&&j.gateId===id&&j.indexSha256===indexSha256&&j.status==='PASS'&&
  Array.isArray(j.checks)&&j.checks.length>0&&j.checks.every(c=>c.status==='PASS'&&c.evidence&&String(c.evidence).length>8);
}
const progressionPath=path.join(forge,'QA/N3/lot2/forge-unique-progression-retest.json');
let progressionTargeted=null;
if(fs.existsSync(progressionPath)){
 try{
  const p=JSON.parse(fs.readFileSync(progressionPath,'utf8'));
  if(p.schema==='FOH_PROGRESSIONS_TARGETED_TESTS_V1'&&p.indexSha256===indexSha256&&p.sourceUnchanged===true&&Array.isArray(p.cases)&&p.cases.length===8){
   progressionTargeted={
    scope:p.scope,evidence:'forge-of-heroes/QA/N3/lot2/forge-unique-progression-retest.json',
    n2:{passed:p.cases.filter(c=>c.id.startsWith('n2-')&&c.status==='PASS').length,total:3},
    n3:{passed:p.cases.filter(c=>c.id.startsWith('n3-')&&c.status==='PASS').length,total:5},
    allPassed:p.passed===8&&p.failed===0,
    note:'Campagnes fonctionnelles ciblées ; ni certificat universel N2/N3, ni preuve PDF réel/mobile ni serveur en ligne.'
   };
  }
 }catch(e){console.warn('Preuve N2/N3 illisible',e.message)}
}
const regressionsPath=path.join(forge,'QA/N1/regressions.json');
let n1Targeted=null;
if(fs.existsSync(regressionsPath)){
 try{
  const r=JSON.parse(fs.readFileSync(regressionsPath,'utf8'));
  if(r.schema==='FOH_N1_REGRESSION_BATCH'&&r.indexSha256===indexSha256&&r.status==='PASS'&&r.passed===37&&r.total===37&&r.suites?.length===37&&r.suites.every(s=>s.status==='PASS')){
   n1Targeted={label:'Familles de régression N1',passed:37,total:37,evidence:'forge-of-heroes/QA/N1/regressions.json',limitations:'Contrôles ciblés N1 sur index courant ; ne prouvent pas tous les effets R3/historiques ni 14/14 profils à 100 %.'};
  }
 }catch(e){console.warn('Rapport de régression N1 indisponible',e.message)}
}
const modules=[
 {id:'n1-profils',name:'N1 · 14 profils officiels',passed:provenProfiles,total:queue.length*profileWeight,status:sourceCurrent?'SCORE_COURANT':'SOURCE_PERIMEE',description:'Les 14 profils ont le même poids. Chaque profil contribue selon la part de ses critères N1 validés dans le registre.',source:'forge-n1/focus.json'},
 {id:'n1-peuples',name:'N1 · 8 peuples officiels',passed:provenPeoples,total:8*10,status:sourceCurrent&&hasRaceInputs?'SCORE_COURANT':'PREUVES_INCOMPLETES',description:'10 vérifications par peuple : les choix raciaux et méthodes prouvés sont acquis ; les autres effets et contraintes restent ouverts.',source:'forge-n1/focus.json'},
 ...gateSpecs.map(m=>{
  const checks=m.checks.map(([id,name])=>({id,name,passed:validGate(id),evidence:listed.get(id)?.evidence||null}));
  return{id:m.id,name:m.name,passed:checks.filter(c=>c.passed).length,total:checks.length,status:checks.every(c=>c.passed)?'CERTIFIE':'A_CERTIFIER',description:'Chaque validation demande un rapport dédié sur le SHA du produit publié. Une fonction présente sans preuve complète ne compte pas.',checks};
 })
];
for(const m of modules){
 if(m.id==='n1-profils'&&n1Targeted)m.targetedProof=n1Targeted;
 if(progressionTargeted&&(m.id==='niveau-2'||m.id==='niveau-3')){
  m.targetedProof={label:m.id==='niveau-2'?'Tests ciblés N2':'Tests ciblés N3',...progressionTargeted[m.id==='niveau-2'?'n2':'n3'],evidence:progressionTargeted.evidence,limitations:progressionTargeted.note};
 }
 m.percent=Math.round(m.passed/m.total*100);m.complete=m.passed===m.total;
}
const complete=modules.every(m=>m.complete);
const exact=sourceCurrent?modules.reduce((s,m)=>s+m.passed/m.total,0)/modules.length*100:null;
const output={
 schema:'FOH_GLOBAL_CERTIFICATION_V1',
 generatedAt:new Date().toISOString(),
 sourceProduct:'forge-of-heroes/index.html',
 source:{indexSha256,engineSha256,databaseSha256,focusSha256:focus.canonicalIndexSha256,focusAt:focus.generatedAt},
 status:sourceCurrent?'MEASURED':'SOURCE_STALE',
 scope:'Forge COF2 Livre de base, N1 à N3, hybrides/sans profil, export PDF et liaison Hub. Compagnon et futur Guide du joueur hors dénominateur jusqu’à intégration et ajout explicite des critères.',
 measure:'Couverture des critères de certification, pas % de code écrit ni probabilité d’absence de bug.',
 scoring:'Sept domaines de même poids. Chaque domaine vaut 1/7 du total et progresse selon ses propres critères intégralement prouvés. Aucune moyenne de tests automatisés ne vaut certificat.',
 moduleCount:modules.length,
 percent:exact===null?null:Math.round(exact),
 exactPercent:exact===null?null:Math.round(exact*100)/100,
 certified:sourceCurrent&&complete,
 modules,
 openModules:modules.filter(m=>!m.complete).map(m=>m.id),
 limitations:['88% d’un profil n’est pas 88% de toute l’application.','0% de certification sur un module signifie preuve globale manquante, non absence de code fonctionnel.','Après toute modification de index.html, les preuves périmées sont neutralisées avant nouveau score.','Les nouveaux livres/règles devront élargir le périmètre et le dénominateur dès leur intégration.']
};
fs.writeFileSync(dest,JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify({status:output.status,global:output.percent,exact:output.exactPercent,canonical:indexSha256,modules:modules.map(m=>[m.id,m.passed,m.total,m.percent])},null,2));
