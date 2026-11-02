'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{load,standardState}=require('./forge_product_runner');
const ROOT=path.resolve(__dirname,'..'),{db,engine:E,html}=load(path.join(ROOT,'index.html')),T=db.tables,copy=x=>JSON.parse(JSON.stringify(x));
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const profiles=T.classes.filter(p=>p.id.endsWith(':cof2-lb-2024')),peoples=T.peoples.filter(p=>p.id.endsWith(':cof2-lb-2024'));
const stats=['for','agi','con','per','int','vol','cha'];
if(profiles.length!==14||peoples.length!==8)throw Error('Expected 14 official profiles and 8 people');
const tests=[
 {id:'series-expert',type:'STANDARD_SERIES',series:'expert',base:[3,2,1,1,0,0,-1]},
 {id:'series-polyvalent',type:'STANDARD_SERIES',series:'polyvalent',base:[2,2,2,1,1,0,-1]},
 {id:'series-specialiste',type:'STANDARD_SERIES',series:'specialiste',base:[4,2,1,0,0,-1,-1]},
 {id:'purchase-expert',type:'ADVANCED_POINT_BUY',base:[3,2,1,1,0,0,-1]},
 {id:'purchase-balanced',type:'ADVANCED_POINT_BUY',base:[2,2,1,1,1,0,0]},
 {id:'purchase-specialiste',type:'ADVANCED_POINT_BUY',base:[4,2,1,0,0,-1,-1]},
 {id:'semi-mixed',type:'ADVANCED_SEMI_RANDOM',rolls:[2,7,12],base:[1,1,2,0,3,-1,0]},
 {id:'semi-low',type:'ADVANCED_SEMI_RANDOM',rolls:[2,2,2],base:[2,1,1,1,1,1,0]},
 {id:'semi-high',type:'ADVANCED_SEMI_RANDOM',rolls:[12,12,12],base:[3,-1,3,-1,3,-1,0]}
];
const report={schema:'FOH_N1_OFFICIAL_METHODS_CROSS',createdAt:new Date().toISOString(),sourceCommit:process.env.GITHUB_SHA||null,sourceSha256:sha(html),sourceRule:'règles avancées pages imprimées 152–153 : séries, point-buy et semi-aléatoire. Domaine exhaustif des méthodes contrôlé indépendamment par QA/N1/lot2/characteristic-methods.json.',scope:'14 profils officiels × 8 peuples officiels × 9 états de méthode. Vérification du choix légal, projection des sept caractéristiques et relecture de la sauvegarde; inclut une parité entre série Expert et achat identique. Ce contrôle ne certifie pas les options de voie, les autres équipements ni toute l’interface.',cases:0,passed:0,failed:0,refused:0,failedCases:[],refusedReasons:{},items:{profiles:{},peoples:{}},families:{},methods:tests.map(t=>t.id)};
function bagChoices(s){
 const owned=new Set();
 for(const a of T.abilities_class)if(s.voies.profilePathIds.includes(a.path_id)&&a.rank===1||a.path_id===s.voies.mageRank2PathId&&a.rank===2)owned.add(a.id);
 for(const a of T.abilities_people)if(a.path_id===s.voies.peoplePathId&&a.rank===1)owned.add(a.id);
 for(const id of [...owned])for(const c of E.getPersistentChoicesForAbility(s,id)){
  const bag=s.abilityChoices[id]||(s.abilityChoices[id]={});
  if(c.id==='preferredWeaponCategory'){s.profileChoices[c.id]='swords';bag[c.id]='swords';}
  else if(c.id==='extraLanguage'){s.profileChoices[c.id]='celestien';bag[c.id]='celestien';}
  else if(c.id==='forestChildAbility'){bag[c.id]=T.abilities_class.find(a=>a.rank===1&&a.path_id.includes('voie-de-la-survie'))?.id;}
  else if(bag[c.id]==null){if(c.type==='boolean')bag[c.id]=false;else if(c.type==='entity')bag[c.id]={type:'animal',species:'chat',name:'Oracle'};else if(c.type==='weapon_multi')bag[c.id]=(c.options||[]).slice(0,Math.max(1,c.min||1)).map(x=>x.id);else if(c.options?.length)bag[c.id]=c.options[0].id;}
 }
 return s;
}
function make(people,p,baseTest,ids){
 const s=standardState(db,p.id,ids[0],people.id);s.voies.profilePathIds=ids;
 const ancestryPath=T.paths_people.find(x=>x.people_id===people.id||x.allowedPeopleIds?.includes(people.id))||T.paths_people.find(x=>people.id.includes('demi-elfe')&&x.people_id?.includes('humain'));
 if(!ancestryPath)throw Error('no people path '+people.id);
 s.voies.peoplePathId=ancestryPath.id;
 s.peupleChoices={};
 if(people.schema?.key==='humain_weakest_plus1')s.peupleChoices.humainStat=stats[baseTest.base.indexOf(Math.min(...baseTest.base))];
 for(const [key,field]of [['bonus','bonusStat'],['malus','malusStat']])if(people.schema?.[key]?.mode==='choice')s.peupleChoices[field]=people.schema[key].options[0];
 if(people.id.includes('gnome'))s.peupleChoices.grantedAbilityId=T.abilities_class.find(a=>a.rank===1&&!ids.includes(a.path_id)&&T.paths_class.some(x=>x.id===a.path_id&&x.classId.includes('ensorceleur')))?.id;
 if(p.id.includes('pretre'))s.profileChoices.priestMode='generalist';
 if(p.familleId==='mage')s.voies.mageRank2PathId=ids[0];
 s.baseCaracs=Object.fromEntries(stats.map((k,i)=>[k,baseTest.base[i]]));
 s.characteristicMethod={type:baseTest.type,rolls:baseTest.rolls||[2,7,12]};
 s.serieId=baseTest.type==='STANDARD_SERIES'?baseTest.series:'advanced';
 return bagChoices(s);
}
function expected(s,people){
 const c={...s.baseCaracs},schema=people.schema;
 if(schema?.key==='humain_weakest_plus1')c[s.peupleChoices.humainStat]++;
 else for(const [key,field]of [['bonus','bonusStat'],['malus','malusStat']]){const r=schema?.[key];if(r){const k=r.mode==='choice'?s.peupleChoices[field]:r.stat||r.options?.[0];if(k)c[k]+=r.value;}}
 return c;
}
function candidatePairs(p){
 const ps=T.paths_class.filter(x=>x.classId===p.id&&!x.additionalMagePath),pairs=[];
 for(let i=0;i<ps.length;i++)for(let j=i+1;j<ps.length;j++)pairs.push([ps[i].id,ps[j].id]);
 return pairs;
}
for(const people of peoples)for(const p of profiles){
 const idx=[people.id,p.id],key=idx.join('|'),rows=[],pairs=candidatePairs(p);
 let match=null;
 for(const ids of pairs){
  const s=make(people,p,tests[0],ids),r=E.computeCharacterN1(s);
  if(!r.errors.length){match=ids;break;}
 }
 if(!match){report.failed++;report.failedCases.push({key,error:'No valid standard pair in supplied equipment; not a product assertion'});continue;}
 for(const test of tests){
  report.cases++;
  const state=make(people,p,test,match),raw=JSON.stringify(state),r=E.computeCharacterN1(state),caseName=key+'|'+test.id;
  if(r.errors.length){report.refused++;const msg=[...r.errors].join(' ; ');report.refusedReasons[msg]=(report.refusedReasons[msg]||0)+1;if(report.failedCases.length<80)report.failedCases.push({caseName,type:'REFUSED',reason:msg});continue;}
  try{
   if(raw!==JSON.stringify(state))throw Error('state mutated');
   if(JSON.stringify(copy(r.sticky.caracs))!==JSON.stringify(expected(state,people)))throw Error('racial characteristics not as expected');
   const char=r.sticky.characterState;if(!char||char.level!==1)throw Error('level invalid');
   for(const v of ['PV','DEF','INIT','PC','PM','ATC','ATD','ATM'])if(!Number.isFinite(char.derived[v]))throw Error('missing '+v);
   const saved=E.createHeroSavePayload(state,char,{id:'method-item'}),restored=E.restoreHeroSavePayload(copy(saved)),r2=E.computeCharacterN1(restored.draft);
   if(r2.errors.length)throw Error('restore rejected '+r2.errors.join('|'));
   if(JSON.stringify(copy(r2.sticky.caracs))!==JSON.stringify(copy(r.sticky.caracs)))throw Error('restore stats mismatch');
   if(JSON.stringify(copy(r2.sticky.characterState.derived))!==JSON.stringify(copy(char.derived)))throw Error('restore derived mismatch');
   rows.push({id:test.id,status:'PASS',caracs:copy(r.sticky.caracs),derived:copy(char.derived)});
   report.passed++;
  }catch(e){report.failed++;if(report.failedCases.length<80)report.failedCases.push({caseName,type:'FAIL',error:String(e)});}
 }
 const expert=rows.find(x=>x.id==='series-expert'),buy=rows.find(x=>x.id==='purchase-expert');
 const parity=!!expert&&!!buy&&JSON.stringify(expert.caracs)===JSON.stringify(buy.caracs)&&JSON.stringify(expert.derived)===JSON.stringify(buy.derived);
 const item={attempted:tests.length,passed:rows.length,refused:tests.length-rows.length,parity,profile:p.id,people:people.id,methodIds:rows.map(x=>x.id),status:rows.length===tests.length&&parity?'PASS':'OPEN'};
 (report.items.profiles[p.id]??=[]).push(item);(report.items.peoples[people.id]??=[]).push(item);
}
report.coverage={profiles:profiles.length,peoples:peoples.length,methodRepresentatives:tests.length,expectedCases:14*8*tests.length,complete:report.cases===14*8*tests.length&&report.failed===0&&report.refused===0&&Object.values(report.items.profiles).every(a=>a.length===8&&a.every(x=>x.status==='PASS'))};
fs.writeFileSync(path.join(ROOT,'QA/N1/official-methods-cross.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({cases:report.cases,passed:report.passed,refused:report.refused,failed:report.failed,coverage:report.coverage,groups:report.refusedReasons,examples:report.failedCases.slice(0,8)}));
if(!report.coverage.complete)process.exitCode=1;