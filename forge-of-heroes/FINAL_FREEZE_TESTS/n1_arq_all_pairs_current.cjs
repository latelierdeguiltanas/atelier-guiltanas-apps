'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const {load,standardState}=require('./forge_product_runner'),ROOT=path.resolve(__dirname,'..'),CL='class:arquebusier:cof2-lb-2024';
const races=['humain','nain','demi-elfe','demi-orc','elfe-haut','elfe-sylvain','gnome','halfelin'],ageCases=[['young',null],['very-young','PC'],['very-young','DR'],['mature',null],['venerable',null]];
const options={'humain':{humainStat:'cha'},'nain':{bonusStat:'con',malusStat:'agi'},'demi-elfe':{bonusStat:'per',malusStat:'for'},'demi-orc':{bonusStat:'for',malusStat:'cha'},'elfe-haut':{bonusStat:'int',malusStat:'for'},'elfe-sylvain':{bonusStat:'agi',malusStat:'for'},'gnome':{bonusStat:'int',malusStat:'for'},'halfelin':{bonusStat:'agi',malusStat:'for'}};
const heritage={'humain':'voie-de-l-humain','nain':'voie-du-nain','demi-elfe':'voie-de-l-humain','demi-orc':'voie-du-demi-orc','elfe-haut':'voie-de-l-elfe-haut','elfe-sylvain':'voie-de-l-elfe-sylvain','gnome':'voie-du-gnome','halfelin':'voie-du-halfelin'};
const report={schema:'FOH_N1_ARQUEBUSIER_ALL_TEN_PATH_PAIRS_CURRENT',generatedAt:new Date().toISOString(),rules:'COF2 base pages 62–65 et âges avancés',cases:0,pass:0,failed:0,errors:[],perPeople:{},inputs:[],expected:8*10*5*2};
for(const file of ['index.html']){
 const {db,html,engine:E}=load(path.join(ROOT,file));const T=db.tables,paths=T.paths_class.filter(p=>p.classId===CL&&!p.additionalMagePath);
 if(paths.length!==5)throw Error('Expected exactly five official paths');
 const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
 const embedded=id=>{const i=html.indexOf('id="'+id+'"');if(i<0)return null;const start=html.indexOf('>',i)+1,end=html.indexOf('</script>',start);return start>i&&end>start?html.slice(start,end):null};
 const engine=embedded('FOH_ENGINE_BUNDLE'),rules=embedded('FOH_DB_JSON');if(!engine||!rules)throw Error('Missing source');
 report.inputs.push({file,sha256:hash(html),engineSha256:hash(engine),dbSha256:hash(rules)});
 for(const race of races)for(let i=0;i<paths.length;i++)for(let j=i+1;j<paths.length;j++)for(const [age,choice]of ageCases){
  const first=paths[i].id,second=paths[j].id,raceId='people:'+race+':cof2-lb-2024',id=[file,race,i,j,age,choice||''].join('|');
  const per=report.perPeople[race]||(report.perPeople[race]={cases:0,pass:0,failed:0});report.cases++;per.cases++;
  try{
   const s=standardState(db,CL,first,raceId);s.voies.profilePathIds=[first,second];s.peupleChoices={...options[race]};
   s.voies.peoplePathId=T.paths_people.find(p=>p.id.split(':')[1]===heritage[race])?.id;
   if(!s.voies.peoplePathId)throw Error('Missing people path');
   if(race==='gnome')s.peupleChoices.grantedAbilityId=T.abilities_class.find(a=>a.rank===1&&a.path_id.includes('voie-de-l-air')&&a.path_id.includes('ensorceleur'))?.id;
   s.advancedRules.age=true;
   s.age={categoryId:age,choice,spending:age==='mature'?[{pathId:first,rank:2},{pathId:second,rank:2}]:age==='venerable'?[{pathId:first,rank:2},{pathId:first,rank:3},{pathId:second,rank:2}]:[]};
   for(let pass=0;pass<4;pass++)for(const a of E.previewAcquiredAbilities(s))for(const c of E.getPersistentChoicesForAbility(s,a.id)){
    const b=s.abilityChoices[a.id]||(s.abilityChoices[a.id]={});
    if(c.id==='preferredWeaponCategory'){b[c.id]='swords';s.profileChoices[c.id]='swords';}
    else if(c.id==='repeatingWeapons')b[c.id]=['weapon:powder-pistol'];
    else if(c.type==='boolean')b[c.id]??=false;
    else if(c.type==='entity')b[c.id]??={type:'animal',species:'chat',name:'QA'};
    else if(c.type==='weapon_multi')b[c.id]??=(c.options||[]).slice(0,Math.max(1,c.min||1)).map(x=>x.id);
    else if(c.options?.length)b[c.id]??=c.options[0].id;
   }
   const result=E.computeCharacterN1(s);
   if(result.errors.length)throw Error(result.errors.join(' / '));
   const character=result.sticky.characterState,owned=character.paths.filter(p=>p.pathId===first||p.pathId===second);
   if(owned.length!==2)throw Error('Missing selected paths');
   const target=age==='venerable'?3:age==='mature'?2:1;
   if(owned.find(p=>p.pathId===first)?.rank!==target)throw Error('Age rank wrong '+target);
   const expectedSecond=age==='mature'||age==='venerable'?2:1;
   if(owned.find(p=>p.pathId===second)?.rank!==expectedSecond)throw Error('Second path rank wrong '+expectedSecond);
   if(result.sticky.acquiredAbilities.filter(a=>a.pathId===first).length<target)throw Error('Missing ranks first path');
   const saved=E.createHeroSavePayload(s,character,{id:'arq-'+race+'-'+i+'-'+j}),restored=E.restoreHeroSavePayload(JSON.parse(JSON.stringify(saved))),back=E.computeCharacterN1(restored.draft);
   if(back.errors.length)throw Error('Save restore refused: '+back.errors.join(' / '));
   if(JSON.stringify(back.sticky.characterState.derived)!==JSON.stringify(character.derived))throw Error('Derived values differ after save');
   report.pass++;per.pass++;
  }catch(e){report.failed++;per.failed++;if(report.errors.length<60)report.errors.push({id,error:String(e)});}
 }
}
report.status=report.failed===0&&report.pass===report.expected?'PASS':'FAIL';
fs.writeFileSync(path.join(ROOT,'QA/N1/arquebusier-all-pairs-current.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,pass:report.pass,total:report.cases,perPeople:report.perPeople,firstErrors:report.errors.slice(0,10)}));
if(report.status!=='PASS')process.exitCode=1;
