'use strict';

const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {createHash}=require('node:crypto');
const {load,standardState}=require('./forge_product_runner');
const runtime=require('../rules/ability-runtime');
const {db,engine,html}=load();
const profile='class:forgesort:cof2-lb-2024';
const pathId=name=>'classpath:voie-'+name+':class-forgesort:cof2-lb-2024';
const checks=[];

function draft(name){
 const state=standardState(db,profile,pathId(name));
 state.voies.profilePathIds[1]=pathId(name==='des-artefacts'?'des-elixirs':'des-artefacts');
 return state;
}
function project(state){
 const {sticky,errors}=engine.computeCharacterN1(state);
 assert.equal(errors.length,0,Array.from(errors).join(' | '));
 return sticky;
}
function check(name,run){
 try{run();checks.push({name,status:'PASS'});}
 catch(error){checks.push({name,status:'FAIL',error:error.message});}
}
function skill(sticky,id,tests){
 const entry=sticky.skillBonuses.find(x=>x.sourceAbilityId.includes(id));
 assert.deepEqual(Array.from(entry.tests),tests);
 assert.equal(entry.value,4);
}
function abilities(sticky,name){
 return sticky.abilityRuntimeCatalog.filter(x=>x.pathId===pathId(name));
}
check('Artefacts · bâton lié et Ouverture-fermeture',()=>{
 const s=project(draft('des-artefacts'));
 assert.equal(s.attacks.find(x=>x.weaponId==='weapon:iron-staff').damage,'1d4°+3');
 assert.equal(abilities(s,'des-artefacts')[1].manaCost,2);
});
check('Élixirs · alchimie et recettes sans mana',()=>{
 const s=project(draft('des-elixirs'));
 skill(s,'fortifiant',['alchimie','chimie','identifier_potion']);
 assert.deepEqual(Array.from(abilities(s,'des-elixirs'),x=>x.manaCost),[0,0]);
});
check('Métal · forge, choix de l’arme et bonus de feu',()=>{
 const state=draft('du-metal'),s=project(state);
 skill(s,'morsure',['orfevrerie','forge']);
 const [bite,heat]=abilities(s,'du-metal');
 assert.deepEqual([bite.manaCost,heat.manaCost],[1,2]);
 const base=runtime.begin(s.characterState,db);
 const active=runtime.use(base,bite.id,db,{activate:true,targetWeaponId:'weapon:iron-staff',additionalCostResolved:true});
 state.semanticContext=runtime.projection(active,db);
 const attacks=project(state).attacks;
 assert.equal(attacks.find(x=>x.weaponId==='weapon:iron-staff').damage,'1d4°+5');
 assert.equal(attacks.find(x=>x.weaponId==='weapon:hammer').damage,'1d6+2');
});
check('Golem · Grosse tête et caractéristiques du compagnon',()=>{
 const state=draft('du-golem'),s=project(state),g=s.companions.find(x=>x.name==='Golem');
 skill(s,'grosse-tete',['crafting','science']);
 assert.deepEqual([g.def,g.pv,g.init,g.attack,g.damage],[12,5,s.INIT,s.ATK_MAGIC,'1d4°+1']);
 const [largeHead]=abilities(s,'du-golem');
 state.abilityChoices[largeHead.id]={useIntForPV:true};
 assert.equal(project(state).PV,s.PV+s.caracs.int-s.caracs.con);
});
check('Runes · condition d’INT, DEF et quota de Rune de puissance',()=>{
 const state=draft('des-runes'),s=project(state);
 assert.equal(s.DEF,project(draft('des-elixirs')).DEF+2);
 const [,power]=abilities(s,'des-runes');
 assert.equal(power.quotas.find(q=>q.period==='combat')?.resolvedMax,1);
 state.baseCaracs={for:3,agi:1,con:0,per:1,int:0,vol:2,cha:-1};
 assert.match(Array.from(engine.computeCharacterN1(state).errors).join(' '),/Runes de défense exige INT \+1/);
});

const report={status:checks.every(c=>c.status==='PASS')?'PASS':'PARTIEL',
 source:'COF2 Livre de base, p. 97–101',
 indexSha256:createHash('sha256').update(html).digest('hex'),
 testSha256:createHash('sha256').update(fs.readFileSync(__filename)).digest('hex'),
 checks};
fs.writeFileSync(path.resolve(__dirname,'../QA/N1/forgesort-source-n1.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));
if(report.status!=='PASS')process.exitCode=1;
