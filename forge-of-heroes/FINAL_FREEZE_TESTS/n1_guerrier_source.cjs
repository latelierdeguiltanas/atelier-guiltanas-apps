'use strict';

const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {createHash}=require('node:crypto');
const {load,standardState,withRank}=require('./forge_product_runner');
const {db,engine,html}=load();
const profile='class:guerrier:cof2-lb-2024';
const pathId=name=>'classpath:voie-'+name+':class-guerrier:cof2-lb-2024';
const checks=[];

function project(name,partner='du-bouclier'){
 const id=pathId(name),state=standardState(db,profile,id);
 state.voies.profilePathIds[1]=pathId(partner);
 state.profileChoices.preferredWeaponCategory='swords';
 const {sticky,errors}=engine.computeCharacterN1(withRank(db,state,id,2));
 assert.equal(errors.length,0,Array.from(errors).join(' | '));
 return sticky;
}
function check(name,run){
 try{run();checks.push({name,status:'PASS'});}
 catch(error){checks.push({name,status:'FAIL',error:error.message});}
}
function skill(sticky,id,tests,bonus){
 const entry=sticky.skillBonuses.find(x=>x.sourceAbilityId.includes(id));
 assert.deepEqual(Array.from(entry.tests),tests);
 assert.equal(entry.value,bonus);
}
const sword=s=>s.attacks.find(x=>x.weaponId==='weapon:long-sword');
check('Bouclier · éviter la surprise',()=>{
 skill(project('du-bouclier','du-combat'),'proteger-un-allie',['avoid_surprise'],4);
});
check('Combat · initiative, immobilisation et mouvement',()=>{
 const s=project('du-combat'),base=project('du-soldat');
 assert.equal(s.INIT,base.INIT+3);
 skill(s,'vivacite',['avoid_immobilized','avoid_prone'],3);
 assert.equal(s.abilityRuntimeCatalog.find(a=>a.label==='Vivacité').quotas[0].resolvedMax,1);
});
check('Maître d’armes · bonus d’attaque de prédilection',()=>{
 const s=project('du-maitre-d-armes'),base=project('du-soldat');
 assert.equal(sword(s).attackBonus,sword(base).attackBonus+1);
 assert.equal(s.attacks.find(x=>x.weaponId==='weapon:dagger').attackBonus,base.attacks.find(x=>x.weaponId==='weapon:dagger').attackBonus);
});
check('Résistance · PV et effort physique',()=>{
 const s=project('de-la-resistance'),base=project('du-soldat');
 assert.equal(s.PV,base.PV+4);
 skill(s,'robustesse',['physical_effort','natural_heat','natural_cold'],4);
});
check('Soldat · endurance et quotas par round',()=>{
 const s=project('du-soldat');
 skill(s,'teigneux',['alcohol','food_deprivation','sleep_deprivation'],4);
 for(const ability of s.abilityRuntimeCatalog.filter(a=>a.pathId===pathId('du-soldat'))){
  assert.equal(ability.quotas[0].period,'round');
  assert.equal(ability.quotas[0].resolvedMax,1);
 }
});

const report={status:checks.every(c=>c.status==='PASS')?'PASS':'PARTIEL',
 source:'COF2 Livre de base, p. 87–90',
 indexSha256:createHash('sha256').update(html).digest('hex'),
 testSha256:createHash('sha256').update(fs.readFileSync(__filename)).digest('hex'),
 observations:[{ability:'Science du critique',expectedThreshold:19,actualThreshold:sword(project('du-maitre-d-armes')).criticalThreshold}],
 checks};
fs.writeFileSync(path.resolve(__dirname,'../QA/N1/guerrier-source-n1.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));
if(report.status!=='PASS')process.exitCode=1;
