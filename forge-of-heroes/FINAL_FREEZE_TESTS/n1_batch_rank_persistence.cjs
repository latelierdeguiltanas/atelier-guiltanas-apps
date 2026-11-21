'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{createHash}=require('node:crypto');
const {load,standardState}=require('./forge_product_runner');
const {toCharacter}=require('../native-progression');
const vault=require('../../fiches-personnages/library');
const {db,engine,html}=load(),T=db.tables;
const root=path.resolve(__dirname,'../..');
const sha=data=>createHash('sha256').update(data).digest('hex');
const fileSha=file=>sha(fs.readFileSync(path.join(root,file)));
const rows=[...T.abilities_class,...T.abilities_people,...T.history_abilities];
const candidates=rows.filter(a=>a.rank<=3||a.path_id.startsWith('history:'));
const canonicalIds=new Map(candidates.map(a=>{
 const replacement=a.rank===1&&T.abilities_r1_people.find(r=>
  (r.path_id||r.pathId)===a.path_id&&(r.label||r.name)===a.label);
 return [a.id,replacement?.id||a.id];
}));
const witnesses={},unresolved=[];
const rowsByActualId=Map.groupBy(candidates,a=>canonicalIds.get(a.id));
const human='people:humain:cof2-lb-2024',thief='class:voleur:cof2-lb-2024';
const neutralCatalogue={paths:[],profiles:[]};
const copy=value=>JSON.parse(JSON.stringify(value));
const dagger=T.weapons_n1.find(w=>/^dague$/i.test(w.label||w.name)).id;
const sourceInputs=require('../QA/N1/lot-2026-11-19/untracked-acquisitions.json');

