'use strict';
const assert=require('node:assert/strict'),crypto=require('node:crypto'),fs=require('node:fs'),path=require('node:path');
const F=require('./forge_product_runner'),API=require('../ENGINE/arquebusier_context_n1');
const root=path.resolve(__dirname,'..'),{html,db,engine:E}=F.load(root+'/index.html'),T=db.tables;
const product={file:'index.html',sha256:crypto.createHash('sha256').update(html).digest('hex')};
const report={status:'PENDING',products:[product],cases:[],refusals:0};
const test=(name,other={})=>({test:name,...other});
const follow={weaponId:'weapon:dagger',mainHandAttackMissed:true,inOtherHand:true,usedThisRound:false};
const protect={surprised:false,allyInContact:true,beforeAttackResult:true,usedThisRound:false};
const recovery={inWilderness:true,sleeping:true,spendsRecoveryDie:true};
const pursuit={enemyInContact:true,enemyMovingAway:true,usedThisRound:false};
const tests={
 'archer-emerite':[[{},'permanentEffect',/PER/]],
 'le-loup':[[{},'companion','Loup']],
 survie:[[test('climb'),'skillBonus',3],[test('night_recovery',{inWilderness:true}),'skillBonus',3],[recovery,'extraRecovery','1d4° PV'],[{...recovery,spendsRecoveryDie:false}],[{...recovery,inWilderness:false}],[test('night_recovery')]],
 eclaireur:[...['wilderness_stealth','wilderness_vigilance','tracking'].map(t=>[test(t,{inWilderness:true}),'skillBonus',3]),[test('tracking')]],
 'attaque-a-suivre-g':[[follow,'penaltyDie',false],[{...follow,weaponId:'weapon:throwing-hatchet'},'penaltyDie',false],[{...follow,weaponId:'weapon:short-sword'},'penaltyDie',false],[{...follow,weaponId:'weapon:javelin'},'penaltyDie',true],[{...follow,weaponId:'weapon:long-sword'},'penaltyDie',true],[{...follow,mainHandAttackMissed:false}],[{...follow,inOtherHand:false}],[{...follow,usedThisRound:true}],[{...follow,weaponId:'weapon:great-sword'}]],
 discretion:[[{attacking:true,targetSurprised:true},'bonusDie',true],[{attacking:true,targetSurprised:false}],[test('hide_weapon'),'skillBonus',3]],
 baratin:[[{item:'scroll',spellRank:1},'magicAttackDifficulty',12],[{item:'wand',spellRank:5},'magicAttackDifficulty',20],[{item:'scroll',spellRank:6}],[{item:'sword',spellRank:2}],[test('black_market'),'skillBonus',3]],
 agile:[[{},'permanentEffect',/DEF et initiative \+1/],[test('escape_grapple'),'skillBonus',3]],
 'doigts-agiles':[[{weaponId:'weapon:dagger'},'permanentEffect',/DM \+1/],[{weaponId:'weapon:long-sword'}],[test('lockpick'),'skillBonus',3]],
 'attaque-en-finesse':[[{weaponId:'weapon:dagger'},'attackCharacteristic','AGI'],[{weaponId:'weapon:dagger'},'damageCharacteristic','FOR'],[{weaponId:'weapon:long-sword'}],[test('intimidation'),'skillBonus',3]],
 'proteger-un-allie-g':[[protect],[test('avoid_surprise'),'skillBonus',3]],
 vivacite:[[{ownTurn:true,usedThisCombat:false},'extraMovementActions',1],[{ownTurn:false,usedThisCombat:false}],[{ownTurn:true,usedThisCombat:true}],[test('avoid_prone',{characteristic:'for'}),'skillBonus',3],[test('avoid_prone',{characteristic:'con'})]],
 'armes-de-predilection':[[{},'permanentEffect',/Attaque \+1/],[test('weapon_value'),'skillBonus',3],[test('martial_reputation'),'skillBonus',3]],
 robustesse:[[{},'permanentEffect',/PV max \+3/],...['physical_effort','natural_heat','natural_cold'].map(t=>[test(t),'skillBonus',3])],
 'teigneux-g':[[pursuit,'freeMeleeAttack',true],[{...pursuit,enemyInContact:false}],[{...pursuit,enemyMovingAway:false}],[{...pursuit,usedThisRound:true}],...['alcohol','food_deprivation','sleep_deprivation'].map(t=>[test(t),'skillBonus',3])]
};
function fill(s){
 for(let i=0;i<4;i++)for(const a of E.previewAcquiredAbilities(s))for(const c of E.getPersistentChoicesForAbility(s,a.id)){
  const bag=s.abilityChoices[a.id]||(s.abilityChoices[a.id]={});
  if(c.id==='preferredWeaponCategory')bag[c.id]=s.profileChoices[c.id]='swords';
  else if(c.type==='boolean')bag[c.id]??=false;
  else if(c.type==='entity')bag[c.id]??={type:'animal',species:'chat',name:'Témoin'};
  else if(c.type==='weapon_multi')bag[c.id]??=c.options.slice(0,c.min||1).map(x=>x.id);
  else if(c.options?.length)bag[c.id]??=c.options[0].id;
 }
}
const slugOf=a=>a.id.split(':')[1];
function check(c,slug,scenario){
 const [context,key,wanted]=scenario;
 const actual=API.resolveGrant(c,slug,context);
 assert.equal(actual.applies,!!key,slug+' '+JSON.stringify(context)+' '+actual.requirements.join(' '));
 if(wanted instanceof RegExp)assert.match(actual.modifiers[key],wanted);
 else if(key)assert.equal(actual.modifiers[key],wanted,slug);
 else{assert.deepEqual(actual.modifiers,{});report.refusals++;}
}
for(const variant of ['arquebusier','arbaletrier']){
 const merc=T.paths_class.find(p=>p.id.includes('voie-du-mercenaire:class-'+variant+':'));
 const base=F.withRank(db,F.standardState(db,merc.classId,merc.id),merc.id,3);
 const source=E.previewAcquiredAbilities(base).find(a=>slugOf(a)==='combattant-aguerri');
 const options=E.getPersistentChoicesForAbility(base,source.id).find(x=>x.id==='combattantAguerriAbility').options;
 assert.deepEqual(options.map(slugOf).sort(),Object.keys(tests).sort());
 for(const option of options){
  const slug=slugOf(option),draft=JSON.parse(JSON.stringify(base));
  draft.abilityChoices[source.id]={combattantAguerriAbility:option.id};
  draft.equip={...draft.equip,armorId:T.armors.find(a=>a.defBonus===2).id,gmApprovedSwap:true};
  if(slug==='attaque-a-suivre-g')draft.equip.weaponIds.push('weapon:throwing-hatchet','weapon:short-sword','weapon:javelin');
  fill(draft);
  const computed=E.computeCharacterN1(draft);
  assert.equal(computed.errors.length,0,computed.errors.join(' | '));
  const c=computed.sticky.characterState,before=JSON.stringify(c);
  assert.equal(API.granted(c,slug)?.id,option.id);
  const scenarios=tests[slug];
  for(const scenario of scenarios)check(c,slug,scenario);
  assert.equal(JSON.stringify(c),before);
  const payload=E.createHeroSavePayload(draft,c,{id:'mercenary-'+slug}),restored=E.restoreHeroSavePayload(JSON.parse(JSON.stringify(payload)));
  const reopened=E.computeCharacterN1(restored.draft);
  assert.deepEqual(Array.from(reopened.errors),[]);
  for(const scenario of scenarios)check(reopened.sticky.characterState,slug,scenario);
  const withoutSource={...c,abilities:c.abilities.filter(a=>a.id!==source.id)};
  check(withoutSource,slug,[scenarios[0][0]]);
  if(/class-(voleur|rodeur):/.test(option.id)){
   const armorDef=option.id.includes('class-voleur:')?3:4;
   draft.equip.armorId=T.armors.find(a=>a.defBonus===armorDef).id;
   const blocked=E.computeCharacterN1(draft);
   assert.deepEqual(Array.from(blocked.errors),[]);
   const activeScenario=scenarios.find(s=>s[1]);
   check(blocked.sticky.characterState,slug,[activeScenario[0]]);
  }
  if(slug==='proteger-un-allie-g'){
   // The pure profiles cannot carry a shield. Build the official hybrid
   // exception, with the last age point invested in the people path.
   const warrior=T.paths_class.find(p=>p.id.includes('voie-de-la-resistance:class-guerrier:'));
   const hybrid=F.standardState(db,merc.classId,merc.id);
   hybrid.voies.profilePathIds=[merc.id,warrior.id];
   hybrid.hybrid={enabled:true,gmApproved:true,primaryProfileId:merc.classId,secondaryProfileId:warrior.classId,primaryPathId:merc.id,secondaryPathId:warrior.id};
   hybrid.equip={...hybrid.equip,weaponIds:['weapon:dagger'],armorId:'',shieldId:T.shields[0].id,gmApprovedSwap:true};
   F.withRank(db,hybrid,merc.id,3);
   hybrid.age.spending.at(-1).pathId=hybrid.voies.peoplePathId;
   hybrid.abilityChoices[source.id]={combattantAguerriAbility:option.id};
   fill(hybrid);
   const withShield=E.computeCharacterN1(hybrid);
   assert.deepEqual(Array.from(withShield.errors),[]);
   const shield=withShield.sticky.characterState;
   check(shield,slug,[protect,'allyDefenseBonus',2]);
   const hybridSave=E.createHeroSavePayload(hybrid,shield,{id:'mercenary-shield'});
   const hybridReopened=E.computeCharacterN1(E.restoreHeroSavePayload(JSON.parse(JSON.stringify(hybridSave))).draft);
   assert.deepEqual(Array.from(hybridReopened.errors),[]);
   check(hybridReopened.sticky.characterState,slug,[protect,'allyDefenseBonus',2]);
   for(const [key,value] of [['surprised',true],['allyInContact',false],['beforeAttackResult',false],['usedThisRound',true]])check(shield,slug,[{...protect,[key]:value}]);
  }
  report.cases.push({variant,slug,status:'PASS',checks:scenarios.length,saveReload:true});
 }
}
report.status='PASS';
fs.writeFileSync(root+'/QA/N1/arquebusier-grant-context.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,grants:report.cases.length,refusals:report.refusals}));
