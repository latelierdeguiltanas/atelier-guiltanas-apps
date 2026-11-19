'use strict';
// Acquisition witnesses only. Numerical effects are deliberately separate gates.
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),crypto=require('crypto');
const {load,standardState}=require('./forge_product_runner'),{db,engine,html}=load(),T=db.tables,root=path.resolve(__dirname,'..');
const old=new Set(require('../rules/completion-audit.json').rows.map(a=>a.abilityId)),missing=[...T.abilities_class,...T.abilities_people].filter(a=>!old.has(a.id)),cases=[];
function fill(s){for(let pass=0;pass<3;pass++){const acquired=engine.previewAcquiredAbilities(s)||[];for(const a of acquired)for(const choice of engine.getPersistentChoicesForAbility(s,a.id)||[]){const b=s.abilityChoices[a.id]||={};if(b[choice.id]!=null)continue;if(choice.id==='preferredWeaponCategory'){s.profileChoices.preferredWeaponCategory='crossbows';b[choice.id]='crossbows';}else if(choice.type==='boolean')b[choice.id]=false;else if(choice.type==='entity')b[choice.id]={type:'animal',species:'chat',name:'QA'};else if(choice.type==='weapon_multi')b[choice.id]=choice.options.slice(0,Math.max(1,choice.min||1)).map(x=>x.id);else if(choice.options?.length)b[choice.id]=choice.options.find(x=>!acquired.some(a=>a.id===x.id))?.id||choice.options[0].id;}}}
for(const a of missing){
 const isPeople=T.paths_people.some(p=>p.id===a.path_id),p=isPeople?T.paths_people.find(p=>p.id===a.path_id):T.paths_class.find(p=>p.id===a.path_id);
 if(a.rank>3){cases.push({id:a.id,pathId:a.path_id,rank:a.rank,status:'NON TESTÉ',reason:'Above ordinary N1 age cap; special access needs source review. Not certified inaccessible.'});continue;}
 let state;
 try{
 const profile=isPeople?T.classes.find(p=>p.id==='class:voleur:cof2-lb-2024'):T.classes.find(x=>x.id===p.classId),people=isPeople?T.peoples.find(x=>x.id===p.people_id||p.allowedPeopleIds?.includes(x.id)):T.peoples.find(x=>x.id==='people:humain:cof2-lb-2024');assert(people,'People owner unresolved');
 state=standardState(db,profile.id,isPeople?undefined:p.id,people.id);if(isPeople)state.voies.peoplePathId=p.id;
 if(/people:(lutin|fee):/.test(people.id))state.baseCaracs={for:-1,agi:2,con:1,per:1,int:3,vol:0,cha:0};state.peupleChoices={};if(people.id.includes(':humain:'))state.peupleChoices.humainStat='cha';for(const [key,field]of [['bonus','bonusStat'],['malus','malusStat']])if(people.schema?.[key]?.mode==='choice')state.peupleChoices[field]=people.schema[key].options[0];
 if(a.rank>1&&!(profile.familleId==='mage'&&a.rank===2&&!isPeople)){state.advancedRules.age=true;state.age={categoryId:a.rank===2?'mature':'venerable',spending:[]};for(let r=2;r<=a.rank;r++)state.age.spending.push({pathId:p.id,rank:r});state.age.spending.push({pathId:state.voies.profilePathIds.find(id=>id!==p.id),rank:2});}
 // Witness uses an explicit MJ-approved equipment exchange, never a real player's gear.
 state.equip={...state.equip,armorId:'',shieldId:'',weaponIds:[T.weapons_n1.find(w=>/dague/i.test(w.label||w.name)).id],gmApprovedSwap:true};
 fill(state);let r=engine.computeCharacterN1(state);if(r.errors.length){cases.push({id:a.id,rank:a.rank,status:'BLOQUÉ',reason:'Witness fixture unresolved; refusal not yet classified as legal or product defect',errors:r.errors,input:state});continue;}
 assert(r.sticky.acquiredAbilities.some(x=>x.id===a.id),'Expected exact ability acquired');const replay=engine.computeCharacterN1(JSON.parse(JSON.stringify(state)));assert.equal(JSON.stringify(replay.sticky),JSON.stringify(r.sticky));cases.push({id:a.id,rank:a.rank,status:'PASS',scope:'Acquisition + deterministic JSON state replay only',input:state});
 }catch(e){cases.push({id:a.id,rank:a.rank,status:'BLOQUÉ',reason:e.message,input:state});}
}
const report={schema:'FOH_UNTRACKED_ACQUISITION_V1',generatedAt:new Date().toISOString(),indexSha256:crypto.createHash('sha256').update(html).digest('hex'),scope:'85 missing audit entries. This is NOT a mechanical effects certificate.',counts:Object.fromEntries(['PASS','REFUS LÉGAL','FAIL','BLOQUÉ','NON TESTÉ'].map(x=>[x,cases.filter(c=>c.status===x).length])),cases};
fs.writeFileSync(root+'/QA/N1/lot-2026-11-19/untracked-acquisitions.json',JSON.stringify(report,null,2)+'\n');console.log(report.counts);
