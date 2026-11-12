'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
const {load,standardState}=require('./forge_product_runner');
const root=path.resolve(__dirname,'..');
const {db,engine,html}=load(process.env.FOH_BARDE_INDEX||path.join(root,'index.html'));
const profile='class:barde:cof2-lb-2024';
const pathId=name=>'classpath:voie-'+name+':class-barde:cof2-lb-2024';
const armor=db.tables.armors.find(a=>/cuir simple/i.test(a.label||a.name)).id;

function project(first,second,armorId='',primaryRank=2){
 const selected=[first,second].map(pathId);
 const draft=standardState(db,profile,selected[0]);
 draft.baseCaracs={for:0,agi:2,con:1,per:0,int:-1,vol:1,cha:3};
 draft.peupleChoices={humainStat:'int'};
 draft.voies.profilePathIds=selected;
 draft.advancedRules.age=true;
 const spending=selected.map(pathId=>({pathId,rank:2}));
 if(primaryRank===3)spending.splice(1,0,{pathId:selected[0],rank:3});
 draft.age={categoryId:primaryRank===3?'venerable':'mature',spending};
 draft.equip={...draft.equip,armorId,gmApprovedSwap:true};
 const {sticky,errors}=engine.computeCharacterN1(draft);
 assert.equal(errors.length,0,Array.from(errors).join(' | '));
 for(const [i,id] of selected.entries())assert.equal(sticky.characterState.paths.find(p=>p.pathId===id)?.rank,i===0?primaryRank:2);
 return sticky;
}

const skill=(s,id)=>s.skillBonuses.find(b=>b.sourceAbilityId?.startsWith('ability:'+id+':'));
const checks=[];
function check(name,run){
 try{run();checks.push({name,status:'PASS'})}
 catch(error){checks.push({name,status:'FAIL',error:error.message})}
}
check('Escrime · Précision sur la rapière et la dague au contact',()=>{
 const s=project('de-l-escrime','du-vagabond');
 for(const weaponId of ['weapon:rapier','weapon:dagger']){
  const a=s.attacks.find(x=>x.weaponId===weaponId&&x.type==='contact');
  assert.equal(a.attackCharacteristic,'agi');
  assert.equal(a.attackBonus,2);
  assert.equal(a.damageCharacteristic,'for');
 }
});
check('Musicien · PM, coûts et bonus de chant au rang 2',()=>{
 const s=project('du-musicien','du-vagabond');
 assert.equal(s.PM,3);
 for(const [slug,cost] of [['chant-des-heros-l',1],['chant-de-reconfort-l',2]]){
  assert.equal(s.abilityRuntimeCatalog.find(a=>a.id.startsWith('ability:'+slug+':'))?.manaCost,cost);
 }
 assert.equal(skill(s,'chant-des-heros-l')?.value,4);
});
check('Saltimbanque · DEF, initiative et acrobaties',()=>{
 const s=project('du-saltimbanque','du-vagabond');
 assert.equal(s.DEF,12);
 assert.equal(s.INIT,13);
 assert.equal(skill(s,'acrobate')?.value,4);
});
check('Séduction · plafond de Dentelles avec et sans armure',()=>{
 assert.equal(project('de-la-seduction','du-vagabond').DEF,13);
 assert.equal(project('de-la-seduction','du-vagabond',armor).DEF,13);
 assert.equal(skill(project('de-la-seduction','du-vagabond'),'charmant')?.value,4);
});
check('Vagabond · exception de cumul et bonus de connaissance',()=>{
 const s=project('du-vagabond','de-l-escrime'),e=skill(s,'eclectique');
 assert.equal(e?.value,1);
 assert.equal(e?.stacking,'max_only');
 assert.equal(e?.exception,'people_path_rank1');
 assert.equal(skill(s,'rumeurs-et-legendes')?.value,4);
});
check('Saltimbanque · danse, mime et jonglerie aux rangs 2 et 3',()=>{
 for(const rank of [2,3]){
  const bonus=skill(project('du-saltimbanque','du-vagabond','',rank),'grace-feline');
  assert.equal(bonus?.value,rank+2);
  assert.deepEqual(Array.from(bonus.tests),['dance','mime','juggling']);
 }
});

const report={status:checks.every(c=>c.status==='PASS')?'PASS':'PARTIEL',source:'COF2 Livre de base, p. 66 à 69',
 indexSha256:createHash('sha256').update(html).digest('hex'),
 scope:'Cinq voies de Barde pur N1, rangs 1–2 et Grâce féline au rang 3. Valeurs attendues issues du livre. Combat et export vérifiés séparément.',
 checks};
fs.writeFileSync(process.env.FOH_BARDE_REPORT||path.join(root,'QA/N1/barde-source-n1.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
if(report.status!=='PASS')process.exitCode=1;
