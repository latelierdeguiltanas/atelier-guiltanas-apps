'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {load,standardState}=require('./forge_product_runner');
const ROOT=path.resolve(__dirname,'..'),cp=x=>JSON.parse(JSON.stringify(x)),results=[],failures=[];
const race='people:demi-elfe:cof2-lb-2024';
const heritageTerms=['voie-de-l-humain','voie-de-l-elfe-haut','voie-de-l-elfe-sylvain'];
for(const file of ['index.html','FORGE_OF_HEROES_ATELIER_GUILTANAS_PRODUCT_MASTER.html']){
 const {db,engine:E,html}=load(path.join(ROOT,file)),T=db.tables,classes=T.classes.filter(x=>x.id.includes('cof2-lb-2024'));
 const heritage=heritageTerms.map(t=>T.paths_people.find(p=>p.id.split(':')[1]===t));
 assert.ok(heritage.every(Boolean),'missing inherited people choices');
 function fill(s){for(let round=0;round<4;round++)for(const a of E.previewAcquiredAbilities(s))for(const c of E.getPersistentChoicesForAbility(s,a.id)){
 const b=s.abilityChoices[a.id]||(s.abilityChoices[a.id]={});
 if(c.id==='forestChildAbility'){const other=T.abilities_class.find(x=>x.rank===1&&x.path_id.includes('voie-des-animaux'));if(!other)throw Error('animal gift missing');b[c.id]=other.id;}
 if(c.id==='preferredWeaponCategory'){s.profileChoices[c.id]||='swords';b[c.id]??='swords';}
 else if(c.id==='extraLanguage'){s.profileChoices[c.id]||='celestien';b[c.id]??='celestien';}
 else if(b[c.id]==null){if(c.type==='boolean')b[c.id]=false;else if(c.type==='entity')b[c.id]={type:'animal',species:'chat',name:'Contrôle'};else if(c.type==='weapon_multi')b[c.id]=c.options.slice(0,Math.max(1,c.min||1)).map(x=>x.id);else if(c.options?.length)b[c.id]=c.options[0].id;}
 }return s;}
 for(const profile of classes)for(const inherited of heritage)for(const bonusStat of ['per','cha'])for(const malusStat of ['for','con'])for(const age of ['young','mature']){
  const tag=[file,profile.id.split(':')[1],inherited.id.split(':')[1],bonusStat,malusStat,age].join('|');
  try{
    const s=standardState(db,profile.id,undefined,race);
    s.peupleChoices={bonusStat,malusStat};s.voies.peoplePathId=inherited.id;
    // Keep the official starting package: removing a shield or forcing a dagger creates illegal fixtures.
    if(age==='mature'){s.advancedRules.age=true;s.age={categoryId:'mature',spending:[{pathId:inherited.id,rank:2},{pathId:s.voies.profilePathIds[profile.familleId==='mage'?1:0],rank:2}]};}
    fill(s);
    const before=JSON.stringify(s),r=E.computeCharacterN1(s);
    assert.deepEqual([...r.errors],[],tag+' '+r.errors.join('; '));
    assert.equal(JSON.stringify(s),before,'mutable input');
    const want={...s.baseCaracs};want[bonusStat]++;want[malusStat]--;if(age==='mature')want.agi--;
    assert.deepEqual(cp(r.sticky.caracs),want,tag+' stat adjustments, COF2 p46 + avancées p153');
    const rank=age==='mature'?2:1;
    assert.ok(r.sticky.acquiredAbilities.some(x=>x.pathId===inherited.id&&x.rank===rank),'inherited ability missing');
    const saved=E.createHeroSavePayload(s,r.sticky.characterState,{id:'source-demi-elfe'});
    const again=E.computeCharacterN1(E.restoreHeroSavePayload(cp(saved)).draft);
    assert.equal(again.errors.length,0,'restoration errors');
    assert.deepEqual(cp(again.sticky.caracs),want,'restoration stat mismatch');
    assert.ok(again.sticky.acquiredAbilities.some(x=>x.pathId===inherited.id&&x.rank===rank));
    results.push({tag,status:'PASS',rank});
  }catch(e){failures.push({tag,error:e.message});results.push({tag,status:'FAIL'});}
 }
}
const report={schema:'FOH_N1_DEMI_ELFE_SOURCE_R1_R2',generatedAt:new Date().toISOString(),source:'COF2 Livre de base p.46; Règles avancées p.153',cases:results.length,passed:results.filter(x=>x.status==='PASS').length,failed:failures.length,failures:failures.slice(0,140),profiles:14,ancestryChoices:3,bonusChoices:2,malusChoices:2,ageModes:2,products:2,scope:'Full 14 official profiles × three inherited people paths × four racial +/- allocations × R1 vs R2 through mature age × two product snapshots, with save/reload. Other ranks/ages, equipment contexts and browser not claimed.'};
fs.writeFileSync(path.join(ROOT,'QA/N1/demi-elfe-source-r1-r2.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({cases:report.cases,passed:report.passed,failed:report.failed,failures:report.failures.slice(0,15)}));
if(report.failed)process.exitCode=1;