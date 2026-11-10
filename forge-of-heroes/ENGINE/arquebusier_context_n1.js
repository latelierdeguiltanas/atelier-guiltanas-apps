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
const num=n=>(typeof n==='number'||(typeof n==='string'&&n.trim()!==''))&&Number.isFinite(Number(n))?Number(n):null;
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
  if(c.action==='powder_safety'){
   const hybrid=String(character?.profileId||'').startsWith('hybrid:')||bool(character?.hybrid?.enabled);
   if(!hybrid)return fail(o,'La dispense de risque d’explosion s’applique à la voie des explosifs acquise dans un profil hybride');
   success(o,'capacité R1 voie des explosifs en profil hybride');o.modifiers.accidentalPowderExplosionRisk=false;return o;
  }
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
   const projectiles=c.projectilesToReload===undefined?1:num(c.projectilesToReload);
   if(!Number.isInteger(projectiles)||projectiles<1)return fail(o,'Nombre entier positif de projectiles à recharger requis');
   success(o,'rechargement du chargeur');o.modifiers.limitedActionsPerProjectile=1;o.modifiers.projectiles=projectiles;
   o.modifiers.totalLimitedActions=o.modifiers.projectiles;
   return o;
  }
  if(!bool(c.selectedRepeatingWeapon))return fail(o,'Arme appartenant aux deux armes modifiées par cette capacité requise');
  const intel=num(character?.characteristics?.int??character?.caracs?.int??c.INT);
  if(intel===null)return fail(o,'INT définitive du personnage requise');
  const rank3=(character.paths||[]).filter(p=>/class-(arquebusier|arbaletrier):/.test(String(p.pathId||p.id||''))&&Number(p.rank)>=3).length;
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
  // Livre de base p.65 : l'exception dans le même round exige réellement
  // Combat de masse (Mercenaire R5) et son action d'attaque additionnelle.
  // Ce rang 5 n'est pas disponible à la création d'un personnage N1.
  if(bool(c.preparedTargetThisRoundByMassCombat)&&!bool(c.preparedTargetLastRound)){
   const combatDeMasse=(character.abilities||character.acquiredAbilities||[]).find(x=>String(x.id||'').startsWith('ability:combat-de-masse:')&&Number(x.rank||5)>=5);
   if(!combatDeMasse)return fail(o,'Combat de masse de rang 5 non acquis : impossible d’utiliser son exception au N1');
   if(!bool(c.bonusAttackFromMassCombatUsed))return fail(o,'L’action d’attaque supplémentaire de Combat de masse doit avoir été utilisée pour préparer la cible');
  }
  if(!bool(c.preparedTargetLastRound)&&!bool(c.preparedTargetThisRoundByMassCombat))return fail(o,'Action d’attaque de préparation au round précédent requise');
  if(!bool(c.sameTarget)||!ranged)return fail(o,'Tirs à distance sur la cible préparée requis');
  const agi=num(c.targetAGI);if(agi===null)return fail(o,'AGI de la cible requise');
  success(o,'tir contre la faiblesse ciblée');o.modifiers.targetDEF=10+agi;
  o.modifiers.ignoreDamageResistance=true;
  o.modifiers.ignoreDamageReduction=!bool(c.targetImmaterial);
  return o;
 }
 case 'tir-de-barrage-l':{
  if(!loaded||!ranged||!bool(c.targetMovedInZoneBeforeNextTurn))return fail(o,'Arme à distance chargée et cible ayant bougé dans la zone surveillée avant le prochain tour');
  // Livre de base p.62 : 20 m désigne la LARGEUR de la zone, jamais la portée de l'arme.
  if(c.targetWithinFacingZone===false)return fail(o,'Cible hors de la zone surveillée, large de 20 m devant le tireur');
  if(num(c.weaponRangeMeters)!==null&&num(c.targetDistanceMeters)!==null&&num(c.targetDistanceMeters)>num(c.weaponRangeMeters))return fail(o,'Cible au-delà de la portée réelle de l’arme');
  success(o,'action limitée de surveillance, puis tir sur déplacement');
  o.modifiers.zoneWidthMeters=20;o.modifiers.attackTriggeredByMovement=true;
  o.choices=bool(c.attackHit)?['doubler les dommages','interrompre immédiatement le déplacement sans dommages']:[];
  o.modifiers.damageIfVictimChoosesDamage=bool(c.attackHit)?2:null;
  if(bool(c.attackHit))o.modifiers.victimStopsTurnIfNoDamage=true;
  o.limits.push('Plusieurs cibles possibles uniquement tant qu’aucun rechargement n’est requis');
  return o;
 }
 case 'poudre-puissante':{
  if(kind!=='powder')return fail(o,'Arme à poudre requise');
  success(o,'préparation de poudre puissante');
  o.modifiers.weaponRangeBonusMeters=10;
  o.modifiers.weaponDamageBonus=1+(character.paths||[]).filter(p=>String(p.pathId||p.id||'').includes('class-arquebusier:')&&Number(p.rank)>=5).length;
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
const grantPages={
 'archer-emerite':70,'le-loup':71,survie:72,eclaireur:72,'attaque-a-suivre-g':73,
 discretion:74,baratin:75,agile:75,'doigts-agiles':76,'attaque-en-finesse':77,
 'proteger-un-allie-g':87,vivacite:88,'armes-de-predilection':88,robustesse:89,'teigneux-g':90
};
const grantAbilities=Object.keys(grantPages);
function grantedRow(character,slug){
 const source=abilityRow(character,'combattant-aguerri');
 return source&&(character.abilities||character.acquiredAbilities||[]).find(a=>a.id.startsWith('ability:'+slug+':')&&a.rank===1&&a.grantedByAbilityId===source.id);
}
function resolveGrant(character,slug,c={}){
 if(!Object.hasOwn(grantPages,slug))throw Error('Capacité accordée inconnue '+slug);
 const a=grantedRow(character,slug),o=result(slug,a,a?.rank);
 o.sourcePage=grantPages[slug];
 if(!a)return fail(o,'Capacité non accordée par Combattant aguerri.');
 const armor=character.calculationTrace?.DEF?.armor;
 const ceiling=a.id.includes('class-voleur:')?2:a.id.includes('class-rodeur:')?3:null;
 if(ceiling!==null&&(!Number.isFinite(armor)||armor>ceiling))return fail(o,'Armure incompatible : '+(ceiling===2?'cuir simple':'cuir renforcé')+' au maximum.');
 const attacks=character.attacks||[];
 const contact=attacks.find(row=>row.weaponId===c.weaponId&&row.type==='contact'&&row.hands===1&&row.mastered);
 const skill=a.mechanics?.skillBonuses?.find(row=>row.tests.includes(c.test));
 if(skill&&(slug!=='survie'||c.test==='climb'||c.inWilderness===true)&&(slug!=='vivacite'||['agi','for'].includes(c.characteristic))){
   o.modifiers.skillBonus=skill.value;
   return success(o,'test concerné par la capacité');
 }
 switch(slug){
  case 'attaque-a-suivre-g': {
   const throwingWeapons=['weapon:dagger','weapon:throwing-hatchet','weapon:throwing-knives','weapon:javelin'];
   const weapon=attacks.find(row=>row.weaponId===c.weaponId&&row.hands===1&&row.mastered&&(row.type==='contact'||throwingWeapons.includes(row.weaponId)));
   if(c.mainHandAttackMissed!==true||c.inOtherHand!==true||c.usedThisRound!==false||!weapon)return fail(o,'Attaque principale ratée, arme admissible tenue dans l’autre main et capacité encore disponible ce round.');
   o.modifiers.freeAttack=true;
   o.modifiers.penaltyDie=!['weapon:dagger','weapon:throwing-hatchet','weapon:short-sword'].includes(c.weaponId);
   return success(o,'attaque gratuite avec l’autre main');
  }
  case 'proteger-un-allie-g':
   if(!character.equipment?.shieldId||c.surprised!==false||c.allyInContact!==true||c.beforeAttackResult!==true||c.usedThisRound!==false)return fail(o,'Bouclier manié, allié au contact, personnage non surpris et annonce avant le résultat. Une fois par round.');
   o.modifiers.allyDefenseBonus=2;
   return success(o,'protection contre une attaque');
  case 'vivacite':
   if(c.ownTurn!==true||c.usedThisCombat!==false)return fail(o,'Tour du personnage et action supplémentaire encore disponible dans ce combat.');
   o.modifiers.extraMovementActions=1;
   return success(o,'mouvement supplémentaire');
  case 'teigneux-g':
   if(c.enemyInContact!==true||c.enemyMovingAway!==true||c.usedThisRound!==false)return fail(o,'Créature au contact qui s’éloigne, capacité encore disponible ce round.');
   o.modifiers.freeMeleeAttack=true;
   return success(o,'attaque au contact en action gratuite');
  case 'discretion':
   if(c.attacking!==true||c.targetSurprised!==true)return fail(o,'Attaque contre un adversaire surpris requise.');
   o.modifiers.bonusDie=true;
   return success(o,'attaque contre un adversaire surpris');
  case 'baratin': {
   const rank=num(c.spellRank);
   if(!['scroll','wand'].includes(c.item)||!Number.isInteger(rank)||rank<1||rank>5)return fail(o,'Parchemin ou baguette et rang du sort compris entre 1 et 5 requis.');
   o.modifiers.magicAttackDifficulty=10+2*rank;
   o.modifiers.limitedAction=true;
   o.notes.push('Le sort est lancé si le test réussit. Une nouvelle tentative est possible en cas d’échec.');
   return success(o,'utilisation d’un objet magique');
  }
  case 'survie':
   if(c.inWilderness!==true||c.sleeping!==true||c.spendsRecoveryDie!==true)return fail(o,'Nuit en milieu naturel avec dépense d’un dé de récupération requise.');
   o.modifiers.extraRecovery='1d4° PV';
   return success(o,'récupération en milieu naturel');
  case 'eclaireur':
   if(c.inWilderness!==true||!['wilderness_stealth','wilderness_vigilance','tracking'].includes(c.test))return fail(o,'Discrétion, vigilance ou pistage en milieu naturel requis.');
   o.modifiers.skillBonus=3;
   return success(o,'test en milieu naturel');
  case 'le-loup': {
   const wolf=(character.companions||[]).find(x=>x.companionId==='companion:wolf');
   if(!wolf)return fail(o,'Compagnon absent de la fiche.');
   o.modifiers.companion='Loup';
   o.notes.push('Il attaque au tour de son maître et comprend des ordres simples. Consulter la fiche du compagnon pour ses valeurs.');
   return success(o,'compagnon animal');
  }
  case 'agile':
   o.modifiers.permanentEffect='DEF et initiative +1, déjà compris dans la fiche';
   return success(o,'bonus permanents');
  case 'robustesse':
   o.modifiers.permanentEffect='PV max +3, déjà compris dans la fiche';
   return success(o,'bonus permanent');
  case 'attaque-en-finesse':
   if(!contact||!['weapon:dagger','weapon:short-sword','weapon:rapier'].includes(c.weaponId))return fail(o,'Dague, épée courte ou rapière équipée pour une attaque au contact.');
   o.modifiers.attackCharacteristic='AGI';
   o.modifiers.damageCharacteristic='FOR';
   return success(o,'attaque au contact en finesse');
  case 'doigts-agiles':
   if(!['weapon:dagger','weapon:throwing-knives'].includes(c.weaponId)||!attacks.some(row=>row.weaponId===c.weaponId&&row.type==='distance'))return fail(o,'Attaque à distance avec une dague ou des couteaux de lancer équipés.');
   o.modifiers.permanentEffect='DM +1, déjà compris dans l’attaque à distance';
   return success(o,'lancer de dague ou de couteaux');
  case 'archer-emerite': {
   const isThrower=character.creationInput?.abilityChoices?.[a.id]?.throwerVariant===true;
   o.modifiers.permanentEffect=isThrower?'Armes de jet : FOR aux DM et portée doublée, déjà calculées. Aucun bonus d’initiative.':'Arc : PER aux DM et initiative +1, déjà calculés.';
   return success(o,'variante sélectionnée sur la fiche');
  }
  case 'armes-de-predilection': {
   const category=character.creationInput?.abilityChoices?.[a.id]?.preferredWeaponCategory||character.creationInput?.profileChoices?.preferredWeaponCategory;
   if(!category)return fail(o,'Catégorie de prédilection manquante sur la fiche.');
   o.modifiers.permanentEffect='Attaque +1 avec la catégorie choisie, déjà compris dans les attaques concernées';
   return success(o,'catégorie de prédilection');
  }
 }
 return o;
}
return Object.freeze({version:'FOH-ARQ-CONTEXT-N1-3',grantAbilities,resolveGrant,granted:(c,slug)=>grantedRow(c,slug),sourcePages:PAGES,abilities,resolve:solve,isOwned:(character,slug)=>!!abilityRow(character,slug),ownedProfile});
});
