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
const hashlib=require('node:crypto');
const {previousForUnaffectedProfiles}=require('./n1_barde_grace_patch.cjs');
const indexHtml=fs.readFileSync(path.join(root,'index.html'),'utf8');
const previousIndex=previousForUnaffectedProfiles(indexHtml);
const hash=data=>hashlib.createHash('sha256').update(data).digest('hex');
const canonicalHash=hash(indexHtml);
const productHash=p=>p==='index.html'?canonicalHash:hash(fs.readFileSync(path.join(root,p)));
const previousHash=previousIndex?hash(previousIndex):null;
const druideScoped=canonicalHash==='da9a2897d72ee30e1fb35865710fc020996befd987dd8a83d919b203ca4b986d';
const beforeDruide='250274e9d2879bc9acde9043b56bb670de6c697a4c9bb8920c371e1393951759';
const beforeGrace='3358aa4fcbd516287f051f3707f8fdf59ac7544b8a69ebc1c072e9244c01e4cd';
const unaffectedIndexEvidence=sha=>sha===canonicalHash||(previousHash!==null&&sha===previousHash)||
 (druideScoped&&(sha===beforeDruide||sha===beforeGrace));
const unchangedProfileEvidence=sha=>sha===canonicalHash||(druideScoped&&sha===beforeDruide);


// Historical reports may contain the retired master. Only the still-published
// index.html can justify a current certification; never require or load a shadow Forge.
const liveProof=arr=>{const hits=Array.isArray(arr)?arr.filter(x=>x?.file==='index.html'||x?.name==='index.html'):[];return hits.length===1?hits[0]:null;};
const liveHashMatches=arr=>{const p=liveProof(arr);return !!p&&unaffectedIndexEvidence(p.sha256);};
const pilierPath=path.resolve(root,'QA/N1/arquebusier-pilier-de-bar-fix.json');
const pilier=fs.existsSync(pilierPath)?JSON.parse(fs.readFileSync(pilierPath,'utf8')):null;
const currentRelease=liveHashMatches(releaseProducts);
// Une preuve explicite de correction limitée assure la continuité du produit sans
// attribuer à tort les anciens tests de clic à des changements plus vastes.
const pilierContinuity=pilier?.status==='PASS'&&!!liveProof(pilier.products)&&!!liveProof(releaseProducts)&&
 (()=>{const p=liveProof(releaseProducts),fix=liveProof(pilier.products);return fix.changed===true&&fix.previous?.length>=1&&fix.previous.every(x=>x.formula==='1d4')&&fix.beforeSha256===p.sha256&&unaffectedIndexEvidence(fix.afterSha256)&&fix.attack==='1d4°'&&fix.nonLethal===true&&fix.saveReload==='PASS';})();
const contextProofFile=path.resolve(root,'QA/N1/arquebusier-context-publish.json');
const contextProof=fs.existsSync(contextProofFile)?JSON.parse(fs.readFileSync(contextProofFile,'utf8')):null;
const componentsCache=new Map();
const components=(file,previous=false)=>{
 const key=previous?'previous:'+file:file;
 if(componentsCache.has(key))return componentsCache.get(key);
 const html=file==='index.html'?(previous?(previousIndex||indexHtml):indexHtml):fs.readFileSync(path.resolve(root,file),'utf8');
 const extract=id=>{const i=html.indexOf('id="'+id+'"');if(i<0)return null;const start=html.indexOf('>',i)+1,end=html.indexOf('</script>',start);return start>i&&end>start?html.slice(start,end):null};
 const engine=extract('FOH_ENGINE_BUNDLE'),db=extract('FOH_DB_JSON');
 if(!engine||!db)throw Error('Production bundle invalid '+file);
 const hash=x=>hashlib.createHash('sha256').update(x).digest('hex');
 const out={engineSha256:hash(engine),dbSha256:hash(db)};componentsCache.set(key,out);return out;
};
const historicalComponents=druideScoped?new Map([
 [beforeDruide,{engineSha256:'1ab516f8250394467e10599f665f2dc8bce4bf8e5f6eb25d02362a8074c9e5fd',dbSha256:'645f2c7f1f5aac50b8574310c638e7284e4eb90acc103f68ae431b17cf72c23e'}],
 [beforeGrace,{engineSha256:'1ab516f8250394467e10599f665f2dc8bce4bf8e5f6eb25d02362a8074c9e5fd',dbSha256:'d0955396d6df4ea3e28ead0f8338ffec02ab6c1336f3260ff370f326fe992d88'}]
]):new Map();
const componentsForHash=sha=>historicalComponents.get(sha)||components('index.html',sha===previousHash);
const isCurrentProof=p=>{
 if(p?.file!=='index.html'||!fs.existsSync(path.resolve(root,p.file)))return false;
 if(p.engineSha256&&p.dbSha256)return [components(p.file),components(p.file,true),...historicalComponents.values()]
  .some(source=>p.engineSha256===source.engineSha256&&p.dbSha256===source.dbSha256);
 return unaffectedIndexEvidence(p.htmlSha256||p.sha256);
};
const contextOnlyContinuity=contextProof?.status==='PASS'&&!!liveProof(contextProof.products)&&
 (()=>{const p=liveProof(contextProof.products);return p.onlyContextAdded===true&&p.readyForOffline===true&&p.baseStrippedBeforeSha256===p.baseStrippedAfterSha256&&unaffectedIndexEvidence(p.afterSha256)&&p.engineSha256===componentsForHash(p.afterSha256).engineSha256&&p.databaseSha256===componentsForHash(p.afterSha256).dbSha256;})();
const mercenaryPatchPath=path.resolve(root,'QA/N1/arquebusier-mercenary-hybrid-fix.json');
const mercenaryPatch=fs.existsSync(mercenaryPatchPath)?JSON.parse(fs.readFileSync(mercenaryPatchPath,'utf8')):null;
const mercenaryGearPath=path.resolve(root,'QA/N1/arquebusier-mercenary-hybrid-gear-probe.json');
const mercenaryGear=fs.existsSync(mercenaryGearPath)?JSON.parse(fs.readFileSync(mercenaryGearPath,'utf8')):null;
const mercenaryContinuity=mercenaryPatch?.status==='PASS'&&mercenaryPatch.twoCasesOnly===true&&!!liveProof(mercenaryPatch.changed)&&!!liveProof(contextProof?.products)&&
 (()=>{const p=liveProof(mercenaryPatch.changed),prior=liveProof(contextProof.products);return p.beforeSha256===prior.afterSha256&&unaffectedIndexEvidence(p.afterSha256)&&p.dbSha256&&p.diffStatements===2;})()&&
 mercenaryGear?.status==='PASS'&&mercenaryGear.accepted===32&&mercenaryGear.cases?.length===32&&mercenaryGear.faultyPowder?.length===0&&liveHashMatches(mercenaryGear.products);
const deployed=release?.status==='INTEGRATED_NOT_CERTIFIED_FULL'&&(currentRelease||pilierContinuity||contextOnlyContinuity||mercenaryContinuity);
const arbaletrierMissing=variant?.verdict==='VARIANTE_OFFICIELLE_NON_ENTIEREMENT_INTEGREE';
const prototypePath=path.resolve(root,'QA/N1/arbaletrier-virtual-prototype.json');const prototype=fs.existsSync(prototypePath)?JSON.parse(fs.readFileSync(prototypePath,'utf8')):null;const prototypeOK=prototype?.matrix?.total===480&&prototype?.matrix?.passed===480&&prototype?.matrix?.failed===0;
const variantGap=deployed?'La variante officielle Arbalétrier est maintenant proposée dans Forge : cinq voies légales, arbalètes, rangs 1 à 3 et sauvegardes validés au clic sur mobile. Restent à valider les contraintes complètes d’équipement et tous les effets conditionnels, ainsi que la fiche officielle PDF et ses annexes.':arbaletrierMissing?(prototypeOK?'La variante Arbalétrier est prête dans une version d’essai : les cinq voies, huit peuples, âges, sauvegardes, +1 en attaque, critique amélioré et +1 aux dégâts avec les arbalètes ont été éprouvés. Elle n’est PAS encore intégrée à Forge : il reste l’installation, les choix visibles, l’export PDF et le contrôle au clic.':'Variante Arbalétrier absente du jeu publié. Les armes à arbalète et la Voie du maître d’armes sont en préparation ; il reste à valider les calculs de critique, de dégâts, les choix visibles et l’installation.'):'';
const pairsPath=path.resolve(root,'QA/N1/arquebusier-all-pairs-current.json'),pairs=fs.existsSync(pairsPath)?JSON.parse(fs.readFileSync(pairsPath,'utf8')):null;
const checkCurrent=!!pairs&&!!liveProof(pairs.inputs)&&isCurrentProof(liveProof(pairs.inputs));
const tenPairsVerified=!!(checkCurrent&&pairs.status==='PASS'&&pairs.expected===400&&pairs.pass===400&&pairs.failed===0&&Object.keys(pairs.perPeople||{}).length===8&&Object.values(pairs.perPeople).every(r=>r.cases===50&&r.pass===50));
const arqHistoryFile=path.resolve(root,'QA/N1/arquebusier-history-people-cross.json');const arqHistory=fs.existsSync(arqHistoryFile)?JSON.parse(fs.readFileSync(arqHistoryFile,'utf8')):null;
const historyCrossPassed=!!arqHistory&&arqHistory.status==='PASS'&&liveHashMatches(arqHistory.inputs)&&arqHistory.counts.cases===1152&&arqHistory.counts.passed===1120&&arqHistory.counts.legallyRejected===32&&arqHistory.counts.failed===0;
const profile=pure.items.find(x=>x.profile==='Arquebusier'&&x.people==='Nain');
if(pure.items.length!==112||!profile||profile.powers.length!==5||ages.complete!==true||ages.pass!==200)throw Error('Missing or non-current proof');
const mark=(id,name,yes,detail,remaining)=>({id,name,status:yes?'ACQUIS':'A_VERIFIER',detail:yes?detail:remaining});
const ageOK=ages.complete&&ages.pass===ages.expected&&!!liveProof(ages.products)&&isCurrentProof(liveProof(ages.products));
const pdfFile=path.join(root,'QA/N1/arquebusier-pdf-real-click.json');
const pdfEvidence=fs.existsSync(pdfFile)?JSON.parse(fs.readFileSync(pdfFile,'utf8')):null;
const pdfProbePass=pdfEvidence?.status==='PASS'&&['Arquebusier','Arbalétrier'].every(v=>['fillable','flat-official-digest-simulated'].every(k=>pdfEvidence.results?.some(x=>x.variant===v&&x.templateKind===k&&x.firstTwoPagesHaveName===true&&x.firstTwoPagesHaveProfile===true&&x.pages>=3)));
const mechanicalFile=path.join(root,'QA/N1/arquebusier-all-mechanics-probe.json');
const mechanical=fs.existsSync(mechanicalFile)?JSON.parse(fs.readFileSync(mechanicalFile,'utf8')):null;
const mechanicalCurrent=mechanical?.status==='SNAPSHOT_COHERENT_STRUCTURE_UNEVALUATED'&&liveHashMatches(mechanical.products)&&liveProof(mechanical.products)?.abilities?.length===15;