function fill(state){
 for(let pass=0;pass<3;pass++){
  const owned=engine.previewAcquiredAbilities(state);
  for(const ability of owned)for(const choice of engine.getPersistentChoicesForAbility(state,ability.id)){
   const b=state.abilityChoices[ability.id]||={};
   if(b[choice.id]!=null)continue;
   if(choice.id==='preferredWeaponCategory'){
    b[choice.id]=state.profileChoices[choice.id]=(choice.options.find(o=>o.id===(state.classeId.includes(':arbaletrier:')?'crossbows':'swords'))||choice.options[0]).id;
   }else if(choice.id==='extraLanguage'){
    b[choice.id]=state.profileChoices[choice.id]='celestien';
   }else if(choice.type==='boolean')b[choice.id]=false;
   else if(choice.type==='entity')b[choice.id]={type:'animal',species:'chat',name:'Témoin'};
   else if(choice.type.endsWith('_multi')||choice.type==='multi')b[choice.id]=choice.options.slice(0,Math.max(1,choice.min||1)).map(o=>o.id);
   else if(choice.options?.length)b[choice.id]=choice.options.find(o=>!owned.some(a=>a.id===o.id))?.id||choice.options[0].id;
  }
 }
 return state;
}
function witness(state,targetId){
 const expectedId=canonicalIds.get(targetId);
 const result=engine.computeCharacterN1(state);
 if(result.errors.length)return Array.from(result.errors);
 const original=result.sticky;
 const expected=Array.from(original.acquiredAbilities,a=>a.id).sort();
 if(!expected.includes(expectedId))return ['Rang attendu absent après calcul'];
 const payload=engine.createHeroSavePayload(state,original.characterState,{id:'rank-witness'});
 const reopenedState=engine.restoreHeroSavePayload(copy(payload)).draft;
 const reopened=engine.computeCharacterN1(reopenedState);
 assert.equal(reopened.errors.length,0,reopened.errors.join(' | '));
 assert.deepEqual(Array.from(reopened.sticky.acquiredAbilities,a=>a.id).sort(),expected);
 const hero={id:'rank-witness',name:'Témoin QA',people:original.peupleLabel,profile:original.profileLabel,draft:{}};
 const character=toCharacter(hero,{state:reopenedState,result:reopened},neutralCatalogue,db);
 assert(vault.validCharacter(character));
 const stored=new Map(),storage={getItem:key=>stored.get(key)??null,setItem:(key,value)=>stored.set(key,value)};
 const entry=vault.upsert(character,{heroId:hero.id,storage});
 const restored=vault.read(storage).data.entries[entry.id].character;
 assert.deepEqual(restored,entry.character);
 const ranks=restored.paths.flatMap(p=>p.ranks);
 assert.deepEqual(ranks.map(a=>a.abilityId).sort(),expected);
 assert(ranks.every(a=>a.owned&&a.text.trim()));
 for(const actualId of expected)for(const target of rowsByActualId.get(actualId)||[]){
  if(!witnesses[target.id])witnesses[target.id]={scenario:targetId,actualId};
 }
 return [];
}
function make(pathRow,kind,rank){
 const magePath=pathRow.id==='path:mage:cof2-lb-2024';
 const people=kind==='people'&&!magePath?T.peoples.find(p=>p.id===pathRow.people_id||pathRow.allowedPeopleIds?.includes(p.id)):T.peoples.find(p=>p.id===human);
 const state=standardState(db,kind==='profile'?pathRow.classId:magePath?'class:magicien:cof2-lb-2024':thief,kind==='profile'?pathRow.id:undefined,people.id);
 if(kind==='profile'&&pathRow.additionalMagePath){state.voies.profilePathIds[0]=pathRow.id;state.advancedRules.additionalMagePaths=true;}
 if(state.classeId.includes(':guerrier:')&&state.voies.profilePathIds.some(id=>id.includes('voie-du-maitre-d-armes')))state.profileChoices.preferredWeaponCategory='swords';
 if(state.classeId.includes(':pretre:'))state.profileChoices.priestMode='generalist';
 if(kind==='people')state.voies.peoplePathId=pathRow.id;
 if(magePath){
  state.voies.keepPeoplePathId='path:voie-de-l-humain:cof2-lb-2024';
  state.voies.mageRank2PathId=rank===3?state.voies.profilePathIds[0]:pathRow.id;
 }
 if(people.id!==human){
  state.peupleChoices={};
  for(const field of ['bonus','malus'])if(people.schema?.[field]?.mode==='choice')state.peupleChoices[field+'Stat']=people.schema[field].options[0];
  if(/people:(fee|lutin):/.test(people.id))state.baseCaracs={for:-1,agi:2,con:1,per:1,int:3,vol:0,cha:0};
  state.equip={...state.equip,armorId:'',shieldId:'',weaponIds:[dagger],gmApprovedSwap:true};
 }
 if(kind==='history'){
  state.advancedRules.histories=true;
  state.voies.profilePathIds=state.voies.profilePathIds.slice(0,1);
  state.history={geographicPathId:pathRow.category==='geographic'?pathRow.id:'history:campaigns',professionalPathId:pathRow.category==='professional'?pathRow.id:'history:courtier',rank:1};
 }
 if(kind==='profile'&&state.familleId==='mage')state.voies.mageRank2PathId=state.voies.profilePathIds[rank===3?1:0];
 if(rank>1&&!(rank===2&&state.familleId==='mage'&&(kind==='profile'||magePath))){
  const second=state.voies.profilePathIds.find(id=>id!==pathRow.id&&id!==state.voies.mageRank2PathId);
  const spending=Array.from({length:rank-1},(_,i)=>({pathId:pathRow.id,rank:i+2}));
  if(kind==='history'&&rank<5){
   const sibling=pathRow.category==='geographic'?state.history.professionalPathId:state.history.geographicPathId;
   const remaining=(rank===2?2:4)-spending.length;
   for(let i=0;i<remaining;i++)spending.push({pathId:sibling,rank:i+2});
  }else if(kind!=='history')spending.push({pathId:second||state.voies.peoplePathId,rank:2});
  state.advancedRules.age=true;
  state.age={categoryId:rank===2?'mature':'venerable',spending};
 }
 return fill(state);
}
module.exports={make};
if(require.main===module){
for(const c of sourceInputs.cases.filter(x=>x.status==='PASS')){
 const errors=witness(c.input,c.id);
 assert.deepEqual(errors,[],c.id);
}
for(const [paths,kind] of [[T.paths_class,'profile'],[T.paths_people,'people'],[T.history_paths,'history']]){
 for(const p of paths)for(const a of candidates.filter(a=>a.path_id===p.id).sort((a,b)=>b.rank-a.rank)){
  if(witnesses[a.id])continue;
  try{
   const errors=witness(make(p,kind,a.rank),a.id);
   if(errors.length)unresolved.push({id:a.id,errors});
  }catch(error){unresolved.push({id:a.id,errors:[error.message]});}
 }
}
const report={
 schema:'FOH_N1_RANK_PERSISTENCE_BATCH_V1',
 inputs:{indexSha256:sha(html),nativeSha256:fileSha('forge-of-heroes/native-progression.js'),librarySha256:fileSha('fiches-personnages/library.js')},
 scope:'A legal level-one acquisition witness, official Forge save/reopen and native vault transfer/reopen per credited rank. Effect mechanics and browser UI are independent.',
 targetCount:candidates.length,witnesses,unresolved:unresolved.filter(x=>!witnesses[x.id])
};
const output=process.env.FOH_BATCH_RANK_REPORT||path.join(root,'forge-of-heroes/QA/N1/lot-2026-11-19/rank-persistence-batch.json');
fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({covered:Object.keys(witnesses).length,total:candidates.length,unresolved:report.unresolved},null,2));
assert.equal(Object.keys(witnesses).length,candidates.length,'Chaque rang candidat doit avoir un témoin');
}
