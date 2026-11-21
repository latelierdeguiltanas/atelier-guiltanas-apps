'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {createHash}=require('node:crypto');
const path=require('node:path');
const {JSDOM}=require('jsdom');
const {load,standardState}=require('../../forge-of-heroes/FINAL_FREEZE_TESTS/forge_product_runner');
const {toCharacter}=require('../../forge-of-heroes/native-progression');
const {db,engine,html:forgeHtml}=load();
const sheet=path.join(__dirname,'../fiche');
const html=fs.readFileSync(path.join(sheet,'index.html'),'utf8');
const script=fs.readFileSync(path.join(sheet,'fiche.js'),'utf8');
const profile='class:barbare:cof2-lb-2024';
const peoplePath='path:voie-du-drakonide:compagnon-cof2';
const abilityId='ability:drakonide-r2:'+peoplePath;
function character(rank,element){
 const state=standardState(db,profile,undefined,'people:drakonide:compagnon-cof2');
 if(rank>1){
  state.advancedRules.age=true;
  state.age={categoryId:rank===2?'mature':'venerable',spending:[
   {pathId:peoplePath,rank:2},
   ...(rank===3?[{pathId:peoplePath,rank:3}]:[]),
   {pathId:state.voies.profilePathIds[0],rank:2}
  ]};
  state.abilityChoices[abilityId]={drakonideBreath:element};
 }
 const result=engine.computeCharacterN1(state);
 assert.equal(result.errors.length,0,result.errors.join(' | '));
 return toCharacter({id:'qa-drakonide',name:'Drakonide QA',people:'Drakonide',profile:'Barbare',draft:{}},{state,result},{paths:[],profiles:[]},db);
}
async function open(c,saved){
 const w=new JSDOM(html,{url:'http://localhost/fiches-personnages/fiche/',runScripts:'outside-only'}).window;
 w.BASTIDE_CHARACTER=c;
 w.saveSoloSheet=()=>{};
 w.confirm=()=>true;
 w.scrollTo=()=>{};
 w.ResizeObserver=class{observe(){}};
 w.HTMLElement.prototype.scrollIntoView=function(){};
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};
 w.HTMLDialogElement.prototype.close=function(){this.open=false;};
 if(saved)w.localStorage.setItem('cof2_solo_play_'+c.id,saved);
 await w.eval(script);
 return w;
}
function breath(w){
 const button=[...w.document.querySelectorAll('#play [data-ui-ability]')].find(x=>x.textContent.includes('Souffle'));
 assert.ok(button,'Souffle accessible depuis Mon tour');
 button.click();
 return w.document.querySelector('dialog[open] .ability');
}
(async()=>{
 const absent=await open(character(1));
 assert.doesNotMatch(absent.document.querySelector('#play').textContent,/Souffle/);
 absent.close();
 const cases=[];
 for(const [element,label,rank,dice] of [
  ['fire','Feu',2,'5d4°'],['cold','Froid',2,'5d4°'],
  ['lightning','Électricité',3,'6d4°'],['acid','Acide',3,'6d4°']
 ]){
  const c=character(rank,element);
  let w=await open(c);
  let card=breath(w);
  assert.ok(card.textContent.includes(label+' · '+dice+' DM'));
  assert.match(card.textContent,/Cône de 10 × 5 m.*AGI difficulté 10/);
  card.querySelector('[data-use]').click();
  const saved=w.localStorage.getItem('cof2_solo_play_'+c.id);
  const resources=JSON.parse(saved);
  assert.equal(resources.pm,c.combat.pmMax);
  assert.equal(resources.pc,c.combat.pcMax);
  assert.equal(resources.dr,c.combat.recoveryMax);
  w.close();
  w=await open(c,saved);
  card=breath(w);
  assert.equal(card.querySelector('[data-use]').disabled,true);
  w.document.querySelector('dialog[open]').close();
  w.document.querySelector('[data-reset=combat]').click();
  assert.equal(breath(w).querySelector('[data-use]').disabled,false);
  if(rank===3)assert.ok(w.document.querySelector('#stats').textContent.includes('RD 3 · '+label));
  w.close();
  cases.push({element,rank,dice,status:'PASS'});
 }
 if(process.env.FOH_DRAKONIDE_REPORT){
  const sha=x=>createHash('sha256').update(x).digest('hex');
  fs.writeFileSync(process.env.FOH_DRAKONIDE_REPORT,JSON.stringify({
   status:'PASS',
   inputs:{indexSha256:sha(forgeHtml),sheetSha256:sha(script),sheetHtmlSha256:sha(html),nativeSha256:sha(fs.readFileSync(path.join(__dirname,'../../forge-of-heroes/native-progression.js')))},
   scope:'Catalogue intégré Compagnon COF2 p.14, moteur Forge, transfert natif, événements DOM et rechargement. Dés physiques, sauvegarde de la cible et RD sur les dégâts reçus gérés à table.',
   cases
  },null,2)+'\n');
 }
 console.log('PASS Drakonide : R1 sans souffle, 4 éléments R2/R3, dégâts et zone affichés, usage sans dépense, rechargement, nouveau combat et RD élémentaire.');
})().catch(error=>{console.error(error);process.exitCode=1;});
