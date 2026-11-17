'use strict';
const assert=require('node:assert/strict'),{load,standardState}=require('../../forge-of-heroes/FINAL_FREEZE_TESTS/forge_product_runner'),N=require('../../forge-of-heroes/native-progression.js'),L=require('../library.js');
const {db,engine}=load(),T=db.tables;
let tested=0,skipped=0;const reasons=new Map(),failures=[],profiles=new Set(),peoples=new Set();
for(const profile of T.classes||[])for(const people of T.peoples||[]){
 let state;
 try{state=standardState(db,profile.id,null,people.id);}catch(e){skipped++;reasons.set(e.message,(reasons.get(e.message)||0)+1);continue;}
 try{
  for(const [field,rule]of[['bonusStat',people.schema?.bonus],['malusStat',people.schema?.malus]]){if(rule?.mode==='choice')state.peupleChoices[field]=rule.options[0];else delete state.peupleChoices[field];}
  if(/halfelin|gnome|nain/.test(people.id))state.equip.gmApprovedSwap=true;
  for(const ability of engine.previewAcquiredAbilities(state))for(const c of engine.getPersistentChoicesForAbility(state,ability.id))if(c.options?.length)(state.abilityChoices[ability.id]??={})[c.id]=c.options[0].id;
  const result=engine.computeCharacterN1(state);
  if(result.errors?.length){skipped++;for(const e of result.errors.slice(0,2))reasons.set(String(e).slice(0,160),(reasons.get(String(e).slice(0,160))||0)+1);continue;}
  const character=N.toCharacter({id:'m-'+(tested+skipped+failures.length),name:'QA',people:people.label||'Peuple',profile:profile.label||'Profil',draft:{}},{state,result},{paths:[],profiles:[]},db);
  if(!L.validCharacter(character))throw Error('export incompatible : '+JSON.stringify({id:character.id,stats:character.stats,combat:character.combat,invalidRanks:character.paths.flatMap(p=>p.ranks).filter(r=>typeof r.text!=='string'||typeof r.name!=='string').map(r=>({name:r.name,rank:r.rank,textType:typeof r.text})),attacksArray:Array.isArray(character.attacks),equipmentArray:Array.isArray(character.equipment)}).slice(0,420));
  const acquired=result.sticky.acquiredAbilities||[],owned=character.paths.flatMap(p=>p.ranks);
  if(acquired.length!==owned.length||owned.some(r=>!r.owned||!r.name||!r.text?.trim()))throw Error('rangs omis ou sans texte');
  if(JSON.stringify(character.skillBonuses)!==JSON.stringify(result.sticky.skillBonuses||[]))throw Error('bonus de compétence perdus');
  if(JSON.stringify(character.passiveFeatures)!==JSON.stringify(result.sticky.passiveFeatures||[]))throw Error('effets passifs perdus');
  profiles.add(profile.id);peoples.add(people.id);tested++;
 }catch(e){failures.push({profile:profile.label,people:people.label,error:e.message})}
}
console.log('MATRIX | combinaisons valides exportées='+tested+' | profils='+profiles.size+' | peuples='+peoples.size+' | états nécessitant des choix supplémentaires='+skipped);
console.log('MATRIX | choix/contraintes à approfondir : '+JSON.stringify([...reasons].sort((a,b)=>b[1]-a[1]).slice(0,8)));
if(failures.length){console.error('MATRIX FAIL | '+JSON.stringify(failures.slice(0,20)));process.exitCode=1;}else console.log('PASS | aucun transfert incomplet parmi les créations valides de la matrice');
