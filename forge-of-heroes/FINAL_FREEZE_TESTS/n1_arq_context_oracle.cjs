'use strict';
/* Independent source-derived truth table checked against level-1 venerable
   characters actually generated with FOH engine, not against duplicated
   descriptions. COF2 Livre de base printed p.62-65. */
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),crypto=require('crypto');
const API=require('../ENGINE/arquebusier_context_n1.js');
const root=path.resolve(__dirname,'..');
const ages=JSON.parse(fs.readFileSync(path.join(root,'QA/N1/arquebusier-pure-age-ranks.json'),'utf8'));
const report={schema:'FOH_N1_ARQ_CONTEXT_INDEPENDENT_TEST',at:new Date().toISOString(),engineVersion:API.version,sourceBook:'Chroniques Oubliées Fantasy 2e ed. Livre de base p.62-65',inputSha256:[],cases:[],status:'FAIL',passed:0,failed:0,all15:false};
for(const file of ['index.html','FORGE_OF_HEROES_ATELIER_GUILTANAS_PRODUCT_MASTER.html']){
 const hash=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex');
 report.inputSha256.push({file,sha256:hash});
 assert(ages.products.some(p=>p.file===file&&p.htmlSha256===hash),'Old age/ability proof for '+file);
}
const expected={
 'mecanismes':[
  [{skill:'repair_mechanism'},{skillBonus:5}],
  [{skill:'siege_weapon_attack'},{bonusDie:true}]
 ],
 'arme-a-repetition':[
  [{selectedRepeatingWeapon:true,rankedThreeArquebusierPaths:1},{capacity:6,limitedActionsPerProjectile:1}],
  [{selectedRepeatingWeapon:true,action:'reload',projectilesToReload:3},{totalLimitedActions:3}]
 ],
 'tir-de-barrage-l':[
  [{weaponLoaded:true,rangedAttack:true,targetMovedInZoneBeforeNextTurn:true,attackHit:true},{zoneWidthMeters:20,damageIfVictimChoosesDamage:2}]
 ],
 'tir-de-grenaille-l':[
  [{weaponKind:'powder',weaponLoaded:true,ammunition:'grapeshot'},{area:{shape:'cone',lengthMeters:10,widthMeters:5},damageFraction:0.5,attackRolls:1}],
  [{skill:'artificer'},{skillBonus:5}]
 ],
 'demolition':[
  [{structureTarget:true,preparationRounds:3,chargesRemaining:1},{damageFormula:'3d4° + INT',targetDamageReductionMultiplier:0.5,dailyChargesMax:3}],
  [{blastRadiusTarget:true,preparationRounds:3,chargesRemaining:1},{damageFormula:'2d4°',blastRadiusMeters:2}]
 ],
 'poudre-puissante':[
  [{weaponKind:'powder'},{weaponRangeBonusMeters:10,weaponDamageBonus:1,projectileMagical:true}]
 ],
 'pilier-de-bar':[
  [{attack:'unarmed'},{damageDice:'1d4°',nonLethal:true}],
  [{incomingDamageType:'non_lethal'},{incomingDamageDivisor:2}],
  [{skill:'resist_alcohol'},{skillBonus:5}]
 ],
 'mort-ou-vif-l':[
  [{attackHit:true,attackType:'ranged',targetNC:2,criticalHit:true},{normalWeaponDamage:true,maxConditionChoices:2,weakenRounds:'1d4'}],
  [{attackHit:true,attackType:'melee',targetNC:3},{normalWeaponDamage:true}]
 ],
 'combattant-aguerri':[
  [{},{defenseBonus:1}]
 ],
 'plus-vite-que-son-ombre':[
  [{phase:'initiative_attack',weaponKind:'powder',weaponLoaded:true,weaponHeld:true},{initiativeBonusForShot:5}],
  [{weaponKind:'crossbow',engagedInMelee:true},{removeRangedContactDisadvantage:true}]
 ],
 'ajuster-le-tir':[
  [{previousRangedAttackMiss:true,sameTarget:true,nextShotBeforeEndOfFollowingRound:true},{nextRangedAttackBonus:5}]
 ],
 'tir-double-l':[
  [{twoLoadedOneHandRangedWeapons:true,weaponKind:'crossbow',sameTarget:true},{attackCount:2,attackPenaltyEach:0}],
  [{twoLoadedOneHandRangedWeapons:true,weaponKind:'powder',sameTarget:false},{attackCount:2,attackPenaltyEach:-2}]
 ],
 'joli-coup':[
  [{rangedAttack:true,cover:'partial'},{coverAttackPenalty:0}],
  [{rangedAttack:true,cover:'important'},{coverAttackPenalty:-2}]
 ],
 'defaut-dans-la-cuirasse-a':[
  [{preparedTargetLastRound:true,sameTarget:true,rangedAttack:true,targetAGI:3,targetImmaterial:false},{targetDEF:13,ignoreDamageReduction:true}],
  [{preparedTargetLastRound:true,sameTarget:true,rangedAttack:true,targetAGI:3,targetImmaterial:true},{targetDEF:13,ignoreDamageReduction:false}]
 ],
 'tir-precis':[
  [{rangedAttack:true},{criticalThreshold:19}]
 ]
};
assert.equal(Object.keys(expected).length,15);assert.equal(API.abilities.length,15);
function sample(slug){const abilityKey='ability:'+slug+':';for(const s of ages.samples){
 if(s.file!=='index.html'||s.age!=='venerable')continue;
 const ab=(s.snapshot.characterStateAbilities||[]).find(a=>String(a.id).startsWith(abilityKey)&&String(a.id).includes('class-arquebusier'));
 if(ab&&s.path===ab.pathId){
  return {abilities:s.snapshot.characterStateAbilities,paths:[{pathId:s.path,rank:3}],characteristics:s.snapshot.caracs,profileId:'class:arquebusier:cof2-lb-2024'};
 }
}
throw Error('No real N1 age proof for '+slug)}
for(const [slug,rows]of Object.entries(expected)){
 const character=sample(slug);
 for(const [input,required] of rows){
  const out=API.resolve(character,slug,input),tag=slug+'/'+JSON.stringify(input);
  try{
    assert.equal(out.owned,true,'must come from real acquired ability');
    assert.equal(out.applies,true,'source legal context');
    for(const [key,val]of Object.entries(required))assert.deepEqual(out.modifiers[key],val,'Wrong '+key);
    report.passed++;report.cases.push({tag,status:'PASS',proof:required});
  }catch(e){report.failed++;report.cases.push({tag,status:'FAIL',error:String(e),actual:out});}
 }
 const empty=API.resolve(character,slug,{});
 if(!['combattant-aguerri'].includes(slug)){
  try{assert.equal(empty.applies,false,'Missing context must not trigger '+slug);report.passed++;report.cases.push({tag:slug+'/no-context',status:'PASS'});}
  catch(e){report.failed++;report.cases.push({tag:slug+'/no-context',status:'FAIL',error:String(e),actual:empty});}
 }
 const missing=API.resolve({abilities:[],paths:[]},slug,rows[0][0]);
 try{assert.equal(missing.applies,false,'Unowned ability cannot apply');report.passed++;report.cases.push({tag:slug+'/unowned',status:'PASS'});}
 catch(e){report.failed++;report.cases.push({tag:slug+'/unowned',status:'FAIL',error:String(e)});}
}
report.all15=Object.keys(expected).every(x=>report.cases.some(y=>y.tag.startsWith(x+'/')&&y.status==='PASS'));
report.status=report.failed===0&&report.all15?'PASS':'FAIL';
fs.writeFileSync(path.join(root,'QA/N1/arquebusier-context-canonical.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,passed:report.passed,failed:report.failed,all15:report.all15,errors:report.cases.filter(x=>x.status==='FAIL').slice(0,8)}).slice(0,6600));
if(report.status!=='PASS')process.exitCode=1;
