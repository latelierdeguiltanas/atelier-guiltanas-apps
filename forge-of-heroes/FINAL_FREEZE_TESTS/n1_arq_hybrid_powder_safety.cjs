'use strict';
/* Book p63: the first rank of Explosifs grants powder safety even if Arquebusier
 * is the secondary profile. Real recomputation on both shipped products.
 * The extra contextual calculator is tested separately from the main sheet.
 */
const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('node:assert/strict');
const {load,standardState}=require('./forge_product_runner'),API=require('../ENGINE/arquebusier_context_n1.js'),root=path.resolve(__dirname,'..');
const A='class:arquebusier:cof2-lb-2024',V='class:voleur:cof2-lb-2024';
const report={schema:'FOH_N1_HYBRID_POWDER_SAFETY',at:new Date().toISOString(),source:'COF2 Livre de base imprimé p63, introduction Voie des Explosifs',products:[],cases:[],passed:0,failed:0,status:'PENDING',limits:'Test d’acquisition et du calculateur conditionnel, pas simulation du risque d’une panne aléatoire de l’arme.'};
for(const file of ['index.html']){
 const {db,engine:E,html}=load(path.join(root,file));
 const t=db.tables,pA=t.paths_class.find(p=>p.classId===A&&p.id.includes('voie-des-explosifs')),pV=t.paths_class.find(p=>p.classId===V&&p.id.includes('voie-de-l-assassin'));
 assert(pA&&pV,'voie requise absente');
 report.products.push({file,sha256:crypto.createHash('sha256').update(html).digest('hex')});
 for(const [primary,secondary,first,second]of [[V,A,pV,pA],[A,V,pA,pV]]){
 const row={file,primary,secondary,status:'FAIL'};report.cases.push(row);
 try{
  const s=standardState(db,primary,first.id,'people:humain:cof2-lb-2024');
  s.voies.profilePathIds=[first.id,second.id];
  s.hybrid={enabled:true,gmApproved:true,primaryProfileId:primary,secondaryProfileId:secondary,primaryPathId:first.id,secondaryPathId:second.id};
  const r=E.computeCharacterN1(s);assert.equal(r.errors.length,0,'hybrid legality '+r.errors.join(' / '));
  const char=r.sticky.characterState;
  const owned=char.abilities.filter(a=>a.id?.startsWith('ability:tir-de-grenaille-l:'));
  assert.equal(owned.length,1,'Tir de grenaille R1 absent in legal hybrid');
  const ok=API.resolve(char,'tir-de-grenaille-l',{action:'powder_safety'});
  assert.equal(ok.applies,true,'Hybrid R1 must remove accident risk');
  assert.equal(ok.modifiers.accidentalPowderExplosionRisk,false);
  assert.equal(API.resolve({abilities:[],paths:[],profileId:char.profileId},'tir-de-grenaille-l',{action:'powder_safety'}).applies,false,'Unowned power cannot grant safety');
  row.status='PASS';row.profileId=char.profileId;row.effect=ok.modifiers;report.passed++;
 }catch(e){row.error=String(e.stack||e);report.failed++;}
 }
}
report.status=report.passed===4&&report.failed===0?'PASS':'FAIL';
fs.writeFileSync(path.join(root,'QA/N1/arquebusier-hybrid-powder-safety.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,passed:report.passed,failed:report.failed,cases:report.cases.filter(x=>x.status!=='PASS')}).slice(0,4400));
if(report.status!=='PASS')process.exitCode=1;
