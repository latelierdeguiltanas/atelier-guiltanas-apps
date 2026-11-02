'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {load,standardState}=require('./forge_product_runner');
const ROOT=path.resolve(__dirname,'..'),OUT=path.join(ROOT,'QA/N1/native-item-shards');
const full=load(path.join(ROOT,'index.html')),{db,engine:E,html}=full,T=db.tables;
const classes=T.classes.filter(p=>p.id.includes(':cof2-lb-2024'));
const peoples=T.peoples.filter(p=>p.id.includes(':cof2-lb-2024'));
const paths=T.paths_class.filter(p=>!p.additionalMagePath&&classes.some(c=>c.id===p.classId));
const shard=Number(process.argv.find(x=>x.startsWith('--race='))?.slice(7)??0),people=peoples[shard];
if(!people||classes.length!==14||peoples.length!==8||paths.length!==70)throw Error('COF2 official scope mismatch: '+[classes.length,peoples.length,paths.length]);
const h=s=>crypto.createHash('sha256').update(s).digest('hex'),cp=x=>JSON.parse(JSON.stringify(x));
const byClass=id=>paths.filter(p=>p.classId===id);
const report={schema:'FOH_N1_OFFICIAL_ITEM_SHARD',generatedAt:new Date().toISOString(),raceId:people.id,counts:{},profiles:{},refusals:{},assertions:[],coverage:{},sourceCommit:process.env.GITHUB_SHA||null,indexSha256:h(html),scope:'All official 14 profiles, one official people, standard 10 pairs, all oriented hybrid 25 crosses among distinct profiles, no-profile every pair among 70 official paths. First permissible alternative of persistent choices; one standard characteristic series. Refusals recorded separately, never counted as passing creations.'};
const modes=['standard','hybrid','no-profile'];
for(const mode of modes)report.counts[mode]={attempted:0,accepted:0,refused:0,failed:0,replays:0};
const fill=s=>{const owned=new Set();for(const a of [...T.abilities_class,...T.abilities_people,...(T.abilities_r1_people||[])])if((s.voies.profilePathIds.includes(a.path_id)&&a.rank===1)||(a.path_id===s.voies.mageRank2PathId&&a.rank===2)||(a.path_id===s.voies.peoplePathId&&a.rank===1))owned.add(a.id);
 const queue=[...owned],seen=new Set;
 while(queue.length){const id=queue.shift();if(seen.has(id))continue;seen.add(id);for(const c of E.getPersistentChoicesForAbility(s,id)){const bag=s.abilityChoices[id]||(s.abilityChoices[id]={});if(c.id==='preferredWeaponCategory'){s.profileChoices[c.id]||='swords';bag[c.id]??=s.profileChoices[c.id];}
 else if(c.id==='extraLanguage'){s.profileChoices[c.id]||='celestien';bag[c.id]??=s.profileChoices[c.id];}
 else if(bag[c.id]==null){if(c.type==='boolean')bag[c.id]=false;else if(c.type==='entity')bag[c.id]={type:'animal',species:'chat',name:'Témoin'};else if(c.type==='weapon_multi')bag[c.id]=(c.options||[]).slice(0,Math.max(1,c.min||1)).map(x=>x.id);else if(c.options?.length)bag[c.id]=(c.type==='ability_choice'?c.options.find(x=>!owned.has(x.id)):c.options[0])?.id;}
 if(c.type==='ability_choice'&&bag[c.id]){owned.add(bag[c.id]);queue.push(bag[c.id]);}
 }}return s;};
function make(p,ids){const s=standardState(db,p.id,ids[0],people.id);s.voies.profilePathIds=ids.slice();s.voies.peoplePathId=(T.paths_people.find(x=>x.people_id===people.id||x.allowedPeopleIds?.includes(people.id))||T.paths_people.find(x=>people.id.includes(':demi-elfe:')&&x.people_id==='people:humain:cof2-lb-2024'))?.id||'';
 if(people.id.includes(':humain:'))s.peupleChoices={humainStat:'cha'};
 else {s.peupleChoices={};for(const [k,f] of [['bonus','bonusStat'],['malus','malusStat']])if(people.schema?.[k]?.mode==='choice')s.peupleChoices[f]=people.schema[k].options[0];}
 if(people.id.includes(':gnome:'))s.peupleChoices.grantedAbilityId=T.abilities_class.find(a=>a.rank===1&&!ids.includes(a.path_id)&&T.paths_class.some(x=>x.id===a.path_id&&x.classId.includes(':ensorceleur:')))?.id;
 if(p.id.includes(':pretre:'))s.profileChoices.priestMode='generalist';
 if(p.familleId==='mage')s.voies.mageRank2PathId=ids[0];
 return fill(s);}
