'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
const {load,standardState,withRank}=require('./forge_product_runner');
const root=path.resolve(__dirname,'..');
const {db,engine,html}=load(path.join(root,'index.html'));
const profile='class:chevalier:cof2-lb-2024';
const pathId=name=>'classpath:voie-'+name+':class-chevalier:cof2-lb-2024';

function project(name,mounted=false){
 const id=pathId(name);
 const draft=withRank(db,standardState(db,profile,id),id,2);
 for(const ability of engine.previewAcquiredAbilities(draft)){
  if(ability.label==='Éduqué')draft.abilityChoices[ability.id]={extraLanguage:'celestien'};
 }
 if(mounted)draft.semanticContext={mounted:true};
 const {sticky,errors}=engine.computeCharacterN1(draft);
 assert.equal(errors.length,0,Array.from(errors).join(' | '));
 assert.equal(sticky.characterState.paths.find(p=>p.pathId===id)?.rank,2);
 return sticky;
}

const skill=(s,id)=>s.skillBonuses.find(b=>b.sourceAbilityId?.startsWith('ability:'+id+':'));
const checks=[];
function check(name,run){
 try{run();checks.push({name,status:'PASS'})}
 catch(error){checks.push({name,status:'FAIL',error:error.message})}
}
check('Cavalier · monture, équitation et dégâts montés',()=>{
 const foot=project('du-cavalier'),mounted=project('du-cavalier',true);
 const mount=s=>s.companions.find(a=>a.companionId==='companion:faithful-mount');
 assert.equal(mount(foot).def,14);
 assert.equal(mount(mounted).def,mounted.DEF);
 assert.equal(mount(mounted).pv,14);
 assert.equal(mount(mounted).attack,5);
 assert.equal(skill(mounted,'fidele-monture')?.value,4);
 const sword=s=>s.attacks.find(a=>a.weaponId==='weapon:long-sword'&&a.type==='contact').damage;
 assert.equal(sword(foot),'1d8+2');
 assert.equal(sword(mounted),'1d8+3');
});
check('Guerre · armure de départ et pénalité d’Armure sur mesure',()=>{
 const s=project('de-la-guerre');
 assert.equal(s.equip.armureDEF,5);
 assert.equal(s.equip.bouclierDEF,2);
 assert.equal(s.DEF,17);
 assert.equal(s.permanentEffects.find(x=>x.mechanicalEffect.type==='armor_test_penalty_multiplier')?.mechanicalEffect.value,0.5);
});
check('Preux · quota d’Ignorer la douleur et bonus de foule',()=>{
 const s=project('du-preux');
 const rule=s.abilityRuntimeCatalog.find(a=>a.id.startsWith('ability:ignorer-la-douleur-g:'));
 assert.equal(rule.quotas.find(q=>q.period==='combat')?.resolvedMax,1);
 assert.equal(skill(s,'ignorer-la-douleur-g')?.value,4);
});
check('Meneur d’homme · stratégie et immunité à la peur',()=>{
 const s=project('du-meneur-d-homme');
 assert.equal(skill(s,'sans-peur')?.value,4);
 assert.ok(s.permanentEffects.some(e=>e.sourceAbilityId.startsWith('ability:sans-peur:')&&e.mechanicalEffect.type==='immunity'&&e.mechanicalEffect.target==='fear'));
});
check('Noblesse · langue d’Éduqué et caractéristiques de l’écuyer',()=>{
 const s=project('de-la-noblesse');
 assert.ok(s.languages.selected.includes('celestien'));
 assert.equal(skill(s,'eduque')?.value,4);
 const companion=s.companions.find(x=>x.companionId==='companion:squire');
 assert.equal(companion.def,12);
 assert.equal(companion.pv,4);
 assert.equal(companion.attack,s.ATK_MAGIC);
});
const report={status:checks.every(c=>c.status==='PASS')?'PASS':'PARTIEL',source:'COF2 Livre de base, p. 83–86',
 indexSha256:createHash('sha256').update(html).digest('hex'),
 scope:'Projections et métadonnées ciblées des cinq voies du Chevalier pur N1. Les déclencheurs en partie sont contrôlés séparément.',
 checks};
fs.writeFileSync(path.join(root,'QA/N1/chevalier-source-n1.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
if(report.status!=='PASS')process.exitCode=1;
