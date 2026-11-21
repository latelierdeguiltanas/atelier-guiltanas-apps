'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto'),cp=require('child_process');
const {load}=require('./forge_product_runner'),root=path.resolve(__dirname,'../..'),out=root+'/forge-of-heroes/QA/N1/lot-2026-11-19',read=p=>JSON.parse(fs.readFileSync(root+'/'+p,'utf8')),hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const {db,html}=load(),T=db.tables,extract=id=>html.match(new RegExp('<script[^>]*id="'+id+'"[^>]*>([\\s\\S]*?)<\\/script>'))[1];
const inputs={commit:process.env.GITHUB_SHA||cp.execSync('git rev-parse HEAD',{cwd:root,encoding:'utf8'}).trim(),indexBlob:cp.execSync('git hash-object forge-of-heroes/index.html',{cwd:root,encoding:'utf8'}).trim(),indexSha256:hash(html),engineSha256:hash(extract('FOH_ENGINE_BUNDLE')),databaseSha256:hash(extract('FOH_DB_JSON')),nativeSha256:hash(fs.readFileSync(root+'/forge-of-heroes/native-progression.js')),bridgeSha256:hash(fs.readFileSync(root+'/fiches-personnages/forge-link.js')),sheetSha256:hash(fs.readFileSync(root+'/fiches-personnages/fiche/fiche.js'))};
for(const f of ['ability-runtime.js','permanent-rules.js','path-calculations.js','prestige-rules.js'])if(!html.includes(fs.readFileSync(root+'/forge-of-heroes/rules/'+f,'utf8').trimEnd()))throw Error('Source/bundle drift: '+f);
const old=read('forge-of-heroes/rules/completion-audit.json'),known=new Set(old.rows.map(r=>r.abilityId)),acq=read('forge-of-heroes/QA/N1/lot-2026-11-19/untracked-acquisitions.json'),bone=read('forge-of-heroes/QA/N1/lot-2026-11-19/bone-armor.json');
if(acq.indexSha256!==inputs.indexSha256||bone.inputs.indexSha256!==inputs.indexSha256||bone.inputs.sheetSha256!==inputs.sheetSha256||bone.inputs.nativeSha256!==inputs.nativeSha256)throw Error('Stale evidence');
const batch=read('forge-of-heroes/QA/N1/lot-2026-11-19/rank-persistence-batch.json');
const batchCurrent=batch.inputs.indexSha256===inputs.indexSha256&&batch.inputs.nativeSha256===inputs.nativeSha256&&
 batch.inputs.librarySha256===hash(fs.readFileSync(root+'/fiches-personnages/library.js'));
const highRankProof=read('forge-of-heroes/QA/N1/lot-2026-11-19/high-rank-access.json');
const highRankCurrent=highRankProof.status==='PASS'&&highRankProof.inputs.indexSha256===inputs.indexSha256;
const finiteChoices=read('forge-of-heroes/QA/N1/lot-2026-11-19/finite-choices.json');
const finiteChoicesCurrent=finiteChoices.inputs.indexSha256===inputs.indexSha256&&
 finiteChoices.inputs.runnerSha256===hash(fs.readFileSync(root+'/forge-of-heroes/FINAL_FREEZE_TESTS/n1_finite_choices.cjs'));
const standardCosts=read('forge-of-heroes/QA/N1/lot-2026-11-19/standard-spell-costs.json');
const standardCostsCurrent=standardCosts.inputs.indexSha256===inputs.indexSha256&&
 standardCosts.inputs.runtimeSha256===hash(fs.readFileSync(root+'/forge-of-heroes/rules/ability-runtime.js'))&&
 standardCosts.inputs.runnerSha256===hash(fs.readFileSync(root+'/forge-of-heroes/FINAL_FREEZE_TESTS/n1_base_spell_costs.cjs'));
