'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const F = require('./forge_product_runner');
const V2 = require('../peuples-compagnon-v2');
const {db, engine, html} = F.load();
const barbare = 'class:barbare:cof2-lb-2024';
const state = kind => {
  const s = F.standardState(db,barbare,undefined,V2.ids[kind]);
  s.baseCaracs = {for:-1,agi:2,con:0,per:1,int:3,vol:0,cha:1};
  s.voies.peoplePathId = V2.paths[kind];
  s.peupleChoices = kind==='soul'?{malusStat:'cha'}:{};
  return s;
};
const compute = s => {
  const result = engine.computeCharacterN1(s);
  assert.deepEqual(Array.from(result.errors),[]);
  return result.sticky;
};
const racial = (kind,rank) => db.tables.abilities_people.find(a=>a.path_id===V2.paths[kind]&&a.rank===rank);
const close = value => JSON.parse(JSON.stringify(value));
for (const [kind,race] of Object.entries(V2.rules)) {
  assert.deepEqual(db.tables.abilities_people.filter(a=>a.path_id===V2.paths[kind]).map(a=>a.label),race.ranks.map(a=>a[0]));
}
for (const malus of ['cha','int']) {
  const s=state('soul');s.peupleChoices.malusStat=malus;
  const r=compute(s);
  assert.equal(r.caracs.con,1);
  assert.equal(r.caracs[malus],s.baseCaracs[malus]-1);
  assert.equal(r.bonuses.DEF,1);
  assert.equal(r.traits.damageReduction[0].value,5);
  assert.deepEqual(Array.from(r.traits.damageReduction[0].types),['fire','cold','life_drain']);
  assert.equal(r.traits.magicalHealingMultiplier,0.5);
  assert.equal(r.attacks.find(a=>a.weaponId==='weapon:unarmed').damage,'1d3-1');
  assert(!r.traits.criticalProtocol);
}
for (const kind of ['fairy','sprite']) {
  const s=state(kind);
  const r=compute(s);
  assert.equal(r.caracs.for,-3);
  assert.equal(r.caracs.agi,3);
  assert.equal(r.caracs.con,-1);
  assert.equal(r.caracs.cha,kind==='fairy'?2:1);
  assert.equal(r.caracs.per,kind==='sprite'?2:1);
  assert.equal(r.bonuses.DEF,2);
  assert.equal(r.traits.darkvisionMeters,20);
  assert.equal(r.traits.stealthBonus,5);
  assert.equal(r.traits.damageReduction[0].exceptMaterial,'cold_iron');
  for(const a of r.attacks.filter(a=>a.weaponId&&a.weaponId!=='weapon:unarmed'))assert.equal(a.damage,a.hands===2?'1d6':'1d4');
  assert(!r.resources?.teleport);
  assert(r.skillBonuses.some(b=>b.value===5&&b.tests.includes('discrétion')));
  const capped=close(s);capped.baseCaracs.for=3;capped.baseCaracs.int=-1;
  assert(engine.computeCharacterN1(capped).errors.some(x=>x.includes('FOR finale')));
}
const sprite=state('sprite');F.withRank(db,sprite,V2.paths.sprite,3);
const far=compute(sprite);
assert.equal(far.PM,0);
assert.equal(far.traits.damageReduction[0].value,3);
assert.equal(far.permissions.racialAbilities.length,2);
assert.equal(far.permissions.racialAbilities.find(x=>x.dailyUses).manaCost,0);
const fairy=state('fairy');fairy.voies.peoplePathId=V2.paths.sprite;F.withRank(db,fairy,V2.paths.sprite,3);
assert(engine.computeCharacterN1(fairy).errors.some(x=>x.includes('Poudre de fée')));
const dust=racial('fairy',3),choices=engine.getPersistentChoicesForAbility(fairy,dust.id)[0].options;
assert(choices.length>4);
assert(!choices.some(x=>/Murmures dans le vent/.test(x.label)));
for(const rank of [1,2]){
  const pick=choices.find(x=>db.tables.abilities_class.find(a=>a.id===x.id).rank===rank);
  assert(pick);
  fairy.abilityChoices={[dust.id]:{fairyDustAbility:pick.id}};
  const r=compute(fairy),ability=r.permissions.racialAbilities[0];
  assert.equal(r.PM,0);
  assert.equal(ability.dailyUses,3);
  assert.equal(ability.manaCost,0);
  assert.equal(ability.armorAllowed,rank===1);
  assert.equal(r.traits.damageReduction[0].value,3);
  assert(r.acquiredAbilities.some(a=>a.pathId===V2.paths.fairy&&a.rank===3));
}
const root=path.resolve(__dirname,'../..');
for(const id of ['zepheline','vivelame']){
  const box={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'ile-aux-tempetes-bastide/personnages',id,'data.js'),'utf8'),box);
  const before=box.window.BASTIDE_CHARACTER;before.level=3;before.companions=[{name:'Monture de campagne',pv:12}];before.paths[0].ranks.find(r=>r.rank===3).owned=id==='zepheline';
  const snapshot=close(before),after=V2.hubCharacter(before);
  assert.notEqual(after,before);
  assert.deepEqual(close(before),snapshot);
  assert.equal(V2.hubCharacter(after),after);
  assert.equal(after.level,3);
  assert.deepEqual(after.paths.slice(1),snapshot.paths.slice(1));
  assert.deepEqual(after.equipment,snapshot.equipment);
  assert.deepEqual(after.companions,snapshot.companions);
  assert.equal(after.combat.pvMax,snapshot.combat.pvMax);
  assert.equal(after.combat.pmMax,snapshot.combat.pmMax);
  if(id==='zepheline'){
    assert.equal(after.people,'Lutin · Fée');
    assert.equal(after.stats.CHA,snapshot.stats.CHA+1);
    assert.equal(after.combat.def,snapshot.combat.def+1);
    assert.equal(after.combat.pcMax,snapshot.combat.pcMax+1);
    assert.equal(after.paths[0].ranks[2].name,'Poudre de fée');
    assert(after.paths[0].ranks[2].owned&&after.peoplePendingChoice);
  }else{
    assert.equal(after.paths[0].ranks[0].name,'Métallique');
    assert.equal(after.combat.def,snapshot.combat.def);
    assert(after.attacks.some(a=>a.name.includes('Métallique')&&a.damage==='1d3'));
  }
}
assert(html.includes('id="FOH_COMPANION_V2"'));
console.log('PASS Âme-forgée, Lutin Fée/Farfadet, Poudre R1/R2, ancienne voie, projection Hub idempotente et conservation des personnages.');
