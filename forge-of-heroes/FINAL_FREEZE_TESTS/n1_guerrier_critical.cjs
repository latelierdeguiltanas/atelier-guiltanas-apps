'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const {load,standardState,withRank}=require('./forge_product_runner');
const {db,engine,html}=load(process.argv[2]);
const profile='class:guerrier:cof2-lb-2024',master='classpath:voie-du-maitre-d-armes:class-guerrier:cof2-lb-2024',checks=[];
for(const category of ['swords','axes','maces','spears','thrown'])for(const rank of [1,2,3])for(const weapon of db.tables.weapons_n1.filter(w=>w.preferredCategory)){
 const name=[category,rank,weapon.id].join(' / ');
 try{
  const state=standardState(db,profile,master);
  state.voies.profilePathIds[1]='classpath:voie-de-la-resistance:class-guerrier:cof2-lb-2024';
  state.profileChoices.preferredWeaponCategory=category;
  state.equip={...state.equip,gmApprovedSwap:true,weaponIds:[weapon.id],shieldId:''};
  const chosen=withRank(db,state,master,rank),result=engine.computeCharacterN1(chosen);
  assert.deepEqual(Array.from(result.errors),[]);
  const attacks=result.sticky.attacks.filter(a=>a.weaponId===weapon.id);assert.ok(attacks.length);
  const expected=(weapon.properties.includes('critical_19_20')?19:20)-(rank>=2&&weapon.preferredCategory===category?1:0);
  for(const attack of attacks)assert.equal(attack.criticalThreshold,expected);
  const restored=engine.computeCharacterN1(JSON.parse(JSON.stringify(chosen)));
  assert.deepEqual(JSON.parse(JSON.stringify(restored.sticky.attacks)),JSON.parse(JSON.stringify(result.sticky.attacks)));
  checks.push({name,status:'PASS'});
 }catch(error){checks.push({name,status:'FAIL',error:error.message});}
}
const report={source:'COF2 Livre de base p.89',status:checks.every(c=>c.status==='PASS')?'PASS':'FAIL',indexSha256:crypto.createHash('sha256').update(html).digest('hex'),checks,passed:checks.filter(c=>c.status==='PASS').length,total:checks.length};
fs.writeFileSync(process.argv[3]||'forge-of-heroes/QA/N1/guerrier-critical.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,passed:report.passed,total:report.total}));if(report.status!=='PASS')process.exitCode=1;
