'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const {load,standardState}=require('./forge_product_runner');
const ROOT=path.resolve(__dirname,'..'),PROFILE='class:arquebusier:cof2-lb-2024';
const races=['humain','nain','demi-elfe','demi-orc','elfe-haut','elfe-sylvain','gnome','halfelin'];
const bonuses={humain:{humainStat:'cha'},nain:{bonusStat:'con',malusStat:'agi'},'demi-elfe':{bonusStat:'per',malusStat:'for'},'demi-orc':{bonusStat:'for',malusStat:'cha'},'elfe-haut':{bonusStat:'int',malusStat:'for'},'elfe-sylvain':{bonusStat:'agi',malusStat:'for'},gnome:{bonusStat:'int',malusStat:'for'},halfelin:{bonusStat:'agi',malusStat:'for'}};
const heritage={humain:'voie-de-l-humain',nain:'voie-du-nain','demi-elfe':'voie-de-l-humain','demi-orc':'voie-du-demi-orc','elfe-haut':'voie-de-l-elfe-haut','elfe-sylvain':'voie-de-l-elfe-sylvain',gnome:'voie-du-gnome',halfelin:'voie-du-halfelin'};
const result={schema:'FOH_N1_ARQUEBUSIER_HISTORIES_ALL_PEOPLES',at:new Date().toISOString(),scope:'Arquebusier pur, 8 peuples, toutes les paires histoire géographique + professionnelle, 2 versions, âge vénérable et 4 rangs investis dans une voie d’historique; tests de calcul, acquisition, sauvegarde/reprise et choix persistants; autres modes reportés.',counts:{cases:0,passed:0,legallyRejected:0,failed:0},inputs:[],perPeople:{},histories:{},failures:[],source:'Règles avancées COF2 p.153, voies d’historique pp.170–180'};
for(const file of ['index.html']){
 const {db,engine:E,html}=load(path.join(ROOT,file)),T=db.tables;
 result.inputs.push({file,sha256:crypto.createHash('sha256').update(html).digest('hex')});
 const geo=T.history_paths.filter(p=>p.category==='geographic'),job=T.history_paths.filter(p=>p.category==='professional');
 const paths=T.paths_class.filter(p=>p.classId===PROFILE&&!p.additionalMagePath);
 if(geo.length<2||job.length<2||paths.length!==5)throw Error('Catalogue des historiques ou voies incomplet');
 for(const race of races)for(const geographic of geo)for(const professional of job)for(const chosen of [geographic,professional]){
  const tag=[file,race,geographic.id,professional.id,chosen.id].join('|'),per=result.perPeople[race]||(result.perPeople[race]={cases:0,passed:0,failed:0});
  per.cases++;result.counts.cases++;
  const hs=result.histories[chosen.id]||(result.histories[chosen.id]={cases:0,passed:0,failed:0});hs.cases++;
  try{
   const s=standardState(db,PROFILE,paths[0].id,'people:'+race+':cof2-lb-2024');
   s.voies.profilePathIds=[paths[0].id];
   s.peupleChoices={...bonuses[race]};
   s.voies.peoplePathId=T.paths_people.find(p=>p.id.split(':')[1]===heritage[race])?.id;
   if(race==='gnome')s.peupleChoices.grantedAbilityId=T.abilities_class.find(a=>a.rank===1&&a.path_id.includes('voie-de-l-air')&&a.path_id.includes('ensorceleur'))?.id;
   s.advancedRules.age=true;s.advancedRules.histories=true;
   s.history={geographicPathId:geographic.id,professionalPathId:professional.id};
   s.age={categoryId:'venerable',spending:[2,3,4,5].map(rank=>({pathId:chosen.id,rank}))};
   for(let n=0;n<4;n++)for(const ability of E.previewAcquiredAbilities(s))for(const c of E.getPersistentChoicesForAbility(s,ability.id)){
    const bag=s.abilityChoices[ability.id]||(s.abilityChoices[ability.id]={});
    if(c.id==='expertStat')bag[c.id]='for';
    else if(c.id==='preferredWeaponCategory'){bag[c.id]='swords';s.profileChoices[c.id]='swords'}
    else if(c.type==='boolean')bag[c.id]??=false;
    else if(c.type==='enum_multi')bag[c.id]??=(c.id==='scholarLanguages'?c.options.filter(o=>o.id!=='argotien').slice(0,c.max):c.options.slice(0,c.min||1)).map(o=>o.id);
    else if(c.type==='entity')bag[c.id]??={type:'animal',species:'chat',name:'Historique QA'};
    else if(c.type==='weapon_multi')bag[c.id]??=(c.options||[]).slice(0,Math.max(1,c.min||1)).map(o=>o.id);
    else if(c.options?.length)bag[c.id]??=c.options[0].id;
   }
   const computed=E.computeCharacterN1(s);
   if(race==='elfe-sylvain'&&['history:campaigns','history:cities'].includes(geographic.id)){
    const official='Elfe sylvain : les origines Cités et Campagnes sont interdites avec les historiques (COF2 p.172).';
    if(computed.errors.length!==1||computed.errors[0]!==official)throw Error('Interdiction officielle absente ou erronée : '+computed.errors.join(' ; '));
    result.counts.legallyRejected++;continue;
   }
   if(computed.errors.length)throw Error(computed.errors.join(' ; '));
   const character=computed.sticky.characterState;
   const obtained=computed.sticky.acquiredAbilities.filter(a=>a.pathId===chosen.id).map(a=>a.rank).sort();
   if(JSON.stringify(obtained)!==JSON.stringify([1,2,3,4,5]))throw Error('Historique incomplet '+JSON.stringify(obtained));
   const opposite=chosen.id===geographic.id?professional.id:geographic.id;
   const initial=computed.sticky.acquiredAbilities.filter(a=>a.pathId===opposite).map(a=>a.rank);
   if(JSON.stringify(initial)!==JSON.stringify([1]))throw Error('Historique secondaire incorrect '+JSON.stringify(initial));
   if(character.capacityBudget?.age?.spent!==4)throw Error('Âge : quatre dépenses manquantes');
   const saved=E.createHeroSavePayload(s,character,{id:'arq-hist-'+race});
   const rerun=E.computeCharacterN1(E.restoreHeroSavePayload(JSON.parse(JSON.stringify(saved))).draft);
   if(rerun.errors.length)throw Error('Relecture échouée : '+rerun.errors.join(';'));
   if(JSON.stringify(rerun.sticky.characterState.derived)!==JSON.stringify(character.derived))throw Error('Valeurs perdues après sauvegarde');
   per.passed++;hs.passed++;result.counts.passed++;
  }catch(e){per.failed++;hs.failed++;result.counts.failed++;if(result.failures.length<70)result.failures.push({tag,error:String(e)})}
 }
}
result.status=result.counts.failed===0&&result.counts.passed+result.counts.legallyRejected===result.counts.cases?'PASS':'FAIL';
fs.writeFileSync(path.join(ROOT,'QA/N1/arquebusier-history-people-cross.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({status:result.status,counts:result.counts,people:result.perPeople,historyCount:Object.keys(result.histories).length,failures:result.failures.slice(0,9)}));
if(result.status!=='PASS')process.exitCode=1;
