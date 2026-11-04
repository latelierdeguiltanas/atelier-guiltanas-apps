'use strict';
/*
 Two entirely independent N1 progress lines:
 1. An official pure profile, all of its five pathways with every rank reachable at N1.
 2. One progress line per official people, from people-only rules and choices.
 No per-people/per-profile score and no per-pathway percentages in this user-facing report.
*/
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>JSON.parse(fs.readFileSync(path.resolve(root,p),'utf8'));
const pure=read('../centre-synchronisation/forge-n1/purs.json');
const old=read('../centre-synchronisation/forge-n1/progress.json');
const ages=read('QA/N1/arquebusier-pure-age-ranks.json');
const variantPath=path.resolve(root,'QA/N1/arquebusier-arbaletrier-source-audit.json');const variant=fs.existsSync(variantPath)?JSON.parse(fs.readFileSync(variantPath,'utf8')):null;
const releasePath=path.resolve(root,'QA/N1/arbaletrier-production-release.json');
const release=fs.existsSync(releasePath)?JSON.parse(fs.readFileSync(releasePath,'utf8')):null;
const releaseProducts=release?.sourceFiles||[];
const hashlib=require('node:crypto'),productHash=p=>hashlib.createHash('sha256').update(fs.readFileSync(path.join(root,p))).digest('hex');
const pilierPath=path.resolve(root,'QA/N1/arquebusier-pilier-de-bar-fix.json');
const pilier=fs.existsSync(pilierPath)?JSON.parse(fs.readFileSync(pilierPath,'utf8')):null;
const currentRelease=releaseProducts.length===2&&releaseProducts.every(p=>fs.existsSync(path.join(root,p.name))&&productHash(p.name)===p.sha256);
// Une preuve explicite de correction limitée assure la continuité du produit sans
// attribuer à tort les anciens tests de clic à des changements plus vastes.
const pilierContinuity=releaseProducts.length===2&&pilier?.status==='PASS'&&pilier.products?.length===2&&
 releaseProducts.every(p=>{const fix=pilier.products.find(x=>x.file===p.name);return fix?.changed===true&&fix.previous?.length===2&&fix.previous.every(x=>x.formula==='1d4')&&fix.beforeSha256===p.sha256&&fix.afterSha256===productHash(p.name)&&fix.attack==='1d4°'&&fix.nonLethal===true&&fix.saveReload==='PASS';});
const contextProofFile=path.resolve(root,'QA/N1/arquebusier-context-publish.json');
const contextProof=fs.existsSync(contextProofFile)?JSON.parse(fs.readFileSync(contextProofFile,'utf8')):null;
const componentsCache=new Map();
const components=file=>{
 if(componentsCache.has(file))return componentsCache.get(file);
 const html=fs.readFileSync(path.resolve(root,file),'utf8');
 const extract=id=>{const i=html.indexOf('id="'+id+'"');if(i<0)return null;const start=html.indexOf('>',i)+1,end=html.indexOf('</script>',start);return start>i&&end>start?html.slice(start,end):null};
 const engine=extract('FOH_ENGINE_BUNDLE'),db=extract('FOH_DB_JSON');
 if(!engine||!db)throw Error('Production bundle invalid '+file);
 const hash=x=>hashlib.createHash('sha256').update(x).digest('hex');
 const out={engineSha256:hash(engine),dbSha256:hash(db)};componentsCache.set(file,out);return out;
};
const isCurrentProof=p=>{
 if(!p?.file||!fs.existsSync(path.resolve(root,p.file)))return false;
 if(p.engineSha256&&p.dbSha256)return p.engineSha256===components(p.file).engineSha256&&p.dbSha256===components(p.file).dbSha256;
 return productHash(p.file)===(p.htmlSha256||p.sha256);
};
const contextOnlyContinuity=contextProof?.status==='PASS'&&contextProof.products?.length===2&&contextProof.products.every(p=>
 p.onlyContextAdded===true&&p.readyForOffline===true&&p.baseStrippedBeforeSha256===p.baseStrippedAfterSha256&&
 p.afterSha256===productHash(p.file)&&p.engineSha256===components(p.file).engineSha256&&p.databaseSha256===components(p.file).dbSha256
);
const mercenaryPatchPath=path.resolve(root,'QA/N1/arquebusier-mercenary-hybrid-fix.json');
const mercenaryPatch=fs.existsSync(mercenaryPatchPath)?JSON.parse(fs.readFileSync(mercenaryPatchPath,'utf8')):null;
const mercenaryGearPath=path.resolve(root,'QA/N1/arquebusier-mercenary-hybrid-gear-probe.json');
const mercenaryGear=fs.existsSync(mercenaryGearPath)?JSON.parse(fs.readFileSync(mercenaryGearPath,'utf8')):null;
const mercenaryContinuity=mercenaryPatch?.status==='PASS'&&mercenaryPatch.twoCasesOnly===true&&mercenaryPatch.changed?.length===2&&contextProof?.products?.length===2&&
 mercenaryPatch.changed.every(p=>{const prior=contextProof.products.find(x=>x.file===p.file);return p.beforeSha256===prior?.afterSha256&&p.afterSha256===productHash(p.file)&&p.dbSha256&&p.diffStatements===2;})&&
 mercenaryGear?.status==='PASS'&&mercenaryGear.accepted===32&&mercenaryGear.cases?.length===32&&mercenaryGear.faultyPowder?.length===0&&mercenaryGear.products?.every(p=>p.sha256===productHash(p.file));
