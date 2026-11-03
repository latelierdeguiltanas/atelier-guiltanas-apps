/* COF2 N1 - Contrats de résolution contextuelle de l'Arquebusier.
 * Conçu pour les rangs 1, 2 et 3 accessibles au niveau 1 avec les règles d'âge.
 * Source: Chroniques Oubliées Fantasy 2e éd., Livre de base, pages imprimées 62-65.
 * Les jets de dés et les décisions adverses restent à arbitrer au moment du combat.
 * Aucun bonus conditionnel n'est ajouté en permanence à la fiche par ce module.
 */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.FOH_ARQ_CONTEXT_N1=api;
})(typeof window!=='undefined'?window:null,function(){
'use strict';
const PAGES={mecanismes:62,'arme-a-repetition':62,'tir-de-barrage-l':62,'tir-de-grenaille-l':63,demolition:63,'poudre-puissante':63,'pilier-de-bar':64,'mort-ou-vif-l':64,'combattant-aguerri':64,'plus-vite-que-son-ombre':65,'ajuster-le-tir':65,'tir-double-l':65,'joli-coup':65,'defaut-dans-la-cuirasse-a':65,'tir-precis':65};
const abilities=Object.keys(PAGES);
const num=n=>Number.isFinite(Number(n))?Number(n):null;
const bool=x=>x===true;
function abilityRow(character,slug){
 const rows=character?.abilities||character?.acquiredAbilities||[];
 return rows.find(a=>String(a.id||'').startsWith('ability:'+slug+':')&&(String(a.id||'').includes('class-arquebusier')||String(a.id||'').includes('class-arbaletrier')||String(a.pathId||'').includes('class-arquebusier')||String(a.pathId||'').includes('class-arbaletrier')));
}
function rankOf(character,a){
 if(!a)return 0;
 const match=(character.paths||[]).find(p=>String(p.pathId||p.id)===String(a.pathId||a.path_id));
 return Math.max(1,Number(match?.rank||a.rank||1));
}
function result(slug,exists,rank){
 return {ability:slug,sourcePage:PAGES[slug],owned:!!exists,rank:rank||0,applies:false,trigger:null,modifiers:{},requirements:[],choices:[],limits:[],notes:[]};
}
function fail(o,requirement){o.requirements.push(requirement);return o;}
function success(o,trigger){o.applies=true;o.trigger=trigger;return o;}
function ownedProfile(character){return String(character?.profileId||'').includes('arquebusier')||String(character?.profileId||'').includes('arbaletrier')||(character?.abilities||[]).some(a=>String(a.pathId||'').includes('class-arquebusier'))}
function solve(character,slug,c={}){
 if(!Object.prototype.hasOwnProperty.call(PAGES,slug))throw Error('Capacité inconnue '+slug);
 const a=abilityRow(character,slug),rank=rankOf(character,a),o=result(slug,a,rank);
 if(!a)return fail(o,'Capacité non acquise : aucun bonus ne doit être appliqué.');
 const kind=String(c.weaponKind||'').toLowerCase();
 const loaded=bool(c.weaponLoaded),held=bool(c.weaponHeld);
 const ranged=bool(c.rangedAttack);
 switch(slug){
 case 'mecanismes':{
  if(['repair_mechanism','understand_mechanism','disarm_mechanical_trap','siege_weapon_operation'].includes(c.skill)){
   success(o,'test de mécanisme');o.modifiers.skillBonus=rank+2;return o;
  }
  if(c.skill==='siege_weapon_attack'){success(o,'attaque avec arme de siège');o.modifiers.bonusDie=true;return o}
  return fail(o,'Test de réparation, compréhension, désamorçage ou tir avec arme de siège requis');
 }
 case 'tir-de-grenaille-l':{
  if(c.skill==='artificer'){success(o,'test d’artificier');o.modifiers.skillBonus=rank+2;return o}
  if(!(kind==='powder'&&loaded&&c.ammunition==='grapeshot'))return fail(o,'Arme à poudre chargée d’une munition de grenaille requise');
  success(o,'action limitée, tir de zone');
  o.modifiers.area={shape:'cone',lengthMeters:10,widthMeters:5};
  o.modifiers.attackRolls=1;o.modifiers.targetRule='un même résultat contre chaque DEF du cône';o.modifiers.damageFraction=0.5;
  o.limits.push('Une seule attaque de zone pour les cibles face au tireur');
  return o;
 }
 case 'pilier-de-bar':{
  if(['tavern_social','resist_alcohol'].includes(c.skill)){success(o,'test en taverne ou de résistance à l’alcool');o.modifiers.skillBonus=rank+2;return o;}
  if(c.attack==='unarmed'){success(o,'attaque à mains nues');o.modifiers.damageDice='1d4°';o.modifiers.nonLethal=true;return o;}
  if(c.incomingDamageType==='non_lethal'){success(o,'dégâts non létaux reçus');o.modifiers.incomingDamageDivisor=2;return o;}
  return fail(o,'Effet de taverne, attaque à mains nues ou dégâts non létaux requis');
 }
 case 'plus-vite-que-son-ombre':{
  if(c.phase==='initiative_attack'&&kind==='powder'&&loaded&&held){success(o,'tir au départ avec arme à poudre chargée tenue en main');o.modifiers.initiativeBonusForShot=5;return o;}
  if(c.engagedInMelee&&(kind==='powder'||kind==='crossbow')&&kind!=='couleuvrine'&&!bool(c.couleuvrine)){
   success(o,'tir au contact avec arme admissible');o.modifiers.removeRangedContactDisadvantage=true;return o;
  }
  return fail(o,'Arme à poudre chargée et tenue pour +5 à l’initiative du tir, ou tir poudre/arbalète au contact hors couleuvrine');
 }
 case 'joli-coup':{
  if(!ranged)return fail(o,'Une attaque à distance est requise');
  if(c.cover==='partial'){success(o,'couvert partiel');o.modifiers.coverAttackPenalty=0;return o}
  if(c.cover==='important'){success(o,'couvert important');o.modifiers.coverAttackPenalty=-2;return o}
  return fail(o,'Cible avec couvert partiel ou important requise');
 }
 case 'arme-a-repetition':{
  if(c.action==='reload'&&bool(c.selectedRepeatingWeapon)){
   success(o,'rechargement du chargeur');o.modifiers.limitedActionsPerProjectile=1;o.modifiers.projectiles=num(c.projectilesToReload)||1;
   o.modifiers.totalLimitedActions=o.modifiers.projectiles;
   return o;
  }
  if(!bool(c.selectedRepeatingWeapon))return fail(o,'Arme appartenant aux deux armes modifiées par cette capacité requise');
  const intel=num(character?.characteristics?.int??character?.caracs?.int??c.INT);
  if(intel===null)return fail(o,'INT définitive du personnage requise');
  const r3=Number(c.rankedThreeArquebusierPaths);
  const rank3=Number.isInteger(r3)&&r3>=0?r3:(character.paths||[]).filter(p=>String(p.pathId||'').includes('class-arquebusier')&&Number(p.rank)>=3).length;
  success(o,'capacité de chargeur');o.modifiers.capacity=2+intel+rank3;
  o.modifiers.limitedActionsPerProjectile=1;o.limits.push('Maximum deux armes à répétition modifiées');
  return o;
 }
 case 'demolition':{
  if(!bool(c.structureTarget)&&!bool(c.blastRadiusTarget))return fail(o,'Structure à démolir ou cible à 2 m de l’explosion requise');
  if((num(c.preparationRounds)||0)<3)return fail(o,'Trois rounds complets de préparation et pose requis');
  if(num(c.chargesRemaining)!==null&&num(c.chargesRemaining)<=0)return fail(o,'Plus aucune charge explosive disponible');
  success(o,'explosif préparé');
  o.modifiers.preparationRounds=3;o.modifiers.dailyChargesMax=rank;o.modifiers.dailyChargesCost=1;
  if(bool(c.structureTarget)){o.modifiers.damageFormula='3d4° + INT';o.modifiers.targetDamageReductionMultiplier=0.5;}
  else{o.modifiers.damageFormula='2d4°';o.modifiers.blastRadiusMeters=2;}
  return o;
 }
 case 'mort-ou-vif-l':{
  if(!bool(c.attackHit))return fail(o,'Attaque au contact ou à distance réussie requise');
  if(!['melee','ranged'].includes(c.attackType))return fail(o,'Arme au contact ou à distance tenue en main requise');
  success(o,'action limitée et attaque réussie');
  o.modifiers.normalWeaponDamage=true;o.modifiers.canUseTemporaryDamage=true;
  const nc=num(c.targetNC);if(nc!==null&&nc<rank){
   o.choices=['désarmer','renverser','affaiblir'];
   o.modifiers.maxConditionChoices=bool(c.criticalHit)?2:1;o.modifiers.weakenRounds='1d4';
  }else o.notes.push('NC non renseigné ou supérieur/égal au rang : aucun état supplémentaire autorisé');
  return o;
 }
 case 'ajuster-le-tir':{
  if(!bool(c.previousRangedAttackMiss))return fail(o,'Une attaque à distance ratée doit avoir été déclarée tir de réglage');
  if(!bool(c.sameTarget))return fail(o,'Le prochain tir doit viser la même cible');
  if(!bool(c.nextShotBeforeEndOfFollowingRound))return fail(o,'L’attaque suivante doit intervenir avant la fin du round suivant');
  success(o,'prochaine attaque à distance après réglage');o.modifiers.nextRangedAttackBonus=5;return o;
 }
 case 'defaut-dans-la-cuirasse-a':{
  if(!bool(c.preparedTargetLastRound)&&!bool(c.preparedTargetThisRoundByMassCombat))return fail(o,'Action d’attaque de préparation au round précédent, ou exception Combat de masse');
  if(!bool(c.sameTarget)||!ranged)return fail(o,'Tirs à distance sur la cible préparée requis');
  const agi=num(c.targetAGI);if(agi===null)return fail(o,'AGI de la cible requise');
  success(o,'tir contre la faiblesse ciblée');o.modifiers.targetDEF=10+agi;
  o.modifiers.ignoreDamageResistance=!bool(c.targetImmaterial);
  o.modifiers.ignoreDamageReduction=!bool(c.targetImmaterial);
  return o;
 }
 case 'tir-de-barrage-l':{
  if(!loaded||!ranged||!bool(c.targetMovedInZoneBeforeNextTurn))return fail(o,'Arme à distance chargée et cible ayant bougé dans la zone surveillée avant le prochain tour');
  if(num(c.targetDistanceMeters)!==null&&num(c.targetDistanceMeters)>20)return fail(o,'Zone de surveillance limitée à 20 m de large');
  success(o,'action limitée de surveillance, puis tir sur déplacement');
  o.modifiers.zoneWidthMeters=20;o.modifiers.attackTriggeredByMovement=true;
  o.choices=bool(c.attackHit)?['doubler les dommages','interrompre immédiatement le déplacement sans dommages']:[];
  o.modifiers.damageIfVictimChoosesDamage=bool(c.attackHit)?2:null;
  o.limits.push('Plusieurs cibles possibles uniquement tant qu’aucun rechargement n’est requis');
  return o;
 }
 case 'poudre-puissante':{
  if(kind!=='powder')return fail(o,'Arme à poudre requise');
  success(o,'préparation de poudre puissante');
  o.modifiers.weaponRangeBonusMeters=10;
  o.modifiers.weaponDamageBonus=1+Number(c.numberOfRank5ArquebusierPaths||0);
  o.modifiers.projectileMagical=true;
  o.notes.push('Ces bonus sont normalement déjà compris dans les attaques canoniques : ne pas les additionner deux fois');
  return o;
 }
 case 'combattant-aguerri':{
  success(o,'bonus permanent et choix additionnel');
  o.modifiers.defenseBonus=1;
  o.choices=['capacité de rang 1 de Guerrier','capacité de rang 1 de Voleur','capacité de rang 1 de Rôdeur'];
  o.limits.push('Voleur : armure cuir ; Rôdeur : armure cuir renforcé');
  o.notes.push('Le moteur canonique additionne déjà le +1 DEF ; pas de double application');
  return o;
 }
 case 'tir-double-l':{
  if(!(bool(c.twoLoadedOneHandRangedWeapons)&&['powder','crossbow'].includes(kind)))return fail(o,'Deux pétoires ou deux arbalètes de poing chargées, une par main, requises');
  success(o,'action limitée de double tir');
  o.modifiers.attackCount=2;
  o.modifiers.attackPenaltyEach=bool(c.sameTarget)?0:-2;
  o.limits.push('Les deux projectiles doivent être disponibles et sont consommés');
  return o;
 }
 case 'tir-precis':{
  if(!ranged)return fail(o,'Une attaque avec arme à distance requise');
  success(o,'attaque à distance');
  o.modifiers.criticalThreshold=rank>=5?18:19;
  o.notes.push('Le moteur d’attaque peut avoir déjà appliqué ce seuil : ne pas l’abaisser une seconde fois');
  return o;
 }
 }
 return o;
}
return Object.freeze({version:'FOH-ARQ-CONTEXT-N1-1',sourcePages:PAGES,abilities,resolve:solve,isOwned:(character,slug)=>!!abilityRow(character,slug),ownedProfile});
});
