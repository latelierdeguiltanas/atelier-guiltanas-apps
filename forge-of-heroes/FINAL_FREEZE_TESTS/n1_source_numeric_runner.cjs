'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),{load,standardState}=require('./forge_product_runner'),root=path.resolve(__dirname,'..'),copy=x=>JSON.parse(JSON.stringify(x));
// Expectations transcribed from supplied COF2 PDF, not obtained from ruleSet or engine traces.
const specs=[
 ['barde','voie-du-saltimbanque','voie-du-musicien',2,3,70,(r,c)=>({DEF:1,INIT:c.cha})],
 ['rodeur','voie-de-l-archer','voie-de-la-survie',1,3,72,r=>({INIT:r})],
 ['voleur','voie-de-l-aventurier','voie-de-l-assassin',3,3,77,r=>({DEF:2,INIT:2})],
 ['voleur','voie-du-deplacement','voie-de-l-assassin',1,3,77,r=>({DEF:r===3?2:1,INIT:r===3?2:1})],
 ['barbare','voie-du-pagne','voie-de-la-rage',1,3,82,r=>({PV:r,DEF:r===3?1:0})],
 ['barbare','voie-du-pourfendeur','voie-de-la-rage',1,3,83,r=>({DEF:1,INIT:3})],
 ['barbare','voie-du-primitif','voie-de-la-rage',2,3,83,r=>({DEF:2,PV:1})],
 ['guerrier','voie-de-la-resistance','voie-du-soldat',1,3,91,r=>({PV:r+2,DEF:r===3?1:0})],
 ['druide','voie-du-fauve','voie-des-animaux',1,3,117,r=>({DEF:r===3?2:1,INIT:3})],
 ['moine','voie-de-la-maitrise','voie-de-l-energie-vitale',1,3,121,r=>({DEF:2})],
 ['pretre','voie-de-la-spiritualite','voie-de-la-priere',1,3,127,r=>({DEF:r===3?3:2})],
 ['ensorceleur','voie-de-la-divination','voie-des-illusions',1,3,95,r=>({DEF:r===3?2:1,INIT:r===3?2:1})],
 ['forgesort','voie-des-runes','voie-du-metal',1,3,103,r=>({DEF:r===3?3:2})],
 ['sorcier','voie-du-sang','voie-de-la-mort',3,3,112,r=>({DEF:2})],
 ['sorcier','voie-du-demon','voie-de-la-mort',3,3,110,(r,c)=>({DR:c.vol})]
];
const report={schema:'FOH_N1_SOURCE_NUMERIC',scope:'Absolute numerical expectations for 15 official abilities at creation ranks 1–3. Unarmored human, neutral second path, no combat activation. Not a claim of all N1 effects.',cases:[],failures:[],inputs:{}};
for(const file of ['index.html','FORGE_OF_HEROES_ATELIER_GUILTANAS_PRODUCT_MASTER.html']){const{db,engine:E,html}=load(root+'/'+file),T=db.tables;report.inputs[file]={engineSha256:crypto.createHash('sha256').update(html.match(/id="FOH_ENGINE_BUNDLE"[^>]*>([\s\S]*?)<\/script>/)[1]).digest('hex')};
for(const [profile,target,neutral,min,max,pdfPage,bonus]of specs)for(let rank=min;rank<=max;rank++){
 const pid='class:'+profile+':cof2-lb-2024',pathId=n=>'classpath:'+n+':class-'+profile+':cof2-lb-2024',s=standardState(db,pid,pathId(target)),targetId=pathId(target),neutralId=pathId(neutral);s.baseCaracs={for:1,agi:1,con:0,per:0,int:3,vol:2,cha:-1};s.voies.profilePathIds=[targetId,neutralId];s.equip.armorId='';s.equip.shieldId='';s.equip.gmApprovedSwap=true;if(profile==='pretre')s.profileChoices.priestMode='generalist';
 if(s.familleId==='mage')s.voies.mageRank2PathId=rank===1?neutralId:targetId;
 if(rank>=2&&s.familleId!=='mage'){s.advancedRules.age=true;s.age={categoryId:rank===2?'mature':'venerable',spending:[{pathId:targetId,rank:2},...(rank===3?[{pathId:targetId,rank:3}]:[]),{pathId:neutralId,rank:2}]};}
 if(rank===3&&s.familleId==='mage'){s.advancedRules.age=true;s.age={categoryId:'venerable',spending:[{pathId:targetId,rank:3},{pathId:neutralId,rank:2},{pathId:s.voies.peoplePathId,rank:2}]};}
 for(let j=0;j<3;j++)for(const a of E.previewAcquiredAbilities(s))for(const c of E.getPersistentChoicesForAbility(s,a.id)){const b=s.abilityChoices[a.id]||(s.abilityChoices[a.id]={});if(c.type==='boolean')b[c.id]??=false;else if(c.type==='entity')b[c.id]??={type:'animal',species:'chat',name:'Témoin'};else if(c.type==='weapon_multi')b[c.id]??=c.options.slice(0,Math.max(1,c.min||1)).map(x=>x.id);else if(c.options?.length)b[c.id]??=c.options[0].id;}
 const label=file+':'+target+':'+rank,r=E.computeCharacterN1(s);try{assert.equal(r.errors.length,0,r.errors.join(' | '));const c={for:1,agi:s.advancedRules.age?0:1,con:rank===3?0:1,per:0,int:3,vol:2,cha:-1};if(s.familleId==='mage'&&rank===2)c.agi=1;assert.deepEqual(copy(r.sticky.caracs),c);const b=bonus(rank,c),familyHP=s.familleId==='combattant'?10:s.familleId==='mage'?6:8,want={DEF:10+c.agi+(b.DEF||0),INIT:10+c.per+(b.INIT||0),PV:familyHP+c.con+(b.PV||0)};for(const[k,v]of Object.entries(want))assert.equal(r.sticky[k],v,label+' '+k);assert.equal(r.sticky.DR.count,(s.familleId==='mystique'?3:2)+c.con+(b.DR||0));assert.equal(r.sticky.characterState.paths.find(p=>p.pathId===targetId).rank,rank);const save=E.createHeroSavePayload(s,r.sticky.characterState,{id:'source-numeric'}),back=E.computeCharacterN1(E.restoreHeroSavePayload(copy(save)).draft);assert.equal(back.errors.length,0);assert.deepEqual(copy(back.sticky.characterState.derived),copy(r.sticky.characterState.derived));report.cases.push({label,source:{document:'COF2 Livre de base',pdfPage,printedPage:pdfPage-2},expected:want,status:'PASS'});}catch(e){report.failures.push({label,message:e.message,actual:e.actual,expected:e.expected,state:s});}
}}
report.status=report.failures.length?'FAIL':'PASS';fs.writeFileSync(root+'/QA/N1/lot4/source-numeric.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:report.status,cases:report.cases.length,failures:report.failures.map(x=>({label:x.label,message:x.message}))},null,2));if(report.failures.length)process.exitCode=1;