const effects=ages.numericEffectAssertions||{};
const numericPartial=effects['Arme à répétition — chargeur 2 + INT et +1 au rang 3']===16&&effects['Poudre puissante — portée +10 m, dommages +1 et projectile magique']===8&&effects['Tir précis — critique sur 19-20 à distance']===8&&effects['Combattant aguerri — défense +1']===8;
const sameCurrentHashes=inputs=>liveHashMatches(inputs);
const contextualPath=path.resolve(root,'QA/N1/arquebusier-context-canonical.json');
const contextual=fs.existsSync(contextualPath)?JSON.parse(fs.readFileSync(contextualPath,'utf8')):null;
const hybridPath=path.resolve(root,'QA/N1/arquebusier-hybrid-powder-safety.json');
const hybrid=fs.existsSync(hybridPath)?JSON.parse(fs.readFileSync(hybridPath,'utf8')):null;
const clickPath=path.resolve(root,'QA/N1/arquebusier-context-real-click.json');
const contextClick=fs.existsSync(clickPath)?JSON.parse(fs.readFileSync(clickPath,'utf8')):null;
const twentyPath=path.resolve(root,'QA/N1/arquebusier-20-real-mobile-pairs.json');
const twenty=fs.existsSync(twentyPath)?JSON.parse(fs.readFileSync(twentyPath,'utf8')):null;
const allR1Names=['mecanismes','tir-de-grenaille-l','pilier-de-bar','plus-vite-que-son-ombre','joli-coup'];
const r1RealClick=!!contextClick&&unaffectedIndexEvidence(contextClick.indexSha256)&&contextClick.status==='PASS'&&contextClick.passed===4&&contextClick.failed===0&&allR1Names.every(slug=>contextClick.cases.some(c=>c.status==='PASS'&&c.checks.some(x=>x.ability===slug)));
const contextualComplete=!!contextual&&contextual.status==='PASS'&&contextual.failed===0&&contextual.passed>=55&&contextual.all15===true&&sameCurrentHashes(contextual.inputSha256);
const hybridComplete=!!hybrid&&hybrid.status==='PASS'&&hybrid.passed===4&&hybrid.failed===0&&sameCurrentHashes(hybrid.products);
const r1Complete=ageOK&&contextualComplete&&r1RealClick; // Current source oracle and real clicks supersede historical continuity.
const twentyRealClick=!!twenty&&twenty.status==='PASS'&&twenty.passed===20&&twenty.failed===0&&unaffectedIndexEvidence(twenty.indexSha256);

// R2 closes from current source-bound oracles AND all five real age journeys,
// rather than remaining permanently false after successful verification.
const advancedPath=path.resolve(root,'QA/N1/arquebusier-venerable-context-click.json');
const advanced=fs.existsSync(advancedPath)?JSON.parse(fs.readFileSync(advancedPath,'utf8')):null;
const r2Names=['arme-a-repetition','demolition','mort-ou-vif-l','ajuster-le-tir','defaut-dans-la-cuirasse-a'];
const r2Oracles=!!contextualComplete&&r2Names.every(slug=>
 contextual.cases.some(c=>c.status==='PASS'&&c.tag.startsWith(slug+'/{'))&&
 contextual.cases.some(c=>c.status==='PASS'&&c.tag===slug+'/no-context')&&
 contextual.cases.some(c=>c.status==='PASS'&&c.tag===slug+'/unowned'));
const r2Mobile=!!advanced&&unaffectedIndexEvidence(advanced.indexSha256)&&advanced.status==='PASS'&&advanced.passed===5&&advanced.failed===0&&r2Names.every(slug=>advanced.cases.some(c=>c.status==='PASS'&&c.abilities?.some(a=>a.slug===slug)));
const r2Complete=ageOK&&tenPairsVerified&&r2Oracles&&r2Mobile;

