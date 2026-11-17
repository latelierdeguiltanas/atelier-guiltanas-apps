'use strict';
const assert=require('node:assert/strict'),{chromium}=require('playwright');
const {load,standardState}=require('../../forge-of-heroes/FINAL_FREEZE_TESTS/forge_product_runner');
const N=require('../../forge-of-heroes/native-progression.js'),L=require('../library.js');
const {db,engine}=load(),T=db.tables;
const cases=[['halfelin-arquebusier','Halfelin','Arquebusier','people:halfelin:cof2-lb-2024','class:arquebusier:cof2-lb-2024'],['demi-ogre-barbare','Demi-ogre','Barbare','people:demi-ogre:addon-comp2017-cof2','class:barbare:cof2-lb-2024'],['haut-elfe-sorcier','Elfe haut','Sorcier','people:elfe-haut:cof2-lb-2024','class:sorcier:cof2-lb-2024']];
const samples=[];
for(const [key,people,profile,peopleId,profileId] of cases){
 const paths=T.paths_class.filter(p=>p.classId===profileId&&!p.additionalMagePath),draft=standardState(db,profileId,paths[0].id,peopleId),race=T.peoples.find(p=>p.id===peopleId);
 assert(race,key+' peuple non trouvé');draft.identite.nom='QA '+profile;
 for(const [field,rule] of [['bonusStat',race.schema?.bonus],['malusStat',race.schema?.malus]]){if(rule?.mode==='choice')draft.peupleChoices[field]=rule.options[0];else delete draft.peupleChoices[field];}
 if(peopleId.includes('halfelin')){draft.peupleChoices.bonusStat='agi';draft.equip.gmApprovedSwap=true;}
 if(peopleId.includes('demi-ogre'))draft.equip.gmApprovedSwap=true;
 for(const ability of engine.previewAcquiredAbilities(draft))for(const choice of engine.getPersistentChoicesForAbility(draft,ability.id))if(choice.options?.length)(draft.abilityChoices[ability.id]??={})[choice.id]=choice.options[0].id;
 const result=engine.computeCharacterN1(draft);assert.deepEqual(Array.from(result.errors||[]),[],key+' Forge');
 const hero={id:'test-'+key,name:'QA '+profile,people,profile,type:'standard',draft:{}},c=N.toCharacter(hero,{state:draft,result},{paths:[],profiles:[]},db),ranks=c.paths.flatMap(p=>p.ranks);
 assert(L.validCharacter(c),key+' non convertible');assert(ranks.length>=3&&ranks.every(r=>r.owned&&r.name&&r.text),key+' capacités incomplètes');
 assert.equal(ranks.length,result.sticky.acquiredAbilities.length);assert.equal(c.combat.def,result.sticky.DEF);
 assert.equal(JSON.stringify(c.skillBonuses),JSON.stringify(result.sticky.skillBonuses||[]));assert.equal(JSON.stringify(c.passiveFeatures),JSON.stringify(result.sticky.passiveFeatures||[]));
 samples.push({key,c,ranks:ranks.length});console.log('PASS | conversion Forge '+key+' · '+ranks.length+' capacités');
}
(async()=>{const browser=await chromium.launch({headless:true});try{for(const {key,c,ranks}of samples){
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(c=>{window.parent.saveSoloSheet=()=>{};sessionStorage.setItem('guiltanas-player-open',JSON.stringify({character:c,play:null,appearance:null}));},c);
 await page.goto('http://127.0.0.1:4173/atelier-guiltanas-apps/fiches-personnages/fiche/');await page.waitForTimeout(250);if(errors.length)throw Error(key+' erreur initialisation : '+errors.join(' | '));if(!(await page.locator('#play').isVisible()))throw Error(key+' vue masquée : '+JSON.stringify(await page.evaluate(()=>({body:document.body.innerText.slice(0,650),active:document.querySelector('.page.active')?.id,classes:document.body.className}))));
 assert.equal(await page.locator('.identity h1').innerText(),c.name);
 await page.locator('[data-page=abilities]').click();assert.equal(await page.locator('#abilities [data-ui-ability]').count(),ranks,key+' capacités simples');
 await page.locator('[data-view=complete]').click();assert.equal(await page.locator('#abilities .rank').count(),ranks,key+' capacités détaillées');
 const currentDef=Number(await page.locator('#resources .resource').filter({hasText:'Défense'}).locator('b').innerText());assert.equal(currentDef,c.combat.def,key+' DEF à la création');
 await page.locator('[data-page=stats]').click();if(c.passiveFeatures?.length)assert.match(await page.locator('#stats').innerText(),/Effets passifs enregistrés par Forge/i);
 await page.locator('[data-page=play]').click();const play=await page.locator('#play').innerText();
 if(key==='halfelin-arquebusier'){assert.match(play,/Armes à poudre et petite taille/);if(/p[ée]toire/i.test(c.equipment.join(' ')+c.attacks.map(a=>a.name).join(' ')))assert(await page.locator('[data-petoire-load]').count()>0);}
 if(key==='demi-ogre-barbare')assert.match(play,/Demi-ogre/);
 if(key==='haut-elfe-sorcier')assert(c.combat.pmMax>0&&await page.locator('[data-count=pm]').count()>0);
 assert.deepEqual(errors,[],key+' erreur JS');console.log('PASS | affichage et fonctions '+key);await page.close();
 }}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
