'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {JSDOM}=require('jsdom'),{load,standardState}=require('../../forge-of-heroes/FINAL_FREEZE_TESTS/forge_product_runner'),N=require('../../forge-of-heroes/native-progression');
const root=path.resolve(__dirname,'../..'),sheet=root+'/fiches-personnages/fiche',js=fs.readFileSync(sheet+'/fiche.js','utf8'),html=fs.readFileSync(sheet+'/index.html','utf8').replace(/<script[\s\S]*?<\/script>/g,''),{db,engine}=load(),T=db.tables;
const sha=x=>crypto.createHash('sha256').update(x).digest('hex'),cases=[],failures=[];
const bone=T.paths_class.find(p=>p.classId==='class:sorcier:cof2-lb-2024'&&/outre-tombe/.test(p.id));
let w;
async function open(c,saved){w?.close();w=new JSDOM(html,{url:'http://localhost/fiches-personnages/fiche/',runScripts:'outside-only'}).window;w.BASTIDE_CHARACTER=c;w.saveSoloSheet=()=>{};w.confirm=()=>true;w.scrollTo=()=>{};w.ResizeObserver=class{observe(){}};w.HTMLElement.prototype.scrollIntoView=function(){};w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false};if(saved)w.localStorage.setItem('cof2_solo_play_'+c.id,saved);await w.eval(js);}
const def=()=>Number([...w.document.querySelectorAll('#resources .resource')].find(e=>e.textContent.includes('Défense')).querySelector('b').textContent);
const click=op=>{const b=w.document.querySelector('#play [data-bone-action='+op+']');assert(b,op);assert(!b.disabled,op+' enabled');b.click()};
const save=c=>w.localStorage.getItem('cof2_solo_play_'+c.id);
async function check(id,fn){try{await fn();cases.push({id,status:'PASS'})}catch(e){failures.push({id,status:'FAIL',message:e.message});}}
(async()=>{
 for(const equipped of [false,true]){
 const s=standardState(db,bone.classId,bone.id,'people:elfe-haut:cof2-lb-2024');if(equipped){s.equip.armorId='armor:os-sorcier:cof2-lb-2024';s.equip.gmApprovedSwap=true;}const result=engine.computeCharacterN1(s);assert.deepEqual(Array.from(result.errors),[]);const c=N.toCharacter({id:'qa-bone-'+equipped,name:'QA os',draft:{}},{state:s,result},{paths:[],profiles:[]},db);
 await check('transfer-'+equipped,async()=>{assert(c.paths.flatMap(p=>p.ranks).some(a=>a.owned&&a.name==='Armure d’os'));assert.equal(c.combat.def,equipped?14:11);});
 await open(c);
 await check('inactive-'+equipped,async()=>assert.equal(def(),11,'10 + AGI 1 ; aucune fabrication ni entretien confirmés'));
 await check('crafted-'+equipped,async()=>{click('craft');assert.equal(def(),11)});
 await check('maintained-'+equipped,async()=>{click('maintain');assert.equal(def(),14);const state=JSON.parse(save(c));assert.equal(state.pm,c.combat.pmMax,'Aucun PM indiqué par la règle');assert.equal(state.hp,c.combat.pvMax);assert.equal(state.pc,c.combat.pcMax)});
 await check('reload-active-'+equipped,async()=>{await open(c,save(c));assert.equal(def(),14)});
 await check('wear-ABA-'+equipped,async()=>{click('wear');assert.equal(def(),11);click('wear');assert.equal(def(),14)});
 await check('new-game-day-'+equipped,async()=>{click('newday');assert.equal(def(),11);await open(c,save(c));assert.equal(def(),11);click('maintain');assert.equal(def(),14)});
 await check('physical-conflict-'+equipped,async()=>{const state=JSON.parse(save(c));state.inventory.push({id:'qa-cuir',name:'Cuir simple',quantity:1,equipped:true,equipment:{slot:'armor',bonuses:{armorDef:2}}});await open(c,JSON.stringify(state));assert.equal(def(),13);state.inventory.pop();await open(c,JSON.stringify(state));assert.equal(def(),14)});
 await check('lost-and-reload-'+equipped,async()=>{click('lose');assert.equal(def(),11);await open(c,save(c));assert.equal(def(),11)});
 await check('removed-acquisition-'+equipped,async()=>{const removed=JSON.parse(JSON.stringify(c));removed.paths.forEach(p=>p.ranks.forEach(a=>{if(a.name==='Armure d’os')a.owned=false}));await open(removed,JSON.stringify({boneArmor:{crafted:true,worn:true,maintainedDay:'jdr-0'}}));assert.equal(def(),11);assert.equal(w.document.querySelectorAll('[data-bone-action]').length,0)});
 }
 for(const equipped of [false,true])await check('bone-stat-cap-boundary-'+equipped,async()=>{const c={id:'qa-bone-cap',level:7,stats:{AGI:7},combat:{pvMax:30,pcMax:2,pmMax:6,recoveryMax:4,def:equipped?18:17},equipment:equipped?['Armure d’os de sorcier']:[],paths:[{name:'Voie de l’outre-tombe',pathId:bone.id,ranks:[{rank:2,name:'Armure d’os',owned:true}]}]};await open(c);assert.equal(def(),17,'Sans armure, plafond retiré');click('craft');click('maintain');assert.equal(def(),18,'Armure +3, AGI plafonnée +5 comme le catalogue');click('wear');assert.equal(def(),17,'Plafond retiré avec l’armure');});
 const report={schema:'FOH_BONE_ARMOR_CERTIFICATION_V1',generatedAt:new Date().toISOString(),source:{book:'COF2 Livre de base',printedPage:109,pdfSha256:process.env.FOH_SOURCE_PDF_SHA||null},inputs:{indexSha256:sha(fs.readFileSync(root+'/forge-of-heroes/index.html')),nativeSha256:sha(fs.readFileSync(root+'/forge-of-heroes/native-progression.js')),sheetSha256:sha(js),runnerSha256:sha(fs.readFileSync(__filename))},execution:'Node + JSDOM, real production engine, native transfer, complete unmodified sheet script and DOM handlers. No browser or physical-device claim.',cases,failures,status:failures.length?'FAIL':'PASS',limits:['R4 scaling requires separate progression witness','No official PDF or real browser replay in this report','Shared formula architecture remains to be unified']};
 fs.writeFileSync(process.env.FOH_BONE_REPORT||root+'/forge-of-heroes/QA/N1/lot-2026-11-19/bone-armor.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({passed:cases.length,failed:failures.length,failures}));w?.close();if(failures.length)process.exitCode=1;
})().catch(e=>{w?.close();console.error(e);process.exitCode=1});
