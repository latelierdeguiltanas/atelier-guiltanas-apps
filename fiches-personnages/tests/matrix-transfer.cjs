'use strict';
const assert=require('node:assert/strict'),{load,standardState}=require('../../forge-of-heroes/FINAL_FREEZE_TESTS/forge_product_runner'),N=require('../../forge-of-heroes/native-progression.js'),L=require('../library.js');
const {db,engine}=load(),T=db.tables;
let tested=0;const failures=[],profiles=new Set(),peoples=new Set();
const dagger=T.weapons_n1.find(w=>/^dague$/i.test(w.label||w.name));
for(const profile of T.classes||[])for(const people of T.peoples||[]){
 try{
  const state=standardState(db,profile.id,null,people.id);
  if(people.id.includes(':centaure:')&&profile.id.includes(':chevalier:')){
   state.voies.profilePathIds=T.paths_class.filter(p=>p.classId===profile.id&&!p.id.includes('voie-du-cavalier')).slice(0,2).map(p=>p.id);
  }
  if(profile.id.includes(':pretre:'))state.profileChoices.priestMode='generalist';
  if(/people:(lutin|fee):/.test(people.id))state.baseCaracs={for:-1,agi:2,con:1,per:1,int:3,vol:0,cha:0};
  for(const [field,rule]of[['bonusStat',people.schema?.bonus],['malusStat',people.schema?.malus]]){
   if(rule?.mode==='choice')state.peupleChoices[field]=rule.options[0];
   else delete state.peupleChoices[field];
  }
  for(const ability of engine.previewAcquiredAbilities(state))for(const choice of engine.getPersistentChoicesForAbility(state,ability.id)){
   const choices=state.abilityChoices[ability.id]||={};
   if(choice.type==='boolean')choices[choice.id]=false;
   else if(choice.type==='entity')choices[choice.id]={type:'animal',species:'chat',name:'Témoin'};
   else if(choice.options?.length)choices[choice.id]=choice.options[0].id;
  }
  let result=engine.computeCharacterN1(state);
  if(result.errors.some(e=>/petite taille|deux mains pour ce peuple/.test(e))){
   state.equip={...state.equip,weaponIds:[dagger.id],gmApprovedSwap:true};
   result=engine.computeCharacterN1(state);
  }
  assert.equal(result.errors.length,0,result.errors.join(' | '));
  const character=N.toCharacter({id:'m-'+(tested+failures.length),name:'QA',people:people.label||'Peuple',profile:profile.label||'Profil',draft:{}},{state,result},{paths:[],profiles:[]},db);
  if(!L.validCharacter(character))throw Error('export incompatible : '+JSON.stringify({id:character.id,stats:character.stats,combat:character.combat,invalidRanks:character.paths.flatMap(p=>p.ranks).filter(r=>typeof r.text!=='string'||typeof r.name!=='string').map(r=>({name:r.name,rank:r.rank,textType:typeof r.text})),attacksArray:Array.isArray(character.attacks),equipmentArray:Array.isArray(character.equipment)}).slice(0,420));
  const acquired=result.sticky.acquiredAbilities||[],owned=character.paths.flatMap(p=>p.ranks);
  if(acquired.length!==owned.length||owned.some(r=>!r.owned||!r.name||!r.text?.trim()))throw Error('rangs omis ou sans texte');
  assert.deepEqual(owned.map(a=>a.abilityId).sort(),Array.from(acquired,a=>a.id).sort());
  const local=new Map();
  const storage={getItem:key=>local.get(key)??null,setItem:(key,value)=>local.set(key,value)};
  const entry=L.upsert(character,{heroId:character.id,storage});
  assert.deepEqual(L.read(storage).data.entries[entry.id].character,entry.character);
  if(JSON.stringify(character.skillBonuses)!==JSON.stringify(result.sticky.skillBonuses||[]))throw Error('bonus de compétence perdus');
  if(JSON.stringify(character.passiveFeatures)!==JSON.stringify(result.sticky.passiveFeatures||[]))throw Error('effets passifs perdus');
  profiles.add(profile.id);peoples.add(people.id);tested++;
 }catch(e){failures.push({profile:profile.label,people:people.label,error:e.message})}
}
const total=T.classes.length*T.peoples.length;
console.log('MATRIX | exports valides='+tested+'/'+total+' | profils='+profiles.size+' | peuples='+peoples.size);
if(failures.length){console.error('MATRIX FAIL | '+JSON.stringify(failures));process.exitCode=1;}
assert.equal(tested,total,'Un témoin valide par couple peuple/profil est requis');
