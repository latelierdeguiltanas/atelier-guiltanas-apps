'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {load}=require('./forge_product_runner');
const {make}=require('./n1_batch_rank_persistence.cjs');
const {db,engine,html}=load(),T=db.tables;
const sha=data=>createHash('sha256').update(data).digest('hex');
const copy=state=>JSON.parse(JSON.stringify(state));
const profiles=new Map(T.paths_class.map(row=>[row.id,row]));
const peoples=new Map(T.paths_people.map(row=>[row.id,row]));
const rows=[...T.abilities_class,...T.abilities_people];
const high=rows.filter(a=>a.rank>3);
const cases={};
assert.deepEqual(T.age_rules_advanced.categories.map(age=>[age.id,age.maxCreationRank]),[
 ['very-young',1],['young',1],['mature',2],['venerable',3]
]);
const acquired=result=>Array.from(result.sticky?.acquiredAbilities||[],a=>a.id);
function capped(state,target){
 const result=engine.computeCharacterN1(state);
 assert.deepEqual(Array.from(result.errors),['Dépense PCap : rang supérieur au plafond d’âge.'],target);
 assert(!acquired(result).includes(target),target+' acquis malgré le plafond');
}
for(const row of high){
 const profile=profiles.get(row.path_id),rowPath=profile||peoples.get(row.path_id);
 assert(rowPath,row.id);
 const state=make(rowPath,profile?'profile':'people',3);
 const baseline=engine.computeCharacterN1(state);
 assert.equal(baseline.errors.length,0,row.id+': '+baseline.errors.join(' | '));
 assert(baseline.sticky.acquiredAbilities.some(a=>a.pathId===row.path_id&&a.rank===3),row.id+' sans R3 légal');
 const injected=copy(state);
 // R5 is challenged with the full prerequisite chain, so R4 is the first prohibited acquisition.
 for(let rank=4;rank<=row.rank;rank++)injected.age.spending.push({pathId:row.path_id,rank});
 capped(injected,row.id);
 cases[row.id]={status:'PASS',pathId:row.path_id,rank:row.rank,blockedAt:4};
}
const neutral={equip:{armorId:'',shieldId:''},voies:{profilePathIds:[]},advancedRules:{additionalMagePaths:true}};
const byId=new Map(rows.map(a=>[a.id,a]));
const grants=[];
for(const row of [...rows,...T.abilities_r1_people,...T.history_abilities]){
 const effect=row.mechanics?.effects?.find(e=>['grant_ability_choice','racial_spell_choice'].includes(e.type));
 if(!effect)continue;
 const options=engine.getAvailableAbilityGrantOptions(neutral,row.id);
 assert(options.every(o=>o.rank<=3),row.id);
 assert((effect.allowedRanks||[]).every(rank=>rank<=3),row.id);
 grants.push({id:row.id,allowedRanks:effect.allowedRanks});
}
assert(grants.length>0);
for(const religion of T.religions_n1){
 if(religion.divineRank<=3)continue;
 const divine=byId.get(religion.divineAbilityId);
 assert.equal(divine.rank,religion.divineRank,religion.id);
 const profile=T.paths_class.find(p=>p.classId==='class:pretre:cof2-lb-2024'&&!p.additionalMagePath);
 const state=make(profile,'profile',3);
 state.profileChoices={...state.profileChoices,priestMode:'specialist',deityId:religion.id,replacedPriestPathId:profile.id};
 const ready=engine.computeCharacterN1(state);
 assert.equal(ready.errors.length,0,religion.id+': '+ready.errors.join(' | '));
 assert(!acquired(ready).includes(divine.id));
 for(let rank=4;rank<=divine.rank;rank++)state.age.spending.push({pathId:profile.id,rank});
 capped(state,divine.id);
}
const history=T.history_paths.find(p=>p.id==='history:courtier');
const courtier=make(history,'history',5),valid=engine.computeCharacterN1(courtier);
assert.equal(valid.errors.length,0,valid.errors.join(' | '));
assert(acquired(valid).includes('ability:history:courtier:r5'),'Le plafond ordinaire ne doit pas bloquer le R5 historique');
const report={schema:'FOH_N1_HIGH_RANK_ACCESS_V1',status:'PASS',
 inputs:{indexSha256:sha(html)},
 source:'COF2 règles avancées p.153 (âge de départ variable), Livre de base p.39 (acquisition et prérequis), voies historiques p.170–171.',
 scope:'R4/R5 ordinaires hors création N1 dans le catalogue courant. Base R3 légale par voie, tentative R4 et chaîne R5, bornes des dons, remplacement Linnarré, témoin historique R5.',
 cases,grants,divine:CappedDivine(),historyR5:'PASS'};
function CappedDivine(){
 return T.religions_n1.filter(r=>r.divineRank>3).map(r=>({id:r.id,rank:r.divineRank,blockedAt:4}));
}
const out=process.env.FOH_N1_HIGH_RANK_REPORT||path.resolve(__dirname,'../QA/N1/lot-2026-11-19/high-rank-access.json');
fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');
console.log('PASS '+Object.keys(cases).length+' limites R4/R5, '+grants.length+' règles de dons, Linnarré R4 et Courtier R5 positif.');
