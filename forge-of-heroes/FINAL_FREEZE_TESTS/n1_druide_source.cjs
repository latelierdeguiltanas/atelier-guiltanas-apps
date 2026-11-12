'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {load,standardState,withRank}=require('./forge_product_runner');
const root=path.resolve(__dirname,'..');
const {db,engine,html}=load(path.join(root,'index.html'));
const profile='class:druide:cof2-lb-2024';
const pathId=name=>'classpath:voie-'+name+':class-druide:cof2-lb-2024';
const checks=[];

function project(name,partner,context){
 const id=pathId(name);
 const state=standardState(db,profile,id);
 state.voies.profilePathIds[1]=pathId(partner);
 const draft=withRank(db,state,id,2);
 draft.semanticContext=context;
 const {sticky,errors}=engine.computeCharacterN1(draft);
 assert.equal(errors.length,0,Array.from(errors).join(' | '));
 assert.equal(sticky.characterState.paths.find(p=>p.pathId===id)?.rank,2);
 return sticky;
}
function check(name,run){
 try{run();checks.push({name,status:'PASS'});}
 catch(error){checks.push({name,status:'FAIL',error:error.message});}
}
function skill(sticky,id,tests){
 const entry=sticky.skillBonuses.find(b=>b.sourceAbilityId.startsWith('ability:'+id+':'));
 assert.deepEqual(Array.from(entry.tests),tests);
 assert.equal(entry.value,4);
}
function companion(sticky,id,expected){
 const asset=sticky.companions.find(a=>a.companionId==='companion:'+id);
 assert.deepEqual([asset.def,asset.pv,asset.init,asset.attack,asset.damage],expected);
}
function mana(sticky,name,expected){
 assert.deepEqual(Array.from(sticky.abilityRuntimeCatalog.filter(a=>a.pathId===pathId(name)),a=>a.manaCost),expected);
}

check('Animaux · langage, compagnon et défense conditionnelle',()=>{
 const hidden=project('des-animaux','de-la-nature');
 const visible=project('des-animaux','de-la-nature',{familiarVisible:true});
 skill(hidden,'langage-des-animaux',['influence_mammal']);
 companion(hidden,'druid-familiar',[15,2,hidden.INIT,null,null]);
 assert.equal(visible.DEF,hidden.DEF+2);
});
check('Fauve · vitesse et caractéristiques de la panthère',()=>{
 const baseline=project('de-la-nature','des-animaux');
 const sticky=project('du-fauve','des-animaux');
 skill(sticky,'vitesse-du-felin',['run','climb','jump']);
 assert.equal(sticky.DEF,baseline.DEF+1);
 assert.equal(sticky.INIT,baseline.INIT+3);
 companion(sticky,'panther',[15,4,sticky.INIT,sticky.ATK_MAGIC,'1d4+2']);
});
check('Nature · survie et récupération nocturne',()=>{
 skill(project('de-la-nature','des-animaux'),'maitre-de-la-survie',['wilderness_survival','night_recovery']);
});
check('Protecteur · vigilance, discrétion et coûts en mana',()=>{
 const sticky=project('du-protecteur','des-animaux');
 skill(sticky,'baies-magiques',['wilderness_vigilance','wilderness_stealth']);
 mana(sticky,'du-protecteur',[1,2]);
});
check('Végétaux · identification et coûts en mana',()=>{
 const sticky=project('des-vegetaux','des-animaux');
 skill(sticky,'peau-d-ecorce',['identify_plants']);
 mana(sticky,'des-vegetaux',[1,2]);
});

const report={status:checks.every(c=>c.status==='PASS')?'PASS':'PARTIEL',
 source:'COF2 Livre de base, p. 114–117',
 indexSha256:createHash('sha256').update(html).digest('hex'),
 testSha256:createHash('sha256').update(fs.readFileSync(__filename)).digest('hex'),
 scope:'Calculs et coûts des cinq voies du Druide pur N1. Les effets en partie sont suivis séparément.',
 checks};
fs.writeFileSync(path.join(root,'QA/N1/druide-source-n1.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
if(report.status!=='PASS')process.exitCode=1;
