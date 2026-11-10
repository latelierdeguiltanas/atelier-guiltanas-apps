/* Forge N1 : présentation accessible des calculs contextuels (sans doubler les totaux).
 * Les situations sont choisies EXPLICITEMENT par le joueur/MJ ; aucun état adversaire
 * ni dé n'est inventé. N'impacte ni la création, ni les sauvegardes.
 */
(function(){'use strict';
 const API=window.FOH_ARQ_CONTEXT_N1,P=window.__FOH_PRODUCT__,E=window.__FOH_ENGINE__;
 if(!API||!P||!E)return;
 const examples={
  mecanismes:[['Réparer ou comprendre un mécanisme',{skill:'repair_mechanism'}],['Attaquer avec une baliste ou arme de siège',{skill:'siege_weapon_attack'}]],
  'arme-a-repetition':[['Chargeur de l’arme modifiée, selon les rangs acquis',{selectedRepeatingWeapon:true}],['Recharger trois projectiles',{action:'reload',selectedRepeatingWeapon:true,projectilesToReload:3}]],
  'tir-de-barrage-l':[['Cible en mouvement dans la zone, attaque réussie',{weaponLoaded:true,rangedAttack:true,targetMovedInZoneBeforeNextTurn:true,attackHit:true,targetDistanceMeters:10}],['Arme vide, tir impossible',{weaponLoaded:false,rangedAttack:true,targetMovedInZoneBeforeNextTurn:true}]],
  'tir-de-grenaille-l':[['Grenaille chargée, tir en cône',{weaponKind:'powder',weaponLoaded:true,ammunition:'grapeshot'}],['Test d’artificier',{skill:'artificer'}],['Rang 1 acquis dans un profil hybride : aucun risque d’explosion involontaire',{action:'powder_safety'}]],
  demolition:[['Explosif sur une structure après 3 rounds',{structureTarget:true,preparationRounds:3,chargesRemaining:1}],['Déflagration à 2 m après préparation',{blastRadiusTarget:true,preparationRounds:3,chargesRemaining:1}]],
  'poudre-puissante':[['Arme à poudre',{weaponKind:'powder'}],['Arbalète, pas de poudre',{weaponKind:'crossbow'}]],
  'pilier-de-bar':[['Coup à mains nues',{attack:'unarmed'}],['Dégâts non létaux reçus',{incomingDamageType:'non_lethal'}],['Test de résistance à l’alcool',{skill:'resist_alcohol'}]],
  'mort-ou-vif-l':[['Attaque touchée, cible NC 1, critique',{attackHit:true,attackType:'ranged',targetNC:1,criticalHit:true}],['Attaque touchée, cible NC 9',{attackHit:true,attackType:'ranged',targetNC:9}]],
  'combattant-aguerri':[['DEF permanente et choix de rang 1',{}]],
  'plus-vite-que-son-ombre':[['Tir à la poudre chargée en main : Initiative',{phase:'initiative_attack',weaponKind:'powder',weaponLoaded:true,weaponHeld:true}],['Arbalète au contact : pas de dé malus',{weaponKind:'crossbow',engagedInMelee:true}]],
  'ajuster-le-tir':[['Tir raté, même cible avant fin du round suivant',{previousRangedAttackMiss:true,sameTarget:true,nextShotBeforeEndOfFollowingRound:true}],['Cible différente : aucun bonus',{previousRangedAttackMiss:true,sameTarget:false,nextShotBeforeEndOfFollowingRound:true}]],
  'tir-double-l':[['Deux pétoires sur deux cibles',{twoLoadedOneHandRangedWeapons:true,weaponKind:'powder',sameTarget:false}],['Deux arbalètes de poing sur la même cible',{twoLoadedOneHandRangedWeapons:true,weaponKind:'crossbow',sameTarget:true}]],
  'joli-coup':[['Cible à couvert partiel',{rangedAttack:true,cover:'partial'}],['Cible à couvert important',{rangedAttack:true,cover:'important'}]],
  'defaut-dans-la-cuirasse-a':[['Cible AGI +2, préparée, visible',{preparedTargetLastRound:true,sameTarget:true,rangedAttack:true,targetAGI:2}],['Cible immatérielle AGI +2',{preparedTargetLastRound:true,sameTarget:true,rangedAttack:true,targetAGI:2,targetImmaterial:true}]],
  'tir-precis':[['Attaque avec arme à distance',{rangedAttack:true}],['Attaque au contact : seuil normal',{rangedAttack:false}]]
 };
 const follow={mainHandAttackMissed:true,inOtherHand:true,usedThisRound:false};
 const protect={surprised:false,allyInContact:true,beforeAttackResult:true,usedThisRound:false};
 const quick={ownTurn:true,usedThisCombat:false};
 const pursue={enemyInContact:true,enemyMovingAway:true,usedThisRound:false};
 const dagger={weaponId:'weapon:dagger'};
 const nature={inWilderness:true};
 const rest={...nature,sleeping:true,spendsRecoveryDie:true};
 const grantExamples={
  'archer-emerite':[['Effets de la variante choisie',{}]],
  'le-loup':[['Compagnon et ordre simple',{}]],
  survie:[['Récupérer en milieu naturel en dépensant un DR',rest],['Récupérer sans dé de récupération',{...rest,spendsRecoveryDie:false}],['Escalader',{test:'climb'}],['Survie en milieu naturel',{...nature,test:'wilderness_survival'}]],
  eclaireur:[['Pister en milieu naturel',{...nature,test:'tracking'}],['Pister en ville',{test:'tracking'}],['Discrétion en milieu naturel',{...nature,test:'wilderness_stealth'}],['Vigilance en milieu naturel',{...nature,test:'wilderness_vigilance'}]],
  'attaque-a-suivre-g':[['Rater avec la main principale, dague dans l’autre main',{...follow,...dagger}],['Déjà utilisé ce round',{...follow,...dagger,usedThisRound:true}],['Hachette de lancer dans l’autre main',{...follow,weaponId:'weapon:throwing-hatchet'}],['Épée courte dans l’autre main',{...follow,weaponId:'weapon:short-sword'}],['Autre arme à une main : épée longue',{...follow,weaponId:'weapon:long-sword'}]],
  discretion:[['Attaquer un adversaire surpris',{attacking:true,targetSurprised:true}],['Attaquer un adversaire qui n’est pas surpris',{attacking:true,targetSurprised:false}],['Test de discrétion',{test:'stealth'}]],
  baratin:[...['scroll','wand'].flatMap(item=>[1,2,3,4,5].map(spellRank=>[(item==='scroll'?'Parchemin':'Baguette')+' de rang '+spellRank,{item,spellRank}])),['Test de négociation',{test:'negotiate'}]],
  agile:[['Défense et initiative sur la fiche',{}],['Test pour échapper à une emprise',{test:'escape_grapple'}]],
  'doigts-agiles':[['Lancer une dague équipée',dagger],['Lancer des couteaux équipés',{weaponId:'weapon:throwing-knives'}],['Test de crochetage',{test:'lockpick'}]],
  'attaque-en-finesse':[['Dague équipée au contact',dagger],['Épée courte équipée au contact',{weaponId:'weapon:short-sword'}],['Rapière équipée au contact',{weaponId:'weapon:rapier'}],['Test d’intimidation',{test:'intimidation'}]],
  'proteger-un-allie-g':[['Protéger un allié au contact, avant le résultat',protect],['Le résultat de l’attaque est déjà connu',{...protect,beforeAttackResult:false}],['Test pour éviter d’être surpris',{test:'avoid_surprise'}]],
  vivacite:[['Premier mouvement supplémentaire du combat, à mon tour',quick],['Mouvement supplémentaire déjà utilisé',{...quick,usedThisCombat:true}],['Test de FOR contre le renversement',{characteristic:'for',test:'avoid_prone'}],['Test d’AGI contre l’immobilisation',{characteristic:'agi',test:'avoid_immobilized'}]],
  'armes-de-predilection':[['Catégorie choisie sur la fiche',{}],['Estimer la valeur d’une arme',{test:'weapon_value'}],['Évaluer une réputation martiale',{test:'martial_reputation'}]],
  robustesse:[['PV supplémentaires sur la fiche',{}],['Résister à un effort physique',{test:'physical_effort'}],['Résister à la chaleur naturelle',{test:'natural_heat'}],['Résister au froid naturel',{test:'natural_cold'}]],
  'teigneux-g':[['Un adversaire au contact s’éloigne',pursue],['Déjà utilisé ce round',{...pursue,usedThisRound:true}],['Résister à l’alcool',{test:'alcohol'}],['Résister à la privation de nourriture',{test:'food_deprivation'}],['Résister à la privation de sommeil',{test:'sleep_deprivation'}]]
 };
 const grantLabels={freeAttack:'Attaque gratuite',penaltyDie:'Dé malus',allyDefenseBonus:'Bonus de DEF de l’allié',extraMovementActions:'Actions de mouvement en plus',freeMeleeAttack:'Attaque au contact gratuite',magicAttackDifficulty:'Difficulté du test d’attaque magique',limitedAction:'Action limitée',extraRecovery:'Récupération supplémentaire',companion:'Compagnon',permanentEffect:'Effet sur la fiche',attackCharacteristic:'Caractéristique d’attaque',damageCharacteristic:'Caractéristique de dégâts'};
 const isGrant=key=>key.startsWith('don:');
 const presetsFor=key=>isGrant(key)?grantExamples[key.slice(4)]:examples[key];
 const titles={'mecanismes':'Mécanismes','arme-a-repetition':'Arme à répétition','tir-de-barrage-l':'Tir de barrage','tir-de-grenaille-l':'Tir de grenaille',demolition:'Démolition','poudre-puissante':'Poudre puissante','pilier-de-bar':'Pilier de bar','mort-ou-vif-l':'Mort ou vif','combattant-aguerri':'Combattant aguerri','plus-vite-que-son-ombre':'Plus vite que son ombre','ajuster-le-tir':'Ajuster le tir','tir-double-l':'Tir double','joli-coup':'Joli coup','defaut-dans-la-cuirasse-a':'Défaut dans la cuirasse','tir-precis':'Tir précis'};
 const labels={skillBonus:'Bonus de compétence',bonusDie:'Dé bonus',damageDice:'DM à mains nues',nonLethal:'Dégâts non létaux',incomingDamageDivisor:'Diviseur des dégâts non létaux reçus',initiativeBonusForShot:'Bonus d’initiative pour ce tir',removeRangedContactDisadvantage:'Dé malus du tir au contact supprimé',coverAttackPenalty:'Malus d’attaque pour le couvert',capacity:'Capacité du chargeur',limitedActionsPerProjectile:'Actions limitées par projectile rechargé',totalLimitedActions:'Total actions limitées',attackRolls:'Nombre de tests d’attaque',damageFraction:'Fraction des dommages habituels',area:'Zone d’effet',preparationRounds:'Rounds nécessaires',dailyChargesMax:'Charges maximales par jour',dailyChargesCost:'Charges consommées',damageFormula:'Formule de dommages',targetDamageReductionMultiplier:'Fraction de RD retenue',blastRadiusMeters:'Rayon de déflagration (m)',normalWeaponDamage:'Dommages normaux',canUseTemporaryDamage:'Option dégâts temporaires',maxConditionChoices:'Nombre d’effets préjudiciables possibles',weakenRounds:'Durée de l’affaiblissement',nextRangedAttackBonus:'Bonus du prochain tir',targetDEF:'DEF à atteindre',ignoreDamageResistance:'Ignorer résistance aux DM',ignoreDamageReduction:'Ignorer réduction des DM',zoneWidthMeters:'Largeur de zone surveillée (m)',attackTriggeredByMovement:'Déclenché par déplacement',damageIfVictimChoosesDamage:'Multiplicateur de dommages si choisi',victimStopsTurnIfNoDamage:'La victime termine son tour et son déplacement si elle évite les dommages',weaponRangeBonusMeters:'Portée supplémentaire (m)',weaponDamageBonus:'DM supplémentaires',projectileMagical:'Projectile magique',defenseBonus:'DEF supplémentaire',attackCount:'Attaques',attackPenaltyEach:'Malus par attaque',criticalThreshold:'Critique dès (d20)'};
 const display=v=>typeof v==='boolean'?(v?'oui':'non'):typeof v==='object'?JSON.stringify(v):String(v);
 let panel=null;
 const $=(el,tag,cls)=>{const x=document.createElement(tag);if(cls)x.className=cls;el.appendChild(x);return x;};
 function state(){
  const computed=E.computeCharacterN1(P.buildState());
  if(computed.errors?.length||!computed.sticky?.characterState)return null;
  return computed.sticky.characterState;
 }
 function render(){
  try{
   const host=document.getElementById('summary-content');if(!host||host.hidden)return;
   const st=state();if(!st)return;
   const grants=API.grantAbilities.filter(slug=>API.granted(st,slug));
   const owned=[...API.abilities.filter(a=>API.isOwned(st,a)),...grants.map(slug=>'don:'+slug)];if(!owned.length){if(panel)panel.hidden=true;return;}
   if(!panel){
    panel=document.createElement('details');panel.id='foh-n1-context-situations';
    panel.style.cssText='margin:14px 0;padding:12px;border:1px solid #877553;border-radius:10px;background:rgba(16,15,13,.86);color:#f5f0e5;font:14px/1.5 system-ui';
    const title=$ (panel,'summary');title.textContent='Calculs de capacités en situation (Arquebusier / Arbalétrier)';
    title.style.cssText='cursor:pointer;font-weight:700';
    const note=$(panel,'p');note.textContent='Choisis une capacité et une situation réelle. Les bonus sont conditionnels et ne s’ajoutent pas deux fois aux caractéristiques de la fiche. Le MJ conserve la décision sur les jets et les choix adverses.';
    note.style.cssText='font-size:12px;color:#d3c6ab';
    const l1=$(panel,'label');l1.textContent='Capacité acquise : ';const a=$(l1,'select');a.id='foh-n1-context-ability';
    const l2=$(panel,'label');l2.textContent=' Situation : ';const b=$(l2,'select');b.id='foh-n1-context-example';
    for(const l of [l1,l2])l.style.cssText='display:block;margin:9px 0';
    for(const select of [a,b])select.style.cssText='max-width:100%;width:100%;padding:9px;border-radius:7px;background:#171511;color:#fff;border:1px solid #877553';
    const button=$(panel,'button');button.type='button';button.textContent='Calculer les effets';button.id='foh-n1-context-run';button.style.cssText='padding:8px 12px;border-radius:8px;border:1px solid #bd9865;background:#433927;color:#fff;cursor:pointer';
    const out=$(panel,'div');out.id='foh-n1-context-result';out.setAttribute('aria-live','polite');out.style.cssText='margin-top:9px;font-size:13px;white-space:pre-wrap';
    a.addEventListener('change',()=>{const presets=presetsFor(a.value)||[];b.replaceChildren();presets.forEach((p,i)=>{const o=document.createElement('option');o.value=String(i);o.textContent=p[0];b.appendChild(o)});out.textContent='';});
    button.addEventListener('click',()=>{try{
      const current=state();if(!current)throw Error('Fiche incomplète.');const slug=a.value;
      const setup=presetsFor(slug)?.[Number(b.value)||0];if(!setup)throw Error('Situation non reconnue');
      const r=isGrant(slug)?API.resolveGrant(current,slug.slice(4),setup[1]):API.resolve(current,slug,setup[1]);const lines=[r.applies?'Capacité applicable dans la situation choisie.':'Capacité NON applicable dans cette situation.'];
      for(const [key,val]of Object.entries(r.modifiers))lines.push((labels[key]||grantLabels[key]||key)+' : '+display(val));
      if(r.choices.length)lines.push('Choix : '+r.choices.join(' / '));
      for(const message of r.requirements)lines.push('Condition manquante : '+message);
      for(const message of r.limits)lines.push('Limite : '+message);
      for(const message of r.notes)lines.push('À noter : '+message);
      lines.push('Référence : livre de base COF2, p. '+r.sourcePage+'.');
      out.textContent=lines.join('\n');
    }catch(e){out.textContent='Calcul impossible : '+e.message}});
    host.insertAdjacentElement('afterend',panel);
   }
   panel.hidden=false;
   const a=panel.querySelector('#foh-n1-context-ability');
   const last=a.value,available=owned.join('|');
   if(a.dataset.available!==available){
     a.replaceChildren();owned.forEach(slug=>{const o=document.createElement('option');o.value=slug;o.textContent=isGrant(slug)?API.granted(st,slug.slice(4)).label+' (Combattant aguerri)':titles[slug]||slug;a.appendChild(o)});
     a.dataset.available=available;if(owned.includes(last))a.value=last;a.dispatchEvent(new Event('change'));
   }
  }catch(e){/* Le module complémentaire ne doit jamais bloquer la création ni la fiche officielle. */}
 }
 let queued=false;
 const schedule=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;render()})};
 const host=document.querySelector('main')||document.body;
 if(host)new MutationObserver(schedule).observe(host,{subtree:true,childList:true});
 document.addEventListener('click',schedule,true);document.addEventListener('change',schedule,true);
 schedule();
 window.__FOH_ARQ_CONTEXT_UI__={version:'FOH-ARQ-CONTEXT-UI-N1-1',render,examples};
})();