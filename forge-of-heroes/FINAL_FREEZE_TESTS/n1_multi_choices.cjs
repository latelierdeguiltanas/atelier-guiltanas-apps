'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {load}=require('./forge_product_runner');
const {make}=require('./n1_batch_rank_persistence.cjs');
const {db,engine,html}=load(),T=db.tables;
const sha=x=>createHash('sha256').update(x).digest('hex');
const clone=x=>JSON.parse(JSON.stringify(x));
const cases={};
const candidates=[...T.abilities_class,...T.history_abilities].filter(a=>(a.rank<=3||a.path_id.startsWith('history:'))&&engine.getPersistentChoicesForAbility({},a.id).some(c=>['weapon_multi','enum_multi'].includes(c.type)));
for(const a of candidates){
 const isHistory=a.path_id.startsWith('history:');
 const p=(isHistory?T.history_paths:T.paths_class).find(p=>p.id===a.path_id);
 const state=make(p,isHistory?'history':'profile',a.rank);
 const definitions=engine.getPersistentChoicesForAbility(state,a.id);
 const valid=[],refused=[];
 function check(c,value,reason,base=state){
  const s=clone(base);s.abilityChoices[a.id][c.id]=value;
  const r=engine.computeCharacterN1(s);
  if(reason){
   assert.match(r.errors.join(' | '),reason,a.id+' / '+JSON.stringify(value));
   refused.push({field:c.id,value});
   return;
  }
  assert.equal(r.errors.length,0,a.id+' / '+JSON.stringify(value)+' : '+r.errors.join(' | '));
  assert.deepEqual(clone(r.sticky.persistentChoices[a.id][c.id]),value);
  const save=engine.createHeroSavePayload(s,r.sticky.characterState,{id:'multi-witness'});
  const again=engine.computeCharacterN1(engine.restoreHeroSavePayload(clone(save)).draft);
  assert.equal(again.errors.length,0,a.id+': '+again.errors.join(' | '));
  assert.deepEqual(clone(again.sticky.persistentChoices[a.id][c.id]),value);
  valid.push({field:c.id,value});
 }
 for(const c of definitions){
  if(c.type==='weapon_multi'){
   const selected=state.abilityChoices[a.id][c.id][0];
   check(c,[selected]);
   const two=clone(state);
   two.equip={...two.equip,weaponIds:[selected,selected],gmApprovedSwap:true};
   check(c,[selected,selected],null,two);
   check(c,selected,/sélection d’armes illégale/);
   check(c,[],/choix obligatoire|entre 1 et 2/);
   check(c,[selected,selected,selected],/entre 1 et 2/,two);
   check(c,['qa-unknown-weapon'],/arme non possédée/);
  }else if(c.type==='enum_multi'){
   const options=[...new Set(c.options.map(o=>o.id))];
   for(const value of options)check(c,[value]);
   check(c,'qa-invalid',/sélection multiple illégale|langues/i);
   check(c,['qa-invalid'],/sélection multiple illégale|langues/i);
   const extra=Array.from({length:c.max+1},(_,i)=>options[i%options.length]);
   check(c,extra,/sélection multiple illégale|langues/i);
   check(c,Array.from({length:(c.maxCopies||1)+1},()=>options[0]),/sélection multiple illégale|langues/i);
  }else{
   for(const option of c.options)check(c,option.id);
   check(c,'qa-invalid',/valeur de choix illégale/);
  }
 }
 cases[a.id]={status:'PASS',label:a.label,valid,refused};
}
const report={schema:'FOH_N1_MULTI_CHOICES_V1',inputs:{indexSha256:sha(html),runnerSha256:sha(fs.readFileSync(__filename))},scope:'Legal N1 witnesses: one and two repeating weapons, scalar branches of mixed choices, every singleton in multiselect domains, invalid input structures and limits, save/reopen.',cases};
fs.writeFileSync(process.env.FOH_N1_MULTI_CHOICE_REPORT||path.resolve(__dirname,'../QA/N1/lot-2026-11-19/multi-choices.json'),JSON.stringify(report,null,2)+'\n');
console.log(Object.keys(cases).length+' capacités ; '+Object.values(cases).reduce((n,c)=>n+c.valid.length,0)+' choix sauvegardés ; '+Object.values(cases).reduce((n,c)=>n+c.refused.length,0)+' refus attendus.');