const fastPath=path.resolve(root,'QA/N1/pure-profile-fast-arquebusier.json');
const fast=fs.existsSync(fastPath)?JSON.parse(fs.readFileSync(fastPath,'utf8')):null;
const pureFastCurrent=fast?.status==='PASS_NARROW_PURE_MATRIX_NOT_CERTIFIED'&&[8500,4250].includes(fast.attempts)&&fast.pass===fast.attempts&&fast.failed===0&&fast.rejected===0&&!!liveProof(fast.sourceHashes)&&isCurrentProof(liveProof(fast.sourceHashes));
const gearPath=path.resolve(root,'QA/N1/arquebusier-pure-gear-diagnostic.json');
const pureGear=fs.existsSync(gearPath)?JSON.parse(fs.readFileSync(gearPath,'utf8')):null;
const pureGearCurrent=pureGear?.status==='LEGAL_GEAR_PASS_OTHER_RESTRICTIONS_AUDIT_PENDING'&&pureGear.legalArmorChecks>=40&&pureGear.legalArmorFailures===0&&liveHashMatches(pureGear.products);
// Profile equipment boundaries are independent of ancestry-specific size rules.
const equipmentSourceFile=path.resolve(root,'QA/N1/arquebusier-equipment-source.json');
const equipmentSource=fs.existsSync(equipmentSourceFile)?JSON.parse(fs.readFileSync(equipmentSourceFile,'utf8')):null;
const indexGearCases=equipmentSource?.cases?.filter(c=>c.file==='index.html')||[];
const equipmentSourceCurrent=!!equipmentSource&&equipmentSource.status==='PASS'&&equipmentSource.failed===0&&liveHashMatches(equipmentSource.products)&&indexGearCases.length===100&&new Set(indexGearCases.map(c=>[c.variant,c.tag].join('|'))).size===100&&indexGearCases.every(c=>c.status==='PASS');
const grantsFile=path.resolve(root,'QA/N1/arquebusier-grants-armor.json');
const grantsProof=fs.existsSync(grantsFile)?JSON.parse(fs.readFileSync(grantsFile,'utf8')):null;
const indexGrantsCases=grantsProof?.cases?.filter(c=>c.file==='index.html')||[];
const grantsArmorCurrent=!!grantsProof&&grantsProof.status==='PASS'&&grantsProof.failed===0&&liveHashMatches(grantsProof.products)&&indexGrantsCases.length===120&&indexGrantsCases.every(c=>c.status==='PASS');
const gearComplete=equipmentSourceCurrent&&grantsArmorCurrent&&twentyRealClick;
const templateFile=path.resolve(root,'QA/N1/arquebusier-official-template.json');
const templateProof=fs.existsSync(templateFile)?JSON.parse(fs.readFileSync(templateFile,'utf8')):null;
const grantedPdfFile=path.resolve(root,'QA/N1/arquebusier-granted-pdf-annex.json');
const grantedPdfProof=fs.existsSync(grantedPdfFile)?JSON.parse(fs.readFileSync(grantedPdfFile,'utf8')):null;
const sharedPdfHash=productHash('progression/official-pdf-engine.js');
const realTemplateCurrent=!!templateProof&&templateProof.status==='PASS'&&templateProof.failures?.length===0&&templateProof.templateSha256==='cb97958e6cd2cf394a3910c5d48af1026a7280da72c4e5f331737e5b41ebddf4'&&templateProof.products?.some(p=>p.file==='index.html'&&unaffectedIndexEvidence(p.sha256))&&templateProof.sharedExporterSha256===sharedPdfHash&&templateProof.pdfLabelsSha256===productHash('progression/pdf-labels.json')&&templateProof.exports?.length===28&&new Set(templateProof.exports.map(p=>p.tag)).size===28&&templateProof.exports.every(p=>p.status==='PASS'&&p.fields===156&&p.pages>2)&&templateProof.widgetAudit?.files===28&&templateProof.widgetAudit?.widgets===4368&&templateProof.widgetAudit?.logicalValuesAndAppearances==='PASS'&&templateProof.visualInspection?.status==='PASS';
const grantsPdfCurrent=!!grantedPdfProof&&grantedPdfProof.status==='PASS'&&grantedPdfProof.passed===60&&grantedPdfProof.failed===0&&unaffectedIndexEvidence(grantedPdfProof.indexSha256)&&grantedPdfProof.sharedExporterSha256===sharedPdfHash;
const pdfComplete=realTemplateCurrent&&grantsPdfCurrent;
const optionalProof=name=>{const f=path.resolve(root,'QA/N1/'+name);return fs.existsSync(f)?JSON.parse(fs.readFileSync(f,'utf8')):null;};
const derivedProof=optionalProof('arquebusier-derived-source.json'),powderProof=optionalProof('arquebusier-powder-weapon-boundary.json'),preferencesProof=optionalProof('arquebusier-two-preferences.json');
const currentNumeric=(r,n)=>!!r&&r.status==='PASS'&&r.passed===n&&r.failed===0&&sameCurrentHashes(r.products);
const historyChoices=optionalProof('arquebusier-history-choices.json'),historyChoicesMobile=optionalProof('arquebusier-history-choices-click.json'),historyChoicesPdf=optionalProof('arquebusier-history-choices-pdf.json');
const historyChoicesCurrent=(currentNumeric(historyChoices,496)&&historyChoices.negativeChecks===888||currentNumeric(historyChoices,248)&&historyChoices.negativeChecks===444)&&historyChoicesMobile?.status==='PASS'&&historyChoicesMobile.passed===6&&historyChoicesMobile.failed===0&&unaffectedIndexEvidence(historyChoicesMobile.indexSha256)&&historyChoicesMobile.cases?.length===6&&historyChoicesMobile.cases.every(c=>c.status==='PASS'&&c.steps?.includes('canonical-choices-and-values-after-reopen'))&&['Arquebusier','Arbalétrier'].every(v=>[['scholar',1],['scholar',5],['courtier',5]].every(([h,r])=>historyChoicesMobile.cases.some(c=>c.variant===v&&c.history===h&&c.rank===r)))&&historyChoicesPdf?.status==='PASS'&&unaffectedIndexEvidence(historyChoicesPdf.indexSha256)&&historyChoicesPdf.sharedExporterSha256===sharedPdfHash&&historyChoicesPdf.pdfLabelsSha256===productHash('progression/pdf-labels.json')&&historyChoicesPdf.templateSha256===templateProof?.templateSha256&&historyChoicesPdf.exports?.length===24&&historyChoicesPdf.exports.every(e=>e.status==='PASS'&&e.fields===156)&&historyChoicesPdf.widgetAudit?.widgets===3744&&historyChoicesPdf.widgetAudit?.logicalValuesAndAppearances==='PASS'&&historyChoicesPdf.visualInspection?.status==='PASS';
const historyConditions=optionalProof('arquebusier-history-conditions.json'),historyConditionsClick=optionalProof('arquebusier-history-conditions-click.json');
const historyConditionsCurrent=historyChoicesCurrent&&(currentNumeric(historyConditions,160)&&historyConditions.contexts===1440&&historyConditions.negativeChecks===4370||currentNumeric(historyConditions,80)&&historyConditions.contexts===720&&historyConditions.negativeChecks===2188)&&historyConditions.moduleSha256===productHash('ENGINE/history_context_n1.js')&&historyConditionsClick?.status==='PASS'&&historyConditionsClick.passed===8&&historyConditionsClick.failed===0&&unaffectedIndexEvidence(historyConditionsClick.indexSha256)&&historyConditionsClick.cases?.length===8&&historyConditionsClick.cases.every(c=>c.status==='PASS'&&c.steps?.includes('canonical-conditions-after-reopen')&&c.steps.includes('context-positive-negative-community'))&&['Arquebusier','Arbalétrier'].every(v=>[['courtier',3],['scholar',3],['expert',2],['wealthy',5]].every(([h,r])=>historyConditionsClick.cases.some(c=>c.variant===v&&c.history===h&&c.rank===r)));
const throwerNumeric=optionalProof('arquebusier-granted-thrower.json');
const derivedComplete=currentNumeric(throwerNumeric,24)&&currentNumeric(derivedProof,10240)&&derivedProof.expected===10240&&derivedProof.failures?.length===0&&derivedProof.saves>=100&&Object.keys(derivedProof.perPeople||{}).length===8&&Object.values(derivedProof.perPeople).every(n=>n===1280)&&['arquebusier','arbaletrier'].every(v=>derivedProof.perVariant?.[v]===5120)&&currentNumeric(powderProof,18)&&currentNumeric(preferencesProof,10)&&ageOK&&tenPairsVerified&&grantsArmorCurrent;
const choicesMobile=optionalProof('arquebusier-80-real-mobile-choices.json'),throwerMobile=optionalProof('arquebusier-granted-thrower-click.json');
const mobileGrantSlugs=['archer-emerite','le-loup','survie','eclaireur','attaque-a-suivre-g','discretion','baratin','agile','doigts-agiles','attaque-en-finesse','proteger-un-allie-g','vivacite','armes-de-predilection','robustesse','teigneux-g'];
const mobileVariants=['Arquebusier','Arbalétrier'],mobilePeople=['humain','nain','demi-elfe','demi-orc','elfe-haut','elfe-sylvain','gnome','halfelin'],mobileAges=[['young',null],['very-young','PC'],['very-young','DR'],['mature',null],['venerable',null]];
const mobile80Current=choicesMobile?.status==='PASS'&&choicesMobile.passed===80&&choicesMobile.failed===0&&unaffectedIndexEvidence(choicesMobile.indexSha256)&&choicesMobile.scriptSha256===productHash('FINAL_FREEZE_TESTS/n1_arq_choices_click.cjs')&&choicesMobile.cases?.length===80&&new Set(choicesMobile.cases.map(c=>c.id)).size===80&&choicesMobile.cases.every(c=>c.status==='PASS'&&c.steps?.includes('save-reload-reopen'))&&mobileVariants.every(variant=>mobilePeople.every(race=>mobileAges.every(([age,resource])=>choicesMobile.cases.some(c=>c.variant===variant&&c.race===race&&c.age===age&&c.resource===resource))))&&choicesMobile.grantCatalogs?.length===2&&mobileVariants.every(variant=>choicesMobile.grantCatalogs.some(c=>c.variant===variant&&c.ids?.length===15&&new Set(c.ids).size===15&&mobileGrantSlugs.every(slug=>c.ids.some(id=>id.startsWith('ability:'+slug+':')))&&c.categories?.length===5&&new Set(c.categories).size===5&&['swords','axes','maces','spears','thrown'].every(x=>c.categories.includes(x))));
const throwerMobileCurrent=throwerMobile?.status==='PASS'&&throwerMobile.passed===2&&throwerMobile.failed===0&&unaffectedIndexEvidence(throwerMobile.indexSha256)&&throwerMobile.cases?.length===2&&throwerMobile.cases.every(c=>c.status==='PASS');
const clickComplete=twentyRealClick&&r2Mobile&&r1RealClick&&mobile80Current&&throwerMobileCurrent;
const methodsEvidence=optionalProof('official-methods-cross.json');
const methodsCurrent=methodsEvidence?.coverage?.complete===true&&unaffectedIndexEvidence(methodsEvidence.sourceSha256)&&methodsEvidence.cases===1008&&methodsEvidence.passed===1008&&methodsEvidence.refused===0&&methodsEvidence.failed===0;
const grantContext=optionalProof('arquebusier-grant-context.json');
const grantContextCurrent=grantContext?.status==='PASS'&&sameCurrentHashes(grantContext.products)&&grantContext.cases?.length===30&&grantContext.refusals>=100&&['arquebusier','arbaletrier'].every(variant=>new Set(grantContext.cases.filter(c=>c.variant===variant&&c.status==='PASS'&&c.saveReload&&c.checks>0).map(c=>c.slug)).size===15);
const borrowedMobileCurrent=r2Mobile&&advanced.cases?.some(c=>c.status==='PASS'&&c.steps?.includes('vivacite-condition-verified'));
const r3EffectsCurrent=contextualComplete&&grantContextCurrent&&borrowedMobileCurrent&&gearComplete&&pdfComplete;
const origins=optionalProof('arquebusier-history-origins.json');
const originsCurrent=origins?.status==='PASS'&&unaffectedIndexEvidence(origins.indexSha256)&&origins.cases===90&&origins.reopened===90&&origins.positive===180&&origins.additionalSituations===104&&origins.negative===1440;
const originProgress=originsCurrent?'Les 36 capacités des rangs 2 à 5 des neuf origines ont des résultats en situation vérifiés sur les deux variantes, avec réouverture. ':'';
const professionsProof=optionalProof('arquebusier-history-professions.json');
const professionsCurrent=professionsProof?.status==='PASS'&&sameCurrentHashes(professionsProof.products)&&professionsProof.cases===80&&professionsProof.reopened===80&&professionsProof.pdfAnnexes===80&&professionsProof.companions===8&&professionsProof.refusals===800&&professionsProof.situations===368&&Object.keys(professionsProof.coverage||{}).length===40;
const historyComplete=originsCurrent&&professionsCurrent&&historyConditionsCurrent&&historyCrossPassed&&historyConditionsClick.cases.filter(c=>c.history==='wealthy').every(c=>c.steps.includes('weekly-justice-difficulty-verified'));
const profileChecks=[
 mark('paths','Les cinq voies officielles',profile.powers.length===5,'Les cinq voies et leurs 15 rangs accessibles sont présents et référencés.','Vérifier les cinq voies du livre.'),
 mark('pairs','Toutes les paires de voies légales',tenPairsVerified,'Les dix choix possibles de deux voies du profil, avec chacun des huit peuples et les cinq modalités d’âge N1, sont créés, validés et conservés après sauvegarde. Les dix couples de l’Arbalétrier sont aussi éprouvés.','Les dix choix possibles de deux voies doivent fonctionner avec les équipements autorisés, y compris l’alternative Halfelin.'),
 mark('r1','Recevoir les capacités de rang 1',ageOK,'Les cinq rangs 1 sont attribués et sauvegardés dans les créations de référence.','Vérifier les cinq rangs 1.'),
 mark('r2','Recevoir les capacités de rang 2',ageOK,'Les cinq rangs 2 obtenus à N1 par l’âge mûr sont attribués et sauvegardés.','Vérifier les cinq rangs 2.'),
 mark('r3','Recevoir les capacités de rang 3',ageOK,'Les cinq rangs 3 obtenus à N1 par l’âge vénérable sont attribués et sauvegardés.','Vérifier les cinq rangs 3.'),
 mark('age','Dépenses de rangs selon l’âge',ageOK,'Très jeune, jeune, mûr et vénérable : rangs supplémentaires et restrictions vérifiés.','Vérifier tous les choix d’âge.'),
 mark('methods','Méthodes de répartition des caractéristiques',methodsCurrent,(pureFastCurrent?'8 500/8 500 créations de profil pur testées sur le moteur courant : huit peuples, dix paires de voies, cinq options d’âge, trois séries distinctes et variantes raciales. Les autres méthodes conservent leurs preuves antérieures.':'Séries, achat et tirages représentatifs avec toutes les races officielles ; règles raciales évaluées séparément.'),'Contrôler les méthodes du profil.'),
 mark('derived','PV, DEF, initiative, chance, mana, attaques et dommages',derivedComplete,'10 240 comparaisons arithmétiques indépendantes : deux variantes, huit peuples, vingt paires ordonnées, cinq modalités d’âge, deux séries et deux armures, quinze dons et échange PC/DR. Attaques, dégâts, portée, critique, pouvoirs permanents et sauvegardes. 18 contrôles des frontières poudre/arbalètes et 10 doubles choix de prédilection. Les activations de combat restent au critère R3.','Compléter les preuves arithmétiques indépendantes sur le seul index publié, toutes les attaques et les dons ; refuser tout rapport partiel ou périmé.'),
 mark('r1effects','Tous les effets des cinq capacités de rang 1',r1Complete,'Cinq capacités R1 calculées selon contexte dans l’interface réelle : mécanismes et armes de siège, grenaille en cône, Pilier de bar 1d4° et résistance non létale, initiative armée chargée, couvert, sans faire intervenir les hybrides. Plus de 60 cas oracle historiques + quatre situations réelles au clic sur la Forge publiée.','Compléter les preuves sur les 5 effets R1, les cas négatifs, le vrai parcours au clic sur la version courante ; aucun test hybride requis.'),
 mark('r2effects','Tous les effets des cinq capacités de rang 2',r2Complete,'Cinq capacités R2 contrôlées par oracles contextuels (cas applicables, absence de contexte et capacité non acquise) et cinq créations vénérables au clic sur la version courante. Chargeurs calculés depuis les rangs acquis, rechargement, charges/préparation de Démolition, NC/critique de Mort ou vif, cible/délai d’Ajuster le tir et préparation/DEF/RD de Défaut dans la cuirasse. Rangs et sauvegardes croisés aux huit peuples.',mechanicalCurrent?'15 capacités R1–R3 contrôlées dans les deux bases, et chargeur 2+INT validé. Plusieurs rangs R2 restent des effets à interpréter en combat ; rechargement, Démolition, Mort ou vif, Ajuster le tir et Défaut dans la cuirasse non certifiés en exécution.':'Chargeur 2 + INT validé ; restent le rechargement, la démolition, Mort ou vif, Ajuster le tir et Défaut dans la cuirasse.'),
 mark('r3effects','Tous les effets des cinq capacités de rang 3',r3EffectsCurrent,'Calcul des cinq capacités R3, plus les 15 dons de Combattant aguerri dans les deux variantes. Conditions, restrictions d’armure, réouverture et non-application vérifiées. Vivacité testée au clic dans les deux situations.', 'Vérifier les cinq capacités et les dons de Combattant aguerri avec leurs restrictions, sur la fiche et au clic.'),
 mark('gear','Toutes les armes, armures et variante Arbalétrier',gearComplete,'100 contrôles des frontières d’équipement sur la Forge publiée (200 dans l’ancien rapport comprenant le maître supprimé) : 41 armes, sept armures, deux boucliers et deux variantes, avec sauvegardes. Variante sans poudre : pétoire et mousquet refusés. 120 contrôles des dons et plafonds d’armure sur la Forge publiée et vingt créations réelles au clic. Les restrictions raciales de taille restent suivies dans les critères propres aux peuples.',mercenaryContinuity?'Périmètre PROFIL PUR seulement : contrôler les interdictions de boucliers, le plafond chemise de mailles, les catégories d’armes et les paquetages, ainsi que la variante officielle Arbalétrier sans armes à poudre. Les 32 tests hybrides réussis restent hors de ce certificat.':deployed||arbaletrierMissing?variantGap:(pureGearCurrent?'80/80 armures autorisées jusqu’à DEF +4 et 16/16 pétoires maîtrisées pour les huit peuples sur deux produits. Les armures trop lourdes et boucliers sont refusés par le moteur ; vérifier la règle de port avec incapacités et l’Arbalétrier.':'Maîtrises, armure maximum, boucliers, armes à poudre, équipements alternatifs et Arbalétrier sans poudre.')),
 mark('history','Origines, métiers et historiques avancés',historyComplete,'Neuf origines et huit métiers testés à tous les rangs accessibles, dans les deux variantes. Bonus permanents et en situation, choix, limites, sauvegardes, réouverture et PDF vérifiés. Les décisions prévues par les règles restent au MJ.',originProgress+'Vérifier les preuves courantes des métiers, des situations au clic et des exports.'),
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
const racialOptions=optionalProof('official-racial-options.json');
const racialOptionsCurrent=racialOptions?.status==='PASS'&&racialOptions.expected===392&&racialOptions.cases===392&&racialOptions.passes===392&&racialOptions.failures?.length===0&&racialOptions.unavailable?.length===0&&racialOptions.products?.length===1&&racialOptions.products[0]?.file==='index.html'&&unaffectedIndexEvidence(racialOptions.products[0]?.htmlSha256);
const peopleSource=optionalProof('lot10/people-source.json');
const peopleSourceCurrent=peopleSource?.status==='PASS'&&sameCurrentHashes(peopleSource.products)&&peopleSource.replays===32;
const inheritedPaths=['voie-de-l-humain','voie-de-l-elfe-haut','voie-de-l-elfe-sylvain'].map(id=>'path:'+id+':cof2-lb-2024');
const racialRankCurrent=(people,rank)=>peopleSourceCurrent&&(people==='demi-elfe'
 ? inheritedPaths.every(path=>peopleSource.inheritedPaths?.some(row=>row.file==='index.html'&&row.path===path&&row.rank===rank&&row.sourcePage===46&&row.status==='PASS'))
 : peopleSource.cases?.some(row=>row.file==='index.html'&&row.people===people&&row.rank===rank&&row.path!=='path:mage:cof2-lb-2024'&&row.source?.document==='COF2 Livre de base'&&row.source.officialCOF2&&row.status==='PASS'));
const peopleGear=optionalProof('official-people-equipment.json');
const peopleGearCurrent=peopleGear?.status==='PASS'&&sameCurrentHashes(peopleGear.products);
const peoples=old.peoples.filter(x=>expectedNames.has(x.label)).map(p=>{
 const currentRace=!!racialOptionsCurrent&&racialOptions.perPeople?.[p.key]?.cases>0&&racialOptions.perPeople[p.key].cases===racialOptions.perPeople[p.key].passed&&racialOptions.perPeople[p.key].failed===0&&Object.keys(racialOptions.perPeople[p.key].profileCases||{}).length===14;
 const methodRows=methodsEvidence?.items?.peoples?.[p.id]||[];
 const currentMethods=!!methodsCurrent&&methodRows.length===14&&methodRows.every(row=>row.status==='PASS');
 const has=id=>p.slots.find(x=>x.id===id)?.status==='PASS';
 const checks=[
  mark('catalogue','Peuple officiel et voie raciale',currentRace,'Race et voie raciale référencées dans le livre et dans Forge.','Vérifier sa voie.'),
  mark('caracs','Bonus et malus de caractéristiques',currentRace,'Bonus et malus de création comparés aux caractéristiques de référence.','Vérifier les bonus et malus raciaux.'),
  mark('options','Tous les choix raciaux de départ',currentRace,'Choix de caractéristiques et héritages de départ vérifiés dans les cas de référence.','Vérifier les choix raciaux.'),
  mark('r1','Voie raciale de rang 1',racialRankCurrent(p.key,1),'Acquisition de la capacité et ses valeurs raciales principales vérifiées.','Vérifier le rang 1 de la voie raciale.'),
  mark('r2','Voie raciale de rang 2',racialRankCurrent(p.key,2),'Rang 2 accessible avec les règles avancées vérifié dans les cas de référence.','Vérifier le rang 2 de la voie raciale.'),
  mark('methods','Caractéristiques et sauvegarde des choix',currentMethods,'Répartition et reprise des caractéristiques raciales vérifiées.','Valider les variantes et sauvegardes des caractéristiques.'),
  mark('ages','Tous les âges et historiques avec ce peuple',false,'',historyCrossPassed?(p.key==='elfe-sylvain'?'Règle confirmée pour l’Elfe sylvain (COF2 p.172) : origines Cités et Campagnes interdites en mode historique. Toutes les autres combinaisons d’historiques ciblées ont été acceptées et sauvegardées. Restent les autres effets selon les âges.':'Les associations origine géographique + métier ont été acceptées, leurs rangs et sauvegardes vérifiés au niveau 1 avec un personnage vénérable. Restent les variantes d’âge et les effets historiques conditionnels.'): 'Prouver les choix d’âge et d’historique pour le peuple, sans dépendre d’un seul profil.'),
  mark('conditional','Effets conditionnels et dons raciaux',false,'','Vérifier chaque pouvoir racial selon ses conditions réelles, y compris dons et résistances.'),
  mark('gear','Équipements et contraintes de taille',peopleGearCurrent&&peopleGear.peoples?.[p.key]?.status==='PASS'&&peopleGear.peoples[p.key].weapons===41&&peopleGear.peoples[p.key].armorAndShields===9&&peopleGear.peoples[p.key].saveReload,'41 armes du livre de base, sept armures et deux boucliers évalués avec un profil Guerrier. Les contraintes raciales du Halfelin et la sauvegarde sont contrôlées.',peopleGearCurrent&&peopleGear.peoples?.[p.key]?.openIssue||'Vérifier toutes les restrictions raciales, les armes et les échanges autorisés.'),
  mark('sheet','Fiche officielle et parcours de création',false,'','Vérifier fiche et annexes puis création au clic pour le peuple, sans restriction à un profil donné.')
 ];
 const pass=checks.filter(x=>x.status==='ACQUIS').length;
 return{id:p.id,key:p.key,name:p.label,rules:lore[p.key],checks,passed:pass,total:checks.length,percent:Math.round(100*pass/checks.length),historicalPercent:Math.round(100*p.slots.filter(x=>x.status==='PASS').length/16),certified:pass===checks.length};
});
if(peoples.length!==8||peoples.some(x=>!x.rules))throw Error('8 race progress lines must be complete');
const copyPaths=profile.powers.map(p=>({name:p.name,page:p.page,abilities:p.abilities.map(a=>({rank:a.rank,name:a.name,focus:a.focus,calculation:a.rank===1&&r1Complete?'Effet R1 et conditions contrôlés par oracle et parcours réel au clic.':a.rank===2&&r2Complete?'Effet R2 et cas négatifs contrôlés par oracle et parcours vénérable au clic.':a.rank===3&&r3EffectsCurrent?(a.name==='Combattant aguerri'?'DEF +1, quinze dons, restrictions d’armure et conditions d’exécution vérifiés.':'Effet R3 et cas négatifs vérifiés dans les deux variantes.'):a.calculation,status:a.rank===3&&r3EffectsCurrent?'EFFETS_VERIFIES':a.rank===1&&r1Complete||a.rank===2&&r2Complete?'EFFETS_VERIFIES':a.status}))}));
const profileOrder=['Arquebusier','Barbare','Barde','Chevalier','Druide','Ensorceleur','Forgesort','Guerrier','Magicien','Moine','Prêtre','Rôdeur','Sorcier','Voleur'];
const activeName='Arquebusier',activeIndex=profileOrder.indexOf(activeName);
if(profileOrder.length!==14||activeIndex!==0)throw Error('Certification séquentielle : ordre de profils incohérent');
const profileComplete=verified===profileChecks.length;
const percent=Math.round(100*verified/profileChecks.length);
const barbareIndex=activeIndex+1;

const barbareMatrix=optionalProof('pure-profile-fast-barbare.json');
const barbareClick=optionalProof('barbare-choices-click.json');
const barbarePdf=optionalProof('barbare-official-pdf.json');
const barbarePeoplesEngine=optionalProof('barbare-peuples-moteur.json');
const barbarePeoplesEngineCurrent=barbarePeoplesEngine?.status==='PASS'&&unaffectedIndexEvidence(barbarePeoplesEngine.indexSha256)&&
 barbarePeoplesEngine.planSha256===productHash('FINAL_FREEZE_TESTS/n1_barbare_coverage.cjs')&&
 barbarePeoplesEngine.cases?.length===32&&barbarePeoplesEngine.rankChecks?.length===12;
const barbarePathsDom=optionalProof('barbare-parcours-dom.json');
const barbarePathsDomCurrent=barbarePathsDom?.status==='PASS'&&barbarePathsDom.environment==='jsdom'&&
 unaffectedIndexEvidence(barbarePathsDom.indexSha256)&&
 barbarePathsDom.testSha256===productHash('FINAL_FREEZE_TESTS/n1_barbare_choices_click.cjs')&&barbarePathsDom.cases?.length===32;
const barbarePathsChrome=optionalProof('barbare-parcours-chrome.json');
const barbarePathsChromeCurrent=barbarePathsChrome?.status==='PASS'&&barbarePathsChrome.environment==='chromium'&&
 unaffectedIndexEvidence(barbarePathsChrome.indexSha256)&&
 barbarePathsChrome.testSha256===productHash('FINAL_FREEZE_TESTS/n1_barbare_choices_click.cjs')&&
 barbarePathsChrome.cases?.length===32&&barbarePathsChrome.cases.every(c=>c.status==='PASS')&&
 new Set(barbarePathsChrome.cases.map(c=>c.people+'/'+c.age)).size===32;
const barbareCombatChromeCurrent=barbarePathsChromeCurrent&&barbarePathsChrome.combat?.status==='PASS'&&
 barbarePathsChrome.combat.sheetSha256===productHash('../fiches-personnages/fiche/fiche.js')&&
 barbarePathsChrome.combat.testSha256===productHash('../fiches-personnages/tests/barbare-combat.cjs');
const barbareCombat=optionalProof('barbare-charge-defier-mort.json');
const barbareCombatMobileCurrent=barbareCombat?.status==='PASS'&&
 barbareCombat.sheetSha256===productHash('../fiches-personnages/fiche/fiche.js')&&
 barbareCombat.testSha256===productHash('../fiches-personnages/tests/barbare-combat.cjs');
const barbareCombatDom=optionalProof('barbare-combat-dom.json');
const barbareCombatDomCurrent=barbareCombatDom?.status==='PASS'&&barbareCombatDom.environment==='jsdom'&&
 barbareCombatDom.sheetSha256===productHash('../fiches-personnages/fiche/fiche.js')&&
 barbareCombatDom.testSha256===productHash('../fiches-personnages/tests/barbare-combat-dom.cjs')&&barbareCombatDom.checks?.length===5;
const barbareCombatCurrent=barbareCombatChromeCurrent||barbareCombatMobileCurrent||barbareCombatDomCurrent;
const barbareRankTwoPaths=['brute','pagne','pourfendeur','primitif','rage'];
const barbareRankTwoCurrent=barbareClick?.status==='PASS'&&unaffectedIndexEvidence(barbareClick.indexSha256)&&
 barbareRankTwoPaths.every(path=>barbareClick.cases?.some(row=>row.rankTwo===path&&row.status==='PASS'&&row.result?.rank===2));
const barbareCurrent=barbareMatrix?.status==='PASS_NARROW_PURE_MATRIX_NOT_CERTIFIED'&&barbareMatrix.profile==='Barbare'&&barbareMatrix.pass===4250&&barbareMatrix.failed===0&&barbareMatrix.rejected===0&&barbareMatrix.sourceHashes?.some(s=>s.file==='index.html'&&unaffectedIndexEvidence(s.htmlSha256))&&barbareClick?.status==='PASS'&&unaffectedIndexEvidence(barbareClick.indexSha256)&&barbareClick.cases?.filter(row=>row.tattoo&&row.status==='PASS').length===3&&barbarePdf?.status==='PASS'&&unaffectedIndexEvidence(barbarePdf.indexSha256)&&barbarePdf.exports?.length===12;
const barbareProgress={
 name:'Barbare',
 checks:[
  {name:'Créations et réouvertures',status:barbareCurrent?'ACQUIS':'A_VERIFIER',detail:barbareCurrent?'4 250 créations, dont 326 réouvertures vérifiées.':'Vérifier la matrice sur la version publiée.',proof:'pure-profile-fast-barbare.json'},
  {name:'Peau de pierre, Tatouages et équipement',status:barbareCurrent?'ACQUIS':'A_VERIFIER',detail:barbareCurrent?'3 parcours mobiles, dont le Halfelin avec une hache simple approuvée par le MJ.':'Rejouer les choix au clic et les sauvegardes.',proof:'barbare-choices-click.json'},
  {name:'Rang 2 des cinq voies au clic',status:barbareRankTwoCurrent?'ACQUIS':'A_VERIFIER',detail:barbareRankTwoCurrent?'Cinq parcours mobiles Mûr. Acquisition, PV, DEF, initiative et réouverture vérifiés.':'Rejouer l’acquisition du rang 2 de chaque voie et contrôler la réouverture.',proof:'barbare-choices-click.json'},
  {name:'Fiche PDF officielle',status:barbareCurrent?'ACQUIS':'A_VERIFIER',detail:barbareCurrent?'12 exports couvrant les cinq voies.':'Vérifier les exports des cinq voies.',proof:'barbare-official-pdf.json'},
  {name:'Charge et Défier la mort en jeu',status:barbareCombatCurrent?'ACQUIS':'A_VERIFIER',
   detail:(barbareCombatChromeCurrent||barbareCombatMobileCurrent)?'Charge, attaque létale, quota et réouverture vérifiés sur mobile.':
    barbareCombatDomCurrent?'Charge, attaque létale, quota et réouverture vérifiés dans la simulation du DOM.':'Rejouer les deux capacités dans la fiche interactive.',
   proof:barbareCombatChromeCurrent?'barbare-parcours-chrome.json':barbareCombatDomCurrent?'barbare-combat-dom.json':'barbare-charge-defier-mort.json'},
  {name:'Cri de guerre, Rage et Armure de vent',status:(barbareCombatChromeCurrent||barbareCombatDomCurrent)?'ACQUIS':'A_VERIFIER',
   detail:barbareCombatChromeCurrent?'Cibles du Cri, quota et fin de Rage, interaction avec Défier la mort et changement d’armure vérifiés sous Chrome mobile.':barbareCombatDomCurrent?'Cibles du Cri, quota et fin de Rage, interaction avec Défier la mort et changement d’armure vérifiés dans la simulation du DOM.':
    'Vérifier les cibles du Cri, les effets et la durée de Rage, et les changements d’armure.',
   ...(barbareCombatChromeCurrent?{proof:'barbare-parcours-chrome.json'}:barbareCombatDomCurrent?{proof:'barbare-combat-dom.json'}:{})},
  {name:'Huit peuples et quatre âges dans le moteur',status:barbarePeoplesEngineCurrent?'ACQUIS':'A_VERIFIER',detail:barbarePeoplesEngineCurrent?'32 créations et réouvertures. Douze bonus conditionnels de rang vérifiés, dont Vigueur et Réflexes éclair.':'Rejouer les créations par peuple et par âge.',proof:'barbare-peuples-moteur.json'},
  {name:'Parcours de création dans Chrome',status:barbarePathsChromeCurrent?'ACQUIS':'A_VERIFIER',
   detail:barbarePathsChromeCurrent?'32 parcours au clic sous Chrome, sauvegarde et réouverture vérifiées.':barbarePathsDomCurrent?'32 parcours réussis dans la simulation du DOM. Rejeu Chrome en attente.':'Rejouer les 32 parcours de création, équipement et réouverture dans Chrome.',
   ...(barbarePathsChromeCurrent?{proof:'barbare-parcours-chrome.json'}:barbarePathsDomCurrent?{proof:'barbare-parcours-dom.json'}:{})}
 ]
};
barbareProgress.total=barbareProgress.checks.length;
barbareProgress.passed=barbareProgress.checks.filter(check=>check.status==='ACQUIS').length;
barbareProgress.percent=Math.round(100*barbareProgress.passed/barbareProgress.total);
const barbareComplete=profileComplete&&barbareProgress.passed===barbareProgress.total&&barbareCombatChromeCurrent;
barbareProgress.completed=barbareComplete;
const bardeMatrix=optionalProof('pure-profile-fast-barde.json');
const bardeMatrixCurrent=bardeMatrix?.status==='PASS_NARROW_PURE_MATRIX_NOT_CERTIFIED'&&bardeMatrix.profile==='Barde'&&
 bardeMatrix.pass===4250&&bardeMatrix.failed===0&&bardeMatrix.rejected===0&&
 bardeMatrix.sourceHashes?.some(s=>s.file==='index.html'&&unchangedProfileEvidence(s.htmlSha256));
const bardeSource=optionalProof('barde-source-n1.json');
const bardeNumericsCurrent=unchangedProfileEvidence(bardeSource?.indexSha256)&&bardeSource.checks?.length===6&&
 bardeSource.checks.slice(0,5).every(c=>c.status==='PASS');
const bardeChrome=optionalProof('barde-choices-chrome.json');
const bardeChromeCurrent=bardeChrome?.status==='PASS'&&unchangedProfileEvidence(bardeChrome.indexSha256)&&
 bardeChrome.testSha256===productHash('FINAL_FREEZE_TESTS/n1_barde_choices_click.cjs')&&bardeChrome.passed===8&&
 new Set(bardeChrome.cases.filter(c=>c.status==='PASS').map(c=>c.people)).size===8;
const bardePdf=optionalProof('barde-official-pdf.json');
const bardePdfCurrent=bardePdf?.status==='PASS'&&unchangedProfileEvidence(bardePdf.indexSha256)&&
 bardePdf.exports?.length===10&&bardePdf.exports.every(c=>c.status==='PASS');
const bardeCombat=optionalProof('barde-combat-chrome.json');
const bardeCombatCurrent=bardeCombat?.status==='PASS'&&bardeCombat.environment==='chromium'&&
 bardeCombat.sheetSha256===productHash('../fiches-personnages/fiche/fiche.js')&&
 bardeCombat.testSha256===productHash('../fiches-personnages/tests/barde-combat.cjs');
const bardeEffectsCurrent=bardeCombatCurrent&&bardeNumericsCurrent&&bardeSource.status==='PASS'&&
 bardeSource.checks.every(c=>c.status==='PASS');
const bardeProgress={name:'Barde',checks:[
 {name:'Créations et réouvertures',status:bardeMatrixCurrent?'ACQUIS':'A_VERIFIER',
  detail:bardeMatrixCurrent?bardeMatrix.pass+' créations et '+bardeMatrix.saves+' réouvertures dans le moteur.':'Rejouer la matrice du Barde pur.',
  proof:'pure-profile-fast-barde.json'},
 {name:'Calculs principaux des cinq voies',status:bardeNumericsCurrent?'ACQUIS':'A_VERIFIER',
  detail:'Précision, PM des chants, Grâce féline en DEF et INIT, Dentelles avec et sans armure, cumul d’Éclectique.',
  proof:'barde-source-n1.json'},
 {name:'Effets conditionnels et mise en jeu',status:bardeEffectsCurrent?'ACQUIS':'A_VERIFIER',
  detail:bardeEffectsCurrent?'Feinte et chants validés au clic. Grâce féline est calculée dans le moteur et affichée sur la fiche.':bardeCombatCurrent?'Feinte, chants et affichage de Grâce féline vérifiés sur Chrome mobile. La projection du bonus de Grâce féline dans le moteur reste ouverte.':'Vérifier la Feinte, les chants et Grâce féline en jeu.',
  ...(bardeCombatCurrent?{proof:'barde-combat-chrome.json'}:{})},
 {name:'Création et réouverture dans Chrome',status:bardeChromeCurrent?'ACQUIS':'A_VERIFIER',detail:bardeChromeCurrent?'Huit peuples, cinq voies et rangs 2 acquis. Sauvegarde et réouverture vérifiées au clic.':'Rejouer les voies et les peuples au clic.',proof:'barde-choices-chrome.json'},
 {name:'Fiche PDF officielle',status:bardePdfCurrent?'ACQUIS':'A_VERIFIER',detail:bardePdfCurrent?'Dix exports contrôlés sur le formulaire officiel, avec les cinq voies, les champs chiffrés, les rangs cochés et les annexes.':'Contrôler l’export des cinq voies et leurs résumés.',proof:'barde-official-pdf.json'}
]};
bardeProgress.total=bardeProgress.checks.length;
bardeProgress.passed=bardeProgress.checks.filter(c=>c.status==='ACQUIS').length;
bardeProgress.percent=Math.round(100*bardeProgress.passed/bardeProgress.total);
const bardeIndex=barbareIndex+1;
const bardeComplete=barbareComplete&&bardeProgress.passed===bardeProgress.total;
bardeProgress.completed=bardeComplete;
const chevalierMatrix=optionalProof('pure-profile-fast-chevalier.json');
const chevalierMatrixCurrent=chevalierMatrix?.status==='PASS_NARROW_PURE_MATRIX_NOT_CERTIFIED'&&chevalierMatrix.profile==='Chevalier'&&
 chevalierMatrix.pass===4250&&chevalierMatrix.failed===0&&chevalierMatrix.rejected===0&&
 chevalierMatrix.sourceHashes?.some(x=>x.file==='index.html'&&unchangedProfileEvidence(x.htmlSha256));
const chevalierPdf=optionalProof('chevalier-official-pdf.json');
const chevalierPdfCurrent=chevalierPdf?.status==='PASS'&&unchangedProfileEvidence(chevalierPdf.indexSha256)&&
 chevalierPdf.exports?.length===10&&chevalierPdf.exports.every(c=>c.status==='PASS');
const chevalierChrome=optionalProof('chevalier-choices-chrome.json');
const chevalierChromeCurrent=chevalierChrome?.status==='PASS'&&unchangedProfileEvidence(chevalierChrome.indexSha256)&&chevalierChrome.passed===8&&
 chevalierChrome.testSha256===productHash('FINAL_FREEZE_TESTS/n1_chevalier_choices_click.cjs')&&
 new Set(chevalierChrome.cases.filter(c=>c.status==='PASS').map(c=>c.people)).size===8;
const chevalierSource=optionalProof('chevalier-source-n1.json');
const chevalierSourceCurrent=chevalierSource?.status==='PASS'&&unchangedProfileEvidence(chevalierSource.indexSha256)&&
 chevalierSource.checks?.length===5&&chevalierSource.checks.every(c=>c.status==='PASS');
const chevalierCombat=optionalProof('chevalier-combat-chrome.json');
const chevalierCombatCurrent=chevalierCombat?.status==='PASS'&&chevalierCombat.environment==='chromium'&&
 chevalierCombat.sheetSha256===productHash('../fiches-personnages/fiche/fiche.js')&&
 chevalierCombat.testSha256===productHash('../fiches-personnages/tests/chevalier-combat.cjs');
const chevalierProgress={name:'Chevalier',checks:[
 {name:'Créations et réouvertures',status:chevalierMatrixCurrent?'ACQUIS':'A_VERIFIER',
  detail:chevalierMatrixCurrent?chevalierMatrix.pass+' créations et '+chevalierMatrix.saves+' réouvertures. Épée courte sans lance de cavalerie pour le Halfelin avec accord du MJ.':'Rejouer les paires de voies, les âges et les équipements légaux des huit peuples.',
  proof:'pure-profile-fast-chevalier.json'},
 {name:'Calculs principaux des cinq voies',status:chevalierSourceCurrent?'ACQUIS':'A_VERIFIER',detail:'Monture et dégâts en selle, pénalité d’armure, quota du Preux, peur, langue et écuyer.',proof:'chevalier-source-n1.json'},
 {name:'Effets conditionnels et mise en jeu',status:chevalierCombatCurrent?'ACQUIS':'A_VERIFIER',
  detail:chevalierCombatCurrent?'Selle, garde, réduction à distance, interception et report de dégâts contrôlés dans la fiche sur Chrome mobile.':'Vérifier la selle, Intercepter et le report des dégâts.',
  proof:'chevalier-combat-chrome.json'},
 {name:'Création et réouverture dans Chrome',status:chevalierChromeCurrent?'ACQUIS':'A_VERIFIER',
  detail:chevalierChromeCurrent?'Huit peuples, choix d’Éduqué, équipement halfelin et réouverture contrôlés au clic.':'Rejouer un scénario de rang 2 par peuple, avec choix de langue et équipement.',
  proof:'chevalier-choices-chrome.json'},
 {name:'Fiche PDF officielle',status:chevalierPdfCurrent?'ACQUIS':'A_VERIFIER',
  detail:chevalierPdfCurrent?'Dix exports sur le formulaire officiel, cinq voies, champs chiffrés, rangs cochés et annexes.':'Contrôler les cinq voies et les annexes.',
  proof:'chevalier-official-pdf.json'}
]};
chevalierProgress.total=chevalierProgress.checks.length;
chevalierProgress.passed=chevalierProgress.checks.filter(c=>c.status==='ACQUIS').length;
chevalierProgress.percent=Math.round(100*chevalierProgress.passed/chevalierProgress.total);
const chevalierIndex=bardeIndex+1;
const chevalierComplete=bardeComplete&&chevalierProgress.passed===chevalierProgress.total;
chevalierProgress.completed=chevalierComplete;
const druideMatrix=optionalProof('pure-profile-fast-druide.json');
const druideMatrixCurrent=druideMatrix?.status==='PASS_NARROW_PURE_MATRIX_NOT_CERTIFIED'&&druideMatrix.profile==='Druide'&&
 druideMatrix.pass===4250&&druideMatrix.failed===0&&druideMatrix.rejected===0&&
 druideMatrix.sourceHashes?.some(x=>x.file==='index.html'&&x.htmlSha256===canonicalHash);
const druidePdf=optionalProof('druide-official-pdf.json');
const druidePdfCurrent=druidePdf?.status==='PASS'&&druidePdf.indexSha256===canonicalHash&&
 druidePdf.exports?.length===10&&druidePdf.exports.every(c=>c.status==='PASS');
const druideChrome=optionalProof('druide-choices-chrome.json');
const druideChromeCurrent=druideChrome?.status==='PASS'&&druideChrome.indexSha256===canonicalHash&&
 druideChrome.testSha256===productHash('FINAL_FREEZE_TESTS/n1_druide_choices_click.cjs')&&druideChrome.passed===8&&
 new Set(druideChrome.cases.filter(c=>c.status==='PASS').map(c=>c.people)).size===8;
const druideSource=optionalProof('druide-source-n1.json');
const druideSourceCurrent=druideSource?.status==='PASS'&&druideSource.indexSha256===canonicalHash&&
 druideSource.testSha256===productHash('FINAL_FREEZE_TESTS/n1_druide_source.cjs')&&
 druideSource.checks?.length===5&&druideSource.checks.every(c=>c.status==='PASS');
const druideCombat=optionalProof('druide-combat-chrome.json');
const druideCombatCurrent=druideCombat?.status==='PASS'&&druideCombat.environment==='chromium'&&
 druideCombat.sheetSha256===productHash('../fiches-personnages/fiche/fiche.js')&&
 druideCombat.testSha256===productHash('../fiches-personnages/tests/druide-combat.cjs')&&[6,8].includes(druideCombat.checks?.length);
const druideRuntime=optionalProof('druide-runtime-n1.json');
const druideFinalCurrent=druideCombatCurrent&&druideCombat.checks.length===8&&
 druideRuntime?.status==='PASS'&&druideRuntime.indexSha256===canonicalHash&&druideRuntime.checks?.length===5&&
 druideRuntime.testSha256===productHash('FINAL_FREEZE_TESTS/n1_druide_runtime.cjs');
const druideProgress={name:'Druide',checks:[
 {name:'Créations et réouvertures',status:druideMatrixCurrent?'ACQUIS':'A_VERIFIER',
  detail:druideMatrixCurrent?druideMatrix.pass+' créations et '+druideMatrix.saves+' réouvertures dans le moteur.':'Rejouer les créations du Druide pur avec les huit peuples.',
  proof:'pure-profile-fast-druide.json'},
 {name:'Calculs principaux des cinq voies',status:druideSourceCurrent?'ACQUIS':'A_VERIFIER',
  detail:'Bonus de tests, défense du familier visible, initiative, caractéristiques de la panthère et coût des sorts.',
  proof:'druide-source-n1.json'},
 {name:'Effets en jeu dans la fiche interactive',status:druideCombatCurrent?'ACQUIS':'A_VERIFIER',
  detail:'Baies par bénéficiaire, rituel quotidien, terrain difficile, Peau d’écorce et défense du compagnon visible. Compteurs vérifiés après réouverture.',
  ...(druideCombatCurrent?{proof:'druide-combat-chrome.json'}:{})},
 {name:'Règles des sorts dans le moteur partagé et effets restants',status:druideFinalCurrent?'ACQUIS':'A_VERIFIER',
  detail:druideFinalCurrent?'Baies et Forêt vivante vérifiées dans le moteur. Prison végétale et récupération nocturne vérifiées au clic dans la fiche.':'Aligner le moteur partagé et vérifier Prison végétale et la récupération nocturne.',
  ...(druideFinalCurrent?{proof:'druide-runtime-n1.json'}:{})},
 {name:'Création et réouverture dans Chrome',status:druideChromeCurrent?'ACQUIS':'A_VERIFIER',
  detail:druideChromeCurrent?'Huit peuples, cinq voies et acquisition des rangs 2 au clic. Sauvegarde et réouverture contrôlées.':'Rejouer un scénario de rang 2 par peuple et vérifier la réouverture.',
  proof:'druide-choices-chrome.json'},
 {name:'Fiche PDF officielle',status:druidePdfCurrent?'ACQUIS':'A_VERIFIER',
  detail:druidePdfCurrent?'Dix exports, champs chiffrés, rangs cochés et annexes sur les cinq voies.':'Contrôler les exports et annexes des cinq voies.',
  proof:'druide-official-pdf.json'}
]};
druideProgress.total=druideProgress.checks.length;
druideProgress.passed=druideProgress.checks.filter(c=>c.status==='ACQUIS').length;
druideProgress.percent=Math.round(100*druideProgress.passed/druideProgress.total);
druideProgress.completed=chevalierComplete&&druideProgress.passed===druideProgress.total;
const ensorceleurIndex=chevalierIndex+2;
const ensorceleurMatrix=optionalProof('pure-profile-fast-ensorceleur.json');
const ensorceleurMatrixCurrent=ensorceleurMatrix?.status==='PASS_NARROW_PURE_MATRIX_NOT_CERTIFIED'&&
 ensorceleurMatrix.profile==='Ensorceleur'&&ensorceleurMatrix.pass===4250&&ensorceleurMatrix.failed===0&&ensorceleurMatrix.rejected===0&&
 ensorceleurMatrix.sourceHashes?.some(x=>x.file==='index.html'&&x.htmlSha256===canonicalHash);
const ensorceleurSource=optionalProof('ensorceleur-source-n1.json');
const ensorceleurSourceCurrent=ensorceleurSource?.status==='PASS'&&ensorceleurSource.indexSha256===canonicalHash&&
 ensorceleurSource.testSha256===productHash('FINAL_FREEZE_TESTS/n1_ensorceleur_source.cjs')&&
 ensorceleurSource.checks?.length===5&&ensorceleurSource.checks.every(c=>c.status==='PASS');
const ensorceleurPdf=optionalProof('ensorceleur-official-pdf.json');
const ensorceleurPdfCurrent=ensorceleurPdf?.status==='PASS'&&ensorceleurPdf.indexSha256===canonicalHash&&
 ensorceleurPdf.exports?.length===10&&ensorceleurPdf.exports.every(c=>c.status==='PASS');
const ensorceleurChrome=optionalProof('ensorceleur-choices-chrome.json');
const ensorceleurChromeCurrent=ensorceleurChrome?.status==='PASS'&&ensorceleurChrome.indexSha256===canonicalHash&&
 ensorceleurChrome.testSha256===productHash('FINAL_FREEZE_TESTS/n1_ensorceleur_choices_click.cjs')&&ensorceleurChrome.passed===8&&
 new Set(ensorceleurChrome.cases.filter(c=>c.status==='PASS').map(c=>c.people)).size===8;
const ensorceleurCombat=optionalProof('ensorceleur-combat-chrome.json');
const ensorceleurCombatCurrent=ensorceleurCombat?.status==='PASS'&&ensorceleurCombat.environment==='chromium'&&
 ensorceleurCombat.sheetSha256===productHash('../fiches-personnages/fiche/fiche.js')&&
 ensorceleurCombat.testSha256===productHash('../fiches-personnages/tests/ensorceleur-combat.cjs')&&
 ensorceleurCombat.checks?.length===5;
const ensorceleurProgress={name:'Ensorceleur',checks:[
 {name:'Créations et réouvertures',status:ensorceleurMatrixCurrent?'ACQUIS':'A_VERIFIER',
  detail:ensorceleurMatrixCurrent?ensorceleurMatrix.pass+' créations et '+ensorceleurMatrix.saves+' réouvertures sur les huit peuples, avec le rang 2 gratuit et les dépenses d’âge.':'Vérifier les créations des huit peuples et les dépenses d’âge du mage.',
  proof:'pure-profile-fast-ensorceleur.json'},
 {name:'Bonus, actions et mana des cinq voies',status:ensorceleurSourceCurrent?'ACQUIS':'A_VERIFIER',
  detail:'DEF, initiative, bonus de tests, coût des sorts, quota de Sommeil et concentration de Choc.',
  proof:'ensorceleur-source-n1.json'},
 {name:'Effets des sorts en partie',status:ensorceleurCombatCurrent?'ACQUIS':'A_VERIFIER',
  detail:ensorceleurCombatCurrent?'Sous tension, Image décalée, Sommeil et Choc testés sur la fiche Chrome mobile. Coûts, portée, cibles, sauvegarde et dé évolutif vérifiés.':'Vérifier les effets de Sous tension, Image décalée, Sommeil et Choc sur la fiche interactive.',
  ...(ensorceleurCombatCurrent?{proof:'ensorceleur-combat-chrome.json'}:{})},
 {name:'Création et réouverture dans Chrome',status:ensorceleurChromeCurrent?'ACQUIS':'A_VERIFIER',
  detail:ensorceleurChromeCurrent?'Huit peuples, cinq voies, rang 2 du mage, achats d’âge et réouverture au clic.':'Rejouer les choix du mage, l’âge Mûr et le Don étrange du Gnome.',
  proof:'ensorceleur-choices-chrome.json'},
 {name:'Fiche PDF officielle',status:ensorceleurPdfCurrent?'ACQUIS':'A_VERIFIER',
  detail:ensorceleurPdfCurrent?'Dix exports, rangs 1 et 2, champs chiffrés et annexes des cinq voies.':'Contrôler les champs et les annexes des cinq voies.',
  proof:'ensorceleur-official-pdf.json'}
]};
ensorceleurProgress.total=ensorceleurProgress.checks.length;
ensorceleurProgress.passed=ensorceleurProgress.checks.filter(c=>c.status==='ACQUIS').length;
ensorceleurProgress.percent=Math.round(100*ensorceleurProgress.passed/ensorceleurProgress.total);
ensorceleurProgress.completed=druideProgress.completed&&ensorceleurProgress.passed===ensorceleurProgress.total;
const forgesortIndex=ensorceleurIndex+1;
const forgesortMatrix=optionalProof('pure-profile-fast-forgesort.json');
const forgesortMatrixCurrent=forgesortMatrix?.status==='PASS_NARROW_PURE_MATRIX_NOT_CERTIFIED'&&
 forgesortMatrix.profile==='Forgesort'&&forgesortMatrix.pass===4250&&forgesortMatrix.failed===0&&forgesortMatrix.rejected===0&&
 forgesortMatrix.sourceHashes?.some(x=>x.file==='index.html'&&x.htmlSha256===canonicalHash);
const forgesortSource=optionalProof('forgesort-source-n1.json');
const forgesortSourceCurrent=forgesortSource?.status==='PASS'&&forgesortSource.indexSha256===canonicalHash&&
 forgesortSource.testSha256===productHash('FINAL_FREEZE_TESTS/n1_forgesort_source.cjs')&&
 forgesortSource.checks?.length===5&&forgesortSource.checks.every(c=>c.status==='PASS');
const forgesortPdf=optionalProof('forgesort-official-pdf.json');
const forgesortPdfCurrent=forgesortPdf?.status==='PASS'&&forgesortPdf.indexSha256===canonicalHash&&
 forgesortPdf.exports?.length===10&&forgesortPdf.exports.every(c=>c.status==='PASS');
const forgesortChrome=optionalProof('forgesort-choices-chrome.json');
const forgesortChromeCurrent=forgesortChrome?.status==='PASS'&&forgesortChrome.indexSha256===canonicalHash&&
 forgesortChrome.testSha256===productHash('FINAL_FREEZE_TESTS/n1_forgesort_choices_click.cjs')&&forgesortChrome.passed===8&&
 new Set(forgesortChrome.cases.filter(c=>c.status==='PASS').map(c=>c.people)).size===8;
const forgesortCombat=optionalProof('forgesort-combat-chrome.json');
const forgesortCombatCurrent=forgesortCombat?.status==='PASS'&&forgesortCombat.environment==='chromium'&&
 forgesortCombat.sheetSha256===productHash('../fiches-personnages/fiche/fiche.js')&&
 forgesortCombat.testSha256===productHash('../fiches-personnages/tests/forgesort-combat.cjs')&&
 forgesortCombat.checks?.length===5;
const forgesortProgress={name:'Forgesort',checks:[
 {name:'Créations et réouvertures',status:forgesortMatrixCurrent?'ACQUIS':'A_VERIFIER',
  detail:forgesortMatrixCurrent?forgesortMatrix.pass+' créations et '+forgesortMatrix.saves+' réouvertures sur huit peuples.':'Valider la matrice complète avec la condition d’INT des runes.',
  proof:'pure-profile-fast-forgesort.json'},
 {name:'Bonus, actions et mana des cinq voies',status:forgesortSourceCurrent?'ACQUIS':'A_VERIFIER',
  detail:'Bâton lié, alchimie, arme enflammée, PV via INT, caractéristiques du golem, INT et DEF des runes.',
  proof:'forgesort-source-n1.json'},
 {name:'Effets des capacités en partie',status:forgesortCombatCurrent?'ACQUIS':'A_VERIFIER',
  detail:forgesortCombatCurrent?'Fortifiant, Feu grégeois, Morsure de la forge, Métal brûlant et Rune de puissance vérifiés au clic.':'Contrôler les élixirs, le métal et la Rune de puissance.',
  ...(forgesortCombatCurrent?{proof:'forgesort-combat-chrome.json'}:{})},
 {name:'Création et réouverture dans Chrome',status:forgesortChromeCurrent?'ACQUIS':'A_VERIFIER',
  detail:'Huit peuples, cinq voies, rang 2 du mage, achats d’âge et réouverture.',
  proof:'forgesort-choices-chrome.json'},
 {name:'Fiche PDF officielle',status:forgesortPdfCurrent?'ACQUIS':'A_VERIFIER',
  detail:'Dix exports, champs et annexes des cinq voies.',
  proof:'forgesort-official-pdf.json'}
]};
forgesortProgress.total=forgesortProgress.checks.length;
forgesortProgress.passed=forgesortProgress.checks.filter(c=>c.status==='ACQUIS').length;
forgesortProgress.percent=Math.round(100*forgesortProgress.passed/forgesortProgress.total);
forgesortProgress.completed=ensorceleurProgress.completed&&forgesortProgress.passed===forgesortProgress.total;
const guerrierIndex=forgesortIndex+1;
const guerrierMatrix=optionalProof('pure-profile-fast-guerrier.json');
const guerrierMatrixCurrent=guerrierMatrix?.status==='PASS_NARROW_PURE_MATRIX_NOT_CERTIFIED'&&
 guerrierMatrix.profile==='Guerrier'&&guerrierMatrix.pass===4250&&guerrierMatrix.failed===0&&guerrierMatrix.rejected===0&&
 guerrierMatrix.sourceHashes?.some(x=>x.file==='index.html'&&x.htmlSha256===canonicalHash);
const guerrierSource=optionalProof('guerrier-source-n1.json');
const guerrierSourceCurrent=guerrierSource?.status==='PASS'&&guerrierSource.indexSha256===canonicalHash&&
 guerrierSource.testSha256===productHash('FINAL_FREEZE_TESTS/n1_guerrier_source.cjs')&&
 guerrierSource.checks?.length===5&&guerrierSource.checks.every(c=>c.status==='PASS');
const guerrierPdf=optionalProof('guerrier-official-pdf.json');
const guerrierPdfCurrent=guerrierPdf?.status==='PASS'&&guerrierPdf.indexSha256===canonicalHash&&
 guerrierPdf.exports?.length===10&&guerrierPdf.exports.every(c=>c.status==='PASS');
const guerrierChrome=optionalProof('guerrier-choices-chrome.json');
const guerrierChromeCurrent=guerrierChrome?.status==='PASS'&&guerrierChrome.indexSha256===canonicalHash&&
 guerrierChrome.testSha256===productHash('FINAL_FREEZE_TESTS/n1_guerrier_choices_click.cjs')&&guerrierChrome.passed===8&&
 new Set(guerrierChrome.cases.filter(c=>c.status==='PASS').map(c=>c.people)).size===8;
const guerrierProgress={name:'Guerrier',checks:[
 {name:'Créations et réouvertures',status:guerrierMatrixCurrent?'ACQUIS':'A_VERIFIER',
  detail:guerrierMatrixCurrent?guerrierMatrix.pass+' créations et '+guerrierMatrix.saves+' réouvertures sur huit peuples.':'Rejouer la matrice avec la catégorie d’arme de prédilection et l’équipement du Halfelin.',
  proof:'pure-profile-fast-guerrier.json'},
 {name:'Bonus passifs et quotas des cinq voies',status:guerrierSourceCurrent?'ACQUIS':'A_VERIFIER',
  detail:'Initiative, PV, résistance, attaque de prédilection et quotas par round.',
  proof:'guerrier-source-n1.json'},
 {name:'Effets des capacités en partie',status:'A_VERIFIER',
  detail:'Corriger Science du critique : le seuil reste à 20 avec une arme de prédilection au lieu de 19–20. Vérifier aussi la parade, la protection d’un allié et les actions par round.'},
 {name:'Création et réouverture dans Chrome',status:guerrierChromeCurrent?'ACQUIS':'A_VERIFIER',
  detail:'Huit peuples, choix de prédilection, achats d’âge et réouverture.',
  proof:'guerrier-choices-chrome.json'},
 {name:'Fiche PDF officielle',status:guerrierPdfCurrent?'ACQUIS':'A_VERIFIER',
  detail:'Dix exports, champs et annexes des cinq voies.',
  proof:'guerrier-official-pdf.json'}
]};
guerrierProgress.total=guerrierProgress.checks.length;
guerrierProgress.passed=guerrierProgress.checks.filter(c=>c.status==='ACQUIS').length;
guerrierProgress.percent=Math.round(100*guerrierProgress.passed/guerrierProgress.total);
guerrierProgress.completed=forgesortProgress.completed&&guerrierProgress.passed===guerrierProgress.total;
const progressByIndex=new Map([[barbareIndex,barbareProgress],[bardeIndex,bardeProgress],
 [chevalierIndex,chevalierProgress],[chevalierIndex+1,druideProgress],[ensorceleurIndex,ensorceleurProgress],[forgesortIndex,forgesortProgress],[guerrierIndex,guerrierProgress]]);
const priorityIndex=forgesortProgress.completed?guerrierIndex:ensorceleurProgress.completed?forgesortIndex:druideProgress.completed?ensorceleurIndex:chevalierComplete?chevalierIndex+1:bardeComplete?chevalierIndex:barbareComplete?bardeIndex:profileComplete?barbareIndex:activeIndex;
const priorityProgress=progressByIndex.get(priorityIndex)||null;
const priorityPercent=priorityProgress?.percent??percent;
const queue=profileOrder.map((name,i)=>{
 const certified=i===activeIndex?profileComplete:progressByIndex.get(i)?.completed===true;
 return {name,position:i+1,status:certified?'CERTIFIE':i===priorityIndex?'EN_COURS':'EN_ATTENTE',
  percent:i===priorityIndex?priorityPercent:i===activeIndex?percent:certified?100:null,certified};
});
const current=queue[priorityIndex];
const output={
 schema:'FOH_N1_PROFILE_AND_PEOPLES_SEPARATE',
 racialOptionsCurrent:{valid:!!racialOptionsCurrent,passed:racialOptionsCurrent?392:0,total:392,scope:'Options de caractéristiques des huit peuples croisees avec quatorze profils sur index.html; ne certifie ni les pouvoirs conditionnels ni toutes les restrictions de taille.'},
 canonicalProduct:'forge-of-heroes/index.html',
 canonicalIndexSha256:canonicalHash,
 certificationBasis:druideScoped?'Correctif ciblé sur les Baies magiques et Forêt vivante. Les preuves de création, de fiche et de peuples restent liées aux périmètres testés.':previousIndex?'Preuves liées au produit canonique. La comparaison octet par octet confirme le correctif isolé de Grâce féline et préserve les preuves des profils hors Barde.':'Preuves liées au produit canonique et à sa version contrôlée.',
 generatedAt:new Date().toISOString(),
 engineSha256:components('index.html').engineSha256,
 databaseSha256:hash(indexHtml.match(/id="FOH_DB_JSON"[^>]*>([\s\S]*?)<\/script>/)[1]),
 peoplesEvidenceCurrent:true,
 peoplesEvidenceSourceEngineSha256:old.engineSha256,
 certificationPlan:{
  policy:'UN_SEUL_PROFIL_A_LA_FOIS_JUSQU_A_100',
  target:{officialProfiles:14,officialPeoples:8,allMustReachPercent:100},
  current:{name:current.name,position:current.position,percent:current.percent,certified:current.certified},
  next:{name:profileOrder[priorityIndex+1],unlocked:current.certified,condition:'profil actif 100 % et certificat de gel fondé sur les règles, les clics et le PDF'},
  queue,
  priorityProgress,
  archivedProfiles:[...progressByIndex.values()].filter(progress=>progress.completed&&progress!==priorityProgress),
  peoplesProgressRule:'Chaque critère de peuple est validé par une preuve liée à la version courante. Les effets conditionnels, les équipements, les âges et historiques et le parcours avec PDF sont suivis séparément.',
  remainingPeoplesPolicy:'Après les 14 profils, fermer les critères raciaux manquants un peuple à la fois',
  fullOfficialN1Closed:false,
  companionExtensions:'CERTIFICATION_SEPAREE'
 },
 intent:'Le profil complet compte indépendamment des peuples : cinq voies et leurs effets, armes, historiques, fiche. Chaque peuple a son propre avancement de règles raciales, indépendant du choix de profil. AUCUNE barre par voie ni par couple profil-peuple.',
 profile:{id:profile.profileId,name:'Arquebusier',priority:profileComplete?'CERTIFIE':'EN_COURS',completed:profileComplete,variantPrototypeReady:!!prototypeOK,variantIntegrated:!!deployed,passed:verified,total:profileChecks.length,percent:Math.round(100*verified/profileChecks.length),checks:profileChecks,paths:copyPaths,partialNumericValidated:numericPartial,
  next:forgesortProgress.completed?'Guerrier N1 en cours.':ensorceleurProgress.completed?'Forgesort N1 en cours.':druideProgress.completed?'Ensorceleur N1 en cours.':chevalierComplete?'Druide N1 en cours.':bardeComplete?'Chevalier N1 en cours.':barbareComplete?'Barde N1 en cours.':profileComplete?(barbareCurrent?'Barbare en cours : 4 250 créations vérifiées, '+barbareClick.passed+' parcours mobiles et 12 PDF couvrant les cinq voies.':'Prochain profil à vérifier : Barbare.'):profileChecks.filter(c=>c.status!=='ACQUIS').map(c=>c.name).join(' ; ')},
 peoples,
 pausedProfiles:queue.filter(p=>p.status==='EN_ATTENTE').length,
 summary:{profilesCertified:queue.filter(p=>p.certified).length,profilesInProgress:queue.filter(p=>p.status==='EN_COURS').length,profilesPending:queue.filter(p=>p.status==='EN_ATTENTE').length,peoplesCertified:peoples.filter(p=>p.certified).length},
 limitations:'Pourcentage de critères complets, non proportion de tests ni preuve exhaustive de tous les personnages. Un effet chiffré peut être validé sans que le rang complet le soit.',
 sources:[...(barbareCurrent?['QA/N1/pure-profile-fast-barbare.json','QA/N1/barbare-choices-click.json','QA/N1/barbare-official-pdf.json']:[]),'QA/N1/arquebusier-history-professions.json','QA/N1/arquebusier-history-origins.json','QA/N1/official-people-equipment.json','QA/N1/arquebusier-grant-context.json','QA/N1/lot10/people-source.json','QA/N1/arquebusier-derived-source.json','QA/N1/arquebusier-powder-weapon-boundary.json','QA/N1/arquebusier-two-preferences.json','QA/N1/arquebusier-official-template.json',...(variant?['QA/N1/arquebusier-arbaletrier-source-audit.json']:[]),'COF2 Livre de base pp. 44-65','Règles avancées p.153 et historiques','QA/N1/arquebusier-pure-age-ranks.json','QA/N1/arquebusier-pdf-real-click.json','QA/N1/arquebusier-all-mechanics-probe.json','QA/N1/official-methods-cross.json','QA/N1/official-racial-options.json','QA/N1/lot10/people-source.json']
};
const dest=path.resolve(root,'..','centre-synchronisation/forge-n1/focus.json');
fs.writeFileSync(dest,JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify({profile:output.profile.name,score:output.profile.percent,passed:verified,peoples:peoples.map(p=>[p.name,p.percent]),profileIndependent:true,racesIndependent:true}));
