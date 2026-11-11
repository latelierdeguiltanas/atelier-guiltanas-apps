'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
const {load,standardState}=require('./forge_product_runner');
const {expandedJobs,pathIds}=require('./n1_barbare_coverage.cjs');
const root=path.resolve(__dirname,'..');
const {db,engine}=load(path.join(root,'index.html'));
const hash=file=>createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const cases=[];
const rankChecks=new Set();
const rankTests={pagne:'course',pourfendeur:'AGI:esquive',primitif:'survie',rage:'VOL:résister_peur'};

for(const job of expandedJobs){
 const profileId='class:barbare:cof2-lb-2024',peopleId='people:'+job.people+':cof2-lb-2024';
 const classPath=key=>'classpath:'+pathIds[key]+':class-barbare:cof2-lb-2024';
 const primary=classPath(job.primary),secondary=classPath(job.secondary);
 const draft=standardState(db,profileId,primary,peopleId);
 const rules=db.tables.peoples.find(p=>p.id===peopleId).schema;
 draft.baseCaracs=Object.fromEntries(['for','agi','con','per','int','vol','cha'].map((key,index)=>[key,job.stats[index]]));
 if(rules.type==='special')draft.peupleChoices.humainStat='con';
 else for(const [key,rule] of [['bonusStat',rules.bonus],['malusStat',rules.malus]]){
  delete draft.peupleChoices[key];
  if(rule?.mode==='choice')draft.peupleChoices[key]=rule.options[job.optionIndex%rule.options.length];
 }
 if(job.people==='demi-elfe'){
  const allowed=db.tables.paths_people.filter(p=>['humain','elfe-haut','elfe-sylvain'].includes(p.people_id?.split(':')[1]));
  draft.voies.peoplePathId=allowed[job.optionIndex%allowed.length].id;
 }
 const ranks=job.age==='venerable'?[3,2]:job.age==='mature'?[2,2]:[1,1];
 const selected=[primary,secondary];
 draft.voies.profilePathIds=selected;
 draft.advancedRules.age=true;
 draft.age={categoryId:job.age,spending:selected.flatMap((pathId,i)=>Array.from({length:ranks[i]-1},(_,r)=>({pathId,rank:r+2})))};
 if(job.resource)draft.age.choice=job.resource;
 if(['gnome','halfelin','nain'].includes(job.people)){
  draft.equip.gmApprovedSwap=true;
  draft.equip.weaponIds[0]='weapon:axe';
 }
 for(const a of engine.previewAcquiredAbilities(draft))for(const choice of engine.getPersistentChoicesForAbility(draft,a.id)){
  if(choice.options?.length)(draft.abilityChoices[a.id]??={})[choice.id]=choice.options[0].id;
 }
 const result=engine.computeCharacterN1(draft);
 const label=job.people+' / '+job.age;
 assert.equal(result.errors.length,0,label+' '+Array.from(result.errors).join(' | '));
 const state=result.sticky.characterState;
 for(const [i,id] of selected.entries())assert.equal(state.paths.find(p=>p.pathId===id)?.rank,ranks[i],label);
 for(const [i,key] of [job.primary,job.secondary].entries()){
  const test=rankTests[key];
  if(!test)continue;
  const bonus=result.sticky.skillBonuses.filter(row=>row.sourceAbilityId.includes(selected[i])&&row.tests.includes(test));
  assert.equal(bonus.length,1,label+' '+test);
  assert.equal(bonus[0].value,ranks[i]+2,label+' '+test);
  rankChecks.add(key+' / '+ranks[i]);
 }
 const payload=engine.createHeroSavePayload(draft,state,{id:'barbare-lot'});
 const restored=engine.restoreHeroSavePayload(JSON.parse(JSON.stringify(payload))).draft;
 const reopened=engine.computeCharacterN1(restored);
 assert.equal(reopened.errors.length,0,label+' réouverture');
 assert.equal(JSON.stringify(reopened.sticky.characterState.derived),JSON.stringify(state.derived),label);
 assert.equal(JSON.stringify(reopened.sticky.attacks),JSON.stringify(result.sticky.attacks),label);
 cases.push({people:job.people,age:job.age,paths:job.primary+' / '+job.secondary,ranks,status:'PASS'});
}
assert.equal(rankChecks.size,12);
const report={
 status:'PASS',
 scope:'Création, acquisitions, sauvegarde et réouverture dans le moteur Forge N1. Parcours au clic vérifiés séparément.',
 indexSha256:hash(path.join(root,'index.html')),
 planSha256:hash(path.join(__dirname,'n1_barbare_coverage.cjs')),
 cases,
 rankChecks:[...rankChecks].sort()
};
fs.writeFileSync(path.join(root,'QA/N1/barbare-peuples-moteur.json'),JSON.stringify(report,null,2)+'\n');
console.log('PASS '+cases.length+' combinaisons peuple et âge, rangs de voie, sauvegarde, réouverture et attaques.');
