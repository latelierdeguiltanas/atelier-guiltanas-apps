'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {JSDOM}=require('jsdom');
const {load}=require('../../forge-of-heroes/FINAL_FREEZE_TESTS/forge_product_runner');
const {make}=require('../../forge-of-heroes/FINAL_FREEZE_TESTS/n1_batch_rank_persistence.cjs');
const {toCharacter}=require('../../forge-of-heroes/native-progression');
const {db,html:forgeHtml,engine}=load();
const sheetDir=path.join(__dirname,'../fiche');
const sheetHtml=fs.readFileSync(path.join(sheetDir,'index.html'),'utf8');
const sheet=fs.readFileSync(process.env.FOH_ROUND_SHEET||path.join(sheetDir,'fiche.js'),'utf8');
const sha=data=>createHash('sha256').update(data).digest('hex');
const powers=[
 ['tour-de-magie-g','people'],
 ['lanceur-de-couteau-g','profile'],
 ['attaque-a-suivre-g','profile'],
 ['droite-gauche-g','profile'],
 ['acrobaties-g','profile'],
 ['teigneux-g','profile'],
 ['piqure-de-rappel-g','profile'],
 ['charge:path:voie-du-centaure','people'],
 ['tir-en-mouvement:path:voie-du-centaure','people']
];
function open(character,saved){
 const w=new JSDOM(sheetHtml,{url:'http://localhost/fiches-personnages/fiche/',runScripts:'outside-only'}).window;
 w.BASTIDE_CHARACTER=character;
 w.saveSoloSheet=()=>{};
 w.confirm=()=>true;
 w.scrollTo=()=>{};
 w.ResizeObserver=class{observe(){}};
 w.HTMLElement.prototype.scrollIntoView=function(){};
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};
 w.HTMLDialogElement.prototype.close=function(){this.open=false;};
 if(saved)w.localStorage.setItem('cof2_solo_play_'+character.id,saved);
 w.eval(sheet);
 return w;
}
function button(w,selector){
 const control=w.document.querySelector(selector);
 assert(control,selector);
 return control;
}
function reveal(w,ability){
 const control=[...w.document.querySelectorAll('#play [data-ui-ability]')].find(b=>b.querySelector('strong')?.textContent===ability.name);
 assert(control,ability.name+' inaccessible depuis Mon tour');
 control.click();
 return button(w,'dialog[open] [data-use]');
}
const cases=[];
for(const [slug,kind] of powers){
 const ability=[...db.tables.abilities_class,...db.tables.abilities_people].find(a=>a.id.startsWith('ability:'+slug+':'));
 const paths=kind==='people'?db.tables.paths_people:db.tables.paths_class;
 const state=make(paths.find(p=>p.id===ability.path_id),kind,ability.rank);
 const result=engine.computeCharacterN1(state);
 assert.equal(result.errors.length,0,ability.id+' '+result.errors.join(' | '));
 const character=toCharacter({id:'qa-round-'+slug,name:'QA usages',draft:{}},{state,result},{paths:[],profiles:[]},db);
 const rank=character.paths.find(p=>p.pathId===ability.path_id)?.ranks.find(r=>r.rank===ability.rank);
 assert(rank?.owned,ability.id);
 const key='cof2_solo_play_'+character.id;
 // An unrelated daily use must survive the round reset; zero PM cannot prevent a free action.
 const starting={uses:{'qa-daily-use':2},pm:0};
 let w=open(character,JSON.stringify(starting));
 try{
  if(ability.path_id.includes(':class-guerrier:')){
   const action=slug==='teigneux-g'?'teigneux':'reminder',show=()=>{const control=[...w.document.querySelectorAll('#play [data-ui-ability]')].find(b=>b.querySelector('strong')?.textContent===rank.name);assert(control);control.click();return w.document.querySelector('dialog[open] .warrior-ability');},prepare=()=>{const card=show();const values={target:'Orc',inContact:true,rolls:'20',defense:1,...(action==='teigneux'?{leaving:true}:{attacksOther:true,targetInt:-1,damageDealt:1})};for(const[k,v]of Object.entries(values)){const el=card.querySelector('[data-warrior-field='+k+']');assert(el,k);if(el.type==='checkbox')el.checked=v;else el.value=String(v);}return card.querySelector('[data-warrior-action='+action+']');};
   assert(!prepare().disabled);prepare().click();let saved=w.localStorage.getItem(key),play=JSON.parse(saved);assert.equal(play.warrior.roundUses[action],1);assert.equal(play.uses['qa-daily-use'],2);assert.equal(play.pm,0);assert(prepare().disabled);w.close();w=open(character,saved);assert(prepare().disabled);button(w,'dialog[open] [data-ui-close]').click();button(w,'#play [data-warrior-reset=round]').click();assert(!prepare().disabled);prepare().click();button(w,'dialog[open] [data-ui-close]').click();button(w,'nav [data-page=rest]').click();button(w,'#rest [data-reset=combat]').click();assert.equal(JSON.parse(w.localStorage.getItem(key)).warrior.roundUses[action],undefined);cases.push({id:ability.id,actualId:rank.abilityId,use:true,limit:true,reopen:true,roundReset:true,combatReset:true,free:true,controller:'warrior'});continue;
  }
  if(slug==='droite-gauche-g'){
   const former=[...w.document.querySelectorAll('#play [data-ui-ability]')].find(b=>b.textContent.includes('Attaque à suivre'));
   assert(former);
   former.click();
   assert.match(button(w,'dialog[open]').textContent,/Remplacée par Droite-gauche/);
   assert.equal(w.document.querySelector('dialog[open] [data-use]'),null);
   button(w,'dialog[open] [data-ui-close]').click();
  }
  const use=reveal(w,rank);
  assert.equal(use.disabled,false,ability.id);
  const counter=use.dataset.use;
  use.click();
  const saved=w.localStorage.getItem(key);
  let play=JSON.parse(saved);
  const useKey=slug.includes('voie-du-centaure')?'centaur-round-action':counter;
  assert.equal(play.uses[useKey],1);
  if(slug.startsWith('tir-en-mouvement')){
   button(w,'dialog[open] [data-ui-close]').click();
   const charge=[...w.document.querySelectorAll('#play [data-ui-ability]')].find(b=>b.textContent.includes('Charge au galop'));
   assert(charge);
   charge.click();
   assert(button(w,'dialog[open] [data-use]').disabled,'charge et tir cumulés avant le rang 4');
  }
  assert.equal(play.pm,0);
  assert(button(w,'dialog[open] [data-use]').disabled);
  w.close();
  w=open(character,saved);
  assert(reveal(w,rank).disabled,'usage réinitialisé au rechargement');
  button(w,'dialog[open] [data-ui-close]').click();
  button(w,'#play [data-reset="round"]').click();
  play=JSON.parse(w.localStorage.getItem(key));
  assert.equal(play.uses[useKey],0);
  assert.equal(play.uses['qa-daily-use'],2);
  assert.equal(play.pm,0);
  const nextUse=reveal(w,rank);
  assert.equal(nextUse.disabled,false);
  nextUse.click();
  button(w,'dialog[open] [data-ui-close]').click();
  button(w,'nav [data-page="rest"]').click();
  button(w,'#rest [data-reset="combat"]').click();
  assert.equal(JSON.parse(w.localStorage.getItem(key)).uses[useKey],0);
  cases.push({id:ability.id,actualId:rank.abilityId,use:true,limit:true,reopen:true,roundReset:true,combatReset:true,free:true});
 }finally{w.close();}
}
const trancePath=db.tables.paths_class.find(p=>p.classId.includes(':psionique:')&&p.id.includes(':voie-du-controle-corporel:'));
const tranceChecks=[];
for(const rank of [2,3]){
 const state=make(trancePath,'profile',rank);
 const result=engine.computeCharacterN1(state);
 assert.equal(result.errors.length,0,result.errors.join(' | '));
 const character=toCharacter({id:'qa-daily-trance-'+rank,name:'QA transe',draft:{}},{state,result},{paths:[],profiles:[]},db);
 const ability=character.paths.find(p=>p.pathId===trancePath.id).ranks.find(r=>r.rank===2);
 const storage='cof2_solo_play_'+character.id;
 let w=open(character);
 try{
  let use=reveal(w,ability);
  for(let i=0;i<rank;i++){
   assert.equal(use.disabled,false);
   use.click();
   const saved=JSON.parse(w.localStorage.getItem(storage));
   assert.equal(saved.pm,0);
   if(i+1<rank){
    // Restore mana independently to reach the daily counter boundary on this N1 character.
    saved.pm=2;
    w.close();
    w=open(character,JSON.stringify(saved));
    use=reveal(w,ability);
   }else use=button(w,'dialog[open] [data-use]');
  }
  assert(use.disabled);
  const useKey=use.dataset.use;
  assert.equal(JSON.parse(w.localStorage.getItem(storage)).uses[useKey],rank);
  button(w,'dialog[open] [data-ui-close]').click();
  button(w,'nav [data-page="rest"]').click();
  button(w,'#rest [data-reset="combat"]').click();
  assert.equal(JSON.parse(w.localStorage.getItem(storage)).uses[useKey],rank);
  button(w,'#rest [data-reset="day"]').click();
  assert.equal(JSON.parse(w.localStorage.getItem(storage)).uses[useKey],0);
  tranceChecks.push({rank,uses:rank});
 }finally{w.close();}
}
if(process.env.FOH_ROUND_REPORT){
 const inputs={indexSha256:sha(forgeHtml),sheetSha256:sha(sheet),sheetHtmlSha256:sha(sheetHtml),
  runnerSha256:sha(fs.readFileSync(__filename)),nativeSha256:sha(fs.readFileSync(require.resolve('../../forge-of-heroes/native-progression'))),
  fixtureSha256:sha(fs.readFileSync(require.resolve('../../forge-of-heroes/FINAL_FREEZE_TESTS/n1_batch_rank_persistence.cjs')))};
 fs.writeFileSync(process.env.FOH_ROUND_REPORT,JSON.stringify({schema:'FOH_N1_ROUND_POWER_USES_V1',status:'PASS',inputs,cases,tranceChecks},null,2)+'\n');
}
console.log('PASS '+cases.length+' pouvoirs : clic DOM, plafond, sauvegarde et remises à zéro ; transe psionique R2 et R3.');
