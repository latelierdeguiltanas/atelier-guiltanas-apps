'use strict';
const assert=require('node:assert/strict'),path=require('node:path'),{load,standardState}=require('./forge_product_runner'),root=path.resolve(__dirname,'..');let count=0;
for(const file of ['index.html','FORGE_OF_HEROES_ATELIER_GUILTANAS_PRODUCT_MASTER.html']){
 const {db,engine:E}=load(root+'/'+file),T=db.tables;
 function base(people,mode,weapon,shield=''){
  const s=standardState(db,'class:guerrier:cof2-lb-2024',undefined,people);s.peupleChoices={bonusStat:'agi'};s.voies.profilePathIds=T.paths_class.filter(p=>p.classId===s.classeId&&!/bouclier|maitre-d-armes/.test(p.id)).slice(0,2).map(p=>p.id);
  if(/:(lutin|fee):/.test(people)){s.baseCaracs={for:-1,agi:2,con:1,per:1,int:3,vol:0,cha:0};s.voies.peoplePathId='path:voie-de-letre-feerique:addon-comp2017-cof2';}
  s.equip={initialPackageId:T.profile_rules.find(r=>r.profileId===s.classeId).initialEquipment.packages[0].id,weaponIds:[weapon],armorId:'',shieldId:shield,tinyFitted:true,gmApprovedSwap:true};
  if(mode==='no-profile'){s.profileMode='NO_PROFILE';s.noProfile={enabled:true,primaryPathId:s.voies.profilePathIds[0],pathIds:s.voies.profilePathIds.slice()};}
  if(mode==='hybrid'){const other=T.paths_class.find(p=>p.classId==='class:barbare:cof2-lb-2024'&&!p.additionalMagePath);s.voies.profilePathIds[1]=other.id;s.hybrid={enabled:true,gmApproved:true,primaryProfileId:s.classeId,secondaryProfileId:other.classId,primaryPathId:s.voies.profilePathIds[0],secondaryPathId:other.id};}
  return s;
 }
 for(const mode of ['standard','hybrid','no-profile']){
  for(const people of ['people:gobelin:addon-comp2017-cof2','people:kobold:addon-comp2017-cof2']){
   for(const weapon of ['weapon:great-sword','weapon:great-axe','weapon:longbow','weapon:heavy-crossbow']){const s=base(people,mode,weapon),before=JSON.stringify(s),r=E.computeCharacterN1(s);assert.ok(r.errors.length,people+' '+mode+' must reject '+weapon);assert.match(r.errors.join(' '),/taille|interdite/i);assert.equal(JSON.stringify(s),before);count++;}
   const s=base(people,mode,'weapon:long-sword'),r=E.computeCharacterN1(s);assert.equal(r.errors.length,0,r.errors.join(' | '));const attack=r.sticky.attacks.find(a=>a.weaponId==='weapon:long-sword');assert.ok(attack);assert.equal(attack.hands,2);assert.equal(attack.damage,'1d8+2');assert.ok(attack.properties.includes('two_handed_for_size'));
   s.equip.shieldId='shield:petit:cof2-lb-2024';const blocked=E.computeCharacterN1(s);assert.match(blocked.errors.join(' '),/deux mains/);s.equip.shieldId='';assert.deepEqual(E.computeCharacterN1(s).sticky,r.sticky);const payload=E.createHeroSavePayload(s,r.sticky.characterState,{id:'size-test'}),back=E.computeCharacterN1(E.restoreHeroSavePayload(JSON.parse(JSON.stringify(payload))).draft);assert.equal(back.errors.length,0);assert.equal(back.sticky.attacks.find(a=>a.weaponId==='weapon:long-sword').hands,2);count++;
   const ordinary=base('people:humain:cof2-lb-2024',mode,'weapon:long-sword');ordinary.peupleChoices={humainStat:'con'};const human=E.computeCharacterN1(ordinary);assert.equal(human.errors.length,0,human.errors.join(' | '));assert.equal(human.sticky.attacks.find(a=>a.weaponId==='weapon:long-sword').hands,1);count++;
  }
  for(const people of ['people:lutin:addon-comp2017-cof2','people:fee:addon-comp2017-cof2']){
   const bad=base(people,mode,'weapon:great-sword');assert.match(E.computeCharacterN1(bad).errors.join(' '),/féerique.*d4/);bad.equip.weaponIds=['weapon:dagger'];const good=E.computeCharacterN1(bad);assert.equal(good.errors.length,0,good.errors.join(' | '));assert.equal(good.sticky.attacks[0].damage,'1d4-1');bad.equip.armorId='armor:cuir-simple:cof2-lb-2024';bad.equip.tinyFitted=false;assert.match(E.computeCharacterN1(bad).errors.join(' '),/taille|ajust/);count++;
  }
 }
}
console.log('PASS '+count+' size/equipment cases across both engines: 2d6 rejected, d8 at two hands without shield, hand count/damage/save/reload, no-profile racial limits, legal d4 counterparts and ordinary-human regression. Sources Compagnon pp.15,17; Forge tiny-equipment policy.');
