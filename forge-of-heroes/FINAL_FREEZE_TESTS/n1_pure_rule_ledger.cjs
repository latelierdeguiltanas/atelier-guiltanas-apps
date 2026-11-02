'use strict';
/** Registre lisible par les joueurs, volontairement indépendant des anciens pourcentages globaux. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),out=path.resolve(root,'..','centre-synchronisation/forge-n1/purs.json');
const read=p=>JSON.parse(fs.readFileSync(path.resolve(root,p),'utf8'));
const catalog=read('progression/catalog.json'),native=read('QA/N1/native-items.json'),methods=read('QA/N1/official-methods-cross.json'),raceOpts=read('QA/N1/official-racial-options.json'),numeric=read('QA/N1/lot4/source-numeric.json'),parity=read('QA/N1/version-parity.json');
const profiles=catalog.profiles.filter(p=>p.id.endsWith(':cof2-lb-2024'));
const arqReportPath=path.resolve(root,'QA/N1/arquebusier-pure-age-ranks.json');const arqReport=fs.existsSync(arqReportPath)?JSON.parse(fs.readFileSync(arqReportPath,'utf8')):null;const arqAgePass=!!arqReport&&arqReport.complete===true&&arqReport.expected===400&&arqReport.pass===400&&arqReport.failed===0;
const peoples=['humain','nain','demi-elfe','demi-orc','elfe-haut','elfe-sylvain','gnome','halfelin'];
const peopleLabels={'humain':'Humain','nain':'Nain','demi-elfe':'Demi-elfe','demi-orc':'Demi-orc','elfe-haut':'Elfe haut','elfe-sylvain':'Elfe sylvain','gnome':'Gnome','halfelin':'Halfelin'};
const detailMaps={
 'mecanismes':'Bonus rang + 2 aux réparations et mécanismes ; dé bonus avec les armes de siège.',
 'arme-a-repetition':'Chargeur de 2 + INT projectiles ; recharge par action limitée ; bonus lié aux rangs 3.',
 'tir-de-barrage-l':'Attaque déclenchée par un déplacement ; choix entre dégâts doublés ou arrêt du mouvement.',
 'tir-de-grenaille-l':'Attaque de zone avec une arme à poudre ; moitié des dégâts et bonus d’artificier.',
 'demolition':'Dégâts d’explosif sur une structure, temps de préparation et réduction des protections.',
 'poudre-puissante':'Bonus de portée et de dégâts pour les armes à poudre.',
 'pilier-de-bar':'Bonus rang + 2 aux interactions dans les tavernes ou auberges.',
 'mort-ou-vif-l':'Attaque spéciale au contact ou à distance avec dégâts supplémentaires.',
 'combattant-aguerri':'Choix d’une capacité de rang 1 autorisée d’un autre profil.',
 'plus-vite-que-son-ombre':'Bonus d’initiative de +5 si l’arme à poudre est chargée et tenue.',
 'ajuster-le-tir':'Bonus conditionnel au tir qui suit une attaque à distance ratée.',
 'tir-double-l':'Attaques avec deux armes de poing ; mains, cibles et rechargement.',
 'joli-coup':'Ignore une pénalité liée à une couverture partielle.',
 'defaut-dans-la-cuirasse-a':'Action de préparation et tir visant la faiblesse d’une cible.',
 'tir-precis':'Plage de critique des armes à distance.'
};
function focus(rank){
 const id=rank.id.split(':')[1];if(detailMaps[id])return detailMaps[id];
 const text=(rank.text||'').replace(/\s+/g,' ');
 const patterns=[
  [/\bDEF\b|défense/i,'Défense et conditions d’armure ou de bouclier'],
  [/\bInit\.?\b|initiative/i,'Initiative et ordre de jeu'],
  [/\bPV\b|vigueur|points de vie/i,'Points de vie et récupération'],
  [/\bPC\b|point de chance/i,'Points de chance'],
  [/\bPM\b|mana/i,'Mana et coût des pouvoirs'],
  [/d[468]|dégâts|\bDM\b/i,'Dégâts et dés'],
  [/attaque|critique|dé bonus|dé malus/i,'Jets d’attaque, bonus et conditions'],
  [/rang\s*\+\s*2|tests? de|compétence/i,'Bonus aux tests de compétence'],
  [/monture|animal|familier|loup|écuyer/i,'Compagnon, monture ou allié'],
  [/armure|bouclier|arme|recharg|portée/i,'Équipement, portées et recharge'],
  [/action|round|combat|tour/i,'Conditions et fréquence d’utilisation']
 ];
 const found=patterns.filter(p=>p[0].test(text)).map(p=>p[1]).slice(0,3);
 return found.length?found.join(' ; '):'Conditions d’utilisation et effet du pouvoir';
}
const gate=(id,name,ok,validated,missing)=>({id,name,status:ok?'ACQUIS':'A_VERIFIER',validated:ok?validated:'',missing:ok?'':missing});
const items=[];
if(profiles.length!==14||catalog.paths.filter(p=>profiles.some(pr=>pr.id===p.classId)&&!p.additionalMagePath).length!==70)throw Error('Scope strict 14×5 changed');
for(const profile of profiles){
 const pathways=catalog.paths.filter(p=>p.classId===profile.id&&!p.additionalMagePath);
 if(pathways.length!==5||pathways.some(p=>p.ranks.filter(r=>r.rank<=3).length!==3))throw Error('Incomplete official profile '+profile.label);
 const recorded=native.profiles.find(x=>x.id===profile.id);
 if(!recorded)throw Error('No baseline profile '+profile.id);
 for(const people of peoples){
  const raceId='people:'+people+':cof2-lb-2024';
  const row=recorded.peoples.find(p=>p.id===raceId),method=methods.items.profiles[profile.id]?.find(p=>p.people===raceId),race=raceOpts.perPeople[people];
  if(!row||!method||!race)throw Error('No evidence '+profile.label+' '+people);
  const racePass=race.cases===race.passed&&race.failed===0,r2Methods=method.status==='PASS'&&method.parity;
  const pureCount=row.standard,purePass=pureCount===10&&row.failures===0,grantPass=pureCount>0&&row.failures===0;
  const checks=[
   gate('race','Caractéristiques et particularités du peuple',racePass,'Tous les choix raciaux de départ ont été appliqués et conservés lors de la sauvegarde.','Contrôler les bonus et malus de ce peuple.'),
   gate('caracs','Choix des caractéristiques',r2Methods,'Séries, achat et tirages représentatifs vérifiés avec ce peuple et ce profil.','Valider séries et méthodes avancées sur cette combinaison.'),
   gate('two-paths','Choisir deux voies parmi les cinq',purePass,pureCount+'/10 paires de voies de ce profil acceptées avec le paquetage testé.',pureCount+'/10 paires acceptées avec ce paquetage. Examiner les refus et équiper légalement le personnage (notamment la petite taille).'),
   gate('abilities','Recevoir les deux capacités de rang 1',grantPass,'Les deux capacités de rang 1 des voies choisies apparaissent lors de la création témoin.','Vérifier l’acquisition des deux capacités de rang 1.'),
   gate('save','Enregistrer et reprendre ce personnage',r2Methods,'La réouverture conserve les caractéristiques, leurs effets de base et les choix de création de ces exemples.','Contrôler les sauvegardes et les calculs restaurés.'),
   gate('derived','Vigueur, défense, initiative, chance, mana, attaques',false,'','Comparer chaque valeur au livre avec toutes les voies, les rangs d’âge et les choix de ce couple peuple/profil.'),
   gate('rank1','Tous les effets des cinq voies au rang 1',false,'','Prouver chaque bonus permanent, conditionnel et utilisation de rang 1, pas seulement l’apparition de la capacité.'),
   gate('rank2','Tous les effets des cinq voies au rang 2',false,'','Contrôler les cinq rangs 2 accessibles par les règles d’âge et les éventuels rangs de mage.'),
   gate('rank3','Tous les effets des cinq voies au rang 3',false,'','Contrôler les cinq rangs 3 lorsque le personnage est vénérable.'),
   gate('ages','Très jeune, jeune, mûr et vénérable',profile.id.includes(':arquebusier:')&&arqAgePass,'Les quatre âges, les choix de très jeune et les rangs 1, 2, 3 ont été vérifiés sur les cinq voies avec les huit peuples.','Vérifier les malus d’âge, les bonus, les dépenses de rangs et les plafonds avec ce peuple/profil.'),
   gate('histories','Origine, métier et options d’historique',false,'','Comparer les bonus de compétences, les choix et les rangs d’historique aux règles avancées.'),
   gate('gear','Armures, armes, boucliers et contraintes',false,'','Tester tous les paquetages et alternatives autorisés par ce profil et ce peuple.'),
   gate('pdf','Fiche officielle et annexes des voies',false,'','Vérifier les valeurs, les noms des pouvoirs, les résumés et les descriptions dans le PDF.'),
   gate('click','Création complète au clic',false,'','Créer ce peuple/profil dans l’interface, sauvegarder, rouvrir, et obtenir la fiche correcte.')
  ];
  const powers=pathways.map(p=>({id:p.id,name:p.name,page:p.source?.printedPage??null,abilities:p.ranks.filter(r=>r.rank<=3).map(r=>{
   const base=String(r.name||'').replace(/[*]/g,'');
   const baseline=grantPass&&r.rank===1;
   return {rank:r.rank,name:base,page:r.source?.printedPage??p.source?.printedPage??null,focus:focus(r),grant:baseline?'Acquisition du rang 1 vérifiée sur les voies choisies':'Présence dans le livre et dans Forge contrôlée',calculation:'À vérifier pour '+profile.label+' '+peopleLabels[people],status:'EFFETS_A_VERIFIER'};
  })}));
  if(profile.id.includes(':arquebusier:'))checks.push(gate('arbaletrier','Variante Arbalétrier sans poudre',false,'','Poudre ou pas poudre (livre de base p.62) : remplacer les armes à poudre, supprimer la Voie des explosifs et intégrer la Voie du maître d’armes limitée aux arbalètes. Vérifier les maîtrises et les effets de cette variante.'));
  const passed=checks.filter(c=>c.status==='ACQUIS').length;
  items.push({id:profile.id+'|'+raceId,profileId:profile.id,profile:profile.label,peopleId:raceId,people:peopleLabels[people],category:'PUR_N1_LIVRE_DE_BASE',percent:Math.round(100*passed/checks.length),passed,total:checks.length,certified:passed===checks.length,canCreateInValidatedScenario:grantPass&&r2Methods,purePathPairs:{approved:pureCount,total:10},checks,powers,source:{profilePage:profile.source?.printedPage??null,rules:'COF2 Livre de base et Règles avancées',sourceProofs:['QA/N1/native-items.json','QA/N1/official-methods-cross.json','QA/N1/official-racial-options.json','QA/N1/lot3/age-profiles.json','QA/N1/lot4/source-numeric.json']}});
 }
}
const report={
 schema:'FOH_N1_PURE_CHARACTERS_BY_RULE',
 generatedAt:new Date().toISOString(),
 sourceCommit:process.env.GITHUB_SHA||null,
 engineSha256:parity.current.engine,
 mainAudience:'MJ et joueurs de COF2',
 interpretation:"Chaque pourcentage concerne les vérifications de création N1 pour CE couple précis peuple / profil, exclusivement en profil pur. Il ne mesure pas des tests passés, n'est pas une probabilité de fiabilité et ne prouve pas que tous les personnages de cette catégorie sont sûrs.",
 focus:{activeProfileId:'class:arquebusier:cof2-lb-2024',activeProfileName:'Arquebusier',activePeopleCount:8,pausedProfileCount:13,policy:'Une certification après l’autre : seuls les 8 Arquebusiers sont en cours.'},scope:{profileMode:'PUR',officialProfiles:14,officialPeoples:8,combinations:112,companions:'DIFFÉRÉS',hybrids:'ÉTAPE SUIVANTE',noProfile:'ÉTAPE SUIVANTE'},
 criteria:'14 vérifications ordinaires ; 15 pour Arquebusier avec la variante Arbalétrier',
 profiles:profiles.map(p=>({id:p.id,name:p.label,page:p.source?.printedPage??null})),
 peoples:peoples.map(p=>({id:'people:'+p+':cof2-lb-2024',name:peopleLabels[p]})),
 items,
 summary:{certified:items.filter(x=>x.certified).length,total:items.length,baselinePlayable:items.filter(x=>x.canCreateInValidatedScenario).length,fullyValidatedAbilities:0,criteriaPassed:items.reduce((n,x)=>n+x.passed,0),criteriaTotal:items.reduce((n,x)=>n+x.total,0)},
 notes:[
 'Un rang affiché avec son texte ne signifie pas que tous ses effets fonctionnent. Les effets non prouvés restent explicitement « À vérifier ».',
 'Les pourcentages précédents 69% incluaient profils hybrides/sans profil et n’étaient pas propres aux 112 couples purs. Ils ne doivent pas être réutilisés ici.',
 'Une création ayant réussi dans une configuration témoin ne certifie pas toutes les options de cette combinaison.',
 'Chaque couple se ferme uniquement après vérification de TOUS ses rangs accessibles, calculs, choix, équipement, historiques, sauvegarde, interface et PDF.'
 ]
};
if(items.length!==112)throw Error('Not 112');
fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(report)+'\n');
console.log(JSON.stringify({profileMode:'PUR',pairs:report.summary.total,certified:report.summary.certified,playable:report.summary.baselinePlayable,criteria:report.summary.criteriaPassed+'/'+report.summary.criteriaTotal,arquebusierNain:items.find(x=>x.profile==='Arquebusier'&&x.people==='Nain')?.percent,halfelinBarbare:items.find(x=>x.profile==='Barbare'&&x.people==='Halfelin')?.purePathPairs}));