const dynamicChoices=read('forge-of-heroes/QA/N1/lot-2026-11-19/dynamic-choices.json');
const dynamicChoicesCurrent=dynamicChoices.inputs.indexSha256===inputs.indexSha256&&
 dynamicChoices.inputs.runnerSha256===hash(fs.readFileSync(root+'/forge-of-heroes/FINAL_FREEZE_TESTS/n1_dynamic_choices.cjs'))&&
 dynamicChoices.inputs.fixtureSha256===hash(fs.readFileSync(root+'/forge-of-heroes/FINAL_FREEZE_TESTS/n1_batch_rank_persistence.cjs'));
const multipleChoices=read('forge-of-heroes/QA/N1/lot-2026-11-19/multi-choices.json');
const multipleChoicesCurrent=multipleChoices.inputs.indexSha256===inputs.indexSha256&&
 multipleChoices.inputs.runnerSha256===hash(fs.readFileSync(root+'/forge-of-heroes/FINAL_FREEZE_TESTS/n1_multi_choices.cjs'));
const originProof=read('forge-of-heroes/QA/N1/arquebusier-history-origins.json');
const originsCurrent=originProof.status==='PASS'&&originProof.indexSha256===inputs.indexSha256&&
 originProof.runnerSha256===hash(fs.readFileSync(root+'/forge-of-heroes/FINAL_FREEZE_TESTS/n1_history_origins_oracle.cjs'))&&
 originProof.contextSha256===hash(fs.readFileSync(root+'/forge-of-heroes/ENGINE/history_context_n1.js'));
const professionProof=read('forge-of-heroes/QA/N1/arquebusier-history-professions.json');
const professionsCurrent=professionProof.status==='PASS'&&professionProof.cases===80&&
 professionProof.products.some(product=>product.file==='index.html'&&product.sha256===inputs.indexSha256)&&
 professionProof.runnerSha256===hash(fs.readFileSync(root+'/forge-of-heroes/FINAL_FREEZE_TESTS/n1_history_conditions_oracle.cjs'))&&
 professionProof.moduleSha256===hash(fs.readFileSync(root+'/forge-of-heroes/ENGINE/history_context_n1.js'));
const breathProof=read('forge-of-heroes/QA/N1/lot-2026-11-19/drakonide-breath-dom.json');
const breathCurrent=breathProof.status==='PASS'&&
 breathProof.inputs.indexSha256===inputs.indexSha256&&breathProof.inputs.nativeSha256===inputs.nativeSha256&&
 breathProof.inputs.sheetSha256===inputs.sheetSha256&&
 breathProof.inputs.sheetHtmlSha256===hash(fs.readFileSync(root+'/fiches-personnages/fiche/index.html'))&&
 ['fire','cold','lightning','acid'].every(element=>breathProof.cases.some(c=>c.element===element&&c.status==='PASS'));
const roundProof=read('forge-of-heroes/QA/N1/lot-2026-11-19/round-power-uses.json');
const roundCurrent=roundProof.status==='PASS'&&roundProof.inputs.indexSha256===inputs.indexSha256&&
 roundProof.inputs.sheetSha256===inputs.sheetSha256&&roundProof.inputs.nativeSha256===inputs.nativeSha256&&
 roundProof.inputs.sheetHtmlSha256===hash(fs.readFileSync(root+'/fiches-personnages/fiche/index.html'))&&
 roundProof.inputs.runnerSha256===hash(fs.readFileSync(root+'/fiches-personnages/tests/round-power-uses.cjs'))&&
 roundProof.inputs.fixtureSha256===hash(fs.readFileSync(root+'/forge-of-heroes/FINAL_FREEZE_TESTS/n1_batch_rank_persistence.cjs'));
const warriorProof=read('forge-of-heroes/QA/N1/guerrier-source-n1.json');
const criticalCurrent=warriorProof.indexSha256===inputs.indexSha256&&
 warriorProof.testSha256===hash(fs.readFileSync(root+'/forge-of-heroes/FINAL_FREEZE_TESTS/n1_guerrier_source.cjs'))&&
 warriorProof.checks.some(c=>c.name==='Science du critique · un point sur les armes de prédilection uniquement'&&c.status==='PASS');
