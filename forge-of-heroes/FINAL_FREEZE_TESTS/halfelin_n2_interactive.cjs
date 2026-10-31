'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const F = require('./forge_product_runner');
const root = path.resolve(__dirname,'..');
const {db,engine:E} = F.load(root+'/index.html');
const cat = require(root+'/progression/catalog.json');
const A = require(root+'/native-progression');
const C = require(root+'/progression/core').create(cat);
const store = new Map();
global.localStorage = {getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)};
require('../../fiches-personnages/library.js');
require('../../fiches-personnages/forge-link.js');
(async () => {
const monk='class:moine:cof2-lb-2024',sorc='class:sorcier:cof2-lb-2024',pathId=n=>'classpath:'+n+':class-moine:cof2-lb-2024',a=pathId('voie-de-la-maitrise'),b='classpath:voie-de-la-mort:class-sorcier:cof2-lb-2024',state=F.standardState(db,monk,a,'people:halfelin:cof2-lb-2024');state.baseCaracs={for:0,agi:3,con:1,per:-1,int:2,vol:1,cha:0};state.peupleChoices={bonusStat:'agi'};state.voies.profilePathIds=[a,b];state.hybrid={enabled:true,gmApproved:true,primaryProfileId:monk,secondaryProfileId:sorc,primaryPathId:a,secondaryPathId:b};state.equip={...state.equip,armorId:'',shieldId:'',weaponIds:[],gmApprovedSwap:true};let count = 0;
const histories = process.argv.includes('--histories')
  ? db.tables.history_paths.filter(p => p.category === 'geographic').flatMap(g =>
      db.tables.history_paths.filter(p => p.category === 'professional').map(p => [g.id,p.id]))
  : [null];
for (const pair of histories) {
  if (pair) {
    state.voies.profilePathIds = [a];
    state.advancedRules.histories = true;
    state.history = {geographicPathId:pair[0],professionalPathId:pair[1]};
  }
  const result=E.computeCharacterN1(state);assert.equal(result.errors.length,0,result.errors.join());const rec=C.begin(A.convert({id:'halfelin-interactive',type:'hybrid',name:'Halfelin témoin',people:'Halfelin',profile:'Moine / Sorcier',draft:{step:9}},{state,result},cat,db));for(const attack of['FOR','AGI'])for(const damage of['FOR','VOL']){const next=C.commit(rec,[{pathId:pathId('voie-du-poing'),rank:1,abilityChoices:{unarmedAttackStat:attack}},{pathId:pathId('voie-de-l-energie-vitale'),rank:1,abilityChoices:{unarmedDamageStat:damage}}]);
const entry = await global.FOHPlayerBridge.openProgression(next,C,{redirect:false});
const saved = global.FOHPlayerLibrary.read().data.entries[entry.id].character;
assert.equal(saved.level,2);
assert.equal(saved.combat.pvMax,next.head.combat.pvMax);
assert.equal(saved.combat.def,next.head.combat.def);
const hand = saved.attacks.find(a => /mains nues/i.test(a.name));
assert.equal(hand.attack,attack === 'AGI' ? 6 : 1);
assert.equal(hand.damage,damage === 'VOL' ? '1d6+1' : '1d6-1');
}
count+=4;
}
console.log(count,'PASS halfelin N2 choices opened and reread in the interactive player library, PDF absent.');
})().catch(error => {console.error(error); process.exitCode=1;});