function expectedCaracs(s){const c={...s.baseCaracs},schema=people.schema;if(schema?.key==='humain_weakest_plus1')c[s.peupleChoices.humainStat]++;else for(const [k,f] of [['bonus','bonusStat'],['malus','malusStat']]){const rule=schema?.[k];if(!rule)continue;const id=rule.mode==='choice'?s.peupleChoices[f]:rule.stat||rule.options?.[0];if(id)c[id]+=rule.value;}return c;}
let serial=0;
function check(mode,s,profileId,secondaryId){const row=report.counts[mode];row.attempted++;serial++;const prior=JSON.stringify(s),res=E.computeCharacterN1(s);if(JSON.stringify(s)!==prior)return fail('state mutated');
 if(res.errors.length){row.refused++;const reason=[...res.errors].sort().join(' | ');report.refusals[mode+'|'+reason]=(report.refusals[mode+'|'+reason]||0)+1;return;}
 row.accepted++;const item=report.profiles[profileId]||(report.profiles[profileId]={standard:0,hybridPrimary:0,hybridSecondary:0,noProfilePathPairs:0,rejected:0,failures:0});
 if(mode==='standard')item.standard++;if(mode==='hybrid'){item.hybridPrimary++;const other=report.profiles[secondaryId]||(report.profiles[secondaryId]={standard:0,hybridPrimary:0,hybridSecondary:0,noProfilePathPairs:0,rejected:0,failures:0});other.hybridSecondary++;}
 try{const c=res.sticky.characterState;if(!c||c.level!==1)throw Error('level');
  if(JSON.stringify(cp(c.characteristics))!==JSON.stringify(expectedCaracs(s)))throw Error('ancestry characteristics');
  if(new Set(c.abilities.map(a=>a.id)).size!==c.abilities.length)throw Error('duplicate abilities');
  for(const id of s.voies.profilePathIds)if(!c.abilities.some(a=>a.pathId===id&&a.rank===1))throw Error('missing '+id);
  for(const k of ['PV','PC','PM','DEF','INIT','ATC','ATD','ATM'])if(!Number.isFinite(c.derived[k]))throw Error('nonfinite '+k);
  if(c.derived.PV<=0||c.derived.PM<0||c.derived.PC<0)throw Error('illegal derived');
  if(serial%53===0){const saved=E.createHeroSavePayload(s,c,{id:'qa-native-'+serial});const back=E.restoreHeroSavePayload(cp(saved));const again=E.computeCharacterN1(back.draft);if(again.errors.length)throw Error('reload rejected');if(JSON.stringify(cp(again.sticky.characterState.derived))!==JSON.stringify(cp(c.derived)))throw Error('reload derived mismatch');row.replays++;}
 }catch(e){fail(e.message);}
 function fail(msg){row.failed++;if(report.assertions.length<150)report.assertions.push({mode,people:people.id,profileId,secondaryId,paths:s.voies.profilePathIds,reason:msg});item.failures++;}
}
for(const p of classes)for(const a of byClass(p.id))for(const b of byClass(p.id)){if(a.id>=b.id)continue;check('standard',make(p,[a.id,b.id]),p.id);}
for(const primary of classes)for(const secondary of classes){if(primary.id===secondary.id)continue;for(const a of byClass(primary.id))for(const b of byClass(secondary.id)){const s=make(primary,[a.id,b.id]);s.hybrid={enabled:true,gmApproved:true,primaryProfileId:primary.id,secondaryProfileId:secondary.id,primaryPathId:a.id,secondaryPathId:b.id};check('hybrid',s,primary.id,secondary.id);}}
for(let i=0;i<paths.length;i++)for(let j=i+1;j<paths.length;j++){const a=paths[i],b=paths[j],p=classes.find(c=>c.id===a.classId),s=make(p,[a.id,b.id]);s.profileMode='NO_PROFILE';s.noProfile={enabled:true,primaryPathId:a.id,pathIds:[a.id,b.id]};s.voies.mageRank2PathId='';s.equip={weaponIds:[],tinyFitted:true};if([a,b].some(x=>x.id.includes('voie-du-bouclier')))s.equip.shieldId=T.shields.find(x=>Number(x.defBonus)===1)?.id;check('no-profile',s,p.id);}
report.officialScope={classes:classes.map(p=>p.id),people:people.id,paths:paths.length};
report.finishedAt=new Date().toISOString();fs.mkdirSync(OUT,{recursive:true});fs.writeFileSync(path.join(OUT,'race-'+shard+'.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({people:people.id,counts:report.counts,assertions:report.assertions.length,refusalGroups:Object.keys(report.refusals).length}));
if(report.assertions.length)process.exitCode=1;