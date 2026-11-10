'use strict';
const assert=require('node:assert/strict'),crypto=require('node:crypto'),fs=require('node:fs'),path=require('node:path');
const F=require('./forge_product_runner');
const root=path.resolve(__dirname,'..'),{html,db,engine:E}=F.load(root+'/index.html'),T=db.tables;
const report={status:'PENDING',products:[{file:'index.html',sha256:crypto.createHash('sha256').update(html).digest('hex')}],source:'COF2 Livre de base pp.44–59, 86, 183–188',peoples:{}};
const peopleChoices={
 humain:{humainStat:'con'},nain:{bonusStat:'con'},
 'demi-elfe':{bonusStat:'per',malusStat:'for'},'demi-orc':{bonusStat:'for',malusStat:'cha'},
 'elfe-haut':{bonusStat:'int'},'elfe-sylvain':{bonusStat:'agi'},
 gnome:{bonusStat:'int'},halfelin:{bonusStat:'agi'}
};
const standardWeapons=T.weapons_n1.filter(w=>w.source?.book==='COF2 Livre de base');
assert.equal(standardWeapons.length,41);
// Independent list from the equipment damage dice and Halfelin's Petite taille.
const forbidden=new Set(['great-sword','great-axe','cavalry-lance','heavy-crossbow','longbow','musket']);
const twoHands=new Set(['bastard-sword','long-sword','great-flail','axe','pike','vivelame','light-crossbow','powder-pistol','scimitar','scythe','pickaxe']);
const armors=T.armors.filter(a=>!a.id.includes('os-sorcier'));
assert.equal(armors.length,7);
const shield=T.shields.find(x=>x.id.includes(':petit:'));
function draft(key){
 const s=F.standardState(db,'class:guerrier:cof2-lb-2024',undefined,'people:'+key+':cof2-lb-2024');
 s.peupleChoices={...peopleChoices[key]};
 if(key==='demi-elfe')s.voies.peoplePathId='path:voie-de-l-humain:cof2-lb-2024';
 if(key==='gnome')s.peupleChoices.grantedAbilityId=T.abilities_class.find(a=>a.rank===1&&a.path_id.includes('voie-des-illusions')).id;
 s.voies.profilePathIds=T.paths_class.filter(p=>p.classId===s.classeId&&!/bouclier|maitre-d-armes/.test(p.id)).slice(0,2).map(p=>p.id);
 s.equip={...s.equip,armorId:'',shieldId:'',weaponIds:['weapon:dagger'],gmApprovedSwap:true};
 return s;
}
for(const key of Object.keys(peopleChoices)){
 const s=draft(key),row={weapons:0,armorAndShields:0,saveReload:false,status:'PENDING'};
 for(const w of standardWeapons){
  s.equip.weaponIds=[w.id];
  const r=E.computeCharacterN1(s),id=w.id.split(':')[1];
  if(key==='halfelin'&&forbidden.has(id))assert.match(r.errors.join(' '),/interdite par la petite taille/,w.id);
  else{
   assert.deepEqual(Array.from(r.errors),[],key+' '+w.id);
   const attack=r.sticky.attacks.find(a=>a.weaponId===w.id);
   assert(attack?.mastered,key+' '+w.id);
   assert.equal(attack.hands,key==='halfelin'&&twoHands.has(id)?2:(w.hands||1),key+' '+w.id);
   if(key==='halfelin'&&twoHands.has(id)){
    s.equip.shieldId=shield.id;
    assert.match(E.computeCharacterN1(s).errors.join(' '),/deux mains/,w.id);
    s.equip.shieldId='';
   }
  }
  row.weapons++;
 }
 s.equip.weaponIds=['weapon:dagger'];
 for(const armor of armors){
  s.equip.armorId=armor.id;
  const r=E.computeCharacterN1(s);
  if(armor.defBonus>5)assert.match(r.errors.join(' '),/Armure non maîtrisée/);
  else{
   assert.deepEqual(Array.from(r.errors),[]);
   assert.equal(r.sticky.characterState.calculationTrace.DEF.armor,armor.defBonus);
  }
  row.armorAndShields++;
 }
 s.equip.armorId='';
 for(const shield of T.shields){
  s.equip.shieldId=shield.id;
  const r=E.computeCharacterN1(s);
  assert.deepEqual(Array.from(r.errors),[]);
  assert.equal(r.sticky.characterState.equipment.shieldId,shield.id);
  row.armorAndShields++;
 }
 const result=E.computeCharacterN1(s);
 const saved=E.createHeroSavePayload(s,result.sticky.characterState,{id:'equipment-'+key});
 const restored=E.computeCharacterN1(E.restoreHeroSavePayload(JSON.parse(JSON.stringify(saved))).draft);
 assert.deepEqual(Array.from(restored.errors),[]);
 assert.equal(JSON.stringify(restored.sticky.characterState.equipment),JSON.stringify(result.sticky.characterState.equipment));
 row.saveReload=true;
 // Page 55 explicitly names the rapier as unsuitable in one hand, while
 // the p. 183 catalogue gives it 1d6, the one-handed cutoff. Preserve
 // both source statements and keep the size criterion open.
 row.status=key==='halfelin'?'A_VERIFIER':'PASS';
 if(key==='halfelin')row.openIssue='Rapière : p. 55, exception à une main ; p. 183, DM 1d6. Arbitrage à vérifier.';
 report.peoples[key]=row;
}
report.status='PASS';
fs.writeFileSync(root+'/QA/N1/official-people-equipment.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));
