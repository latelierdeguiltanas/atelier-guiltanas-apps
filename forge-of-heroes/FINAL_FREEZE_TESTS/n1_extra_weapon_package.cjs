'use strict';
const assert = require('node:assert/strict');
const vm = require('node:vm');
const path = require('node:path');
const {load,standardState} = require('./forge_product_runner');
for (const file of ['index.html','FORGE_OF_HEROES_ATELIER_GUILTANAS_PRODUCT_MASTER.html']) {
  const {html,db,engine} = load(path.resolve(__dirname,'..',file));
  const T = db.tables;
  const profile = T.classes.find(p => p.id.includes(':ensorceleur:'));
  const state = standardState(db,profile.id);
  const d = {primaryId:profile.id,peopleId:state.peupleId,packageId:'extra_mastered',type:'standard'};
  const nodes = {};
  const $ = id => nodes[id] ||= {classList:{toggle(){}}};
  let options = [];
  const ctx = {T,d,$,rule:()=>T.profile_rules.find(r=>r.profileId===profile.id),equipmentProfileId:()=>profile.id,
    optionHtml:(rows,value,label)=>{if(rows[0]?.damage) options=rows.map(w=>w.id);return rows.map(label).join(',');}};
  ctx.render=()=>ctx.selectEquipment();
  vm.createContext(ctx);
  vm.runInContext(html.slice(html.indexOf('function selectEquipment(){'),html.indexOf('\nfunction ',html.indexOf('function selectEquipment(){')+1))+
    html.split('\n').find(l=>l.startsWith('function equipment(){')),ctx);
  ctx.render();
  const picker=$('extra-mastery-weapon');
  const eligible=T.weapons_n1.filter(w=>(/^1d[346]$/.test(w.damage)&&w.hands>0||w.id==='weapon:light-crossbow')&&!['weapon:dagger','weapon:iron-staff'].includes(w.id));
  assert.deepEqual(options,eligible.map(w=>w.id));
  for(const weapon of eligible){
    picker.value=weapon.id;picker.onchange();
    state.equip=ctx.equipment();
    state.profileChoices.extraMasteryWeaponId=d.extraMasteryWeaponId;
    assert.equal(state.equip.weaponIds[0],weapon.id);
    assert.deepEqual(Array.from(engine.computeCharacterN1(state).errors),[]);
  }
  for(const w of T.weapons_n1.filter(w=>w.damage==='2d6')){
    state.profileChoices.extraMasteryWeaponId=w.id;
    state.equip.weaponIds=[w.id];
    assert.ok(engine.computeCharacterN1(state).errors.some(e=>e.includes('supérieurs au d6')));
  }
  console.log(file,eligible.length,'legal weapons; 2d6 refused');
}
