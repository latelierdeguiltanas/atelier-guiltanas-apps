'use strict';
const assert=require('node:assert/strict'),path=require('node:path');
const {load,standardState}=require('./forge_product_runner');
const {toCharacter}=require('../native-progression');
const catalog=require('../progression/catalog.json');
const warrior='class:guerrier:cof2-lb-2024',soldier='classpath:voie-du-soldat:class-guerrier:cof2-lb-2024';
const thief='class:voleur:cof2-lb-2024',assassin='classpath:voie-de-l-assassin:class-voleur:cof2-lb-2024';
const histories=['history:campaigns','history:courtier'];
// Age rules p.153, historical variant pp.170–172, hybrid family benefits p.180.
const ages=[
 {id:'very-young',choice:'PC',agi:1,con:1,init:10,pc:3,dr:3,rank:1},
 {id:'very-young',choice:'DR',agi:1,con:1,init:10,pc:2,dr:4,rank:1},
 {id:'young',agi:1,con:1,init:11,pc:2,dr:3,rank:1},
 {id:'mature',agi:0,con:1,init:11,pc:2,dr:3,rank:2},
 {id:'venerable',agi:0,con:0,init:11,pc:2,dr:2,rank:3}
];
let count=0;
for(const file of ['index.html','FORGE_OF_HEROES_ATELIER_GUILTANAS_PRODUCT_MASTER.html']){
 const {db,engine}=load(path.join(__dirname,'..',file));
 for(const mode of ['standard','hybrid','no-profile'])for(const age of ages)for(const armor of [false,true]){
  const state=standardState(db,warrior,soldier);
  state.voies.profilePathIds=[soldier];
  if(mode==='hybrid')state.hybrid={enabled:true,gmApproved:true,primaryProfileId:warrior,secondaryProfileId:thief,primaryPathId:soldier,secondaryPathId:assassin};
  if(mode==='no-profile'){state.profileMode='NO_PROFILE';state.noProfile={enabled:true,primaryPathId:soldier,pathIds:[soldier]};}
  state.advancedRules.age=true;state.advancedRules.histories=true;
  state.history={geographicPathId:histories[0],professionalPathId:histories[1]};
  state.age={categoryId:age.id,choice:age.choice||null,spending:[]};
  for(let rank=2;rank<=age.rank;rank++)for(const pathId of histories)state.age.spending.push({pathId,rank});
  state.equip={...state.equip,gmApprovedSwap:true,armorId:armor?'armor:cuir-simple:cof2-lb-2024':'',shieldId:''};
  const check=(s)=>{
   const result=engine.computeCharacterN1(s);
   const tag=[file,mode,age.id,age.choice,armor].join('/');
   assert.equal(result.errors.length,0,tag+': '+result.errors.join('; '));
   const c=toCharacter({id:'qa-turn',name:'Témoin',type:mode,profile:mode,people:'Humain',draft:{}},{state:s,result},catalog,db);
   const expected={pvMax:(mode==='hybrid'?9:10)+age.con,def:10+age.agi+(armor?2:0),init:age.init,pcMax:age.pc,recoveryMax:age.dr,recoveryDie:'D10',contact:3,distance:1+age.agi,magic:1,pmMax:0};
   for(const [key,value] of Object.entries(expected))assert.equal(c.combat[key],value,tag+' '+key);
   assert.equal(c.stats.AGI,age.agi);assert.equal(c.stats.CON,age.con);
   for(const id of histories)assert.deepEqual(c.paths.find(p=>p.pathId===id).ranks.map(r=>r.rank).sort(),Array.from({length:age.rank},(_,i)=>i+1));
   assert.equal(c.paths.some(p=>p.pathId===assassin),false);
   return result.sticky.characterState;
  };
  const cs=check(state);
  const saved=engine.createHeroSavePayload(state,cs,{id:'qa-turn'});
  check(engine.restoreHeroSavePayload(JSON.parse(JSON.stringify(saved))).draft);
  count++;
 }
}
console.log(count+' cas vérifiés, puis relus après sauvegarde.');
