'use strict';
const assert=require('node:assert/strict'),path=require('node:path');
const F=require('./forge_product_runner'),A=require('../native-progression');
const cat=require('../progression/catalog.json'),L=require('../../fiches-personnages/library');
const store=new Map(),storage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)};
let count=0;
for(const file of ['index.html','FORGE_OF_HEROES_ATELIER_GUILTANAS_PRODUCT_MASTER.html']){
 const {db,engine}=F.load(path.join(__dirname,'..',file));
 for(const profile of db.tables.classes){
  const state=F.standardState(db,profile.id);if(profile.id.includes('pretre'))state.profileChoices.priestMode='generalist';
  for(const a of engine.previewAcquiredAbilities(state))for(const c of engine.getPersistentChoicesForAbility(state,a.id)){
   const choices=state.abilityChoices[a.id]||={};
   if(c.type==='boolean')choices[c.id]=false;
   else if(c.type==='entity')choices[c.id]={type:'animal',species:'chat',name:'Témoin'};
   else if(c.options?.length)choices[c.id]=c.options[0].id;
  }
  check(state,{id:'test-'+count,type:'standard',name:'Témoin '+profile.label,people:'Humain',profile:profile.label,draft:{}});
 }
 const state=F.standardState(db,'class:guerrier:cof2-lb-2024','classpath:voie-du-soldat:class-guerrier:cof2-lb-2024');
 state.voies.profilePathIds=state.voies.profilePathIds.slice(0,1);
 state.profileMode='NO_PROFILE';state.noProfile={enabled:true,primaryPathId:state.voies.profilePathIds[0],pathIds:state.voies.profilePathIds};
 state.advancedRules.histories=true;state.advancedRules.age=true;
 state.history={geographicPathId:'history:campaigns',professionalPathId:'history:courtier'};
 state.age={categoryId:'venerable',spending:[2,3].flatMap(rank=>['history:campaigns','history:courtier'].map(pathId=>({pathId,rank})))};
 const hero={id:'test-'+count,type:'no-profile',name:'Clic C QA',people:'Humain',profile:'Sans profil',draft:{}};
 const c=check(state,hero);
 assert.equal(c.combat.pvMax,10);assert.equal(c.combat.def,16);assert.equal(c.combat.init,11);
 for(const id of ['history:campaigns','history:courtier'])assert.deepEqual(c.paths.find(p=>p.pathId===id).ranks.map(r=>r.rank).sort(),[1,2,3]);
 assert.throws(()=>A.convert(hero,{state,result:engine.computeCharacterN1(state)},cat,db),/progression de ce profil/);
 function check(state,hero){
  const result=engine.computeCharacterN1(state);assert.equal(result.errors.length,0,hero.profile+': '+result.errors.join('; '));
  const projection={complete:true,state,result},c=A.toCharacter(hero,projection,cat,db);
  assert.ok(L.validCharacter(c),hero.profile);
  assert.equal(c.paths.reduce((n,p)=>n+p.ranks.length,0),result.sticky.acquiredAbilities.length);
  assert.ok(c.paths.every(p=>p.ranks.every(r=>r.text.length>0)),hero.profile+' textes manquants');
  const entry=L.upsert(c,{heroId:hero.id,storage});
  assert.deepEqual(L.read(storage).data.entries[entry.id].character,entry.character);
  assert.equal(c.combat.pvMax,result.sticky.PV);assert.equal(c.combat.def,result.sticky.DEF);
  assert.equal(c.combat.magic,result.sticky.ATK_MAGIC);
  assert.throws(()=>A.toCharacter(hero,{...projection,result:{errors:['choix incomplet']}},cat,db),/Termine/);
  count++;return c;
 }
}
console.log(count+' PASS : tous les profils N1 + sans profil historique vers la bibliothèque interactive ; gardes de progression conservées.');