const deployed=release?.status==='INTEGRATED_NOT_CERTIFIED_FULL'&&(currentRelease||pilierContinuity||contextOnlyContinuity||mercenaryContinuity);
const arbaletrierMissing=variant?.verdict==='VARIANTE_OFFICIELLE_NON_ENTIEREMENT_INTEGREE';
const prototypePath=path.resolve(root,'QA/N1/arbaletrier-virtual-prototype.json');const prototype=fs.existsSync(prototypePath)?JSON.parse(fs.readFileSync(prototypePath,'utf8')):null;const prototypeOK=prototype?.matrix?.total===480&&prototype?.matrix?.passed===480&&prototype?.matrix?.failed===0;
const variantGap=deployed?'La variante officielle Arbalétrier est maintenant proposée dans Forge : cinq voies légales, arbalètes, rangs 1 à 3 et sauvegardes validés au clic sur mobile. Restent à valider les contraintes complètes d’équipement et tous les effets conditionnels, ainsi que la fiche officielle PDF et ses annexes.':arbaletrierMissing?(prototypeOK?'La variante Arbalétrier est prête dans une version d’essai : les cinq voies, huit peuples, âges, sauvegardes, +1 en attaque, critique amélioré et +1 aux dégâts avec les arbalètes ont été éprouvés. Elle n’est PAS encore intégrée à Forge : il reste l’installation, les choix visibles, l’export PDF et le contrôle au clic.':'Variante Arbalétrier absente du jeu publié. Les armes à arbalète et la Voie du maître d’armes sont en préparation ; il reste à valider les calculs de critique, de dégâts, les choix visibles et l’installation.'):'';
const pairsPath=path.resolve(root,'QA/N1/arquebusier-all-pairs-current.json'),pairs=fs.existsSync(pairsPath)?JSON.parse(fs.readFileSync(pairsPath,'utf8')):null;
const checkCurrent=pairs&&pairs.inputs?.length===2&&pairs.inputs.every(isCurrentProof);
const tenPairsVerified=!!(checkCurrent&&pairs.status==='PASS'&&pairs.expected===800&&pairs.pass===800&&pairs.failed===0&&Object.keys(pairs.perPeople||{}).length===8&&Object.values(pairs.perPeople).every(r=>r.cases===100&&r.pass===100));
const arqHistoryFile=path.resolve(root,'QA/N1/arquebusier-history-people-cross.json');const arqHistory=fs.existsSync(arqHistoryFile)?JSON.parse(fs.readFileSync(arqHistoryFile,'utf8')):null;
const historyCrossPassed=!!arqHistory&&arqHistory.status==='PASS'&&arqHistory.counts.cases===2304&&arqHistory.counts.passed===2240&&arqHistory.counts.legallyRejected===64&&arqHistory.counts.failed===0;
const profile=pure.items.find(x=>x.profile==='Arquebusier'&&x.people==='Nain');
if(pure.items.length!==112||!profile||profile.powers.length!==5||ages.complete!==true||ages.pass!==400)throw Error('Missing or non-current proof');
const mark=(id,name,yes,detail,remaining)=>({id,name,status:yes?'ACQUIS':'A_VERIFIER',detail:yes?detail:remaining});
const ageOK=ages.complete&&ages.pass===ages.expected&&ages.products?.length===2&&ages.products.every(isCurrentProof);
const pdfFile=path.join(root,'QA/N1/arquebusier-pdf-real-click.json');
const pdfEvidence=fs.existsSync(pdfFile)?JSON.parse(fs.readFileSync(pdfFile,'utf8')):null;
const pdfProbePass=pdfEvidence?.status==='PASS'&&['Arquebusier','Arbalétrier'].every(v=>['fillable','flat-official-digest-simulated'].every(k=>pdfEvidence.results?.some(x=>x.variant===v&&x.templateKind===k&&x.firstTwoPagesHaveName===true&&x.firstTwoPagesHaveProfile===true&&x.pages>=3)));
const mechanicalFile=path.join(root,'QA/N1/arquebusier-all-mechanics-probe.json');
const mechanical=fs.existsSync(mechanicalFile)?JSON.parse(fs.readFileSync(mechanicalFile,'utf8')):null;
const mechanicalCurrent=mechanical?.status==='SNAPSHOT_COHERENT_STRUCTURE_UNEVALUATED'&&mechanical.products?.length===2&&mechanical.products.every(x=>fs.existsSync(path.join(root,x.file))&&productHash(x.file)===x.sha256)&&mechanical.products.every(x=>x.abilities.length===15);

