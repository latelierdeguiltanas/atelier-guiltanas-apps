'use strict';
const assert=require('assert/strict'),path=require('path');
const {load,standardState,withRank}=require('./forge_product_runner');
const {db,engine}=load(path.resolve(__dirname,'../index.html')),t=db.tables||db,copy=x=>JSON.parse(JSON.stringify(x));
let checks=0;
function verify(state){const before=copy(state),r=copy(engine.computeCharacterN1(state));assert.deepEqual(r.errors,[]);assert.deepEqual(state,before);const s=r.sticky,tr=s.calculationTrace;
 for(const key of ['PV','DEF','INIT','PC','PM'])assert.equal(tr[key].final,s[key],key);
 assert.deepEqual(tr.characteristics.final,s.caracs);assert.deepEqual(tr.characteristics.base,state.baseCaracs);assert.deepEqual(tr,s.characterState.calculationTrace);
 assert.equal(tr.PV.baseFamily+tr.PV.CON+tr.PV.capacityAndOtherModifiers,s.PV);
 assert.equal(tr.DEF.base+tr.DEF.AGI+tr.DEF.armor+tr.DEF.shield+tr.DEF.capacityAndOtherModifiers,s.DEF);
 assert.equal(tr.INIT.base+tr.INIT.PER+tr.INIT.capacityAndOtherModifiers,s.INIT);
 assert.equal(tr.PC.base+tr.PC.CHA+tr.PC.familyBonus+tr.PC.peopleAndCapacityModifiers,s.PC);
 assert.equal(tr.DR.baseFamily+tr.DR.CON+tr.DR.otherModifiers,s.DR.count);assert.equal(tr.DR.die,s.DR.die);
 assert.deepEqual(tr.attacks.map(a=>a.final),s.attacks.map(a=>a.attackBonus));
 assert.deepEqual(tr.PM.spellsLearned.map(a=>a.id),s.acquiredAbilities.filter(a=>a.spell).map(a=>a.id));checks++;return s;
}
const sed=t.paths_class.find(x=>x.id.includes('voie-de-la-seduction'));
for(const rank of [1,2,3]){const s=standardState(db,sed.classId,sed.id);s.equip.armorId='';s.baseCaracs={for:1,agi:2,con:0,per:1,int:0,vol:-1,cha:3};s.peupleChoices.humainStat='vol';withRank(db,s,sed.id,rank);const r=verify(s);if(rank===3){assert.equal(r.DEF,14);assert.equal(r.calculationTrace.DEF.capacityAndOtherModifiers,3);}const bare=copy(r);s.equip.armorId=t.profile_rules.find(x=>x.profileId===s.classeId).initialEquipment.requiredArmorId;verify(s);s.equip.armorId='';assert.deepEqual(verify(s),bare);}
for(const id of ['class:magicien:cof2-lb-2024','class:guerrier:cof2-lb-2024','class:pretre:cof2-lb-2024']){const s=standardState(db,id);s.profileChoices.preferredWeaponCategory='swords';s.profileChoices.priestMode='generalist';verify(s);}
const s=standardState(db,sed.classId,sed.id);s.profileMode='NO_PROFILE';s.noProfile={enabled:true,pathIds:s.voies.profilePathIds.slice()};withRank(db,s,sed.id,3);const a=verify(s);s.voies.profilePathIds.reverse();s.noProfile.pathIds=s.voies.profilePathIds.slice();const b=verify(s);assert.equal(a.calculationTrace.PV.baseFamily,b.calculationTrace.PV.baseFamily);
const warriorPath=t.paths_class.find(p=>p.classId==='class:guerrier:cof2-lb-2024'&&p.id.includes('voie-de-la-resistance'));
const mixed=standardState(db,sed.classId,sed.id);mixed.profileMode='NO_PROFILE';mixed.voies.profilePathIds=[sed.id,warriorPath.id];mixed.noProfile={enabled:true,pathIds:mixed.voies.profilePathIds.slice()};const m=verify(mixed);assert.equal(m.calculationTrace.PV.baseFamily,9);mixed.voies.profilePathIds.reverse();mixed.noProfile.pathIds=mixed.voies.profilePathIds.slice();assert.equal(verify(mixed).calculationTrace.PV.baseFamily,9);
const hybrid=standardState(db,sed.classId,sed.id);hybrid.voies.profilePathIds=[sed.id,warriorPath.id];hybrid.hybrid={enabled:true,gmApproved:true,primaryProfileId:sed.classId,secondaryProfileId:warriorPath.classId,primaryPathId:sed.id,secondaryPathId:warriorPath.id};const h=verify(hybrid);assert.equal(h.calculationTrace.PV.baseFamily,9);
console.log(checks+' calculation trace checks passed.');
