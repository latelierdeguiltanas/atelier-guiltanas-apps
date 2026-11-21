'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {load}=require('./forge_product_runner');
const {make,fill}=require('./n1_batch_rank_persistence.cjs');
const root=path.resolve(__dirname,'..');
const {db,engine,html}=load(),T=db.tables,paths=[...T.paths_class,...T.paths_people,...T.history_paths];
const copy=x=>JSON.parse(JSON.stringify(x));
const cases={};
const sha=data=>createHash('sha256').update(data).digest('hex');
const types=new Set(['ability_choice','language']);
for(const a of [...T.abilities_class,...T.abilities_people,...T.history_abilities].filter(a=>a.rank<=3||a.path_id.startsWith('history:'))){
 const neutral=engine.getPersistentChoicesForAbility({},a.id);
 if(neutral.length!==1||!types.has(neutral[0].type))continue;
 const base=make(paths.find(p=>p.id===a.path_id),a.path_id.startsWith('classpath:')?'profile':a.path_id.startsWith('history:')?'history':'people',a.rank);
 const c=engine.getPersistentChoicesForAbility(base,a.id)[0];
 const verified=[],refused=[];
 assert(c.options.length>0,a.id);
 const racial=a.mechanics?.effects?.some(e=>e.type==='racial_spell_choice');
 const count=(sticky,value)=>racial
  ?(sticky.permissions?.racialAbilities||[]).filter(x=>x.sourceAbilityId===a.id&&x.id===value).length
  :sticky.acquiredAbilities.filter(x=>x.id===value).length;
 for(const value of [...c.options.map(x=>x.id),'qa-outside-domain']){
  const state=copy(base);
  (state.abilityChoices[a.id]||={})[c.id]=value;
  if(c.type==='language')state.profileChoices[c.id]=value;
  fill(state);
  const result=engine.computeCharacterN1(state);
  if(result.errors.length){
   const reasons=Array.from(result.errors);
   if(value!=='qa-outside-domain'){
    assert(reasons.every(reason=>/capacité déjà (acquise|possédée)/i.test(reason)),a.id+' / '+value+' : '+reasons.join(' | '));
   }
   refused.push({value,reasons});
   continue;
  }

   assert.notEqual(value,'qa-outside-domain');
   assert.equal(result.sticky.persistentChoices?.[a.id]?.[c.id],value);
   if(c.type==='ability_choice')assert.equal(count(result.sticky,value),1);
   const save=engine.createHeroSavePayload(state,result.sticky.characterState,{id:'choice-witness'});
   const back=engine.computeCharacterN1(engine.restoreHeroSavePayload(copy(save)).draft);
   assert.equal(back.errors.length,0);
   assert.equal(back.sticky.persistentChoices?.[a.id]?.[c.id],value);
   if(c.type==='ability_choice')assert.equal(count(back.sticky,value),1);
   verified.push(value);
 }
 assert(verified.length>0,a.id);
 assert(refused.some(row=>row.value==='qa-outside-domain'),a.id);
 cases[a.id]={status:'PASS',label:a.label,choiceId:c.id,racial:!!racial,verified,refused};
}

const report={schema:'FOH_N1_DYNAMIC_CHOICES_V1',inputs:{indexSha256:sha(html),runnerSha256:sha(fs.readFileSync(__filename)),fixtureSha256:sha(fs.readFileSync(require.resolve('./n1_batch_rank_persistence.cjs')))},scope:'Every option offered in one legal witness per choice; ordinary grants or source-linked racial permissions, explicit duplicate and unknown rejection, Forge save/reopen. Other characters, armor contexts and multiselects remain separate.',cases};
const result=process.env.FOH_N1_DYNAMIC_CHOICE_REPORT||path.join(root,'QA/N1/lot-2026-11-19/dynamic-choices.json');
fs.writeFileSync(result,JSON.stringify(report,null,2)+'\n');
console.log(Object.keys(cases).length+' capacités à choix dynamiques ; '+Object.values(cases).reduce((n,c)=>n+c.verified.length,0)+' choix et relectures, '+Object.values(cases).reduce((n,c)=>n+c.refused.length,0)+' refus attendus.');