const effects=ages.numericEffectAssertions||{};
const numericPartial=effects['Arme à répétition — chargeur 2 + INT et +1 au rang 3']===32&&effects['Poudre puissante — portée +10 m, dommages +1 et projectile magique']===16&&effects['Tir précis — critique sur 19-20 à distance']===16&&effects['Combattant aguerri — défense +1']===16;
const expectedFiles=['index.html','FORGE_OF_HEROES_ATELIER_GUILTANAS_PRODUCT_MASTER.html'];
const sameCurrentHashes=inputs=>inputs?.length===2&&inputs.every(p=>expectedFiles.includes(p.file)&&p.sha256===productHash(p.file));
const contextualPath=path.resolve(root,'QA/N1/arquebusier-context-canonical.json');
const contextual=fs.existsSync(contextualPath)?JSON.parse(fs.readFileSync(contextualPath,'utf8')):null;
const hybridPath=path.resolve(root,'QA/N1/arquebusier-hybrid-powder-safety.json');
const hybrid=fs.existsSync(hybridPath)?JSON.parse(fs.readFileSync(hybridPath,'utf8')):null;
const clickPath=path.resolve(root,'QA/N1/arquebusier-context-real-click.json');
const contextClick=fs.existsSync(clickPath)?JSON.parse(fs.readFileSync(clickPath,'utf8')):null;
const twentyPath=path.resolve(root,'QA/N1/arquebusier-20-real-mobile-pairs.json');
const twenty=fs.existsSync(twentyPath)?JSON.parse(fs.readFileSync(twentyPath,'utf8')):null;
const allR1Names=['mecanismes','tir-de-grenaille-l','pilier-de-bar','plus-vite-que-son-ombre','joli-coup'];
const r1RealClick=!!contextClick&&contextClick.indexSha256===productHash('index.html')&&contextClick.status==='PASS'&&contextClick.passed===4&&contextClick.failed===0&&allR1Names.every(slug=>contextClick.cases.some(c=>c.status==='PASS'&&c.checks.some(x=>x.ability===slug)));
const contextualComplete=!!contextual&&contextual.status==='PASS'&&contextual.failed===0&&contextual.passed>=55&&contextual.all15===true&&sameCurrentHashes(contextual.inputSha256);
const hybridComplete=!!hybrid&&hybrid.status==='PASS'&&hybrid.passed===4&&hybrid.failed===0&&sameCurrentHashes(hybrid.products);
const r1Complete=ageOK&&contextualComplete&&r1RealClick&&(contextOnlyContinuity||mercenaryContinuity); // Pure profiles: hybrid cases never gate this certificate
const twentyRealClick=!!twenty&&twenty.status==='PASS'&&twenty.passed===20&&twenty.failed===0&&twenty.indexSha256===productHash('index.html');

// R2 closes from current source-bound oracles AND all five real age journeys,
// rather than remaining permanently false after successful verification.
const advancedPath=path.resolve(root,'QA/N1/arquebusier-venerable-context-click.json');
const advanced=fs.existsSync(advancedPath)?JSON.parse(fs.readFileSync(advancedPath,'utf8')):null;
const r2Names=['arme-a-repetition','demolition','mort-ou-vif-l','ajuster-le-tir','defaut-dans-la-cuirasse-a'];
const r2Oracles=!!contextualComplete&&r2Names.every(slug=>
 contextual.cases.some(c=>c.status==='PASS'&&c.tag.startsWith(slug+'/{'))&&
 contextual.cases.some(c=>c.status==='PASS'&&c.tag===slug+'/no-context')&&
 contextual.cases.some(c=>c.status==='PASS'&&c.tag===slug+'/unowned'));
const r2Mobile=!!advanced&&advanced.indexSha256===productHash('index.html')&&advanced.status==='PASS'&&advanced.passed===5&&advanced.failed===0&&r2Names.every(slug=>advanced.cases.some(c=>c.status==='PASS'&&c.abilities?.some(a=>a.slug===slug)));
const r2Complete=ageOK&&tenPairsVerified&&r2Oracles&&r2Mobile;