const peopleProof=read('forge-of-heroes/QA/N1/lot10/people-source.json'),arqProof=read('forge-of-heroes/QA/N1/arquebusier-pure-age-ranks.json');
const exactReport=j=>JSON.stringify(j.products||[]).includes(inputs.indexSha256);
const obligations=['acquisition','choices','permanentEffects','activation','numericEffects','costs','duration','deactivation','restrictions','persistence'];
const paths=new Map([...T.paths_class,...T.paths_people,...T.history_paths].map(p=>[p.id,p]));
function classification(a){const txt=a.desc||'',m=a.mechanics||{},tags=new Set();if(m.kind==='passive')tags.add('permanent');if(m.kind==='active'||m.kind==='spell'||/\([ALMG]\)/.test(a.label))tags.add('activable');if(/si |lorsqu|tant que|à condition|lors de/i.test(txt))tags.add('passif contextuel');if(/minutes?|rounds?|heures?|journée/i.test(txt))tags.add('temporaire');if(/par jour|utilisation|consomm|sacrifi/i.test(txt))tags.add('consommable');if(/réaction|en réaction|lorsqu.*attaque/i.test(txt))tags.add('réactif');if(!tags.size)tags.add('descriptif');return {candidateTypes:[...tags],behavior:tags.size>1?'mixte':[...tags][0],review:'AUTO_CLASSIFIED_REQUIRES_REVIEW',evidence:'Catalogue text/mechanics signals, not a functional verdict'};}
const rows=[...T.abilities_class,...T.abilities_people,...T.history_abilities].map(a=>{
 const p=paths.get(a.path_id),kind=T.history_paths.some(p=>p.id===a.path_id)?'history':T.paths_people.some(p=>p.id===a.path_id)?'people':'profile',applicable=kind==='history'||a.rank<=3,probe=acq.cases.find(x=>x.id===a.id),isBone=/ability:armure-d-os:/.test(a.id);
 const checks=Object.fromEntries(obligations.map(k=>[k,{status:'NON TESTÉ',reason:'Historical proof mapping remains open; no old proof discarded'}]));
 if(probe?.status==='PASS'){for(const k of ['acquisition','persistence'])checks[k]={status:'PASS',evidence:'untracked-acquisitions.json',scope:k==='persistence'?'Draft JSON replay only; interactive sheet is a separate gate':'Exact ID acquired in saved witness'};}
 const oldPeople=exactReport(peopleProof)&&peopleProof.cases.find(c=>c.path===a.path_id&&c.rank===a.rank&&c.status==='PASS');
 const oldArq=exactReport(arqProof)&&arqProof.complete===true&&arqProof.failed===0&&a.rank<=3&&a.path_id.includes(':class-arquebusier:');
 if(oldPeople||oldArq)for(const k of ['acquisition','persistence'])checks[k]={status:'PASS',evidence:oldPeople?'../lot10/people-source.json':'../arquebusier-pure-age-ranks.json',scope:'REUSED exact-index assertions: owned rank and official payload save/reopen. Does not close all effects or new sheet dependencies.'};
 const boundary=highRankCurrent&&highRankProof.cases[a.id];
 const reachability=!applicable&&boundary?.status==='PASS'&&boundary.pathId===a.path_id&&boundary.rank===a.rank&&boundary.blockedAt===4
  ?{status:'PASS',verdict:'NOT_ACQUIRABLE_AT_N1',evidence:'high-rank-access.json'}
  :null;
 const witness=batchCurrent&&batch.witnesses[a.id];
 if(witness){
  checks.acquisition={status:'PASS',evidence:'rank-persistence-batch.json',scope:'Verified canonical acquisition: '+witness.actualId};
  checks.persistence={status:'PASS',evidence:'rank-persistence-batch.json',scope:'Forge save and reopen, native sheet transfer, vault save and reopen; exact IDs checked'};
 }
 if(criticalCurrent&&a.rank===2&&a.path_id==='classpath:voie-du-maitre-d-armes:class-guerrier:cof2-lb-2024')
  checks.numericEffects={status:'PASS',evidence:'../guerrier-source-n1.json',scope:'COF2 p.89: threshold 19 on the preferred sword; 20 on the dagger and after switching preference to axes.'};
 const choices=finiteChoicesCurrent&&finiteChoices.cases[a.id];
 if(choices?.status==='PASS'&&choices.verified.length&&choices.rejectedOutsideDomain>0)
  checks.choices={status:'PASS',evidence:'finite-choices.json',scope:'Finite scalar options in a legal N1 witness: each value applied and reloaded, out-of-domain value rejected.'};
 const dynamic=dynamicChoicesCurrent&&dynamicChoices.cases[a.id];
 if(dynamic?.status==='PASS'&&dynamic.verified.length&&dynamic.refused.some(row=>row.value==='qa-outside-domain'))
  checks.choices={status:'PASS',evidence:'dynamic-choices.json',scope:'All options offered in a legal N1 witness, rejected duplicates and unknown input, exact grant or racial permission after save and reload.'};
 const multiple=multipleChoicesCurrent&&multipleChoices.cases[a.id];
 if(multiple?.status==='PASS'&&multiple.valid.length&&multiple.refused.length)
  checks.choices={status:'PASS',evidence:'multi-choices.json',scope:'Legal N1 choice witnesses; supported selections projected and reloaded, malformed input and over-limit lists rejected.'};
 const spellCost=standardCostsCurrent&&standardCosts.cases[a.id];
 if(spellCost?.status==='PASS'&&spellCost.standard===a.rank&&spellCost.insufficientManaRejected)
  checks.costs={status:'PASS',evidence:'standard-spell-costs.json',scope:spellCost.upkeep===1?'COF2 pp.111,228: cast, concentration, 1 PM per upkeep round (movement action), insufficient mana and inactive upkeep denied.':'COF2 p.228: standard mana, concentration when available and atomic refusal for insufficient mana, in the shared runtime.'};
 const firstOrigin=originsCurrent&&originProof.firstRanks[a.id];
 const contextualOrigin=originsCurrent&&originProof.abilities[a.id];
 if(firstOrigin?.status==='PASS'&&firstOrigin.verified===10){
  checks.numericEffects={status:'PASS',evidence:'../arquebusier-history-origins.json',scope:'Exact +3 on both source tests at R1–R5, both variants.'};
  checks.permanentEffects={status:'PASS',evidence:'../arquebusier-history-origins.json',scope:'Source-linked persistent skill bonuses present after Forge calculation and save/reopen.'};
 }
 if(contextualOrigin?.status==='PASS'&&contextualOrigin.verified===2*(6-a.rank)*contextualOrigin.situations.length&&
  contextualOrigin.situations.some(item=>Object.values(item.modifiers).some(v=>typeof v==='number'||typeof v==='string'&&/\d/.test(v))))
  checks.numericEffects={status:'PASS',evidence:'../arquebusier-history-origins.json',scope:'All catalogued context resolver situations and their exact modifiers, checked after save/reopen. Interactive actions remain a separate gate.'};
 const profession=professionsCurrent&&professionProof.byAbility[a.id];
 if(profession?.owned===2*(6-a.rank)&&profession.unowned===2*(a.rank-1)&&
  profession.invalidSituation===20&&profession.positiveSituations>0&&
  profession.reopenedSituations===profession.positiveSituations)
  checks.restrictions={status:'PASS',evidence:'../arquebusier-history-professions.json',scope:'Profession resolver: owned ranks accepted in catalogued situations; insufficient rank, missing profession and out-of-range situations denied across both variants.'};
 const round=roundCurrent&&roundProof.cases.find(row=>row.id===a.id);
 if(round?.use&&round.limit&&round.reopen){
  checks.activation={status:'PASS',evidence:'round-power-uses.json',scope:'Owned ability: player records a use in the sheet and cannot record another before reset. Attack/test resolution remains manual.'};
  if(round.roundReset&&round.combatReset)
   checks.deactivation={status:'PASS',evidence:'round-power-uses.json',scope:'Usage counter stays spent on reopening, then clears on a round reset or at the end of combat.'};
  if(round.free&&a.id.startsWith('ability:tour-de-magie-g:'))
   checks.costs={status:'PASS',evidence:'round-power-uses.json',scope:'Tour de magie can be recorded with 0 PM remaining. No PM consumed.'};
 }
 if(roundCurrent&&a.id==='ability:foh81:psionique:voie-du-controle-corporel:r2'&&
  [2,3].every(rank=>roundProof.tranceChecks.some(c=>c.rank===rank&&c.uses===rank))){
  checks.activation={status:'PASS',evidence:'round-power-uses.json',scope:'Records legal trance uses on a transferred sheet through the daily limit at path R2 and R3.'};
  checks.costs={status:'PASS',evidence:'round-power-uses.json',scope:'Each recorded trance debits 2 PM under the Forge conversion.'};
  checks.deactivation={status:'PASS',evidence:'round-power-uses.json',scope:'Daily limit survives reload and the end of combat; full recovery resets it.'};
 }
 if(breathCurrent&&a.id==='ability:drakonide-r2:path:voie-du-drakonide:compagnon-cof2'){
  const scopes={
   choices:'All four elements projected from Forge to the interactive card.',
   activation:'Ownership gated; player activates the limited action and one use is recorded.',
   costs:'Exactly one use consumed; PM, PC and DR unchanged.',
   deactivation:'Use remains spent until a new combat resets the counter.',
   persistence:'Transfer to the interactive sheet and reload preserve the spent use.'
  };
  for(const [key,scope] of Object.entries(scopes))checks[key]={status:'PASS',evidence:'drakonide-breath-dom.json',scope};
 }
 if(isBone&&bone.status==='PASS')for(const k of obligations)checks[k]={status:'PASS',evidence:'bone-armor.json',scope:'N1 mechanical/DOM scope, COF2 LB p109; no PM/action cost or timed spell invented. Physical browser/PDF/shared formula are separate gates.'};
 return {id:a.id,pathId:a.path_id,path:p?.label||p?.name||a.path_id,rank:a.rank,name:a.label,kind,ownerId:p?.classId||p?.people_id||null,source:a.source||null,descriptionSha256:hash(a.desc||''),untrackedByOldAudit:!known.has(a.id)&&kind!=='history',n1Applicability:applicable?'IN_SCOPE':'SPECIAL_ACCESS_REVIEW',reachability,applicabilityBasis:kind==='history'?'Historical ranks 1–5, four venerable PCap, pp170–171':a.rank<=3?'Ordinary N1 + mage/age/grants, advanced rules p153':reachability?'Ordinary acquisition blocked from rank 4; grant and divine routes checked.':'Above ordinary creation cap3. Must review exceptions before exclusion.',classification:isBone?{behavior:'mixte',candidateTypes:['passif contextuel','permanent'],review:'SOURCE_REVIEWED',evidence:'COF2 Livre de base p109, own fabrication and daily 10-minute upkeep'}:classification(a),partialHistoricalNumerics:oldPeople?{evidence:'../lot10/people-source.json',expected:oldPeople.expected,scope:'Exact PV/DEF/INIT/PC/ATM and listed skill/trait assertions; not a complete effects certificate'}:oldArq?{evidence:'../arquebusier-pure-age-ranks.json',scope:'Age/racial derived stats and explicitly named numerical assertions; remaining contexts open'}:null,declaredCatalogueStatus:a.certification?.functionalStatus||null,checks,mechanicallyClosed:applicable&&Object.values(checks).every(x=>x.status==='PASS')};
});
const evidence=[];function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(p===out)continue;if(e.isDirectory())walk(p);else if(e.name.endsWith('.json')){let j;try{j=JSON.parse(fs.readFileSync(p,'utf8'))}catch{continue;}const text=JSON.stringify(j),indexMatch=text.includes(inputs.indexSha256)||text.includes(inputs.indexBlob),componentsMatch=text.includes(inputs.engineSha256)&&text.includes(inputs.databaseSha256);evidence.push({path:path.relative(root,p),reportSha256:hash(fs.readFileSync(p)),dependencyStatus:indexMatch?'EXACT_INDEX_SCOPE_REUSABLE':componentsMatch?'ENGINE_DATABASE_SCOPE_REUSABLE':'DEPENDENCY_REVIEW_REQUIRED',note:'Reuse is limited to actual assertions and tested resources. Sheet flows require matching native/bridge/sheet dependencies; a PASS label alone is insufficient.'});}}}walk(root+'/forge-of-heroes/QA/N1');
const applicable=rows.filter(r=>r.n1Applicability==='IN_SCOPE'),special=rows.filter(r=>r.n1Applicability!=='IN_SCOPE');
const pairTransferPath='forge-of-heroes/QA/N1/lot-2026-11-19/pair-transfer.json';
const pairTransfer=read(pairTransferPath);
const pairKeys=new Set(pairTransfer.pairs.map(pair=>JSON.stringify(pair)));
const pairTransferCurrent=pairTransfer.status==='PASS'&&
 pairTransfer.inputs.indexSha256===inputs.indexSha256&&pairTransfer.inputs.nativeSha256===inputs.nativeSha256&&
 pairTransfer.inputs.runnerSha256===hash(fs.readFileSync(root+'/fiches-personnages/tests/matrix-transfer.cjs'))&&
 pairTransfer.inputs.librarySha256===hash(fs.readFileSync(root+'/fiches-personnages/library.js'))&&
 pairTransfer.tested===T.classes.length*T.peoples.length&&pairTransfer.pairs.length===pairTransfer.tested&&
 pairKeys.size===pairTransfer.tested&&T.classes.every(profile=>T.peoples.every(people=>pairKeys.has(JSON.stringify([profile.id,people.id]))));
