/* COF2, Voies d'historique pp.176-177. Les contextes sont déclarés par le joueur/MJ.
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
const rows=c=>c?.abilities||c?.acquiredAbilities||[];
const path=a=>a.pathId||a.path_id||'';
const professional=c=>rows(c).find(a=>professions.some(p=>path(a)==='history:'+p)&&Number(a.rank)>=1);
function owned(c,key){if(key==='community')return !!professional(c);return !!rules[key]&&rows(c).some(a=>a.id===rules[key].id);}
function resolve(c,key,context={}){
 const rule=rules[key];if(!rule)throw Error('Règle historique inconnue : '+key);
 const out={rule:key,sourcePage:rule.page,owned:owned(c,key),applies:false,modifiers:{},requirements:[],limits:[],notes:[]};
 if(!out.owned){out.requirements.push('Capacité non acquise.');return out;}
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
return Object.freeze({version:'FOH-HISTORY-CONTEXT-N1-1',rules,available:c=>Object.keys(rules).filter(k=>owned(c,k)),isOwned:owned,resolve});
});
