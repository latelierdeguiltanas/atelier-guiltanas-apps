'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{load,standardState}=require('./forge_product_runner');
const ROOT=path.resolve(__dirname,'..'),copy=x=>JSON.parse(JSON.stringify(x)),h=x=>crypto.createHash('sha256').update(x).digest('hex');
const official={
 'humain':{bonus:['cha','con'],malus:[null],heritage:['voie-de-l-humain'],book:'COF2 Livre de base p.57 : +1 sur une des deux caractéristiques les plus faibles'},
 'demi-elfe':{bonus:['per','cha'],malus:['for','con'],heritage:['voie-de-l-humain','voie-de-l-elfe-haut','voie-de-l-elfe-sylvain'],book:'p.46 : +1 PER/CHA, -1 FOR/CON, héritage Humain/Elfe haut/Elfe sylvain'},
 'demi-orc':{bonus:['for','con'],malus:['cha','int'],heritage:['voie-du-demi-orc'],book:'p.48-49 : +1 FOR/CON, -1 CHA/INT'},
 'elfe-haut':{bonus:['int','cha'],malus:['for'],heritage:['voie-de-l-elfe-haut'],book:'p.50 : +1 INT/CHA, -1 FOR'},
 'elfe-sylvain':{bonus:['agi','per'],malus:['for'],heritage:['voie-de-l-elfe-sylvain'],book:'p.52 : +1 AGI/PER, -1 FOR'},
 'gnome':{bonus:['int','per'],malus:['for'],heritage:['voie-du-gnome'],book:'p.53 : +1 INT/PER, -1 FOR; Don étrange est une option distincte'},
 'halfelin':{bonus:['agi','vol'],malus:['for'],heritage:['voie-du-halfelin'],book:'p.55 : +1 AGI/VOL, -1 FOR'},
 'nain':{bonus:['con','vol'],malus:['agi'],heritage:['voie-du-nain'],book:'p.59 : +1 CON/VOL, -1 AGI'}
};
const report={schema:'FOH_N1_CO_F2_OFFICIAL_RACE_STAT_CHOICES',generatedAt:new Date().toISOString(),runnerSha:null,products:[],cases:0,passes:0,failures:[],unavailable:[],perPeople:{},bookEvidence:Object.fromEntries(Object.entries(official).map(([k,v])=>[k,v.book])),scope:'Tous les choix de caractéristiques raciales du livre de base : 8 peuples, 14 profils, héritages du demi-elfe, deux produits, valeurs permanentes, persistance et dérivés. Les capacités alternatives et conditions distinctes sont vérifiées dans leurs propres lots.'};
for(const file of ['index.html','FORGE_OF_HEROES_ATELIER_GUILTANAS_PRODUCT_MASTER.html']){
 const {db,engine:E,html}=load(path.join(ROOT,file)),T=db.tables;
 const classes=T.classes.filter(x=>x.id.endsWith(':cof2-lb-2024'));
 const races=T.peoples.filter(x=>x.id.endsWith(':cof2-lb-2024'));
 if(classes.length!==14||races.length!==8)throw Error('official count mismatch');
 report.products.push({file,engineSha256:h(html.match(/id="FOH_ENGINE_BUNDLE"[^>]*>([\s\S]*?)<\/script>/)[1]),dbSha256:h(html.match(/id="FOH_DB_JSON"[^>]*>([\s\S]*?)<\/script>/)[1])});
 function choices(s){
  const ids=new Set();
  for(const a of [...T.abilities_class,...T.abilities_people])if((s.voies.profilePathIds.includes(a.path_id)&&a.rank===1)||(a.path_id===s.voies.peoplePathId&&a.rank===1)||(s.voies.mageRank2PathId===a.path_id&&a.rank===2))ids.add(a.id);
  for(const id of [...ids])for(const c of E.getPersistentChoicesForAbility(s,id)){
   const bag=s.abilityChoices[id]||(s.abilityChoices[id]={});
   if(c.id==='preferredWeaponCategory'){s.profileChoices[c.id]='swords';bag[c.id]='swords';}
   else if(c.id==='extraLanguage'){s.profileChoices[c.id]='celestien';bag[c.id]='celestien';}
   else if(c.id==='forestChildAbility')bag[c.id]=T.abilities_class.find(a=>a.rank===1&&a.path_id.includes('voie-de-la-survie'))?.id;
   else if(bag[c.id]==null){if(c.type==='boolean')bag[c.id]=false;else if(c.type==='entity')bag[c.id]={type:'animal',species:'chat',name:'Test'};else if(c.type==='weapon_multi')bag[c.id]=(c.options||[]).slice(0,Math.max(1,c.min||1)).map(x=>x.id);else if(c.options?.length)bag[c.id]=c.options[0].id;}
  }return s;
 }
 function create(people,profile,opt,ids){
  const s=standardState(db,profile.id,ids[0],people.id);
  s.voies.profilePathIds=ids;
  s.voies.peoplePathId=T.paths_people.find(p=>p.id.split(':')[1]===opt.heritage)?.id;
  s.peupleChoices=people.id.includes(':humain:')?{humainStat:opt.bonus}:{bonusStat:opt.bonus,...(opt.malus?{malusStat:opt.malus}:{})};
  if(people.id.includes(':gnome:'))s.peupleChoices.grantedAbilityId=T.abilities_class.find(a=>a.rank===1&&!ids.includes(a.path_id)&&T.paths_class.some(x=>x.id===a.path_id&&x.classId.includes('ensorceleur')))?.id;
  if(profile.id.includes(':pretre:'))s.profileChoices.priestMode='generalist';
  if(profile.familleId==='mage')s.voies.mageRank2PathId=ids[0];
  return choices(s);
 }
 for(const people of races){const raceId=people.id.split(':')[1],spec=official[raceId];if(!spec)throw Error('Missing source '+raceId);
  const row=report.perPeople[raceId]||(report.perPeople[raceId]={cases:0,passed:0,failed:0,profileCases:{}});
  const opts=[];
  for(const bonus of spec.bonus)for(const malus of spec.malus)for(const heritage of spec.heritage)opts.push({bonus,malus,heritage});
  for(const profile of classes){const profileId=profile.id.split(':')[1],all=T.paths_class.filter(p=>p.classId===profile.id&&!p.additionalMagePath),combos=[];
   for(let a=0;a<all.length;a++)for(let b=a+1;b<all.length;b++)combos.push([all[a].id,all[b].id]);
   for(const opt of opts){report.cases++;row.cases++;const tag=[file,raceId,profileId,opt.bonus,opt.malus||'none',opt.heritage].join('|');
    let chosen=null,equipmentOverride=false;
    for(const ids of combos){const s=create(people,profile,opt,ids);if(!E.computeCharacterN1(s).errors.length){chosen=ids;break;}}
    if(!chosen&&raceId==='halfelin')for(const ids of combos){const s=create(people,profile,opt,ids);s.equip={...s.equip,armorId:'',shieldId:'',weaponIds:['weapon:dagger'],gmApprovedSwap:true};if(!E.computeCharacterN1(s).errors.length){chosen=ids;equipmentOverride=true;break;}}
    if(!chosen){row.failed++;report.unavailable.push({tag,reason:'no legal configuration found with tested packages'});continue;}
    const s=create(people,profile,opt,chosen);if(equipmentOverride)s.equip={...s.equip,armorId:'',shieldId:'',weaponIds:['weapon:dagger'],gmApprovedSwap:true};
    try{
     const raw=JSON.stringify(s),c=E.computeCharacterN1(s);
     if(c.errors.length)throw Error('errors: '+c.errors.join('; '));
     if(JSON.stringify(s)!==raw)throw Error('input mutation');
     const expect={...s.baseCaracs};expect[opt.bonus]++;if(opt.malus)expect[opt.malus]--;
     if(JSON.stringify(copy(c.sticky.caracs))!==JSON.stringify(expect))throw Error('book racial stat mismatch');
     const saved=E.createHeroSavePayload(s,c.sticky.characterState,{id:'race-source'});
     const restored=E.computeCharacterN1(E.restoreHeroSavePayload(copy(saved)).draft);
     if(restored.errors.length)throw Error('save reload error: '+restored.errors.join('; '));
     if(JSON.stringify(copy(restored.sticky.caracs))!==JSON.stringify(expect))throw Error('persisted stat mismatch');
     if(JSON.stringify(copy(restored.sticky.characterState.derived))!==JSON.stringify(copy(c.sticky.characterState.derived)))throw Error('derived stat mismatch after reload');
     if(!c.sticky.acquiredAbilities.some(x=>x.pathId===s.voies.peoplePathId&&x.rank===1))throw Error('incorrect heritage R1');
     row.passed++;report.passes++;row.profileCases[profileId]=(row.profileCases[profileId]||0)+1;
    }catch(e){row.failed++;if(report.failures.length<150)report.failures.push({tag,error:String(e)});}
   }
  }
 }
}
report.expected=Object.values(official).reduce((n,x)=>n+x.bonus.length*x.malus.length*x.heritage.length,0)*14*2;
report.status=report.cases===report.expected&&report.passes===report.expected&&report.failures.length===0&&report.unavailable.length===0?'PASS':'FAIL';
fs.writeFileSync(path.join(ROOT,'QA/N1/official-racial-options.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,expected:report.expected,attempts:report.cases,passed:report.passes,byPeople:Object.fromEntries(Object.entries(report.perPeople).map(([k,v])=>[k,{passed:v.passed,total:v.cases,failed:v.failed}])),failures:report.failures.slice(0,5),unavailable:report.unavailable.slice(0,5)}));
if(report.status!=='PASS')process.exitCode=1;