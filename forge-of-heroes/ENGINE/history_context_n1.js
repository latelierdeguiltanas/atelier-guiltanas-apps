/* COF2, Voies d'historique pp.172-180. Les contextes sont déclarés par le joueur/MJ.
 * Aucun bonus social ou professionnel ne modifie une caractéristique permanente.
 */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.FOH_HISTORY_CONTEXT_N1=api;})(typeof window!=='undefined'?window:null,function(){
'use strict';
const professions=['courtier','scholar','expert','commoner','soldier','pauper','wealthy','nomad'];
const rules={
 community:{title:'Bonus communautaire',page:176},
 courtier_secrets:{title:'Secrets et commérages',id:'ability:history:courtier:r2',page:176},
 courtier_details:{title:'Le diable est dans les détails',id:'ability:history:courtier:r3',page:176},
 scholar_persuasion:{title:'Argumenter',id:'ability:history:scholar:r2',page:177},
 expert_work:{title:'Expertise',id:'ability:history:expert:r2',page:177}
};
// Voies d’historique, pp. 172–175. Each situation is selected explicitly by
// the player or GM and is resolved without changing the saved character.
const extraDamage={extraDamage:'1d4°'};
const terrainCombat={attackBonus:2,defenseBonus:2};
const originGroups={
 campaigns:{page:172,ranks:[
  ['C’est pas tout prêt', [['Réparer un objet ou travailler dur',{skillBonus:5}]]],
  ['Les outils sont des armes', [['Attaquer avec une arme servant aussi d’outil',{attackBonus:1}]]],
  ['C’est pas tout près', [['Pendant une période de marche',{extraTravelKm:2,armorPenaltyDivisor:2},'Arrondir la pénalité d’armure à l’inférieur.']]],
  ['Adversaire des campagnes', [['Attaquer un humanoïde en armure métallique',extraDamage]]]
 ]},
 cities:{page:172,ranks:[
  ['Survie dans les coupe-gorge', [['PER pour s’orienter ou détecter une embuscade en ville',{skillBonus:3}],['CHA face à un gang ou à la garde en ville',{skillBonus:3}]]],
  ['Fendre la foule', [['Se déplacer dans une foule',{ignoreCrowdSlowdown:true}],['Combattre dans une foule',terrainCombat]]],
  ['Pistage urbain', [['CHA pour suivre une piste en interrogeant les témoins en ville',{skillBonus:5},'Difficulté de 15 à 30 selon les circonstances.'],['Survie en milieu urbain',{skillBonus:5}]]],
  ['Expert des rixes', [['Combattre un humanoïde',{extraTemporaryDamage:'1d4°'}]]]
 ]},
 deserts:{page:173,ranks:[
  ['À boire !', [['Point d’eau à moins d’une heure de marche',{perceptionDifficulty:10}],['Point d’eau entre une heure et moins d’un jour de marche',{perceptionDifficulty:15}],['Point d’eau à un jour de marche ou davantage',{perceptionDifficulty:20}]]],
  ['Soleil de plomb', [['Subir du feu ou de la chaleur',{damageReduction:3}]]],
  ['Se mettre à l’abri', [['Chercher un abri contre la chaleur, le froid nocturne ou un événement climatique',{automaticShelter:true}]]],
  ['Adversaire des déserts', [['Attaquer un arthropode géant',extraDamage]]]
 ]},
 forests:{page:173,ranks:[
  ['Nature généreuse (forêts)', [['Chercher de la nourriture en avançant en forêt',{selfForage:true,forageThreshold:10,forageInterval:5}]]],
  ['Chasseur', [['Attaquer un animal ou un animal géant',extraDamage]]],
  ['Terrain de prédilection (forêts)', [['Traverser une forêt dense',{normalTravelSpeed:true}],['Combattre en forêt',{defenseBonus:2}]]],
  ['Passage par les arbres', [['Se déplacer d’arbre en arbre',{movementMultiplier:0.5,ignoreClimbAndBalanceTests:true}]]]
 ]},
 caves:{page:174,ranks:[
  ['Sens de l’orientation (souterrains)', [['S’orienter dans les souterrains',{directWayToSurface:true}],['Voir dans la pénombre',{dimLightAsDay:true}],['Utiliser une vision dans le noir déjà acquise',{darkvisionMultiplier:2}]]],
  ['Combat confiné', [['Combattre sous terre ou dans un espace étroit',{attackBonus:2}]]],
  ['Combat en aveugle', [['Combattre au contact un ennemi invisible à mes yeux',{ignoreUnseenMeleePenalty:true}],['Frapper avec une torche enflammée',{torchDamage:'1d6 + AGI'}],['Éblouir un adversaire au contact dans le noir avec la torche',{enemyMeleePenalty:-1}],['Éblouir un animal au contact dans le noir avec la torche',{enemyMeleePenalty:-2}]]],
  ['Adversaire des souterrains', [['Attaquer un elfe des profondeurs, un orc ou un goblinoïde',extraDamage]]]
 ]},
 marshes:{page:174,ranks:[
  ['Résistance aux miasmes', [['Résister à une maladie ou à un poison',{skillBonus:3}]]],
  ['Vision améliorée', [['Voir dans un brouillard léger',{effectiveFog:'Aucun brouillard'}],['Voir dans un brouillard dense',{effectiveFog:'Brouillard léger'}],['Échapper aux sables mouvants',{automaticEscape:true}]]],
  ['Résistance aux toxines', [['Subir du poison ou de l’acide',{damageReduction:3}]]],
  ['Adversaire des marécages', [['Attaquer un reptile ou un amphibien',extraDamage]]]
 ]},
 mountains:{page:174,ranks:[
  ['Grimpeur', [['Faire un test d’escalade',{skillBonus:3}],['Subir des dommages de chute',{damageDivisor:2}]]],
  ['Résistance au froid', [['Subir des dommages de froid',{damageReduction:3}]]],
  ['Terrain de prédilection (montagnes)', [['Combattre sur une forte pente ou dans un escalier',terrainCombat]]],
  ['Danger des montagnes', [['Combattre un géant',{defenseBonus:2,...extraDamage}]]]
 ]},
 plains:{page:175,ranks:[
  ['Cavalier', [['Attaquer en étant monté',{attackBonus:1}],['Monter en selle ou descendre',{freeAction:true}]]],
  ['Œil de faucon', [['Observer des détails à 100 m ou davantage',{skillBonus:5}],['Attaquer à distance',{rangeBonusMeters:10}]]],
  ['Engagement', [['Au premier round, se rapprocher et/ou attaquer au contact',{freeRangedAttack:true}]]],
  ['Adversaire des plaines', [['Attaquer une créature volante',extraDamage]]]
 ]},
 shores:{page:175,ranks:[
  ['Nature généreuse (rivages)', [['Chercher de la nourriture en avançant en bord de rivière ou en mer',{selfForage:true,forageThreshold:10,forageInterval:5}]]],
  ['Comme un poisson dans l’eau', [['Combattre dans l’eau',{ignoreWaterCombatPenalty:true},'Conserver les pénalités propres au type d’arme.']]],
  ['Sens de l’eau', [['S’orienter en mer',{direction:'Terre la plus proche'}],['S’orienter sur terre',{direction:'Étendue d’eau la plus proche'}]]],
  ['Adversaire des étendues d’eau', [['Attaquer une créature aquatique',extraDamage]]]
 ]}
};
for(const [origin,{page,ranks}] of Object.entries(originGroups)){
 ranks.forEach(([title,situations],index)=>{
  const id='ability:history:'+origin+':r'+(index+2);
  rules[id]={title,id,page,situations};
 });
}
// Voies professionnelles, pp. 176–180. Permanent effects are computed by
// Forge. These entries describe results for situations declared by the player.
const professionGroups={
 courtier:{page:176,ranks:[
  ['Charmant',[['Séduire, baratiner ou mentir avec le CHA',({rank})=>({skillBonus:rank+2})]]],
  null,null,
  ['J’ai un ami…',[['Demander une entrevue à une personne d’importance moyenne, première utilisation du jour',{charismaDifficulty:10}],['Demander une entrevue à un grand représentant de mon milieu, première utilisation du jour',{charismaDifficulty:15}]]],
  ['Plus d’une corde à son arc',[['Consulter le don choisi sur la fiche',{effect:'Une capacité de rang 1 à 3 de la famille des aventuriers, selon le choix enregistré.'}]]]
 ]},
 scholar:{page:177,ranks:[
  ['Érudition',[['Faire un test dans mon domaine principal',({rank})=>({skillBonus:rank+2})],['Consulter les langues d’érudition',({rank})=>({effect:rank+' langue(s) supplémentaire(s), selon les choix de la fiche.'})]]],
  null,
  ['Domaine secondaire',[['Faire un test dans mon domaine secondaire',{skillBonus:3,effect:'Bonus de voie de peuple.'}]]],
  ['Novice',[['Rechercher un document avec le novice',{workTimeMultiplier:0.5}],['Recevoir les premiers soins du novice, trois utilisations par jour au maximum',{effect:'Au choix, 1d4° PV ou 1 PM. Consulter le bloc du novice pour ses caractéristiques et son attaque.'}]]],
  ['Sommité',[['Consulter les caractéristiques',{effect:'INT +1, compris dans la fiche.'}]]]
 ]},
 expert:{page:177,ranks:[
  ['Professionnel',[['Faire un test lié à mon métier',({rank})=>({skillBonus:rank+2})],['Travailler une journée dans mon métier',({rank,character})=>({incomeSilver:rank*(character.level||1)})]]],
  null,
  ['Talent spécial',[['Utiliser le talent défini avec le MJ',{effect:'Appliquer la capacité définie avec le MJ pour le métier choisi.'}]]],
  ['Maître en son domaine',[['Demander une entrevue à une personne puissante',{charismaDifficulty:10}],['Demander un service à une personne puissante',{charismaDifficulty:15}]]],
  ['Caractéristique d’expert',[['Consulter la caractéristique choisie',{effect:'+1 à la caractéristique du métier, compris dans la fiche.'}]]]
 ]},
 commoner:{page:178,ranks:[
  ['La vie est dure',[['Résister à un effort physique ou faire un test d’endurance',{skillBonus:3}],['Consulter les dés de récupération',({rank})=>({effect:rank>=4?'DR +1, compris dans la fiche.':'Le DR supplémentaire arrive au rang 4.'})]]],
  ['J’ai un ami qui m’a dit…',[['Faire un test d’INT sur une rumeur ou une personne',({rank})=>({skillBonus:rank+2})]]],
  ['On m’la fait pas à moi !',[['Résister à une illusion ou à une influence de l’esprit',{skillBonus:5}]]],
  ['Ni vu ni connu',[['Disparaître dans une foule',{charismaDifficulty:10,effect:'Une capacité particulière peut permettre de retrouver le personnage.'}]]],
  ['Résistance naturelle',[['Consulter les caractéristiques',{effect:'CON +1, compris dans la fiche.'}]]]
 ]},
 soldier:{page:178,ranks:[
  ['Formation martiale',[['Consulter l’option de formation choisie',({character,id})=>character.creationInput?.abilityChoices?.[id]?.martialTraining==='DISARM_BONUS'?{skillBonus:3,effect:'Pour éviter d’être désarmé.'}:{effect:'Maîtrise de toutes les armes, comprise dans la fiche.'}]]],
  ['Seconde peau',[['Consulter l’armure de prédilection',{effect:'Maîtrise de l’armure choisie et pénalité réduite de 1, selon l’armure équipée.'}]]],
  ['Sentinelle infatigable',[['Effectuer un tour de garde la nuit',{effect:'Le tour de garde n’empêche pas de récupérer 1 DR.'}],['Tester ma vigilance ou résister à la fatigue pendant la garde',{skillBonus:3}]]],
  ['Du rab à la cantoche',[['Manger une double ration et dépenser un DR en récupération rapide',{effect:'Résultat maximal du dé de récupération.'}]]],
  ['Évaluer l’adversité',[['Évaluer une créature visible',{effect:'Test opposé d’attaque au contact. En cas de réussite, le MJ révèle la DEF et l’attaque de la cible. Un dé bonus sur un test d’attaque au choix contre elle.'}]]]
 ]},
 pauper:{page:179,ranks:[
  ['Moins que rien',[['Interagir avec la bonne société',{effect:'Dé malus au test social.'}],['Résister à une privation ou passer inaperçu',{skillBonus:3}],['Passer la nuit en ville',{effect:'Récupération automatique de 1 DR, même dans la rue ou sans acheter à manger.'}]]],
  ['Roi de la débrouille',[['Faire un test de métier physique',{skillBonus:3}],['Consulter l’initiative',{effect:'Initiative +3, comprise dans la fiche.'}]]],
  ['Solidarité des démunis',[['Demander l’aide d’un autre miséreux',{effect:'1d6 : aide inconditionnelle sur 1 à 3. Le MJ lance aussi 1d6 en secret : sur 6, le PNJ prépare un mauvais coup.'}]]],
  ['Corvée à merci',[['Faire un test de CON ou de FOR',{skillBonus:3}],['Consulter les points de vie',{effect:'PV +3, compris dans la fiche.'}]]],
  ['L’énergie du désespoir',[['Tester FOR, AGI ou CON à la moitié de mes PV ou moins',{bonusDie:true}],['À 0 PV, sans mort évidente ni nouveau dommage',{effect:'Reste conscient et dispose d’une action de mouvement par tour. Un nouveau dommage rend inconscient.'}]]]
 ]},
 wealthy:{page:179,ranks:[
  ['Plein aux as',[['Payer mes dépenses courantes du jour',({rank})=>({incomeSilver:10*rank,effect:'Le montant inutilisé ne s’ajoute pas aux économies.'})]]],
  ['On ne prête qu’aux riches',[['Acheter un bien de grande valeur à crédit',{effect:'Délai de paiement d’un mois.'}],['Demander un mois supplémentaire',{charismaDifficulty:15}]]],
  ['Pot-de-vin',Array.from({length:10},(_,i)=>['Dépenser '+(10*(i+1))+' pa de mon argent pour rattraper un test de CHA raté',{skillBonus:i+1,effect:'Les fonds de Plein aux as sont exclus. Ce bonus ne s’applique pas à Au-dessus des lois.'}])],
  ['Garde du corps',[['Le garde du corps est à mon contact',{defenseBonus:2}],['Remplacer le garde au prochain niveau',{effect:'Engagement pour 500 pa si le précédent garde est mort.'}]]],
  ['Au-dessus des lois',[
   ...[['Délit',10],['Crime',15],['Acte odieux',20]].flatMap(([label,difficulty])=>[
    [label+' sans contrarier un puissant',{charismaDifficulty:difficulty,effect:'Victime importante : capacité inefficace. Pot-de-vin exclu.'}],
    [label+' en contrariant un puissant',{charismaDifficulty:difficulty+5,effect:'Victime importante : capacité inefficace. Pot-de-vin exclu.'}]
   ])
  ]]
 ]},
 nomad:{page:180,ranks:[
  ['Sens de l’orientation',[['M’orienter ou prévoir la météo des prochaines 24 h',{skillBonus:3}]]],
  ['Voyageur',[['Récupérer après une nuit à la belle étoile ou tester la PER pour un événement de voyage',{skillBonus:3}]]],
  ['Chasseur-cueilleur',[['Me nourrir en avançant à allure normale',{selfForage:true,effect:'Un test de PER (Survie) réussi permet de nourrir une autre personne. Difficulté selon la région.'}]]],
  ['Je suis déjà venu',[['Dépenser 1 DR ou 1 PC en arrivant dans la localité',{effect:'Le MJ indique les lieux connus et un contact de confiance. Rareté réduite d’un niveau pour les achats locaux, pendant cette aventure.'}]]],
  ['Attentif',[['Consulter les caractéristiques',{effect:'PER +1, comprise dans la fiche.'}]]]
 ]}
};
for(const [profession,{page,ranks}] of Object.entries(professionGroups)){
 ranks.forEach((entry,index)=>{
  if(!entry)return;
  const [title,situations]=entry;
  const id='ability:history:'+profession+':r'+(index+1);
  rules[id]={title,id,page,situations};
 });
}
const rows=c=>c?.abilities||c?.acquiredAbilities||[];
const path=a=>a.pathId||a.path_id||'';
const professional=c=>rows(c).find(a=>professions.some(p=>path(a)==='history:'+p)&&Number(a.rank)>=1);
function owned(c,key){if(key==='community')return !!professional(c);return !!rules[key]&&rows(c).some(a=>a.id===rules[key].id);}
function resolve(c,key,context={}){
 const rule=rules[key];if(!rule)throw Error('Règle historique inconnue : '+key);
 const out={rule:key,sourcePage:rule.page,owned:owned(c,key),applies:false,modifiers:{},requirements:[],limits:[],notes:[]};
 if(!out.owned){out.requirements.push('Capacité non acquise.');return out;}
 const ability=rows(c).find(a=>a.id===rule.id);
 const rank=ability?Math.max(Number(ability.rank),...rows(c).filter(a=>path(a)===path(ability)).map(a=>Number(a.rank))):0;
 if(rule.situations){
  const selected=Number.isInteger(context.situation)?rule.situations[context.situation]:null;
  if(!selected){out.requirements.push('Les conditions de cette capacité ne sont pas réunies.');return out;}
  const [,modifiers,note]=selected;
  Object.assign(out.modifiers,typeof modifiers==='function'?modifiers({character:c,rank,id:rule.id}):modifiers);
  if(key==='ability:history:wealthy:r5'){
   const previousUses=context.previousUses??0;
   if(!Number.isSafeInteger(previousUses)||previousUses<0||context.importantVictim===true){
    out.modifiers={};
    out.requirements.push(context.importantVictim===true?'Capacité inefficace si la victime est importante.':'Nombre entier positif ou nul d’utilisations précédentes requis.');
    return out;
   }
   out.modifiers.charismaDifficulty+=5*previousUses;
  }
  if(note)out.notes.push(note);
  out.applies=true;
  return out;
 }
 if(key==='community'){
  if(context.socialInteraction!==true||context.sameProfessionalCommunity!==true){out.requirements.push('Interaction sociale avec un autre membre de la même communauté professionnelle requise.');return out;}
  out.modifiers.skillBonus=3;out.notes.push('Le test est généralement fondé sur le CHA ; le MJ choisit la caractéristique adaptée.');
 }else if(key==='courtier_secrets'){
  if(!['secret_information','sensitive_information','auditory_perception'].includes(context.test)){out.requirements.push('Information secrète/sensible ou perception auditive requise.');return out;}out.modifiers.skillBonus=rank+2;
  out.notes.push('L’invitation non sollicitée à une réunion, fête ou cérémonie reste limitée à une fois par aventure.');
 }else if(key==='courtier_details'){
  if(!['visual_perception','detect_lie','read_body_language'].includes(context.test)){out.requirements.push('Perception visuelle, détection du mensonge ou langage corporel requis.');return out;}out.modifiers.skillBonus=rank+2;
  out.notes.push('Le MJ peut rappeler précisément les paroles entendues à la demande du joueur.');
 }else if(key==='scholar_persuasion'){
  if(context.test!=='convince'||context.characteristic!=='cha'){out.requirements.push('Test de CHA pour convaincre requis.');return out;}out.modifiers.skillBonus=rank+2;
 }else if(key==='expert_work'){
  if(context.relatesToChosenProfession!==true){out.requirements.push('Test ou travail en rapport avec le métier choisi requis.');return out;}out.modifiers.bonusDie=true;out.modifiers.workTimeMultiplier=0.5;
  out.notes.push('Moitié du temps nécessaire à un professionnel ordinaire pour un même résultat.');
 }
 out.applies=true;return out;
}
return Object.freeze({version:'FOH-HISTORY-CONTEXT-N1-3',rules,available:c=>Object.keys(rules).filter(k=>owned(c,k)),isOwned:owned,resolve});
});
