'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),{load,standardState,withRank}=require('./forge_product_runner'),root=path.resolve(__dirname,'..'),copy=x=>JSON.parse(JSON.stringify(x));
const report={schema:'FOH_N1_AGE_SOURCE_CHECK',sources:[{file:'règles avancées.pdf',pdfPage:1,printedPage:153,visuallyRead:true,rule:'Very young: INIT -1 and PC +1 or DR +1; young unchanged; mature AGI -1 and 2 points rank cap2; venerable AGI/CON -1 and 4 points rank cap3.'}],cases:[],replays:0,failures:[]};
for(const file of process.argv[2]?[process.argv[2]]:['index.html','FORGE_OF_HEROES_ATELIER_GUILTANAS_PRODUCT_MASTER.html']){
 const full=path.isAbsolute(file)?file:root+'/'+file,{db,engine:E,html}=load(full);report.engineSha256=crypto.createHash('sha256').update(html.match(/id="FOH_ENGINE_BUNDLE"[^>]*>([\s\S]*?)<\/script>/)[1]).digest('hex');
 for(const category of ['very-young','young','mature','venerable'])for(const choice of [null,'PC','DR']){
  const s=standardState(db,'class:voleur:cof2-lb-2024');s.advancedRules.age=true;s.age={categoryId:category,choice,spending:[]};if(category==='mature')withRank(db,s,s.voies.profilePathIds[0],2);if(category==='venerable')withRank(db,s,s.voies.profilePathIds[0],3);s.age.choice=choice;
  const before=JSON.stringify(s),r=E.computeCharacterN1(s),id=file+':'+category+':'+choice;
  try{assert.equal(JSON.stringify(s),before);if(category==='very-young'&&choice===null){assert.match(r.errors.join(' '),/PC ou DR/);}else{
   assert.equal(r.errors.length,0,r.errors.join(' | '));const c={for:2,agi:category==='mature'||category==='venerable'?0:1,con:category==='venerable'?0:1,per:1,int:3,vol:0,cha:-1};assert.deepEqual(copy(r.sticky.caracs),c);
   const wants={PV:8+c.con,DEF:12+c.agi,INIT:11-(category==='very-young'?1:0),PC:3+(category==='very-young'&&choice==='PC'?1:0),PM:0,ATK_CONTACT:3,ATK_DISTANCE:1+c.agi,ATK_MAGIC:1};for(const[k,v]of Object.entries(wants))assert.equal(r.sticky[k],v,id+' '+k);assert.equal(r.sticky.DR.count,2+c.con+(category==='very-young'&&choice==='DR'?1:0));assert.equal(r.sticky.DR.die,8);
   const cs=r.sticky.characterState,points=category==='mature'?2:category==='venerable'?4:0;assert.equal(cs.age.choice,category==='very-young'?choice:null);assert.equal(cs.capacityBudget.age.available,points);assert.equal(cs.capacityBudget.age.spent,points);assert.equal(cs.capacityBudget.age.remaining,0);for(const [i,p]of s.voies.profilePathIds.entries()){const rank=category==='mature'?2:category==='venerable'?(i===0?3:2):1;assert.equal(cs.paths.find(x=>x.pathId===p).rank,rank);} 
   const saved=E.createHeroSavePayload(s,r.sticky.characterState,{id:'age-source'}),back=E.computeCharacterN1(E.restoreHeroSavePayload(copy(saved)).draft);assert.equal(back.errors.length,0);assert.deepEqual(copy(back.sticky.characterState.derived),copy(r.sticky.characterState.derived));report.replays++;
   const off=copy(s);off.advancedRules.age=false;delete off.age;const baseline=E.computeCharacterN1(off);assert.equal(baseline.errors.length,0);assert.equal(baseline.sticky.PC,3);assert.equal(baseline.sticky.DR.count,3);
  }report.cases.push({id,status:'PASS'});}catch(e){report.failures.push({id,message:e.message,actual:e.actual,expected:e.expected});}
 }
}
report.status=report.failures.length?'FAIL':'PASS';if(!process.argv[2])fs.writeFileSync(root+'/QA/N1/lot3/age-source.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));if(report.failures.length)process.exitCode=1;
