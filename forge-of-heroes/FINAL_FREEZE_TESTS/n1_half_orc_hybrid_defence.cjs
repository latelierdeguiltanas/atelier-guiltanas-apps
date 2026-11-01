'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const {load,standardState} = require('./forge_product_runner');
const {toCharacter} = require('../native-progression');
const catalog = require('../progression/catalog.json');
const primary = 'class:barbare:cof2-lb-2024', secondary = 'class:forgesort:cof2-lb-2024';
const first = 'classpath:voie-du-pagne:class-barbare:cof2-lb-2024';
const second = 'classpath:voie-des-runes:class-forgesort:cof2-lb-2024';
let cases = 0;
for(const file of ['index.html','FORGE_OF_HEROES_ATELIER_GUILTANAS_PRODUCT_MASTER.html']){
 const {db,engine} = load(path.join(__dirname,'..',file));
 for(const bonusStat of ['for','con'])for(const malusStat of ['int','cha'])for(const leather of [true,false]){
  const state = standardState(db,primary,first,'people:demi-orc:cof2-lb-2024');
  state.characteristicMethod = {type:'ADVANCED_POINT_BUY'};
  state.baseCaracs = {for:1,agi:1,con:2,per:-1,int:3,vol:1,cha:-1};
  state.peupleChoices = {bonusStat,malusStat};
  state.hybrid = {enabled:true,gmApproved:true,primaryProfileId:primary,secondaryProfileId:secondary,primaryPathId:first,secondaryPathId:second};
  state.voies.profilePathIds = [first,second];
  if(!leather)state.equip.armorId='';
  const result = engine.computeCharacterN1(state);
  assert.deepEqual(Array.from(result.errors),[]);
  const expected = {...state.baseCaracs};
  expected[bonusStat]++;expected[malusStat]--; // COF2, demi-orc, p. 47.
  const sheet = toCharacter({id:'qa-half-orc',type:'hybrid',name:'Témoin',profile:'Barbare + Forgesort',people:'Demi-orc',draft:{}},{state,result},catalog,db);
  for(const [key,value] of Object.entries(expected))assert.equal(sheet.stats[key.toUpperCase()],value);
  // Hybrid family halves, CON and Vigueur R1. Runes R1 grants +2 even without armor.
  assert.equal(sheet.combat.pvMax,5+3+expected.con+1);
  assert.equal(sheet.combat.def,10+expected.agi+(leather?2:0)+2);
  assert.equal(sheet.combat.init,10+expected.per);
  assert.equal(sheet.combat.contact,1+expected.for);
  assert.equal(sheet.combat.magic,1+expected.vol);
  assert.equal(sheet.combat.pmMax,0);
  cases++;
 }
}
console.log(cases+' PASS — demi-orc hybride, quatre choix raciaux, avec et sans cuir, deux versions.');
