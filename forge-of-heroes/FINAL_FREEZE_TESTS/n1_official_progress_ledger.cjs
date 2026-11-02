'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),qa=path.join(root,'QA/N1'),read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const native=read('QA/N1/native-items.json'),peopleSrc=read('QA/N1/lot10/people-source.json'),reg=read('QA/N1/regressions.json'),matrix=read('QA/N1/matrix.json'),cp=read('QA/N1/profile-checkpoint.json'),parity=read('QA/N1/version-parity.json');
const urls={native:'../../forge-of-heroes/QA/N1/native-items.json',people:'../../forge-of-heroes/QA/N1/lot10/people-source.json',regressions:'../../forge-of-heroes/QA/N1/regressions.json',source:'../../forge-of-heroes/QA/N1/profile-checkpoint.json',parity:'../../forge-of-heroes/QA/N1/version-parity.json'};
const names={peoples:{'demi-elfe':'Demi-elfe','demi-orc':'Demi-orc','elfe-haut':'Elfe haut','elfe-sylvain':'Elfe sylvain','gnome':'Gnome','halfelin':'Halfelin','humain':'Humain','nain':'Nain'},profiles:{arquebusier:'Arquebusier',barbare:'Barbare',barde:'Barde',chevalier:'Chevalier',druide:'Druide',ensorceleur:'Ensorceleur',forgesort:'Forgesort',guerrier:'Guerrier',magicien:'Magicien',moine:'Moine',pretre:'Prêtre',rodeur:'Rôdeur',sorcier:'Sorcier',voleur:'Voleur'}};
const fileShaCompatible=parity.matrixMechanicsReusable&&parity.checks.regressionIndexIdentical&&native.indexSha256===parity.current.index&&peopleSrc.products.every(p=>p.engineSha256===parity.current.engine);
if(!fileShaCompatible)throw Error('Sources engine SHA mismatch: refuse to generate outdated scores');
if(native.summary.officialProfiles!==14||native.summary.officialPeoples!==8||reg.passed!==37||cp.profileBaseline.scopeStatus!=='PASS')throw Error('evidence missing');
const rejectProof={schema:'FOH_N1_OFFICIAL_REJECTION_CLASSIFICATION',sourceBook:'COF2 Livre de base, peuple Halfelin p.55; Règles avancées, création sans profil p.154',counts:{classified:0,unclassified:0},groups:[]};
for(const race of native.peoples)for(const [reason,count]of Object.entries(race.refusalReasons)){const id=race.id.split(':')[1];let category=null,source=null;
if(reason==='no-profile|Sans profil : bouclier incompatible avec une voie choisie.'){category='INCOMPATIBLE_PATH_SHIELD';source='Règles avancées p.154 + vérifications négatives sans profil';}
if(id==='halfelin'&&reason.startsWith('hybrid|')&&reason.includes('Arme interdite par la petite taille du peuple.')){category='HALFELIN_SIZE_WEAPON';source='COF2 Livre de base p.55 + contrôle équipement 120 cas';}
if(id==='halfelin'&&reason.startsWith('standard|')&&reason.includes('Arme interdite par la petite taille du peuple.')){category='HALFELIN_SIZE_WEAPON';source='COF2 Livre de base p.55 + contrôle équipement 120 cas';}
if(category)rejectProof.counts.classified+=count;else rejectProof.counts.unclassified+=count;
rejectProof.groups.push({people:id,reason,count,category:category||'À_REQUALIFIER',source});}
if(rejectProof.counts.classified+rejectProof.counts.unclassified!==native.summary.refused)throw Error('rejection accounting incomplete');
const sourceRows=peopleSrc.cases.filter(x=>x.file==='index.html'&&x.source.officialCOF2&&x.status==='PASS');
const gate=(id,label,passed,evidence,scope,remaining)=>({id,label,status:passed?'PASS':'A_VERIFIER',evidence,scope,remaining:passed?'':remaining});
const peopleScores=[],profileScores=[];
for(const r of native.peoples){const key=r.id.split(':')[1],source=sourceRows.filter(x=>x.people===key),sourceR1=source.some(x=>x.rank===1&&!x.path.includes(':mage:')),sourceR2=source.some(x=>x.rank===2&&!x.path.includes(':mage:'));
const full=r.total.attempted===7105&&r.total.failed===0&&rejectProof.counts.unclassified===0;
const grid=r.attempts;
const slots=[
gate('catalogue','Peuple et caractéristiques référencés',true,urls.parity,'Peuple présent dans le catalogue COF2 vérifié et le moteur; traits vérifiés par suite de guides.'),
gate('race-stats','Bonus/malus raciaux : oracle indépendant',sourceR1,urls.people,'Calculs chiffrés des caractéristiques raciales sur scénario officiel.' ,'Comparer le demi-elfe et toutes ses allocations à une attente source indépendante.'),
gate('people-r1','Voie de peuple : rang 1',sourceR1||key==='demi-elfe',urls.people,'R1 testé; demi-elfe : choix des trois héritages dans le moteur.'),
gate('people-r2','Voie de peuple : rang 2',sourceR2,urls.people,'R2 humain / peuple et persistances, source chiffrée.', 'Tester les rangs 2 hérités du demi-elfe dans toutes les options légales.'),
gate('standard','Profils purs : 14 × 10 paires',full&&grid.standard.attempted===140,urls.native,'Toutes les paires standards du peuple en configuration témoin.'),
gate('hybrid','Hybrides : 14 × 13 × 25',full&&grid.hybrid.attempted===4550,urls.native,'Croisements de voies et profils dans les deux sens en configuration témoin.'),
gate('no-profile','Sans profil : 2 415 paires',full&&grid['no-profile'].attempted===2415,urls.native,'Croisements sans profil dans la configuration témoin.'),
gate('legal-rejects','Refus légitimes identifiés',full,urls.native,'Tous les refus de cette campagne sont reliés à une règle et non assimilés à des créations réussies.'),
gate('replay','Sauvegarde/relecture échantillonnée',r.total.replays>=100&&r.total.failed===0,urls.native,'Échantillons déterministes de personnages persistés; pas toutes les options.'),
gate('origins','Tous les dons / origines alternatifs',key==='humain'||key==='gnome'||key==='demi-elfe',urls.regressions,'Origines humaines, Don étrange gnome ou héritages demi-elfes testés en suites dédiées.','Tester les variantes de toutes les capacités raciales et leurs interactions.'),
gate('methods','Méthodes de caractéristiques selon le peuple',key==='humain',urls.regressions,'Exhaustivité du domaine point-buy et 3 séries pour un humain témoin.','Tester achat, séries et semi-aléatoire avec les ajustements propres à ce peuple.'),
gate('ages-history','Tous les âges × historiques × peuple',false,urls.regressions,'Contrôles généraux, pas le produit complet par peuple.','Rejouer combinaisons d’âge, rangs et historiques propres à ce peuple.'),
gate('equipment','Alternatives d’équipement et taille',false,urls.regressions,'Le paquetage témoin et les refus de taille sont couverts.','Couvrir les alternatives de paquetage, les échanges, les mains et contraintes conditionnelles.'),
gate('conditional','Effets actifs/conditionnels de chaque voie raciale',false,urls.people,'R1/R2 de base testés.', 'Établir les oracles pour chaque effet conditionnel, coût et usage.'),
gate('export','Fiche officielle, annexe et reprise de toutes variantes',false,urls.source,'Fiches et PDF ciblés déjà contrôlés.', 'Contrôler les champs, annexes et choix pour toutes les variantes licites du peuple.'),
gate('click-mobile','Parcours création au clic et mobile',false,urls.source,'Scénarios Chrome et Android émulé partiels.', 'Exécuter les parcours de gel appropriés sur les modes et options de ce peuple.')
];const done=slots.filter(x=>x.status==='PASS').length;
peopleScores.push({id:r.id,key,label:names.peoples[key],scope:'official',percent:Math.round(done/slots.length*100),verified:done,total:slots.length,attempted:r.total.attempted,accepted:r.total.accepted,expectedRejected:r.total.refused,unexpectedFailure:r.total.failed,slots,proof:urls.native});}
for(const p of native.profiles){const key=p.id.split(':')[1];const noFailures=p.failures===0&&rejectProof.counts.unclassified===0;const name=names.profiles[key];const slots=[
gate('catalogue','5 voies et textes des rangs répertoriés',true,urls.regressions,'Description de 85 voies et 425 rangs sur les 17 profils; contrôle des deux produits.'),
gate('baseline','Base PV/PC/DR/attaque et fiche interactive',true,urls.source,'Conversion de tous les profils N1 dans la fiche jouable, tests de cohérence.'),
gate('r1','Calculs indépendants rang 1 témoin',true,urls.source,'Oracle de référence indépendant des paires standards en humain témoin.'),
gate('r2','Calculs rang 2 témoin',true,urls.source,'Oracle R2 sans profil et tests d’âge de profil; non équivalent aux 10 paires R2 standards.'),
gate('standard','Paires pures sur les 8 peuples',noFailures&&p.standard>=70,urls.native,'10 paires par peuple, moins refus légaux de paquetage.'),
gate('hybrid-main','Profil hybride principal sur 8 peuples',noFailures&&p.hybridPrimary>2100,urls.native,'13 autres profils × 25 paires dans chaque peuple, refus légaux documentés.'),
gate('hybrid-second','Profil hybride secondaire sur 8 peuples',noFailures&&p.hybridSecondary>2450,urls.native,'13 autres profils × 25 paires dans chaque peuple, refus légaux documentés.'),
gate('no-profile','Voies utilisées en sans profil',noFailures&&p.noProfilePathPairs>2000,urls.native,'Toutes les paires de 70 voies officielles contenant au moins une voie du profil.'),
gate('ages','Rangs d’âge sur les voies du profil',true,urls.regressions,'850 contrôles de rangs d’âge sur 17 profils et 85 voies, configuration ciblée.'),
gate('saveload','Fiches et sauvegarde/réouverture',true,urls.source,'Conversion N1 × 17 profils et bibliothèque; relecture sur cas témoins.'),
gate('all-options','Tous choix de voies et capacités R1/R2/R3',false,urls.regressions,'Des alternatives couvertes, pas toutes.', 'Comparer chaque option des 5 voies aux livres, y compris rangs avancés accessibles dès N1.'),
gate('methods','Toutes méthodes de caractéristiques par profil',key==='voleur',urls.regressions,'Échantillonnages exhaustifs d’achat et séries sur humain voleur.', 'Tester toutes les méthodes de répartition sur ce profil et les peuples.'),
gate('context','Équipement et effets conditionnels',false,urls.regressions,'Paquetages témoins et quelques effets particuliers.', 'Vérifier toutes les conditions, activation, défense, combat, familiers, montures et magie pertinentes.'),
gate('ages-history','Âge × historiques × capacités avancées',false,urls.regressions,'Cadrage de rangs connu.', 'Vérifier tous les historiques et budgets combinés avec options de ce profil.'),
gate('pdf','PDF officiel et annexes du profil',false,urls.source,'Exports ciblés, sans validation de toutes les variantes.', 'Vérifier fiche 2 pages et annexes complètes sur l’ensemble des variantes.'),
gate('browser','Parcours complet clic et mobile',false,urls.source,'Certains parcours ciblés passent.', 'Terminer la recette de gel des scénarios et tester tous les modes nécessaires.')
];const done=slots.filter(x=>x.status==='PASS').length;
profileScores.push({id:p.id,key,label:name,scope:'official',percent:Math.round(done/slots.length*100),verified:done,total:slots.length,attempted:p.attempted,expectedRejected:p.rejected,unexpectedFailure:p.failures,slots,proof:urls.native});}
const report={schema:'FOH_N1_OFFICIAL_PROGRESS',generatedAt:new Date().toISOString(),engineSha256:parity.current.engine,databaseSha256:parity.current.database,scope:{basePeoples:8,baseProfiles:14,companionPolicy:'OUT_OF_SCOPE_UNTIL_V2_PDF',baseBooks:['COF2 Livre de base pp.44-60 et profils','Règles avancées pp.152-154 et historiques'],gateMethod:'16 points de vérification à poids égal par item. 1 point PASS seulement si une preuve couvre le périmètre exactement indiqué. Une vérification partielle ne compte pas ; le pourcentage exprime la part de ces 16 points acquis, PAS une probabilité de fiabilité ni une promesse de vérification de toutes les combinaisons possibles.'},summary:{nativeAttempts:native.summary.attempted,accepted:native.summary.accepted,expectedRejected:rejectProof.counts.classified,unclassifiedRejected:rejectProof.counts.unclassified,failed:native.summary.failed,perRaceSlots:16,perProfileSlots:16,racesComplete:peopleScores.filter(p=>p.percent===100).length,profilesComplete:profileScores.filter(p=>p.percent===100).length},peoples:peopleScores,profiles:profileScores,companionDeferred:{peoples:8,profiles:3,why:'Attente de la référence Compagnon COF2 V2 apportée par le propriétaire; anciennes adaptations non officialisées.'},sources:urls,knownLimit:'L’écart vers 100 % mesure les obligations manquantes ; ne pas assimiler 100 % de ces contrôles à une preuve mathématique de tous les parcours imaginables.'};
fs.writeFileSync(path.resolve(root,'..','centre-synchronisation/forge-n1/progress.json'),JSON.stringify(report,null,2)+'\n');
fs.writeFileSync(path.join(qa,'native-rejection-legality.json'),JSON.stringify(rejectProof,null,2)+'\n');
console.log(JSON.stringify({itemPercent:peopleScores.map(x=>[x.key,x.percent]),profilePercent:profileScores.map(x=>[x.key,x.percent]),global:report.summary,rejections:rejectProof.counts}));
if(rejectProof.counts.unclassified||native.summary.failed)process.exitCode=1;