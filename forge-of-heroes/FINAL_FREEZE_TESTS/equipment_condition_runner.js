'use strict';
const assert=require('assert/strict'),path=require('path');
const {load,standardState,withRank}=require('./forge_product_runner');
const {db,engine}=load(path.resolve(__dirname,'../index.html'));
const t=db.tables||db,copy=x=>JSON.parse(JSON.stringify(x));
const seduction=t.paths_class.find(x=>x.classId==='class:barde:cof2-lb-2024'&&x.id.includes('voie-de-la-seduction')).id;
function barde(rank,cha=3){
 const s=standardState(db,'class:barde:cof2-lb-2024',seduction);
 s.baseCaracs={for:1,agi:2,con:0,per:1,int:0,vol:-1,cha};s.peupleChoices.humainStat='vol';
 s.equip.armorId='';withRank(db,s,seduction,rank);return s;
}
function result(s){const r=copy(engine.computeCharacterN1(s));assert.deepEqual(r.errors,[]);return r.sticky;}
let checks=0;function test(name,run){run();checks++;console.log('PASS',name);}
for(const rank of [2,3])test('unarmored barde bonus follows path rank '+rank,()=>{
 const s=barde(rank),before=copy(s),r=result(s);
 assert.equal(r.DEF,10+r.caracs.agi+Math.min(r.caracs.cha,rank));
 assert.equal(r.characterState.derived.DEF,r.DEF);assert.equal(r.totals.DEF,r.DEF);assert.deepEqual(s,before);
});
test('CHARISMA remains the ceiling when below path rank',()=>{
 const s=barde(3);s.baseCaracs.cha=2;s.baseCaracs.agi=3;const r=result(s);
 assert.equal(r.DEF,10+r.caracs.agi+2);
});
test('armor on/off/on is reversible and does not retain unarmored bonus',()=>{
 const s=barde(3),bare=result(s),rule=t.profile_rules.find(x=>x.profileId===s.classeId),armorId=rule.initialEquipment.requiredArmorId;
 assert.ok(armorId);s.equip.armorId=armorId;const armored=result(s),armor=t.armors.find(x=>x.id===armorId);
 assert.equal(armored.DEF,10+Math.min(armored.caracs.agi,armor.agiCap)+(armor.defBonus??armor.def));
 s.equip.armorId='';assert.deepEqual(result(s),bare);
 s.equip.armorId=armorId;assert.deepEqual(result(s),armored);
});
test('priest unarmored spiritual bonus is reversible',()=>{
 const spirit=t.paths_class.find(x=>x.id.includes('voie-de-la-spiritualite')).id;
 const s=standardState(db,'class:pretre:cof2-lb-2024',spirit);s.profileChoices.priestMode='generalist';const armor=s.equip.armorId,armored=result(s);
 assert.ok(armor);s.equip.armorId='';const bare=result(s);
 assert.equal(bare.DEF,10+bare.caracs.agi+bare.equip.bouclierDEF+2);
 s.equip.armorId=armor;assert.deepEqual(result(s),armored);
});
test('shield removal and restoration do not leave a defense bonus',()=>{
 const s=standardState(db,'class:guerrier:cof2-lb-2024');
 const paths=t.paths_class.filter(x=>x.classId===s.classeId&&!x.id.includes('voie-du-bouclier'));
 s.voies.profilePathIds=paths.slice(0,2).map(x=>x.id);
 s.profileChoices.preferredWeaponCategory='swords';s.equip.gmApprovedSwap=true;const shield=t.shields[0];s.equip.shieldId=shield.id;const withShield=result(s);
 s.equip.shieldId='';const without=result(s);
 assert.equal(withShield.DEF-without.DEF,shield.defBonus??shield.def);
 s.equip.shieldId=shield.id;assert.deepEqual(result(s),withShield);
});
console.log(checks+' equipment condition checks passed.');
