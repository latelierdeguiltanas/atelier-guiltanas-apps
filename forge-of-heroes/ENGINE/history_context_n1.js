/* COF2, Voies d'historique pp.172-177. Les contextes sont déclarés par le joueur/MJ.
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
const rows=c=>c?.abilities||c?.acquiredAbilities||[];
const path=a=>a.pathId||a.path_id||'';
const professional=c=>rows(c).find(a=>professions.some(p=>path(a)==='history:'+p)&&Number(a.rank)>=1);
function owned(c,key){if(key==='community')return !!professional(c);return !!rules[key]&&rows(c).some(a=>a.id===rules[key].id);}
function resolve(c,key,context={}){
 const rule=rules[key];if(!rule)throw Error('Règle historique inconnue : '+key);
 const out={rule:key,sourcePage:rule.page,owned:owned(c,key),applies:false,modifiers:{},requirements:[],limits:[],notes:[]};
 if(!out.owned){out.requirements.push('Capacité non acquise.');return out;}
 if(rule.situations){
  const selected=Number.isInteger(context.situation)?rule.situations[context.situation]:null;
  if(!selected){out.requirements.push('Les conditions de cette capacité ne sont pas réunies.');return out;}
  const [,modifiers,note]=selected;
  Object.assign(out.modifiers,modifiers);
  if(note)out.notes.push(note);
  out.applies=true;
  return out;
 }
 const ability=rows(c).find(a=>a.id===rule.id),rank=ability?Math.max(Number(ability.rank),...rows(c).filter(a=>path(a)===path(ability)).map(a=>Number(a.rank))):0;
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
return Object.freeze({version:'FOH-HISTORY-CONTEXT-N1-2',rules,available:c=>Object.keys(rules).filter(k=>owned(c,k)),isOwned:owned,resolve});
});
