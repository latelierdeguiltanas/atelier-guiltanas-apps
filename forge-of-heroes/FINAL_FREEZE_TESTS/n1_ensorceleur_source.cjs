'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {load,standardState}=require('./forge_product_runner');
const runtime=require('../rules/ability-runtime');
const root=path.resolve(__dirname,'..');
const {db,engine,html}=load();
const profile='class:ensorceleur:cof2-lb-2024';
const pathId=name=>'classpath:voie-'+name+':class-ensorceleur:cof2-lb-2024';
const checks=[];

function project(name,partner='de-l-invocation'){
 const id=pathId(name);
 const state=standardState(db,profile,id);
 state.baseCaracs={for:2,agi:0,con:0,per:1,int:-1,vol:1,cha:3};
 state.voies.profilePathIds[1]=pathId(partner);
 const {sticky,errors}=engine.computeCharacterN1(state);
 assert.equal(errors.length,0,Array.from(errors).join(' | '));
 assert.equal(sticky.characterState.paths.find(p=>p.pathId===id)?.rank,2);
 assert.equal(sticky.PM,sticky.caracs.vol+sticky.spells.length);
 return sticky;
}
function check(name,run){
 try{run();checks.push({name,status:'PASS'});}
 catch(error){checks.push({name,status:'FAIL',error:error.message});}
}
function spells(sticky,name,actions){
 const entries=sticky.abilityRuntimeCatalog.filter(a=>a.pathId===pathId(name));
 assert.deepEqual(Array.from(entries,x=>x.manaCost),[1,2]);
 assert.deepEqual(Array.from(entries,x=>Array.from(x.actions)),actions);
 return entries;
}
function skill(sticky,label,tests){
 const entry=sticky.skillBonuses.find(b=>b.sourceAbilityId.includes(label));
 assert.deepEqual(Array.from(entry.tests),tests);
 assert.equal(entry.value,4);
}

check('Air · DEF, initiative et coût des sorts',()=>{
 const baseline=project('des-illusions'),s=project('de-l-air');
 assert.equal(s.DEF,baseline.DEF+1);
 assert.equal(s.INIT,baseline.INIT+1);
 spells(s,'de-l-air',[['G'],['M']]);
});
check('Divination · DEF, initiative et coût des sorts',()=>{
 const baseline=project('des-illusions'),s=project('de-la-divination');
 assert.equal(s.DEF,baseline.DEF+1);
 assert.equal(s.INIT,baseline.INIT+1);
 spells(s,'de-la-divination',[['L'],['L']]);
});
check('Envoûteur · persuasion, séduction et quota de Sommeil',()=>{
 const s=project('de-l-envouteur');
 skill(s,'injonction',['persuasion','séduction']);
 const [,sleep]=spells(s,'de-l-envouteur',[['A'],['L']]);
 const initial=runtime.begin(s.characterState,db);
 const used=runtime.use(initial,sleep.id,db);
 assert.equal(used.resources.mana.current,initial.resources.mana.current-2);
 assert.throws(()=>runtime.use(used,sleep.id,db),/épuisées/);
 assert.equal(runtime.recover(used,'combat',db).used[sleep.id].combat,undefined);
});
check('Illusions · supercherie, mensonge et coût des sorts',()=>{
 const s=project('des-illusions');
 skill(s,'mirage',['supercherie','mensonge']);
 spells(s,'des-illusions',[['L'],['M']]);
});
check('Invocation · actions, mana et concentration de Choc',()=>{
 const s=project('de-l-invocation','des-illusions');
 const [shock]=spells(s,'de-l-invocation',[['A'],['L']]);
 const initial=runtime.begin(s.characterState,db);
 assert.equal(runtime.use(initial,shock.id,db).resources.mana.current,initial.resources.mana.current-1);
 assert.equal(runtime.use(initial,shock.id,db,{concentrate:true}).resources.mana.current,initial.resources.mana.current);
});

const report={status:checks.every(c=>c.status==='PASS')?'PASS':'PARTIEL',
 source:'COF2 Livre de base, p. 93–96',
 indexSha256:createHash('sha256').update(html).digest('hex'),
 testSha256:createHash('sha256').update(fs.readFileSync(__filename)).digest('hex'),
 scope:'Bonus passifs, actions et coûts N1. Les effets appliqués aux cibles et les durées restent des contrôles en jeu.',checks};
fs.writeFileSync(path.join(root,'QA/N1/ensorceleur-source-n1.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));
if(report.status!=='PASS')process.exitCode=1;