const common=['initialStats','racialStats','derivedStats','resources','attacks','sizeEquipment','prerequisites','rankBudget','ageHistory','stacking','roundingBounds','saveRestore','choiceABA','sourceBundleParity','sharedFormula'],interactions=['peopleProfile','peoplePath','sameProfilePaths','hybrids','noProfile','ageRank','equipmentAbility','racialAbility','twoConditions','historyAbility','choiceReplacement','threeFactorRisks'],integration=['forgeToSheet','importExport','legacyMigration','officialPDF','annexes','desktopBrowser','mobileBrowser','publicParity'];
const extra=[...common.map(id=>({id:'engine:'+id,status:id==='sourceBundleParity'?'PASS':'NON TESTÉ'})),...interactions.map(id=>({id:'interaction:'+id,status:'NON TESTÉ'})),...integration.map(id=>({id:'integration:'+id,status:'NON TESTÉ'}))];
if(pairTransferCurrent){
 const scope='468 legal N1 creations, one per people/profile pair; exact characteristics, PV, DEF, INIT, ranks, passive features and skill bonuses in native transfer and vault reopening.';
 for(const gate of extra.filter(g=>['interaction:peopleProfile','integration:forgeToSheet'].includes(g.id))){
  Object.assign(gate,{status:'PASS',evidence:'pair-transfer.json',scope});
 }
}
const pairNumerics=read('forge-of-heroes/QA/N1/lot-2026-11-19/pair-numerics.json');
if(pairNumerics.status==='PASS'&&pairNumerics.inputs['index.html']===inputs.indexSha256&&
 pairNumerics.runnerSha256===hash(fs.readFileSync(root+'/forge-of-heroes/FINAL_FREEZE_TESTS/n1_pair_numeric_oracle.cjs'))&&
 pairNumerics.failures.length===0&&pairNumerics.counts['no-profile']===3570&&pairNumerics.counts.expectedShieldRefusals===60&&
 pairNumerics.counts.standard===110&&pairNumerics.counts['standard-mage-r2']===120){
 const scopes={
  'interaction:noProfile':'3,570 distinct pair cases across 85 main paths, with 60 source-expected shield refusals; exact baseline numeric interaction checks.',
  'interaction:sameProfilePaths':'230 same-profile cases across 85 main paths, including both R2 choices for mages; exact baseline numeric interaction checks.'
 };
 for(const gate of extra.filter(g=>Object.hasOwn(scopes,g.id))){
  Object.assign(gate,{status:'PASS',evidence:'pair-numerics.json',scope:scopes[gate.id]});
 }
}
const methods=read('forge-of-heroes/QA/N1/lot2/characteristic-methods.json');
if(methods.status==='PASS'&&methods.indexSha256===inputs.indexSha256&&methods.engineSha256===inputs.engineSha256&&
 methods.counts.pointBuy===6**7&&methods.counts.classicCreations===2940&&
 methods.counts.semiTriples===11**3&&methods.counts.balancedLowCreations===64){
 Object.assign(extra.find(g=>g.id==='engine:initialStats'),{status:'PASS',
  evidence:'../lot2/characteristic-methods.json',
  scope:'All finite point-buy ledgers, all allocations of the three standard series and all semirandom dice triples; legal and rejected inputs asserted against an independent source oracle.'});
}
const ancestryStats=read('forge-of-heroes/QA/N1/lot-2026-11-19/ancestry-stats.json');
const ancestryPeople=new Set(ancestryStats.cases.map(c=>c.people));
if(ancestryStats.status==='PASS'&&ancestryStats.indexSha256===inputs.indexSha256&&
 ancestryStats.runnerSha256===hash(fs.readFileSync(root+'/forge-of-heroes/FINAL_FREEZE_TESTS/n1_ancestry_stat_gate.cjs'))&&
 ancestryStats.fixtureSha256===hash(fs.readFileSync(root+'/forge-of-heroes/FINAL_FREEZE_TESTS/n1_batch_rank_persistence.cjs'))&&
 ancestryStats.cases.length===54&&T.peoples.every(people=>ancestryPeople.has(people.id))){
 Object.assign(extra.find(g=>g.id==='engine:racialStats'),{status:'PASS',
  evidence:'ancestry-stats.json',
  scope:'54 legal ancestry modifier combinations across all 26 peoples; all characteristics compared to the catalogued rules, before and after reopening.'});
}
// Partial R4/R5 rows each contribute one mandatory reachability review, not ten
// fabricated gameplay requirements. An exception expands its ten obligations.
const specialReviewed=special.filter(row=>row.reachability?.status==='PASS').length;
const passed=specialReviewed+applicable.reduce((n,r)=>n+Object.values(r.checks).filter(c=>c.status==='PASS').length,0)+extra.filter(c=>c.status==='PASS').length,total=applicable.length*obligations.length+special.length+extra.length;
const summary={catalogue:{peoples:T.peoples.length,profiles:T.classes.length,profilePaths:T.paths_class.length,peoplePaths:T.paths_people.length,historyPaths:T.history_paths.length,referencePrestigeRanks:T.abilities_prestige.length},inventoriedRules:rows.length,applicableRules:applicable.length,specialAccessReviews:special.length,specialAccessReviewed:specialReviewed,mechanicallyClosedRules:rows.filter(x=>x.mechanicallyClosed).length,fullyCertifiedRules:0,criteriaPassed:passed,criteriaTotal:total,percent:Math.round(passed/total*10000)/100,profilesCertified:0,peoplesCertified:0,certified:false,denominatorPolicy:'451 ordinary N1 candidate ranks × 10 obligations + 244 exceptional-reachability reviews + 35 engine/interaction/integration gates. Each review discovering an N1 exception adds its 10 obligations; historical witness mapping may credit existing proofs. This first reconciliation is a documented lower bound, not an estimated failure rate.',reuseCandidates:evidence.filter(e=>e.dependencyStatus!=='DEPENDENCY_REVIEW_REQUIRED').length};
const report={schema:'FOH_N1_CERTIFICATION_REGISTER_V1',generatedAt:new Date().toISOString(),inputs,summary,obligations,rows,extra,evidence,untracked:{total:rows.filter(x=>x.untrackedByOldAudit).length,arbaletrier:25,peopleExtensions:60,acquisitionCounts:acq.counts},blockers:[{id:'shared-effects',status:'BLOQUÉ',detail:'Bone/other conditional formulas still duplicated between creation and sheet; shared engine integration not certified.'},{id:'browser',status:'BLOQUÉ',detail:'Local Chromium launch: socket() Operation not permitted. JSDOM is not browser or phone evidence.'},{id:'historical-mapping',status:'NON TESTÉ',detail:'Map exact dependency-matched historical assertions to per-rule obligations before increasing certification.'},{id:'source-exceptions',status:specialReviewed===special.length?'PASS':'NON TESTÉ',detail:specialReviewed+' / '+special.length+' R4/R5 reviews verified; conditional classifications remain separate.'}],nextAction:'Contrôler les effets, choix et coûts des rangs par familles de règles ; élargir les recettes d’annexes PDF.',tracks:{A:'Global N1 certification remains OPEN',B:'Individually verified N2/N3/N4 progression allowed; no global N1 gate and no automatic player choice'}};
fs.writeFileSync(out+'/coverage-register.json',JSON.stringify(report,null,2)+'\n');
const grouped=Object.entries(Object.groupBy(rows.filter(r=>r.untrackedByOldAudit),r=>r.pathId)).map(([pathId,rs])=>({pathId,ranks:rs.map(r=>({id:r.id,rank:r.rank,name:r.name,applicability:r.n1Applicability,types:r.classification.candidateTypes,acquisition:acq.cases.find(c=>c.id===r.id)?.status}))}));fs.writeFileSync(out+'/85-ranks.json',JSON.stringify({inputs,groups:grouped},null,2)+'\n');
const item=(p,kind)=>{const own=applicable.filter(r=>kind==='profile'?r.ownerId===p.id:(T.paths_people.filter(x=>x.people_id===p.id||x.allowedPeopleIds?.includes(p.id)).some(x=>x.id===r.pathId))),pass=own.reduce((n,r)=>n+Object.values(r.checks).filter(c=>c.status==='PASS').length,0);return{id:p.id,name:p.label||p.name,total:own.length*10,passed:pass,percent:own.length?Math.round(pass/(own.length*10)*10000)/100:0,certified:false,ruleCount:own.length,checks:[],scope:'Per-rule proof mapping in progress; shared and integration gates additionally required'};};
const dashboard={schema:'FOH_N1_RECONCILED_SUMMARY_V1',generatedAt:report.generatedAt,inputs,summary,profiles:T.classes.map(p=>item(p,'profile')),peoples:T.peoples.map(p=>item(p,'people')),nextAction:report.nextAction,blockers:report.blockers,tracks:report.tracks,evidencePath:'../../forge-of-heroes/QA/N1/lot-2026-11-19/coverage-register.json'};
for(const name of ['focus','progress','purs']){const p=root+'/centre-synchronisation/forge-n1/'+name+'.json',j=JSON.parse(fs.readFileSync(p,'utf8'));j.reconciliation=dashboard;j.legacyStatus='HISTORICAL_DETAIL_RETAINED_NOT_CURRENT_CERTIFICATE';fs.writeFileSync(p,JSON.stringify(j,null,name==='purs'?0:2)+'\n');}
const gp=root+'/centre-synchronisation/data/forge-global-progress.json',g=JSON.parse(fs.readFileSync(gp,'utf8'));g.n1Certification=dashboard;fs.writeFileSync(gp,JSON.stringify(g,null,2)+'\n');
console.log(JSON.stringify(summary));
