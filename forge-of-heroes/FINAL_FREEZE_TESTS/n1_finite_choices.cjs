'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {load}=require('./forge_product_runner');
const {make}=require('./n1_batch_rank_persistence.cjs');
const root=path.resolve(__dirname,'..');
const {db,engine,html}=load(),T=db.tables,profiles=new Map(T.paths_class.map(p=>[p.id,p])),peoples=new Map(T.paths_people.map(p=>[p.id,p])),histories=new Map(T.history_paths.map(p=>[p.id,p]));
const copy=x=>JSON.parse(JSON.stringify(x));
const sha=x=>createHash('sha256').update(x).digest('hex');
const cases={};
const staticTypes=new Set(['enum','boolean','preferred_weapon_category']);
for(const a of [...T.abilities_class,...T.abilities_people,...T.history_abilities].filter(a=>a.rank<=3||histories.has(a.path_id))){
 const neutral=engine.getPersistentChoicesForAbility({},a.id);
 if(!neutral.length||neutral.some(c=>!staticTypes.has(c.type)))continue;
 const base=make(profiles.get(a.path_id)||peoples.get(a.path_id)||histories.get(a.path_id),profiles.has(a.path_id)?'profile':peoples.has(a.path_id)?'people':'history',a.rank);
 const definitions=engine.getPersistentChoicesForAbility(base,a.id);
 const verified=[];
 assert(definitions.length>0,a.id);
 for(const c of definitions){
  const values=c.type==='boolean'?[false,true]:c.options.map(o=>o.id);
  assert(values.length>0,a.id+' : domaine vide');
  for(const value of [...values,'qa-outside-domain']){
   const state=copy(base);(state.abilityChoices[a.id]||={})[c.id]=value;
   if(c.id==='preferredWeaponCategory')state.profileChoices[c.id]=value;
   const result=engine.computeCharacterN1(state);
   if(value==='qa-outside-domain'){
    assert(result.errors.length>0,a.id+' accepte une valeur hors domaine pour '+c.id);
    continue;
   }
   assert.equal(result.errors.length,0,a.id+' / '+c.id+' / '+value+': '+result.errors.join(' | '));
   assert(result.sticky.acquiredAbilities.some(row=>row.id===a.id),a.id);
   const actual=result.sticky.persistentChoices?.[a.id]?.[c.id];
   assert.equal(actual,value,a.id+' : valeur projetée');
   const save=engine.createHeroSavePayload(state,result.sticky.characterState,{id:'choice-witness'});
   const back=engine.computeCharacterN1(engine.restoreHeroSavePayload(copy(save)).draft);
   assert.equal(back.errors.length,0,a.id+': '+back.errors.join(' | '));
   assert.equal(back.sticky.persistentChoices?.[a.id]?.[c.id],value,a.id+' : valeur rechargée');
   verified.push([c.id,value]);
  }
 }
 cases[a.id]={status:'PASS',label:a.label,verified,rejectedOutsideDomain:definitions.length};
}

const report={
 schema:'FOH_N1_FINITE_CHOICES_V1',
 inputs:{indexSha256:sha(html),runnerSha256:sha(fs.readFileSync(__filename))},
 scope:'All implemented finite scalar values in a legal level-one witness per ability. Checks projection, official save/reopen, and rejection of an out-of-domain input per field. Mixed, dynamic and multiselect choices are excluded.',
 cases
};
const output=process.env.FOH_N1_CHOICE_REPORT||path.join(root,'QA/N1/lot-2026-11-19/finite-choices.json');
fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');
console.log(Object.keys(cases).length+' capacités ; '+Object.values(cases).reduce((n,c)=>n+c.verified.length,0)+' valeurs et relectures vérifiées.');
