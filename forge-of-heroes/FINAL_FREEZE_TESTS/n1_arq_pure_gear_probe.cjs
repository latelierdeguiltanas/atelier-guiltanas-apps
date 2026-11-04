'use strict';
/* COF2 base book printed pp.62,188: Arquebusier PURE equipment.
 * Probe legal light armors and forbidden shield/heavy-armor effects on BOTH
 * shipped engines, separating certified legal cases from diagnostics.
 * Do not conflate "can wear" and "can activate profile abilities".
 */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {load,standardState}=require('./forge_product_runner');
const ROOT=path.resolve(__dirname,'..'),SHA=x=>crypto.createHash('sha256').update(x).digest('hex'),copy=x=>JSON.parse(JSON.stringify(x));
const cls='class:arquebusier:cof2-lb-2024',races=['humain','nain','demi-elfe','demi-orc','elfe-haut','elfe-sylvain','gnome','halfelin'],ruleBonus={
 humain:{humainStat:'con'},nain:{bonusStat:'con',malusStat:'agi'},'demi-elfe':{bonusStat:'per',malusStat:'for'},'demi-orc':{bonusStat:'for',malusStat:'cha'},'elfe-haut':{bonusStat:'int',malusStat:'for'},'elfe-sylvain':{bonusStat:'agi',malusStat:'for'},gnome:{bonusStat:'int',malusStat:'for'},halfelin:{bonusStat:'agi',malusStat:'for'}};
const report={schema:'FOH_N1_ARQ_PURE_GEAR_SOURCE_DIAGNOSIS',at:new Date().toISOString(),source:'COF2 Livre de base pp.62 et 188',pureOnly:true,sourceRules:{allOneHandMeleeAndRanged:true,powderMastery:true,armorAbilitiesMaxDef:4,shieldForbiddenForAbilities:true,startingArmorDef:3},products:[],legalArmorChecks:0,legalArmorFailures:0,diagnostics:[],errors:[],status:'PENDING'};
for(const file of ['index.html','FORGE_OF_HEROES_ATELIER_GUILTANAS_PRODUCT_MASTER.html']){
 const {html,db,engine:E}=load(path.join(ROOT,file)),T=db.tables;
 const paths=T.paths_class.filter(x=>x.classId===cls&&!x.additionalMagePath),rule=T.profile_rules.find(x=>x.profileId===cls);
 assert.equal(paths.length,5);assert(rule);
 const armors=T.armors||[],shields=T.shields||[];
 const legal=armors.filter(x=>Number(x.defBonus??x.def)<=4),heavy=armors.filter(x=>Number(x.defBonus??x.def)>4),pistol=T.weapons_n1.find(x=>x.id==='weapon:powder-pistol');
 assert(legal.length>=3&&heavy.length>=2&&shields.length>=1&&pistol,'Equipment catalogue incomplete');
 const pr={file,sha256:SHA(html),rule:{profileId:rule.profileId,masteries:rule.masteries,initialEquipment:rule.initialEquipment},legalArmor:legal.map(x=>({id:x.id,label:x.label,def:x.defBonus??x.def,agiCap:x.agiCap})),heavyArmor:heavy.map(x=>({id:x.id,label:x.label,def:x.defBonus??x.def})),shields:shields.map(x=>({id:x.id,label:x.label,def:x.defBonus??x.def})),races:[]};
 report.products.push(pr);
 for(const race of races){
  const s=standardState(db,cls,paths[0].id,'people:'+race+':cof2-lb-2024');
  s.voies.profilePathIds=[paths[0].id,paths[3].id];s.peupleChoices={...ruleBonus[race]};
  if(race==='demi-elfe')s.voies.peoplePathId=T.paths_people.find(p=>p.id.includes('voie-de-l-humain'))?.id;
  if(race==='gnome')s.peupleChoices.grantedAbilityId=T.abilities_class.find(a=>a.rank===1&&a.path_id.includes('voie-de-l-air')&&a.path_id.includes('ensorceleur'))?.id;
  s.equip={...s.equip,gmApprovedSwap:true,armorId:'',shieldId:'',weaponIds:['weapon:dagger']};
  const bare=E.computeCharacterN1(s),r={race,legal:0,refused:[],heavy:[],shield:[],powder:[]};pr.races.push(r);
  if(bare.errors.length){report.legalArmorFailures++;report.errors.push({file,race,phase:'bare',errors:bare.errors});continue;}
  const baseDef=bare.sticky.DEF,baseAgi=bare.sticky.caracs.agi;
  for(const armor of legal){
   const dressed=copy(s);dressed.equip.armorId=armor.id;const x=E.computeCharacterN1(dressed);report.legalArmorChecks++;
   if(x.errors.length){report.legalArmorFailures++;r.refused.push({armor:armor.id,reason:x.errors});continue;}
   const def=Number(armor.defBonus??armor.def),cap=Number(armor.agiCap),expectedDelta=def+(Number.isFinite(cap)?Math.min(baseAgi,cap)-baseAgi:0);
   if(x.sticky.DEF-baseDef!==expectedDelta){report.legalArmorFailures++;r.refused.push({armor:armor.id,error:'DEF mismatch',delta:x.sticky.DEF-baseDef,expectedDelta});}
   else r.legal++;
  }
  for(const armor of heavy){
   const dressed=copy(s);dressed.equip.armorId=armor.id;const x=E.computeCharacterN1(dressed);
   r.heavy.push({armor:armor.id,errors:x.errors,accepted:x.errors.length===0,acquiredCount:x.sticky?.acquiredAbilities?.length,activatedConditionalEffects:x.sticky?.conditionalEffects?.length});
  }
  for(const shield of shields){
   const dressed=copy(s);dressed.equip.shieldId=shield.id;const x=E.computeCharacterN1(dressed);
   r.shield.push({shield:shield.id,errors:x.errors,accepted:x.errors.length===0,acquiredCount:x.sticky?.acquiredAbilities?.length,activatedConditionalEffects:x.sticky?.conditionalEffects?.length});
  }
  const armed=copy(s);armed.equip.weaponIds=['weapon:powder-pistol'];const x=E.computeCharacterN1(armed);
  r.powder.push({weapon:'weapon:powder-pistol',accepted:x.errors.length===0,errors:x.errors,attacks:x.sticky?.attacks?.filter(a=>a.weaponId==='weapon:powder-pistol').map(a=>({mastered:a.mastered,attackBonus:a.attackBonus}))});
  if(x.errors.length){report.legalArmorFailures++;report.errors.push({file,race,phase:'powder-mastered',errors:x.errors})}
 }
}
report.status=report.legalArmorFailures===0?'LEGAL_GEAR_PASS_OTHER_RESTRICTIONS_AUDIT_PENDING':'LEGAL_GEAR_FAIL';
const out=path.join(ROOT,'QA/N1/arquebusier-pure-gear-diagnostic.json');fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,legalArmorChecks:report.legalArmorChecks,legalArmorFailures:report.legalArmorFailures,errors:report.errors.slice(0,6),samples:report.products.map(p=>({file:p.file,legalArmor:p.legalArmor,heavyArmor:p.heavyArmor,shields:p.shields,sample:p.races.find(r=>r.race==='humain')}))}).slice(0,6500));
if(report.legalArmorFailures>0)process.exitCode=1;
