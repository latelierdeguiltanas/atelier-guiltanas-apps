'use strict';
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
const F=require('./forge_product_runner');
const API=require('../ENGINE/history_context_n1');
const root=path.resolve(__dirname,'..');
const {html,db,engine:E}=F.load(root+'/index.html');
const expected={
 campaigns:[{skillBonus:5},{attackBonus:1},{extraTravelKm:2,armorPenaltyDivisor:2},{extraDamage:'1d4°'}],
 cities:[{skillBonus:3},{ignoreCrowdSlowdown:true},{skillBonus:5},{extraTemporaryDamage:'1d4°'}],
 deserts:[{perceptionDifficulty:10},{damageReduction:3},{automaticShelter:true},{extraDamage:'1d4°'}],
 forests:[{selfForage:true,forageThreshold:10,forageInterval:5},{extraDamage:'1d4°'},{normalTravelSpeed:true},{movementMultiplier:0.5,ignoreClimbAndBalanceTests:true}],
 caves:[{directWayToSurface:true},{attackBonus:2},{ignoreUnseenMeleePenalty:true},{extraDamage:'1d4°'}],
 marshes:[{skillBonus:3},{effectiveFog:'Aucun brouillard'},{damageReduction:3},{extraDamage:'1d4°'}],
 mountains:[{skillBonus:3},{damageReduction:3},{attackBonus:2,defenseBonus:2},{defenseBonus:2,extraDamage:'1d4°'}],
 plains:[{attackBonus:1},{skillBonus:5},{freeRangedAttack:true},{extraDamage:'1d4°'}],
 shores:[{selfForage:true,forageThreshold:10,forageInterval:5},{ignoreWaterCombatPenalty:true},{direction:'Terre la plus proche'},{extraDamage:'1d4°'}]
};
const otherScenarios=[
 ['deserts',2,1,{perceptionDifficulty:15}],['deserts',2,2,{perceptionDifficulty:20}],
 ['caves',2,2,{darkvisionMultiplier:2}],['caves',4,1,{torchDamage:'1d6 + AGI'}],
 ['caves',4,2,{enemyMeleePenalty:-1}],['caves',4,3,{enemyMeleePenalty:-2}],
 ['mountains',2,1,{damageDivisor:2}],['plains',3,1,{rangeBonusMeters:10}],
 ['cities',2,1,{skillBonus:3}],['cities',3,1,{attackBonus:2,defenseBonus:2}],['cities',4,1,{skillBonus:5}],
 ['forests',4,1,{defenseBonus:2}],['caves',2,1,{dimLightAsDay:true}],
 ['marshes',3,1,{effectiveFog:'Brouillard léger'}],['marshes',3,2,{automaticEscape:true}],
 ['plains',2,1,{freeAction:true}],['shores',4,1,{direction:'Étendue d’eau la plus proche'}]
];
assert.equal(otherScenarios.length+36,53);
const id=(origin,rank)=>'ability:history:'+origin+':r'+rank;
const report={status:'PASS',source:'Voies d’historique COF2 pp.172–175',indexSha256:createHash('sha256').update(html).digest('hex'),cases:0,positive:0,additionalSituations:0,negative:0,reopened:0,matrix:{}};
for(const variant of ['arquebusier','arbaletrier']){
 const cls=db.tables.classes.find(c=>c.id.includes('class:'+variant+':'));
 const profilePath=db.tables.paths_class.find(p=>p.classId===cls.id&&p.id.includes('artilleur'));
 for(const [origin,rankEffects] of Object.entries(expected))for(let rank=1;rank<=5;rank++){
  const draft=F.standardState(db,cls.id,profilePath.id);
  draft.voies.profilePathIds=[profilePath.id];
  draft.advancedRules.histories=true;
  draft.history={geographicPathId:'history:'+origin,professionalPathId:'history:nomad',humanProfession:'Charpentier'};
  if(rank>1){
   draft.advancedRules.age=true;
   draft.age={categoryId:'venerable',spending:[...Array.from({length:rank-1},(_,i)=>({pathId:'history:'+origin,rank:i+2})),...Array.from({length:5-rank},(_,i)=>({pathId:'history:nomad',rank:i+2}))]};
  }
  const computed=E.computeCharacterN1(draft);
  assert.equal(computed.errors.length,0,variant+' '+origin+' R'+rank+' '+computed.errors.join(' | '));
  const character=computed.sticky.characterState,before=JSON.stringify(character);
  const saved=E.createHeroSavePayload(draft,character,{id:'origin-'+origin});
  const reopened=E.computeCharacterN1(E.restoreHeroSavePayload(JSON.parse(JSON.stringify(saved))).draft);
  assert.equal(reopened.errors.length,0);
  for(const [index,modifiers] of rankEffects.entries()){
   const abilityRank=index+2,key=id(origin,abilityRank);
   const source=db.tables.history_abilities.find(a=>a.id===key);
   assert.equal(API.rules[key].page,source.source.printedPage);
   assert.equal(API.available(character).includes(key),abilityRank<=rank);
   if(abilityRank<=rank){
    const resolved=API.resolve(character,key,{situation:0});
    assert(resolved.applies);
    assert.deepEqual(resolved.modifiers,modifiers);
    assert.deepEqual(API.resolve(reopened.sticky.characterState,key,{situation:0}),resolved);
    report.positive++;
   }else assert.deepEqual(API.resolve(character,key,{situation:0}).modifiers,{});
   for(const context of [{},{situation:-1},{situation:99},{situation:'0'}]){
    assert(!API.resolve(character,key,context).applies);
    report.negative++;
   }
  }
  for(const [key,abilityRank,situation,modifiers] of otherScenarios){
   if(key===origin&&abilityRank<=rank){
    const resolved=API.resolve(character,id(key,abilityRank),{situation});
    assert(resolved.applies);
    assert.deepEqual(resolved.modifiers,modifiers);
    assert.deepEqual(API.resolve(reopened.sticky.characterState,id(key,abilityRank),{situation}),resolved);
    report.additionalSituations++;
   }
  }
  assert.equal(JSON.stringify(character),before);
  report.matrix[variant]??={};
  report.matrix[variant][origin]=(report.matrix[variant][origin]||0)+1;
  report.cases++;
  report.reopened++;
 }
}
assert.equal(report.cases,90);
assert.equal(report.additionalSituations,2*otherScenarios.reduce((sum,[,rank])=>sum+6-rank,0));
fs.writeFileSync(root+'/QA/N1/arquebusier-history-origins.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));
