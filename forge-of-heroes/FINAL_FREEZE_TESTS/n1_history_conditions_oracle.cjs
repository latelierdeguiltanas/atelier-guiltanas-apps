'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),F=require('./forge_product_runner'),API=require('../ENGINE/history_context_n1'),root=path.resolve(__dirname,'..'),copy=x=>JSON.parse(JSON.stringify(x));
const report={schema:'FOH_N1_HISTORY_CONDITIONS',at:new Date().toISOString(),source:'Voies d’historique pp.176–177',scope:'8 professions × 5 rangs × 2 variantes × le seul index.html ; communauté, Courtisan R2/R3, Érudit R2, Expert R2. Ne certifie pas tous les historiques.',products:[],expected:80,passed:0,failed:0,contexts:0,negativeChecks:0,failures:[],moduleSha256:crypto.createHash('sha256').update(fs.readFileSync(root+'/ENGINE/history_context_n1.js')).digest('hex')};
const PDFLib=require('../progression/pdf-lib');
require('../progression/official-pdf-engine');
const pdf=global.FOHOfficialPDF.create({PDFLib,DB:require('../progression/pdf-labels.json')});
const professionalReport={pdfAnnexes:0,companions:0,status:'PENDING',cases:0,situations:0,reopened:0,refusals:0,coverage:{},products:report.products};
const id=(profession,rank)=>'ability:history:'+profession+':r'+rank;
const boundaries={
 courtier:[4,1,'charismaDifficulty',15],scholar:[3,0,'skillBonus',3],
 expert:[4,1,'charismaDifficulty',15],commoner:[3,0,'skillBonus',5],
 soldier:[3,1,'skillBonus',3],pauper:[5,0,'bonusDie',true],
 wealthy:[3,9,'skillBonus',10],nomad:[2,0,'skillBonus',3]
};
const aliases={courtier:{2:'courtier_secrets',3:'courtier_details'},scholar:{2:'scholar_persuasion'},expert:{2:'expert_work'}};
const bonuses={'courtier_secrets':{id:'ability:history:courtier:r2',min:2,positive:[{test:'secret_information'},{test:'sensitive_information'},{test:'auditory_perception'}],negative:[{test:'visual_perception'},{test:'ordinary_information'},{}, {test:'read_lips'}]},'courtier_details':{id:'ability:history:courtier:r3',min:3,positive:[{test:'visual_perception'},{test:'detect_lie'},{test:'read_body_language'}],negative:[{test:'auditory_perception'},{test:'read_lips'},{test:'decipher_message'},{}]},'scholar_persuasion':{id:'ability:history:scholar:r2',min:2,positive:[{test:'convince',characteristic:'cha'}],negative:[{test:'convince',characteristic:'int'},{test:'intimidate',characteristic:'cha'},{test:'convince'},{}]},'expert_work':{id:'ability:history:expert:r2',min:2,positive:[{relatesToChosenProfession:true}],negative:[{relatesToChosenProfession:false},{relatesToChosenProfession:'true'},{}]}};
for(const file of ['index.html']){const{db,engine:E,html}=F.load(root+'/'+file);assert(html.includes(fs.readFileSync(root+'/ENGINE/history_context_n1.js','utf8')));assert(html.includes(fs.readFileSync(root+'/ENGINE/history_context_ui_n1.js','utf8')));report.products.push({file,sha256:crypto.createHash('sha256').update(html).digest('hex')});for(const variant of ['Arquebusier','Arbalétrier'])for(const pro of ['courtier','scholar','expert','commoner','soldier','pauper','wealthy','nomad'])for(let rank=1;rank<=5;rank++){
 const tag=[file,variant,pro,rank].join('|');try{
 const cls=db.tables.classes.find(c=>c.label===variant),p=db.tables.paths_class.find(p=>p.classId===cls.id&&p.id.includes('artilleur')),s=F.standardState(db,cls.id,p.id);s.voies.profilePathIds=[p.id];s.advancedRules.histories=true;s.history={geographicPathId:'history:mountains',professionalPathId:'history:'+pro,humanProfession:'Charpentier'};
 if(rank>1){s.advancedRules.age=true;s.age={categoryId:'venerable',spending:[...Array.from({length:rank-1},(_,i)=>({pathId:'history:'+pro,rank:i+2})),...Array.from({length:5-rank},(_,i)=>({pathId:'history:mountains',rank:i+2}))]};}
 for(let i=0;i<5;i++)for(const a of E.previewAcquiredAbilities(s))for(const c of E.getPersistentChoicesForAbility(s,a.id)){const b=s.abilityChoices[a.id]||(s.abilityChoices[a.id]={});if(b[c.id]!=null)continue;if(c.type==='boolean')b[c.id]=false;else if(c.id==='scholarLanguages')b[c.id]=c.options.filter(x=>x.id!=='argotien').slice(0,rank).map(x=>x.id);else if(['enum_multi','weapon_multi'].includes(c.type))b[c.id]=c.options.slice(0,c.min||1).map(x=>x.id);else if(c.type==='entity')b[c.id]={type:'animal',species:'chat'};else if(c.options?.length)b[c.id]=c.options[0].id;}
 const r=E.computeCharacterN1(s);assert.equal(r.errors.length,0,r.errors.join('; '));const c=r.sticky.characterState,before=JSON.stringify(c);assert(API.available(c).includes('community'));const common=API.resolve(c,'community',{socialInteraction:true,sameProfessionalCommunity:true});assert.equal(common.modifiers.skillBonus,3);assert(common.applies);report.contexts++;
 for(const context of [{},{socialInteraction:true},{sameProfessionalCommunity:true},{socialInteraction:true,sameProfessionalCommunity:false},{socialInteraction:false,sameProfessionalCommunity:true}]){assert.equal(API.resolve(c,'community',context).applies,false);report.negativeChecks++;}
 for(const[key,spec]of Object.entries(bonuses)){const expected=s.history.professionalPathId===spec.id.split(':').slice(1,3).join(':')&&rank>=spec.min;assert.equal(API.available(c).includes(key),expected);for(const context of spec.positive){const o=API.resolve(c,key,context);assert.equal(o.applies,expected,key);if(expected){if(key==='expert_work'){assert.equal(o.modifiers.bonusDie,true);assert.equal(o.modifiers.workTimeMultiplier,0.5);}else assert.equal(o.modifiers.skillBonus,rank+2);}else{assert.deepEqual(o.modifiers,{});report.negativeChecks++;}report.contexts++;}for(const context of spec.negative){assert.equal(API.resolve(c,key,context).applies,false);report.negativeChecks++;}
  if(key!=='expert_work'){const found=r.sticky.skillBonuses.filter(b=>b.sourceAbilityId===spec.id);assert.equal(found.length,expected?1:0);if(expected)assert.equal(found[0].value,rank+2);}
 }
 assert.equal(JSON.stringify(c),before,'Resolver must not change permanent character');const save=E.createHeroSavePayload(s,c,{id:'history-context'}),back=E.computeCharacterN1(E.restoreHeroSavePayload(copy(save)).draft);assert.equal(back.errors.length,0);assert.deepEqual(copy(back.sticky.skillBonuses),copy(r.sticky.skillBonuses));assert.deepEqual(API.available(back.sticky.characterState),API.available(c));
 for(let abilityRank=1;abilityRank<=5;abilityRank++){
  const key=aliases[pro]?.[abilityRank]||id(pro,abilityRank);
  const rule=API.rules[key];
  assert(rule,'Missing profession '+key);
  const source=db.tables.history_abilities.find(a=>a.id===rule.id);
  assert.equal(rule.page,source.source.printedPage);
  assert.equal(API.isOwned(c,key),abilityRank<=rank);
  assert.equal(API.resolve(c,key,{situation:-1}).applies,false);
  assert.equal(API.resolve({abilities:[]},key,{situation:0}).applies,false);
  professionalReport.refusals+=2;
  if(abilityRank>rank)continue;
  professionalReport.coverage[key]=true;
  for(const [situation] of (rule.situations||[]).entries()){
   const effect=API.resolve(c,key,{situation});
   assert(effect.applies&&Object.keys(effect.modifiers).length);
   assert.deepEqual(API.resolve(back.sticky.characterState,key,{situation}),effect);
   professionalReport.situations++;
  }
 }
 const [abilityRank,situation,field,value]=boundaries[pro];
 if(rank>=abilityRank)assert.equal(API.resolve(c,id(pro,abilityRank),{situation}).modifiers[field],value);
 const resolved=(r,situation=0)=>API.resolve(c,id(pro,r),{situation}).modifiers;
 if(pro==='expert')assert.equal(resolved(1,1).incomeSilver,rank);
 if(pro==='wealthy'){
  assert.equal(resolved(1).incomeSilver,10*rank);
  if(rank>=5){
   assert.equal(resolved(5,0).charismaDifficulty,10);
   assert.equal(resolved(5,5).charismaDifficulty,25);
   assert.equal(API.resolve(c,id(pro,5),{situation:5,previousUses:2}).modifiers.charismaDifficulty,35);
   assert.equal(API.resolve(c,id(pro,5),{situation:0,importantVictim:true}).applies,false);
   assert.equal(API.resolve(c,id(pro,5),{situation:0,previousUses:-1}).applies,false);
  }
 }
 if(pro==='commoner'&&rank===5)assert.equal(r.sticky.caracs.con,1);
 if(pro==='scholar'&&rank===5)assert.equal(r.sticky.caracs.int,4);
 if(pro==='nomad'&&rank===5)assert.equal(r.sticky.caracs.per,2);
 if(pro==='pauper'&&rank>=2)assert.equal(r.sticky.INIT,14);
 if(pro==='pauper'&&rank>=4)assert.equal(r.sticky.PV,11);
 const professionalAnnex=pdf.annexPaths(s,r.sticky,{type:'standard'}).find(entry=>entry.pathId==='history:'+pro);
 assert(professionalAnnex&&professionalAnnex.kind==='Historique professionnel');
 assert.equal(professionalAnnex.rows.length,5);
 for(const [index,entry] of professionalAnnex.rows.entries()){
  const original=db.tables.history_abilities.find(row=>row.id===id(pro,index+1));
  assert.equal(entry.rank,original.rank);
  assert.equal(entry.desc,original.desc);
 }
 professionalReport.pdfAnnexes++;
 if((pro==='scholar'||pro==='wealthy')&&rank>=4){
  const novice=pro==='scholar';
  const companion=c.companions.find(row=>row.companionId===(novice?'companion:scholar-novice':'companion:bodyguard'));
  assert(companion);
  assert.equal(companion.def,novice?11:16);
  assert.equal(companion.pv,novice?11:4);
  assert.equal(companion.init,novice?10:r.sticky.INIT);
  assert.equal(companion.attack,1);
  assert.equal(companion.damage,novice?'1d4°':'1d4°+2');
  assert.deepEqual(copy(back.sticky.characterState.companions),copy(c.companions));
  professionalReport.companions++;
 }
 professionalReport.cases++;
 professionalReport.reopened++;
 const switched=copy(s);switched.history.professionalPathId='history:commoner';if(switched.age)switched.age.spending=switched.age.spending.map(x=>({...x,pathId:'history:mountains'}));if(switched.age)switched.age.spending=[2,3,4,5].map(rank=>({pathId:'history:mountains',rank}));const changed=E.computeCharacterN1(switched);assert.equal(changed.errors.length,0);assert.deepEqual(API.available(changed.sticky.characterState).filter(key=>!API.rules[key].situations),['community']);
 report.passed++;
 }catch(e){report.failed++;if(report.failures.length<12)report.failures.push({tag,error:String(e.stack||e).slice(0,1500)});}
}}
for(const key of Object.keys(API.rules).filter(key=>!API.rules[key].situations)){assert.equal(API.resolve({abilities:[]},key,{}).applies,false);report.negativeChecks++;}assert.throws(()=>API.resolve({},'unknown'));report.negativeChecks++;
report.status=report.passed===report.expected&&!report.failed?'PASS':'FAIL';fs.writeFileSync(root+'/QA/N1/arquebusier-history-conditions.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
professionalReport.status=report.status==='PASS'&&professionalReport.cases===80&&Object.keys(professionalReport.coverage).length===40?'PASS':'FAIL';
fs.writeFileSync(root+'/QA/N1/arquebusier-history-professions.json',JSON.stringify(professionalReport,null,2)+'\n');
if(professionalReport.status!=='PASS')process.exitCode=1;
if(report.status!=='PASS')process.exitCode=1;
