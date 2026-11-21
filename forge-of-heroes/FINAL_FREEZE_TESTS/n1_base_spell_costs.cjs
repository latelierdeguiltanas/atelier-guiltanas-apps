'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {load}=require('./forge_product_runner');
const {make}=require('./n1_batch_rank_persistence.cjs');
require('../rules/permanent-rules');
const runtime=require('../rules/ability-runtime');
const {db,engine,html}=load(),tables=db.tables;
const sha=data=>createHash('sha256').update(data).digest('hex');
const powers=tables.abilities_class.filter(a=>a.rank<=3&&a.label.includes('*')&&a.source?.bookId==='cof2-livre-base-2024');
const cases={},exceptions=[];
for(const power of powers){
 const descriptor=runtime.descriptor(power);
 if(descriptor.manaByAction||descriptor.manaByNC||descriptor.manaEscalation||descriptor.upkeep||descriptor.costNotes){
  exceptions.push({id:power.id,label:power.label});
  continue;
 }
 const row=tables.paths_class.find(p=>p.id===power.path_id);
 const result=engine.computeCharacterN1(make(row,'profile',power.rank));
 assert.equal(result.errors.length,0,power.id+': '+result.errors.join(' | '));
 const character=runtime.begin(result.sticky.characterState,db);
 const funded={...character,resources:{...character.resources,mana:{max:20,current:20}}};
 const before=JSON.stringify(funded);
 const options={targetId:'témoin',livingPlant:true,perception:1,ritualMinutesElapsed:30};
 const paid=runtime.use(funded,power.id,db,options);
 assert.equal(20-paid.resources.mana.current,power.rank,power.id);
 const low={...funded,resources:{...funded.resources,mana:{max:20,current:power.rank-1}}};
 const lowBefore=JSON.stringify(low);
 assert.throws(()=>runtime.use(low,power.id,db,options),/mana insuffisants/i,power.id);
 assert.equal(JSON.stringify(low),lowBefore,power.id);
 let concentration=null;
 if(power.label.includes('(A)')){
  const cast=runtime.use(funded,power.id,db,{...options,concentrate:true});
  concentration=Math.max(0,power.rank-2);
  assert.equal(20-cast.resources.mana.current,concentration,power.id+' avec concentration');
 }
 assert.equal(JSON.stringify(funded),before,power.id);
 cases[power.id]={status:'PASS',label:power.label,standard:power.rank,concentration,insufficientManaRejected:true};
}
const report={schema:'FOH_N1_STANDARD_SPELL_COSTS_V1',inputs:{
 indexSha256:sha(html),runtimeSha256:sha(fs.readFileSync(path.resolve(__dirname,'../rules/ability-runtime.js'))),
 runnerSha256:sha(fs.readFileSync(__filename))
},source:'COF2 Livre de base, p. 228',scope:'Normal and concentrated mana, where applicable, in the shared runtime, standard legal N1 witnesses; dedicated variable and upkeep costs excluded.',cases,exceptions};
const output=process.env.FOH_N1_MANA_REPORT||path.resolve(__dirname,'../QA/N1/lot-2026-11-19/standard-spell-costs.json');
fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');
console.log(Object.keys(cases).length+' coûts standards vérifiés, '+exceptions.length+' exception à traiter.');
