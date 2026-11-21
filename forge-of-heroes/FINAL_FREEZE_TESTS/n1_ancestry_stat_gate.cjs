'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {load,standardState}=require('./forge_product_runner');
const {fill}=require('./n1_batch_rank_persistence.cjs');
const {db,html,engine}=load();
const sha=data=>crypto.createHash('sha256').update(data).digest('hex');
const keys=['for','agi','con','per','int','vol','cha'];
const profile=db.tables.classes.find(row=>row.id==='class:voleur:cof2-lb-2024');
const cases=[];
for(const people of db.tables.peoples){
 const base=standardState(db,profile.id,null,people.id);
 base.equip={...base.equip,armorId:'',shieldId:'',weaponIds:['weapon:dagger'],gmApprovedSwap:true};
 if(/people:(lutin|fee):/.test(people.id))base.baseCaracs={for:-1,agi:2,con:1,per:1,int:3,vol:0,cha:0};
 const {schema}=people;
 assert(schema,people.id);
 const checks=[];
 if(schema.key==='humain_weakest_plus1'){
  const values=keys.map(key=>base.baseCaracs[key]).sort((a,b)=>a-b);
  for(const key of keys.filter(key=>base.baseCaracs[key]<=values[1])){
   checks.push({choices:{humainStat:key},changes:[[key,1]]});
  }
 }else{
  assert.equal(schema.type,'stat_mods',people.id);
  for(const bonus of schema.bonus.options)for(const malus of schema.malus.options){
   const choices={};
   if(schema.bonus.mode==='choice')choices.bonusStat=bonus;
   if(schema.malus.mode==='choice')choices.malusStat=malus;
   checks.push({choices,changes:[[bonus,schema.bonus.value],[malus,schema.malus.value],...Object.entries(schema.extra||{})]});
  }
 }
 for(const {choices,changes} of checks){
  const state=structuredClone(base);
  delete state.peupleChoices.humainStat;
  delete state.peupleChoices.bonusStat;
  delete state.peupleChoices.malusStat;
  Object.assign(state.peupleChoices,choices);
  const expected={...state.baseCaracs};
  for(const [key,value] of changes)expected[key]+=value;
  fill(state);
  const result=engine.computeCharacterN1(state);
  const label=people.id+' '+JSON.stringify(choices);
  assert.equal(result.errors.length,0,label+' '+result.errors.join(' | '));
  assert.deepEqual({...result.sticky.caracs},expected,label);
  const payload=engine.createHeroSavePayload(state,result.sticky.characterState,{id:'ancestry-stat-qa'});
  const resumed=engine.computeCharacterN1(engine.restoreHeroSavePayload(structuredClone(payload)).draft);
  assert.equal(resumed.errors.length,0,label);
  assert.deepEqual({...resumed.sticky.caracs},expected,label);
  cases.push({people:people.id,choices,expected});
 }
}
const report={schema:'FOH_N1_ANCESTRY_STATS_V1',status:'PASS',indexSha256:sha(html),
 runnerSha256:sha(fs.readFileSync(__filename)),
 fixtureSha256:sha(fs.readFileSync(require.resolve('./n1_batch_rank_persistence.cjs'))),
 scope:'All combinations of configured ancestry modifiers on one legal N1 template per ancestry; expected independently from catalogue. Save/reopen included.',
 cases};
const dest=process.env.FOH_N1_ANCESTRY_STAT_REPORT||path.resolve(__dirname,'../QA/N1/lot-2026-11-19/ancestry-stats.json');
fs.writeFileSync(dest,JSON.stringify(report,null,2)+'\n');
console.log(cases.length+' combinaisons de modificateurs de peuple vérifiées.');
