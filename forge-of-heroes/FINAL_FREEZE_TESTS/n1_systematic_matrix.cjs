'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {load,standardState}=require('./forge_product_runner');
const shardArg=process.argv.find(x=>x.startsWith('--shard='))?.slice(8),[shardIndex,shardTotal]=shardArg?shardArg.split('/').map(Number):[0,1];
const ROOT=path.resolve(__dirname,'..'),OUT=path.join(ROOT,'QA/N1',shardArg?'shard-'+shardIndex:''),{db,engine:E,html}=load(ROOT+'/index.html'),T=db.tables;
const copy=x=>JSON.parse(JSON.stringify(x)),hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const smoke=process.argv.includes('--smoke'),stats=['for','agi','con','per','int','vol','cha'];
const classes=smoke?T.classes.slice(0,2):T.classes,peoples=smoke?T.peoples.slice(0,2):T.peoples;
const paths=T.paths_class.filter(p=>!p.additionalMagePath),byClass=id=>paths.filter(p=>p.classId===id);
fs.mkdirSync(OUT,{recursive:true});
const master=load(ROOT+'/FORGE_OF_HEROES_ATELIER_GUILTANAS_PRODUCT_MASTER.html');
const extract=(s,id)=>s.match(new RegExp('<script[^>]*id="'+id+'"[^>]*>([\\s\\S]*?)<\\/script>'))[1];
assert.equal(extract(html,'FOH_DB_JSON'),extract(master.html,'FOH_DB_JSON'),'Product data parity');
assert.equal(extract(html,'FOH_ENGINE_BUNDLE'),extract(master.html,'FOH_ENGINE_BUNDLE'),'Product engine parity');
const results={},failures=[],rejections=new Map(),coverage={profiles:new Set(),peoples:new Set(),profilePaths:new Set(),hybridPairs:new Set(),noProfilePairs:new Set()},startedAt=new Date().toISOString();
let serial=0;
function fill(s){
 // Read choices directly from the acquired source rows, including choices required before a valid projection exists.
 // Avoid repeatedly computing a complete character just to discover an empty list of choices.
 const rows=[...T.abilities_class,...T.abilities_people,...(T.abilities_r1_people||[])],owned=new Set();
 for(const a of rows)if((s.voies.profilePathIds.includes(a.path_id)&&a.rank===1)||(a.path_id===s.voies.mageRank2PathId&&a.rank===2)||(a.path_id===s.voies.peoplePathId&&a.rank===1))owned.add(a.id);
 const queue=[...owned],visited=new Set();
 while(queue.length){const id=queue.shift();if(visited.has(id))continue;visited.add(id);
  for(const c of E.getPersistentChoicesForAbility(s,id)){
   const bag=s.abilityChoices[id]||(s.abilityChoices[id]={});
   if(c.id==='preferredWeaponCategory'){s.profileChoices[c.id]||='swords';bag[c.id]??=s.profileChoices[c.id];}
   else if(c.id==='extraLanguage'){s.profileChoices[c.id]||='celestien';bag[c.id]??=s.profileChoices[c.id];}
   else if(bag[c.id]==null){
    if(c.type==='boolean')bag[c.id]=false;
    else if(c.type==='entity')bag[c.id]={type:'animal',species:'chat',name:'Témoin'};
    else if(c.type==='weapon_multi')bag[c.id]=(c.options||[]).slice(0,Math.max(1,c.min||1)).map(x=>x.id);
    else if(c.options?.length)bag[c.id]=(c.type==='ability_choice'?c.options.find(x=>!owned.has(x.id)):c.options[0])?.id;
   }
   if(c.type==='ability_choice'&&bag[c.id]){owned.add(bag[c.id]);queue.push(bag[c.id]);}
  }
 }
 return s;
}
function make(profile,people,ids){
 const s=standardState(db,profile.id,ids[0],people.id);s.voies.profilePathIds=ids.slice();
 s.voies.peoplePathId=(T.paths_people.find(p=>p.people_id===people.id||p.allowedPeopleIds?.includes(people.id))||T.paths_people.find(p=>people.id.includes(':demi-elfe:')&&p.people_id==='people:humain:cof2-lb-2024'))?.id||'';
 // Valid official series; INT +3 permits the Runes prerequisite without silently altering a rejection.
 if(/people:(lutin|fee):/.test(people.id))s.baseCaracs={for:-1,agi:2,con:1,per:1,int:3,vol:0,cha:0};
 s.peupleChoices={};const schema=people.schema;
 if(people.id.includes(':humain:'))s.peupleChoices.humainStat='cha';
 for(const [key,field] of [['bonus','bonusStat'],['malus','malusStat']])if(schema?.[key]?.mode==='choice')s.peupleChoices[field]=schema[key].options[0];
 if(people.id.includes(':gnome:'))s.peupleChoices.grantedAbilityId=T.abilities_class.find(a=>a.rank===1&&!ids.includes(a.path_id)&&T.paths_class.some(p=>p.id===a.path_id&&p.classId==='class:ensorceleur:cof2-lb-2024'))?.id;
 if(profile.id.includes('pretre'))s.profileChoices.priestMode='generalist';
 if(profile.familleId==='mage')s.voies.mageRank2PathId=ids[0];
 return s;
}
function expectedStats(s,people){const out={...s.baseCaracs},schema=people.schema;
 if(schema?.key==='humain_weakest_plus1')out[s.peupleChoices.humainStat]++;
 else for(const [key,field] of [['bonus','bonusStat'],['malus','malusStat']]){const r=schema?.[key];if(!r)continue;const k=r.mode==='choice'?s.peupleChoices[field]:(r.stat||r.options?.[0]);if(k)out[k]+=r.value;}
 return out;
}
function run(mode,s,people,meta={}){
 const row=results[mode]||(results[mode]={attempted:0,accepted:0,rejectedForReview:0,assertionFailures:0,replayChecks:0,negativeChecks:0});row.attempted++;serial++;
 const before=JSON.stringify(s),key=hash(before),r=E.computeCharacterN1(s);
 const details={mode,caseId:key,profile:s.classeId,people:s.peupleId,paths:s.voies.profilePathIds,...meta};
 try{assert.equal(JSON.stringify(s),before,'input mutated');}catch(e){record(e);return;}
 if(r.errors.length){row.rejectedForReview++;const reasons=Array.from(r.errors).sort(),rk=mode+'|'+reasons.join('|');const v=rejections.get(rk)||{mode,reasons,count:0,samples:[]};v.count++;if(v.samples.length<3)v.samples.push({case:details,state:s});rejections.set(rk,v);return;}
 row.accepted++;coverage.profiles.add(s.classeId);coverage.peoples.add(s.peupleId);for(const p of s.voies.profilePathIds)coverage.profilePaths.add(p);
 const c=r.sticky.characterState;
 try{
  assert.equal(c.level,1);assert.deepEqual(copy(c.characteristics),expectedStats(s,people),'ancestry characteristics');
  for(const k of ['PV','PC','PM','DEF','INIT','ATC','ATD','ATM'])assert.ok(Number.isFinite(c.derived[k]),'finite '+k);
  assert.ok(c.derived.PV>0);assert.ok(c.derived.PM>=0);assert.ok(c.derived.PC>=0);
  assert.equal(new Set(c.abilities.map(a=>a.id)).size,c.abilities.length,'duplicate abilities');
  if(s.profileMode==='NO_PROFILE'){assert.equal(c.profileId,null);coverage.noProfilePairs.add(s.voies.profilePathIds.slice().sort().join('|'));}
  else assert.equal(c.profileId,s.hybrid?.enabled?'hybrid:'+s.hybrid.primaryProfileId+'+'+s.hybrid.secondaryProfileId:s.classeId);
  if(s.hybrid?.enabled)coverage.hybridPairs.add(s.hybrid.primaryProfileId+'|'+s.hybrid.secondaryProfileId);
  for(const id of s.voies.profilePathIds)assert.ok(c.abilities.some(a=>a.pathId===id&&a.rank===1),'selected R1 missing '+id);
  if(serial%17===0){const payload=E.createHeroSavePayload(s,c,{id:'qa-'+serial}),restored=E.restoreHeroSavePayload(copy(payload)),again=E.computeCharacterN1(restored.draft);assert.equal(again.errors.length,0,'restoration refused');const restoredState=copy(again.sticky.characterState),originalState=copy(c);assert.equal(restoredState.creationInput.heroLibraryId,'qa-'+serial);delete restoredState.creationInput.heroLibraryId;delete originalState.creationInput.heroLibraryId;assert.deepEqual(restoredState,originalState,'save/reload mismatch');row.replayChecks++;}
  if(serial%31===0){const bad=copy(s);bad.voies.profilePathIds=[];if(bad.noProfile)bad.noProfile.pathIds=[];const invalid=E.computeCharacterN1(bad);assert.ok(invalid.errors.length,'empty paths accepted');assert.match(invalid.errors.join(' '),/voie/i,'unrelated empty-path rejection');row.negativeChecks++;}
 }catch(e){record(e);}
 function record(e){row.assertionFailures++;if(failures.length<100)failures.push({case:details,state:s,error:e.message});}
}
function done(mode){console.log(mode+': '+JSON.stringify(results[mode]));fs.writeFileSync(path.join(OUT,smoke?'smoke-progress.json':'progress.json'),JSON.stringify({startedAt,updatedAt:new Date().toISOString(),results,failures,rejectionGroups:[...rejections.values()]},null,2)+'\n');}
for(const p of classes.filter((_,i)=>i%shardTotal===shardIndex))for(const people of peoples){const pp=byClass(p.id);for(let i=0;i<pp.length;i++)for(let j=i+1;j<pp.length;j++){
 const s=make(p,people,[pp[i].id,pp[j].id]);run('standard',fill(s),people);
 // All available ancestry adjustments, including both choices of the weakest human stats.
 const bonus=people.schema?.bonus?.mode==='choice'?people.schema.bonus.options:[null],malus=people.schema?.malus?.mode==='choice'?people.schema.malus.options:[null];
 for(const b of bonus)for(const m of malus){if(b===s.peupleChoices.bonusStat&&m===s.peupleChoices.malusStat)continue;const alt=copy(s);if(b)alt.peupleChoices.bonusStat=b;if(m)alt.peupleChoices.malusStat=m;run('ancestry-choices',fill(alt),people);}
 if(people.id.includes(':humain:')){const alt=copy(s);alt.peupleChoices.humainStat='con';run('ancestry-choices',fill(alt),people);}
 if(p.familleId==='mage'){const alt=copy(s);alt.voies.mageRank2PathId=pp[j].id;run('mage-r2-alternative',fill(alt),people);}
}}done('standard');done('ancestry-choices');done('mage-r2-alternative');
for(const primary of classes.filter((_,i)=>i%shardTotal===shardIndex))for(const secondary of classes){if(primary.id===secondary.id)continue;for(const people of peoples)for(const a of byClass(primary.id))for(const b of byClass(secondary.id)){
 const s=make(primary,people,[a.id,b.id]);s.hybrid={enabled:true,gmApproved:true,primaryProfileId:primary.id,secondaryProfileId:secondary.id,primaryPathId:a.id,secondaryPathId:b.id};
 run('hybrid',fill(s),people);
}console.log('hybrid pair '+primary.label+' / '+secondary.label);}
done('hybrid');
const npPaths=paths.filter(p=>classes.some(c=>c.id===p.classId));
for(const people of peoples)for(let i=0;i<npPaths.length;i++)for(let j=i+1;j<npPaths.length;j++){
 if(i%shardTotal!==shardIndex)continue;
 const ids=[npPaths[i].id,npPaths[j].id],s=make(T.classes.find(p=>p.id===npPaths[i].classId),people,ids);s.profileMode='NO_PROFILE';s.noProfile={enabled:true,primaryPathId:ids[0],pathIds:ids.slice()};s.voies.mageRank2PathId='';s.equip={weaponIds:[],tinyFitted:true};if(ids.some(id=>id.includes('voie-du-bouclier')))s.equip.shieldId=T.shields.find(x=>Number(x.defBonus)===1)?.id;run('no-profile',fill(s),people);
 if(people.id.includes(':humain:')){const alt=copy(s);alt.voies.profilePathIds.reverse();alt.noProfile.pathIds=alt.voies.profilePathIds.slice();alt.noProfile.primaryPathId=alt.voies.profilePathIds[0];run('no-profile-reverse',fill(alt),people);}
}done('no-profile');done('no-profile-reverse');
const report={schema:'FOH_N1_SYSTEMATIC_MATRIX',version:1,shard:{index:shardIndex,total:shardTotal},phase:'N1_ONLY',overallCertified:false,smoke,startedAt,finishedAt:new Date().toISOString(),inputs:{indexSha256:hash(html),masterSha256:hash(master.html),engineSha256:hash(extract(html,'FOH_ENGINE_BUNDLE')),databaseSha256:hash(extract(html,'FOH_DB_JSON'))},scope:{profiles:classes.length,peoples:peoples.length,mainProfilePaths:npPaths.length,standard:'Every same-profile unordered pair, each people, ancestry choices and alternative mage R2',hybrid:'Every ordered distinct-profile pair, all 25 path crossings, each people; first required-choice option only',noProfile:'Every unordered distinct-path pair, each people; all reverse orders on humans; small shield equipped when the shield path requires it',stats:'One official standard distribution; same series redistributed for lutin/fée (FOR -1). Other distributions/point-buy in separate suites',withoutPaths:'Zero-path standard/no-profile states must be refused; no such supported creation mode found',replay:'Every 17th case; mutation immutability for every case',negative:'Every 31st accepted case: zero paths must be refused for a path-related reason',browserClicks:false,pdfValidation:false},results,coverage:Object.fromEntries(Object.entries(coverage).map(([k,v])=>[k,{count:v.size,values:[...v].sort()}])),assertionFailures:failures,rejectionGroups:[...rejections.values()],remaining:['Review every rejection group; rejection is not a passed legal creation','All persistent-choice alternatives, characteristic distributions, equipment and advanced rules combinations','Independent PDF-derived numeric expectations for every accessible capacity','UI/browser and official PDF lifecycle']};
fs.writeFileSync(path.join(OUT,smoke?'smoke.json':'matrix.json'),JSON.stringify(report,null,2)+'\n');console.log('FINISHED '+JSON.stringify(Object.fromEntries(Object.entries(results).map(([k,v])=>[k,v]))));if(failures.length)process.exitCode=1;if(process.argv.includes('--require-certified'))process.exitCode=2;