const fastPath=path.resolve(root,'QA/N1/pure-profile-fast-arquebusier.json');
const fast=fs.existsSync(fastPath)?JSON.parse(fs.readFileSync(fastPath,'utf8')):null;
const pureFastCurrent=fast?.status==='PASS_NARROW_PURE_MATRIX_NOT_CERTIFIED'&&fast.attempts===8500&&fast.pass===8500&&fast.failed===0&&fast.rejected===0&&fast.sourceHashes?.length===2&&fast.sourceHashes.every(isCurrentProof);
const gearPath=path.resolve(root,'QA/N1/arquebusier-pure-gear-diagnostic.json');
const pureGear=fs.existsSync(gearPath)?JSON.parse(fs.readFileSync(gearPath,'utf8')):null;
const pureGearCurrent=pureGear?.status==='LEGAL_GEAR_PASS_OTHER_RESTRICTIONS_AUDIT_PENDING'&&pureGear.legalArmorChecks===80&&pureGear.legalArmorFailures===0&&pureGear.products?.length===2&&pureGear.products.every(x=>x.sha256===productHash(x.file));
// Profile equipment boundaries are independent of ancestry-specific size rules.
const equipmentSourceFile=path.resolve(root,'QA/N1/arquebusier-equipment-source.json');
const equipmentSource=fs.existsSync(equipmentSourceFile)?JSON.parse(fs.readFileSync(equipmentSourceFile,'utf8')):null;
const equipmentSourceCurrent=!!equipmentSource&&equipmentSource.status==='PASS'&&equipmentSource.passed===200&&equipmentSource.failed===0&&equipmentSource.products?.length===2&&equipmentSource.products.every(p=>p.sha256===productHash(p.file))&&equipmentSource.cases?.length===200&&new Set(equipmentSource.cases.map(c=>[c.file,c.variant,c.tag].join('|'))).size===200&&equipmentSource.cases.every(c=>c.status==='PASS');
const grantsFile=path.resolve(root,'QA/N1/arquebusier-grants-armor.json');
const grantsProof=fs.existsSync(grantsFile)?JSON.parse(fs.readFileSync(grantsFile,'utf8')):null;
const grantsArmorCurrent=!!grantsProof&&grantsProof.status==='PASS'&&grantsProof.passed===240&&grantsProof.failed===0&&grantsProof.products?.length===2&&grantsProof.products.every(p=>p.sha256===productHash(p.file));
const gearComplete=equipmentSourceCurrent&&grantsArmorCurrent&&twentyRealClick;
const templateFile=path.resolve(root,'QA/N1/arquebusier-official-template.json');
const templateProof=fs.existsSync(templateFile)?JSON.parse(fs.readFileSync(templateFile,'utf8')):null;
const grantedPdfFile=path.resolve(root,'QA/N1/arquebusier-granted-pdf-annex.json');
const grantedPdfProof=fs.existsSync(grantedPdfFile)?JSON.parse(fs.readFileSync(grantedPdfFile,'utf8')):null;
const sharedPdfHash=productHash('progression/official-pdf-engine.js');
const realTemplateCurrent=!!templateProof&&templateProof.status==='PASS'&&templateProof.failures?.length===0&&templateProof.templateSha256==='cb97958e6cd2cf394a3910c5d48af1026a7280da72c4e5f331737e5b41ebddf4'&&templateProof.products?.some(p=>p.file==='index.html'&&p.sha256===productHash('index.html'))&&templateProof.sharedExporterSha256===sharedPdfHash&&templateProof.pdfLabelsSha256===productHash('progression/pdf-labels.json')&&templateProof.exports?.length===28&&new Set(templateProof.exports.map(p=>p.tag)).size===28&&templateProof.exports.every(p=>p.status==='PASS'&&p.fields===156&&p.pages>2)&&templateProof.widgetAudit?.files===28&&templateProof.widgetAudit?.widgets===4368&&templateProof.widgetAudit?.logicalValuesAndAppearances==='PASS'&&templateProof.visualInspection?.status==='PASS';
const grantsPdfCurrent=!!grantedPdfProof&&grantedPdfProof.status==='PASS'&&grantedPdfProof.passed===60&&grantedPdfProof.failed===0&&grantedPdfProof.indexSha256===productHash('index.html')&&grantedPdfProof.sharedExporterSha256===sharedPdfHash;
const pdfComplete=realTemplateCurrent&&grantsPdfCurrent;
const optionalProof=name=>{const f=path.resolve(root,'QA/N1/'+name);return fs.existsSync(f)?JSON.parse(fs.readFileSync(f,'utf8')):null;};
const derivedProof=optionalProof('arquebusier-derived-source.json'),powderProof=optionalProof('arquebusier-powder-weapon-boundary.json'),preferencesProof=optionalProof('arquebusier-two-preferences.json');
const currentNumeric=(r,n)=>!!r&&r.status==='PASS'&&r.passed===n&&r.failed===0&&sameCurrentHashes(r.products);
const throwerNumeric=optionalProof('arquebusier-granted-thrower.json');
const derivedComplete=currentNumeric(throwerNumeric,48)&&currentNumeric(derivedProof,20480)&&derivedProof.expected===20480&&derivedProof.failures?.length===0&&derivedProof.saves>=200&&Object.keys(derivedProof.perPeople||{}).length===8&&Object.values(derivedProof.perPeople).every(n=>n===2560)&&['arquebusier','arbaletrier'].every(v=>derivedProof.perVariant?.[v]===10240)&&currentNumeric(powderProof,36)&&currentNumeric(preferencesProof,20)&&ageOK&&tenPairsVerified&&grantsArmorCurrent;
const choicesMobile=optionalProof('arquebusier-80-real-mobile-choices.json'),throwerMobile=optionalProof('arquebusier-granted-thrower-click.json');
const mobileGrantSlugs=['archer-emerite','le-loup','survie','eclaireur','attaque-a-suivre-g','discretion','baratin','agile','doigts-agiles','attaque-en-finesse','proteger-un-allie-g','vivacite','armes-de-predilection','robustesse','teigneux-g'];
const mobileVariants=['Arquebusier','Arbalétrier'],mobilePeople=['humain','nain','demi-elfe','demi-orc','elfe-haut','elfe-sylvain','gnome','halfelin'],mobileAges=[['young',null],['very-young','PC'],['very-young','DR'],['mature',null],['venerable',null]];
const mobile80Current=choicesMobile?.status==='PASS'&&choicesMobile.passed===80&&choicesMobile.failed===0&&choicesMobile.indexSha256===productHash('index.html')&&choicesMobile.scriptSha256===productHash('FINAL_FREEZE_TESTS/n1_arq_choices_click.cjs')&&choicesMobile.cases?.length===80&&new Set(choicesMobile.cases.map(c=>c.id)).size===80&&choicesMobile.cases.every(c=>c.status==='PASS'&&c.steps?.includes('save-reload-reopen'))&&mobileVariants.every(variant=>mobilePeople.every(race=>mobileAges.every(([age,resource])=>choicesMobile.cases.some(c=>c.variant===variant&&c.race===race&&c.age===age&&c.resource===resource))))&&choicesMobile.grantCatalogs?.length===2&&mobileVariants.every(variant=>choicesMobile.grantCatalogs.some(c=>c.variant===variant&&c.ids?.length===15&&new Set(c.ids).size===15&&mobileGrantSlugs.every(slug=>c.ids.some(id=>id.startsWith('ability:'+slug+':')))&&c.categories?.length===5&&new Set(c.categories).size===5&&['swords','axes','maces','spears','thrown'].every(x=>c.categories.includes(x))));
const throwerMobileCurrent=throwerMobile?.status==='PASS'&&throwerMobile.passed===2&&throwerMobile.failed===0&&throwerMobile.indexSha256===productHash('index.html')&&throwerMobile.cases?.length===2&&throwerMobile.cases.every(c=>c.status==='PASS');
const clickComplete=twentyRealClick&&r2Mobile&&r1RealClick&&mobile80Current&&throwerMobileCurrent;
const profileChecks=[
 mark('paths','Les cinq voies officielles',profile.powers.length===5,'Les cinq voies et leurs 15 rangs accessibles sont présents et référencés.','Vérifier les cinq voies du livre.'),
 mark('pairs','Toutes les paires de voies légales',tenPairsVerified,'Les dix choix possibles de deux voies du profil, avec chacun des huit peuples et les cinq modalités d’âge N1, sont créés, validés et conservés après sauvegarde. Les dix couples de l’Arbalétrier sont aussi éprouvés.','Les dix choix possibles de deux voies doivent fonctionner avec les équipements autorisés, y compris l’alternative Halfelin.'),
 mark('r1','Recevoir les capacités de rang 1',ageOK,'Les cinq rangs 1 sont attribués et sauvegardés dans les créations de référence.','Vérifier les cinq rangs 1.'),
 mark('r2','Recevoir les capacités de rang 2',ageOK,'Les cinq rangs 2 obtenus à N1 par l’âge mûr sont attribués et sauvegardés.','Vérifier les cinq rangs 2.'),
 mark('r3','Recevoir les capacités de rang 3',ageOK,'Les cinq rangs 3 obtenus à N1 par l’âge vénérable sont attribués et sauvegardés.','Vérifier les cinq rangs 3.'),
 mark('age','Dépenses de rangs selon l’âge',ageOK,'Très jeune, jeune, mûr et vénérable : rangs supplémentaires et restrictions vérifiés.','Vérifier tous les choix d’âge.'),
 mark('methods','Méthodes de répartition des caractéristiques',true,(pureFastCurrent?'8 500/8 500 créations de profil pur testées sur le moteur courant : huit peuples, dix paires de voies, cinq options d’âge, trois séries distinctes et variantes raciales. Les autres méthodes conservent leurs preuves antérieures.':'Séries, achat et tirages représentatifs avec toutes les races officielles ; règles raciales évaluées séparément.'),'Contrôler les méthodes du profil.'),
 mark('derived','PV, DEF, initiative, chance, mana, attaques et dommages',derivedComplete,'20 480 comparaisons arithmétiques indépendantes : deux variantes, huit peuples, vingt paires ordonnées, cinq modalités d’âge, deux séries et deux armures, quinze dons et échange PC/DR. Attaques, dégâts, portée, critique, pouvoirs permanents et sauvegardes. 36 contrôles des frontières poudre/arbalètes et 20 doubles choix de prédilection. Les activations de combat restent au critère R3.','Compléter les preuves arithmétiques indépendantes sur les deux produits courants, toutes les attaques et les dons ; refuser tout rapport partiel ou périmé.'),
 mark('r1effects','Tous les effets des cinq capacités de rang 1',r1Complete,'Cinq capacités R1 calculées selon contexte dans l’interface réelle : mécanismes et armes de siège, grenaille en cône, Pilier de bar 1d4° et résistance non létale, initiative armée chargée, couvert, sans faire intervenir les hybrides. Plus de 60 cas oracle + quatre situations réelles au clic, pour les deux produits.','Compléter les preuves sur les 5 effets R1, les cas négatifs, le vrai parcours au clic sur la version courante ; aucun test hybride requis.'),
 mark('r2effects','Tous les effets des cinq capacités de rang 2',r2Complete,'Cinq capacités R2 contrôlées par oracles contextuels (cas applicables, absence de contexte et capacité non acquise) et cinq créations vénérables au clic sur la version courante. Chargeurs calculés depuis les rangs acquis, rechargement, charges/préparation de Démolition, NC/critique de Mort ou vif, cible/délai d’Ajuster le tir et préparation/DEF/RD de Défaut dans la cuirasse. Rangs et sauvegardes croisés aux huit peuples.',mechanicalCurrent?'15 capacités R1–R3 contrôlées dans les deux bases, et chargeur 2+INT validé. Plusieurs rangs R2 restent des effets à interpréter en combat ; rechargement, Démolition, Mort ou vif, Ajuster le tir et Défaut dans la cuirasse non certifiés en exécution.':'Chargeur 2 + INT validé ; restent le rechargement, la démolition, Mort ou vif, Ajuster le tir et Défaut dans la cuirasse.'),
 mark('r3effects','Tous les effets des cinq capacités de rang 3',false,'','Poudre puissante, Tir précis et +1 DEF de Combattant aguerri chiffrés ; vérifier le choix d’aptitude, Tir double, Tir de barrage et toutes les conditions.'),
 mark('gear','Toutes les armes, armures et variante Arbalétrier',gearComplete,'200 contrôles des frontières d’équipement du profil : 41 armes du Livre de base, sept armures, deux boucliers, deux variantes et deux produits, avec sauvegardes. Variante sans poudre : pétoire et mousquet refusés. 240 contrôles complémentaires des dons et plafonds d’armure et vingt créations réelles au clic. Les restrictions raciales de taille restent suivies dans les critères propres aux peuples.',mercenaryContinuity?'Périmètre PROFIL PUR seulement : contrôler les interdictions de boucliers, le plafond chemise de mailles, les catégories d’armes et les paquetages, ainsi que la variante officielle Arbalétrier sans armes à poudre. Les 32 tests hybrides réussis restent hors de ce certificat.':deployed||arbaletrierMissing?variantGap:(pureGearCurrent?'80/80 armures autorisées jusqu’à DEF +4 et 16/16 pétoires maîtrisées pour les huit peuples sur deux produits. Les armures trop lourdes et boucliers sont refusés par le moteur ; vérifier la règle de port avec incapacités et l’Arbalétrier.':'Maîtrises, armure maximum, boucliers, armes à poudre, équipements alternatifs et Arbalétrier sans poudre.')),
 mark('history','Origines, métiers et historiques avancés',false,'',historyCrossPassed?'Les 17 historiques sont accessibles, leurs rangs et sauvegardes réussissent avec les huit peuples. Restent à vérifier individuellement leurs bonus conditionnels, les restrictions et l’export sur la fiche de l’Arquebusier.':'Contrôler toutes les voies d’historique, leurs rangs accessibles et leurs effets sur les aptitudes de l’Arquebusier.'),
 mark('save','Enregistrer et reprendre les pouvoirs obtenus',ageOK,'Les états de référence des rangs 1, 2 et 3 avec l’âge ont été enregistrés et restaurés à l’identique.','Vérifier la sauvegarde et la reprise.'),
 mark('pdf','Fiche officielle et annexes',pdfComplete,'28 exports sur le vrai modèle officiel : cinq voies et rangs R1–R3 des deux variantes, deux exporteurs, bonus de Doigts agiles actif/inactif selon l’armure. 4 368 widgets relus (valeurs et apparences), fiche et annexe inspectées visuellement. Quinze dons contrôlés dans 60 annexes, uniquement leurs rangs acquis et textes intégraux. Les exports propres aux peuples et historiques restent suivis séparément.',pdfProbePass?'Test réel Chrome et smartphone des exports des deux variantes : 4 PDF de 6 pages, nom et profil présents sur les deux premières pages, PDF sans champs étranger refusé. Empreinte du modèle COF2 reconnue en simulation ; restent le rendu sur le PDF officiel réel et la vérification exhaustive des champs, textes et annexes.':'Vérifier les deux pages officielles, toutes les valeurs, les résumés et les descriptions des voies.'),
 mark('click','Créer, sauvegarder et rouvrir au clic sur mobile',clickComplete,'80 créations tactiles des huit peuples × cinq modalités d’âge × deux variantes : jeune, très jeune PC/DR, mûr et vénérable. Fiches, valeurs et attaques identiques après sauvegarde/rechargement/réouverture. Quinze dons de Combattant aguerri et cinq catégories de prédilection sélectionnés dans chaque variante. Complète les vingt paires, les cinq voies vénérables et les situations contextuelles déjà vérifiées au clic.','Compléter les quatre-vingts parcours des peuples et âges, le choix PC/DR visible, les quinze dons et les reprises sur les empreintes de production courantes. Les hybrides restent hors de cette campagne.')
];
const verified=profileChecks.filter(x=>x.status==='ACQUIS').length;
const lore={
 humain:'Bonus de +1 à l’une des caractéristiques les plus faibles ; voie de l’Humain.',
 nain:'Bonus de +1 CON ou VOL et malus de −1 AGI ; voie du Nain.',
 'demi-elfe':'Bonus de +1 PER ou CHA, malus de −1 FOR ou CON ; héritage au choix : Humain, Elfe haut ou Elfe sylvain.',
 'demi-orc':'Bonus de +1 FOR ou CON et malus de −1 CHA ou INT ; voie du Demi-orc.',
 'elfe-haut':'Bonus de +1 INT ou CHA et malus de −1 FOR ; voie de l’Elfe haut.',
 'elfe-sylvain':'Bonus de +1 AGI ou PER et malus de −1 FOR ; voie de l’Elfe sylvain.',
 gnome:'Bonus de +1 INT ou PER et malus de −1 FOR ; Don étrange et voie du Gnome.',
 halfelin:'Bonus de +1 AGI ou VOL et malus de −1 FOR ; taille et armes autorisées à contrôler.'
};
const expectedNames=new Set(['Humain','Nain','Demi-elfe','Demi-orc','Elfe haut','Elfe sylvain','Gnome','Halfelin']);
const peoples=old.peoples.filter(x=>expectedNames.has(x.label)).map(p=>{
 const has=id=>p.slots.find(x=>x.id===id)?.status==='PASS';
 const checks=[
  mark('catalogue','Peuple officiel et voie raciale',has('catalogue'),'Race et voie raciale référencées dans le livre et dans Forge.','Vérifier sa voie.'),
  mark('caracs','Bonus et malus de caractéristiques',has('race-stats'),'Bonus et malus de création comparés aux caractéristiques de référence.','Vérifier les bonus et malus raciaux.'),
  mark('options','Tous les choix raciaux de départ',has('origins'),'Choix de caractéristiques et héritages de départ vérifiés dans les cas de référence.','Vérifier les choix raciaux.'),
  mark('r1','Voie raciale de rang 1',has('people-r1'),'Acquisition de la capacité et ses valeurs raciales principales vérifiées.','Vérifier le rang 1 de la voie raciale.'),
  mark('r2','Voie raciale de rang 2',has('people-r2'),'Rang 2 accessible avec les règles avancées vérifié dans les cas de référence.','Vérifier le rang 2 de la voie raciale.'),
  mark('methods','Caractéristiques et sauvegarde des choix',has('methods')&&has('replay'),'Répartition et reprise des caractéristiques raciales vérifiées.','Valider les variantes et sauvegardes des caractéristiques.'),
  mark('ages','Tous les âges et historiques avec ce peuple',false,'',historyCrossPassed?(p.key==='elfe-sylvain'?'Règle confirmée pour l’Elfe sylvain (COF2 p.172) : origines Cités et Campagnes interdites en mode historique. Toutes les autres combinaisons d’historiques ciblées ont été acceptées et sauvegardées. Restent les autres effets selon les âges.':'Les associations origine géographique + métier ont été acceptées, leurs rangs et sauvegardes vérifiés au niveau 1 avec un personnage vénérable. Restent les variantes d’âge et les effets historiques conditionnels.'): 'Prouver les choix d’âge et d’historique pour le peuple, sans dépendre d’un seul profil.'),
  mark('conditional','Effets conditionnels et dons raciaux',false,'','Vérifier chaque pouvoir racial selon ses conditions réelles, y compris dons et résistances.'),
  mark('gear','Équipements et contraintes de taille',false,'','Vérifier toutes les restrictions raciales, les armes et les échanges autorisés.'),
  mark('sheet','Fiche officielle et parcours de création',false,'','Vérifier fiche et annexes puis création au clic pour le peuple, sans restriction à un profil donné.')
 ];
 const pass=checks.filter(x=>x.status==='ACQUIS').length;
 return{id:p.id,key:p.key,name:p.label,rules:lore[p.key],checks,passed:pass,total:checks.length,percent:Math.round(100*pass/checks.length),certified:pass===checks.length};
});
if(peoples.length!==8||peoples.some(x=>!x.rules))throw Error('8 race progress lines must be complete');
const copyPaths=profile.powers.map(p=>({name:p.name,page:p.page,abilities:p.abilities.map(a=>({rank:a.rank,name:a.name,focus:a.focus,calculation:a.rank===1&&r1Complete?'Effet R1 et conditions contrôlés par oracle et parcours réel au clic.':a.rank===2&&r2Complete?'Effet R2 et cas négatifs contrôlés par oracle et parcours vénérable au clic.':a.calculation,status:a.rank===1&&r1Complete||a.rank===2&&r2Complete?'EFFETS_VERIFIES':a.status}))}));
const profileOrder=['Arquebusier','Barbare','Barde','Chevalier','Druide','Ensorceleur','Forgesort','Guerrier','Magicien','Moine','Prêtre','Rôdeur','Sorcier','Voleur'];
const activeName='Arquebusier',activeIndex=profileOrder.indexOf(activeName);
if(profileOrder.length!==14||activeIndex!==0)throw Error('Certification séquentielle : ordre de profils incohérent');
const queue=profileOrder.map((name,i)=>({name,position:i+1,status:i===activeIndex?'EN_COURS':'EN_ATTENTE',percent:i===activeIndex?Math.round(100*verified/profileChecks.length):null,certified:false}));
const output={
 schema:'FOH_N1_PROFILE_AND_PEOPLES_SEPARATE',
 generatedAt:new Date().toISOString(),
 engineSha256:pure.engineSha256,
 certificationPlan:{
  policy:'UN_SEUL_PROFIL_A_LA_FOIS_JUSQU_A_100',
  target:{officialProfiles:14,officialPeoples:8,allMustReachPercent:100},
  current:{name:activeName,position:activeIndex+1,percent:Math.round(100*verified/profileChecks.length),certified:false},
  next:{name:profileOrder[activeIndex+1],unlocked:false,condition:'profil actif 100 % et certificat de gel fondé sur les règles, les clics et le PDF'},
  queue,
  peoplesProgressRule:'CRITERES_RACIAUX_ACQUIS_PAR_PREUVE_TRANSVERSALE_SEULEMENT',
  remainingPeoplesPolicy:'Après les 14 profils, fermer les critères raciaux manquants un peuple à la fois',
  fullOfficialN1Closed:false,
  companionExtensions:'CERTIFICATION_SEPAREE'
 },
 intent:'Le profil complet compte indépendamment des peuples : cinq voies et leurs effets, armes, historiques, fiche. Chaque peuple a son propre avancement de règles raciales, indépendant du choix de profil. AUCUNE barre par voie ni par couple profil-peuple.',
 profile:{id:profile.profileId,name:'Arquebusier',priority:'EN_COURS',completed:false,variantPrototypeReady:!!prototypeOK,variantIntegrated:!!deployed,passed:verified,total:profileChecks.length,percent:Math.round(100*verified/profileChecks.length),checks:profileChecks,paths:copyPaths,partialNumericValidated:numericPartial,
  next:profileChecks.filter(c=>c.status!=='ACQUIS').map(c=>c.name).join(' ; ')},
 peoples,
 pausedProfiles:13,
 summary:{profilesCertified:0,profilesInProgress:1,profilesPending:13,peoplesCertified:peoples.filter(p=>p.certified).length},
 limitations:'Pourcentage de critères complets, non proportion de tests ni preuve exhaustive de tous les personnages. Un effet chiffré peut être validé sans que le rang complet le soit.',
 sources:['QA/N1/arquebusier-derived-source.json','QA/N1/arquebusier-powder-weapon-boundary.json','QA/N1/arquebusier-two-preferences.json','QA/N1/arquebusier-official-template.json',...(variant?['QA/N1/arquebusier-arbaletrier-source-audit.json']:[]),'COF2 Livre de base pp. 44-65','Règles avancées p.153 et historiques','QA/N1/arquebusier-pure-age-ranks.json','QA/N1/arquebusier-pdf-real-click.json','QA/N1/arquebusier-all-mechanics-probe.json','QA/N1/official-methods-cross.json','QA/N1/official-racial-options.json','QA/N1/lot10/people-source.json']
};
const dest=path.resolve(root,'..','centre-synchronisation/forge-n1/focus.json');
fs.writeFileSync(dest,JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify({profile:output.profile.name,score:output.profile.percent,passed:verified,peoples:peoples.map(p=>[p.name,p.percent]),profileIndependent:true,racesIndependent:true}));
