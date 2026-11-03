'use strict';
/* Diagnostic indépendant de la variante Mercenaire utilisée en hybride.
 * COF2 Livre de base p.65 : le Mercenaire en hybride ne confère ni maîtrise
 * des armes à poudre ni interdiction du bouclier. N'exige pas encore un PASS :
 * détecte le comportement du moteur avant correction et refuse les faux constats.
 */
const fs=require('fs'),path=require('path'),crypto=require('crypto'),{load,standardState}=require('./forge_product_runner');
const root=path.resolve(__dirname,'..'),g='class:guerrier:cof2-lb-2024',a='class:arquebusier:cof2-lb-2024',races=['humain','nain','demi-elfe','demi-orc','elfe-haut','elfe-sylvain','gnome','halfelin'];
const choices={humain:{humainStat:'con'},nain:{bonusStat:'con',malusStat:'agi'},'demi-elfe':{bonusStat:'per',malusStat:'for'},'demi-orc':{bonusStat:'for',malusStat:'cha'},'elfe-haut':{bonusStat:'int',malusStat:'for'},'elfe-sylvain':{bonusStat:'agi',malusStat:'for'},gnome:{bonusStat:'int',malusStat:'for'},halfelin:{bonusStat:'agi',malusStat:'for'}};
const report={schema:'FOH_N1_MERCENAIRE_HYBRIDE_PROBE',at:new Date().toISOString(),source:'COF2 Livre de base, page imprimée 65, exception Voie du mercenaire hybride',expected:{noPowderMastery:true,shieldAllowed:true},products:[],cases:[],classification:'DIAGNOSTIC_NON_CERTIFIANT'};
for(const file of ['index.html','FORGE_OF_HEROES_ATELIER_GUILTANAS_PRODUCT_MASTER.html']){
 const {db,engine:E,html}=load(path.join(root,file)),T=db.tables;
 const primary=T.paths_class.find(x=>x.classId===g&&x.id.includes('voie-du-bouclier'));
 const secondary=T.paths_class.find(x=>x.classId===a&&x.id.includes('voie-du-mercenaire'));
 const shield=T.shields.find(x=>Number(x.defBonus)===1)||T.shields.find(x=>Number(x.defBonus)>0);
 if(!primary||!secondary||!shield)throw Error('Missing official warrior/mercenary/shield');
 report.products.push({file,sha256:crypto.createHash('sha256').update(html).digest('hex')});
 for(const race of races)for(const orientation of ['warrior-first','mercenary-first']){
  const classId=orientation==='warrior-first'?g:a;
  const first=orientation==='warrior-first'?primary:secondary;
  const second=orientation==='warrior-first'?secondary:primary;
  const raceId='people:'+race+':cof2-lb-2024',s=standardState(db,classId,first.id,raceId);
  s.peupleChoices={...choices[race]};s.voies.profilePathIds=[first.id,second.id];
  s.hybrid={enabled:true,gmApproved:true,primaryProfileId:classId,secondaryProfileId:orientation==='warrior-first'?a:g,primaryPathId:first.id,secondaryPathId:second.id};
  const pr=T.paths_people.find(x=>x.people_id===raceId);
  if(pr)s.voies.peoplePathId=pr.id;
  if(race==='demi-elfe')s.voies.peoplePathId=T.paths_people.find(p=>p.id.includes('voie-de-l-humain'))?.id;
  if(race==='gnome')s.peupleChoices.grantedAbilityId=T.abilities_class.find(z=>z.rank===1&&z.path_id.includes('ensorceleur')&&z.path_id.includes('voie-de-l-air'))?.id;
  s.equip.shieldId=shield.id;s.equip.armorId='';
  s.equip.weaponIds=['weapon:dagger'];
  s.equip.gmApprovedSwap=true;
  const row={file,race,orientation,profile:classId,paths:s.voies.profilePathIds,shieldId:shield.id,powderMasteryExpected:false,shieldAllowedExpected:true};
  try{
   const out=E.computeCharacterN1(s);
   row.errors=out.errors;row.allowed=out.errors.length===0;
   if(out.sticky){row.masteries=out.sticky.masteries;row.derived={DEF:out.sticky.DEF,PV:out.sticky.PV};
    row.powderRelatedAttacks=out.sticky.attacks?.filter(x=>x.weaponId?.includes('powder')).map(x=>({weaponId:x.weaponId,mastered:x.mastered}));
    row.equipment=out.sticky.equip;}
   const noShield={...s,equip:{...s.equip,shieldId:''}},without=E.computeCharacterN1(noShield);
   row.noShieldErrors=without.errors;
   if(!without.errors.length&&out.sticky)row.shieldDefenseDelta=out.sticky.DEF-without.sticky.DEF;
   const withPowder={...s,equip:{...s.equip,weaponIds:['weapon:powder-pistol'],shieldId:''}},powder=E.computeCharacterN1(withPowder);
   row.powderErrors=powder.errors;
   row.powderAttacks=powder.sticky?.attacks?.filter(x=>x.weaponId==='weapon:powder-pistol').map(x=>({mastered:x.mastered,attackBonus:x.attackBonus}));
  }catch(e){row.exception=String(e)}
  report.cases.push(row);
 }
}
report.samples=report.cases.filter(x=>x.race==='humain'||x.race==='demi-elfe'||x.race==='halfelin');
fs.writeFileSync(path.join(root,'QA/N1/arquebusier-mercenary-hybrid-gear-probe.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({classification:report.classification,cases:report.cases.length,accepted:report.cases.filter(x=>x.allowed).length,examples:report.samples.map(x=>({file:x.file,race:x.race,errors:x.errors,masteries:x.masteries,shield:x.equipment?.shieldId}))}).slice(0,8000));
