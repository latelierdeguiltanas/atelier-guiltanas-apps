'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),{load,standardState}=require('./forge_product_runner');
const root=path.resolve(__dirname,'..'),copy=x=>JSON.parse(JSON.stringify(x));
// Expectations authored from COF2 Livre de base p.86 and Compagnon p.31.
// Same title is not a shared rule: only the knight learns an extra language.
const report={schema:'FOH_N1_EDUCATED_SOURCE',scope:'Two educated abilities: requirements, granted literacy, extra language allowance, active choice projection and save/reload in standard/hybrid/no-profile. Not a global N1 certification.',sources:[{document:'COF2 Livre de base',printedPage:86},{document:'Compagnon COF1, adaptation Forge',printedPage:31}],cases:[],failures:[],inputs:{}};
for(const file of ['index.html','FORGE_OF_HEROES_ATELIER_GUILTANAS_PRODUCT_MASTER.html']){const {db,engine:E,html}=load(root+'/'+file);report.inputs[file]=crypto.createHash('sha256').update(html).digest('hex');
for(const who of ['chevalier','samourai'])for(const mode of ['standard','hybrid','no-profile'])for(const int of [-1,0,3])for(const storage of ['ability','legacy']){
 const edition=who==='chevalier'?'cof2-lb-2024':'addon-compagnon-2024',profile='class:'+who+':'+edition,target='classpath:'+(who==='chevalier'?'voie-de-la-noblesse':'voie-du-dirigeant')+':class-'+who+':'+edition,s=standardState(db,profile,target),neutral='classpath:voie-du-soldat:class-guerrier:cof2-lb-2024';
 s.baseCaracs=int===-1?{for:2,agi:1,con:0,per:1,int:-1,vol:0,cha:3}:int===0?{for:2,agi:1,con:0,per:1,int:0,vol:3,cha:-1}:{for:2,agi:1,con:0,per:1,int:3,vol:0,cha:-1};
 if(mode==='hybrid'){s.voies.profilePathIds=[target,neutral];s.hybrid={enabled:true,gmApproved:true,primaryProfileId:profile,secondaryProfileId:'class:guerrier:cof2-lb-2024',primaryPathId:target,secondaryPathId:neutral};}
 if(mode==='no-profile'){s.voies.profilePathIds=[target,neutral];s.profileMode='NO_PROFILE';s.noProfile={enabled:true,primaryPathId:target,pathIds:s.voies.profilePathIds.slice()};s.equip={weaponIds:[]};}
 const a=E.previewAcquiredAbilities(s).find(a=>a.pathId===target&&a.rank===1),choices=E.getPersistentChoicesForAbility(s,a.id),label=[file,who,mode,int,storage].join(':');
 try{assert.equal(choices.some(c=>c.id==='extraLanguage'),who==='chevalier','source-specific required language choice');
 if(who==='chevalier'){
  const missing=E.computeCharacterN1(s);assert.ok(missing.errors.some(x=>/choix obligatoire|langue supplémentaire/.test(x)),'missing free language must be explained');
  if(storage==='ability')s.abilityChoices[a.id]={extraLanguage:'celestien'};else s.profileChoices.extraLanguage='celestien';
 }else{s.profileChoices.extraLanguage='langue-residuelle-inexistante';}
 const r=E.computeCharacterN1(s);assert.equal(r.errors.length,0,r.errors.join(' | '));const l=r.sticky.languages;
 assert.equal(l.literacy,'literate');assert.deepEqual(copy(l.selected),who==='chevalier'?['celestien']:[]);assert.equal(l.remainingSlots,Math.max(0,int));assert.deepEqual(copy(r.sticky.characterState.languages),copy(l));
 if(who==='chevalier'){const illegal=copy(s);illegal.abilityChoices[a.id]={extraLanguage:'commun'};illegal.profileChoices.extraLanguage='commun';assert.ok(E.computeCharacterN1(illegal).errors.some(x=>/Langues|option illégale/.test(x)));const excess=copy(s);excess.languages={selected:['celestien','sylvestre','runique','draconique','profond']};assert.ok(E.computeCharacterN1(excess).errors.some(x=>/Langues/.test(x)));}
 const save=E.createHeroSavePayload(s,r.sticky.characterState,{id:'educated-source'}),again=E.computeCharacterN1(E.restoreHeroSavePayload(copy(save)).draft);assert.equal(again.errors.length,0);assert.deepEqual(copy(again.sticky.languages),copy(l));
 report.cases.push({label,literacy:l.literacy,selected:copy(l.selected),remainingSlots:l.remainingSlots,status:'PASS'});
 }catch(e){report.failures.push({label,error:e.message,actual:e.actual,expected:e.expected,state:s});}
}}
report.status=report.failures.length?'FAIL':'PASS';fs.writeFileSync(root+'/QA/N1/lot10/educated-languages.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:report.status,cases:report.cases.length,failures:report.failures.map(x=>({label:x.label,error:x.error}))},null,2));if(report.failures.length)process.exitCode=1;
