'use strict';
/* Audits all five Arquebusier paths at ranks legitimately available at N1 through age. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {load,standardState}=require('./forge_product_runner');
const ROOT=path.resolve(__dirname,'..'), copy=x=>JSON.parse(JSON.stringify(x));
const profile='class:arquebusier:cof2-lb-2024', races=['humain','nain','demi-elfe','demi-orc','elfe-haut','elfe-sylvain','gnome','halfelin'];
const source={book:'COF2 Livre de base imprimé pp.62–65; Règles avancées p.153 (catégories d’âge)',familyHpPerLevel:4,baseHpN1:8,ageEffects:{'very-young':{agi:0,con:0,init:-1},young:{agi:0,con:0,init:0},mature:{agi:-1,con:0,init:0},venerable:{agi:-1,con:-1,init:0}},ranks:{young:1,'very-young':1,mature:2,venerable:3}};
const reports={schema:'FOH_N1_ARQUEBUSIER_PURE_AGE_RANK',timestamp:new Date().toISOString(),scope:'14? No: only Arquebusier pure × 8 official peoples × five different first paths × all ages (very young PC/DR, young, mature, venerable), both product engines. Validates racial and age characteristics against book rules, permanent PV/DEF/INIT under equip, existence of each accessible rank, local save/reopen. Contextual spells/attacks, historical choices, Arbalétrier alternative and PDF are NOT validated.',source,sourceCommit:process.env.GITHUB_SHA||null,expected:8*5*5*2,cases:0,pass:0,refused:0,failed:0,failures:[],perRace:{},perPath:{},products:[],samples:[],skillEffectAssertions:{mecanismes:0,grenailleArtificier:0,pilierDeBar:0},r1RuleProjectionAssertions:{mecanismesSiege:0,grenailleCone:0,pilierNonLethal:0,pistoleroLoaded:0,precisionCover:0},numericEffectAssertions:{'Arme à répétition — chargeur 2 + INT et +1 au rang 3':0,'Poudre puissante — portée +10 m, dommages +1 et projectile magique':0,'Tir précis — critique sur 19-20 à distance':0,'Combattant aguerri — défense +1':0}};
const raceRules={
 humain:{bonus:'cha',malus:null,humain:true,path:'voie-de-l-humain'},
 nain:{bonus:'con',malus:'agi',path:'voie-du-nain'},
 'demi-elfe':{bonus:'per',malus:'for',path:'voie-de-l-humain'},
 'demi-orc':{bonus:'for',malus:'cha',path:'voie-du-demi-orc'},
 'elfe-haut':{bonus:'int',malus:'for',path:'voie-de-l-elfe-haut'},
 'elfe-sylvain':{bonus:'agi',malus:'for',path:'voie-de-l-elfe-sylvain'},
 gnome:{bonus:'int',malus:'for',path:'voie-du-gnome'},
 halfelin:{bonus:'agi',malus:'for',path:'voie-du-halfelin'}
};
const sourceIndex={
 'voie-de-l-artilleur':62,'voie-des-explosifs':63,'voie-du-mercenaire':64,'voie-du-pistolero':65,'voie-de-la-precision':65
};
const cases=[['young',null],['very-young','PC'],['very-young','DR'],['mature',null],['venerable',null]];
for(const file of ['index.html','FORGE_OF_HEROES_ATELIER_GUILTANAS_PRODUCT_MASTER.html']){
 const {db,engine:E,html}=load(path.join(ROOT,file)),T=db.tables,paths=T.paths_class.filter(p=>p.classId===profile&&!p.additionalMagePath);
 if(paths.length!==5)throw Error('Missing five paths');
 const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
 reports.products.push({file,htmlSha256:hash(html)});
 function fill(s){
  for(let round=0;round<4;round++)for(const a of E.previewAcquiredAbilities(s))for(const ch of E.getPersistentChoicesForAbility(s,a.id)){
    const b=s.abilityChoices[a.id]||(s.abilityChoices[a.id]={});
    if(ch.id==='preferredWeaponCategory'){b[ch.id]='swords';s.profileChoices[ch.id]='swords';}
    else if(ch.id==='extraLanguage'){b[ch.id]='celestien';s.profileChoices[ch.id]='celestien';}
    else if(ch.id==='forestChildAbility'){b[ch.id]=T.abilities_class.find(x=>x.rank===1&&x.path_id.includes('voie-de-la-survie'))?.id;}
    else if(b[ch.id]==null){if(ch.type==='boolean')b[ch.id]=false;else if(ch.type==='entity')b[ch.id]={type:'animal',species:'chat',name:'QA'};else if(ch.type==='weapon_multi')b[ch.id]=(ch.options||[]).slice(0,Math.max(1,ch.min||1)).map(x=>x.id);else if(ch.options?.length)b[ch.id]=ch.options[0].id;}
  }
  return s;
 }
 for(const race of races)for(let i=0;i<paths.length;i++)for(const [age,choice] of cases){
  const first=paths[i],second=paths[(i+1)%paths.length],tag=[file,race,first.id.split(':')[1],age,choice||''].join('|');reports.cases++;
  const pr=reports.perRace[race]||(reports.perRace[race]={cases:0,pass:0,refused:0,failed:0}),pp=reports.perPath[first.id]||(reports.perPath[first.id]={name:first.label||first.id,printedPage:sourceIndex[first.id.split(':')[1]],cases:0,pass:0,refused:0,failed:0});
  pr.cases++;pp.cases++;
  const r=raceRules[race],s=standardState(db,profile,first.id,'people:'+race+':cof2-lb-2024');
  s.voies.profilePathIds=[first.id,second.id];s.peupleChoices=r.humain?{humainStat:r.bonus}:{bonusStat:r.bonus,malusStat:r.malus};
  s.voies.peoplePathId=T.paths_people.find(x=>x.id.split(':')[1]===r.path)?.id;
  if(!s.voies.peoplePathId)throw Error('Missing race path '+race);
  if(race==='gnome')s.peupleChoices.grantedAbilityId=T.abilities_class.find(a=>a.rank===1&&!s.voies.profilePathIds.includes(a.path_id)&&T.paths_class.some(p=>p.id===a.path_id&&p.classId.includes(':ensorceleur:')))?.id;
  s.advancedRules.age=true;
  const spending=age==='mature'?[{pathId:first.id,rank:2},{pathId:second.id,rank:2}]:age==='venerable'?[{pathId:first.id,rank:2},{pathId:first.id,rank:3},{pathId:second.id,rank:2}]:[];
  s.age={categoryId:age,choice,spending};fill(s);
  const before=JSON.stringify(s),result=E.computeCharacterN1(s);
  if(result.errors.length){reports.refused++;pr.refused++;pp.refused++;if(reports.failures.length<80)reports.failures.push({tag,type:'REFUSED',reason:result.errors.join(' | ')});continue;}
  try{
   if(JSON.stringify(s)!==before)throw Error('Input mutated');
   const actual=copy(result.sticky.caracs),expected={...s.baseCaracs},a=source.ageEffects[age];expected[r.bonus]++;if(r.malus)expected[r.malus]--;expected.agi+=a.agi;expected.con+=a.con;
   if(JSON.stringify(expected)!==JSON.stringify(actual))throw Error('Incorrect ancestry+age stats expected '+JSON.stringify(expected)+' actual '+JSON.stringify(actual));
   const sticky=result.sticky;
   if(race==='humain'&&(age==='young'||age==='mature'||age==='venerable')){
    const A=T.abilities_class.filter(a=>a.path_id===first.id&&a.rank<=source.ranks[age]);
    reports.samples.push({file,race,path:first.id,age,rank:source.ranks[age],snapshot:{PV:sticky.PV,DEF:sticky.DEF,INIT:sticky.INIT,caracs:copy(sticky.caracs),attacks:copy(sticky.attacks||[]),skills:copy(sticky.skills||[]),equip:copy(sticky.equip||{}),effects:copy(sticky.effects||[]),characterStateAbilities:copy(sticky.characterState?.abilities||[])},ranks:A.map(a=>({id:a.id,label:a.label,rank:a.rank,mechanics:a.mechanics,calculationRules:a.calculationRules,certification:a.certification}))});
   }
   if(sticky.PV!==source.baseHpN1+expected.con)throw Error('PV baseline differs from book ('+sticky.PV+' vs '+(source.baseHpN1+expected.con)+')');
   // Depending on a loaded firearm, Plus vite que son ombre grants a shot initiative,
   // not a passive character-wide INIT; compare only when not using that path.
   const strangeGift=s.peupleChoices.grantedAbilityId||'';const airGift= race==='gnome'&&(strangeGift.includes('ensorceleur-air-murmures-dans-le-vent')||strangeGift.includes('ensorceleur-divination-'))?1:0;
   if(first.id.split(':')[1]!=='voie-du-pistolero'&&second.id.split(':')[1]!=='voie-du-pistolero'&&sticky.INIT!==10+expected.per+a.init+airGift)throw Error('INIT mismatch: race '+race+' gift '+strangeGift+' expected '+(10+expected.per+a.init+airGift)+' actual '+sticky.INIT);
   const rank=source.ranks[age],entry=sticky.characterState.paths.find(p=>p.pathId===first.id);
   if(!entry||entry.rank!==rank)throw Error('Expected path rank '+rank+' got '+entry?.rank);
   for(let n=1;n<=rank;n++)if(!sticky.acquiredAbilities.some(x=>x.pathId===first.id&&x.rank===n))throw Error('Missing ability rank '+n);
   if(rank===3&&first.id.split(':')[1]==='voie-du-mercenaire'&&sticky.DEF<10+expected.agi+1)throw Error('Missing +1 DEF of Combattant aguerri at R3');
   if(airGift && sticky.DEF<10+expected.agi+1)throw Error('Don étrange du gnome doit donner +1 DEF, selon Murmures dans le vent (Livre de base p.93)');
   
   // Book source p.62–64: skills bonuses are path rank + 2 at R1, including matured and venerable rank increases.
   const skSpecs=[
    {slug:'voie-de-l-artilleur',ability:'mecanismes',tests:['repair_mechanism','understand_mechanism'],counter:'mecanismes'},
    {slug:'voie-des-explosifs',ability:'tir-de-grenaille-l',tests:['artificer'],counter:'grenailleArtificier'},
    {slug:'voie-du-mercenaire',ability:'pilier-de-bar',tests:['tavern_social','resist_alcohol'],counter:'pilierDeBar'}
   ];
   for(const info of skSpecs){
    const ownedPath=[first,second].find(p=>p.id.split(':')[1]===info.slug);
    const matches=(sticky.skillBonuses||[]).filter(x=>x.sourceAbilityId?.includes('ability:'+info.ability+':classpath:'+info.slug+':'));
    if(!ownedPath){if(matches.length)throw Error('Leaked +skill bonus for unchosen path '+info.slug);continue;}
    const rankForPath=ownedPath.id===first.id?source.ranks[age]:age==='young'||age==='very-young'?1:2;
    const want=rankForPath+2;
    if(matches.length!==1||matches[0].value!==want||JSON.stringify(matches[0].tests)!==JSON.stringify(info.tests)||matches[0].scope!=='self')throw Error('Wrong '+info.slug+' bonus: expected '+want+' '+JSON.stringify(info.tests)+' got '+JSON.stringify(matches));
    reports.skillEffectAssertions[info.counter]++;
   }

   
   const projectedPaths=new Set([first.id.split(':')[1],second.id.split(':')[1]]);
   const hasPermanent=(slug,effect)=>sticky.permanentEffects?.some(z=>z.sourceAbilityId?.includes('classpath:'+slug+':class-arquebusier:')&&effect(z.mechanicalEffect));
   const hasConditional=(slug,effect)=>sticky.conditionalEffects?.some(z=>z.sourceAbilityId?.includes('classpath:'+slug+':class-arquebusier:')&&effect(z));
   const presence=[
    ['voie-de-l-artilleur',hasPermanent('voie-de-l-artilleur',e=>e?.type==='bonus_die'&&e.target==='siege_weapon_attacks'),'mecanismesSiege'],
    ['voie-des-explosifs',hasConditional('voie-des-explosifs',x=>x.condition?.loadedPowderWeapon===true&&x.condition?.specialAmmunition==='grapeshot'&&x.trigger==='L'&&x.mechanics?.area?.shape==='cone'&&x.mechanics.area.lengthMeters===10&&x.mechanics.area.widthMeters===5&&x.mechanicalEffect?.some(e=>e.type==='multi_target_weapon_attack'&&e.damageMultiplier===0.5)),'grenailleCone'],
    ['voie-du-mercenaire',hasPermanent('voie-du-mercenaire',e=>e?.type==='weapon_damage_override'&&e.weaponId==='weapon:unarmed'&&e.formula==='1d4°'&&e.nonLethal===true)&&hasPermanent('voie-du-mercenaire',e=>e?.type==='conditional_damage_reduction'&&e.damageType==='non_lethal'&&e.divisor===2),'pilierNonLethal'],
    ['voie-du-pistolero',hasConditional('voie-du-pistolero',x=>x.condition==='loaded_powder_weapon_held'&&x.mechanicalEffect?.some(e=>e.type==='conditional_INIT_bonus'&&e.value===5)&&x.mechanicalEffect?.some(e=>e.type==='remove_contact_ranged_malus'&&e.except?.includes('couleuvrine'))),'pistoleroLoaded'],
    ['voie-de-la-precision',hasPermanent('voie-de-la-precision',e=>e?.type==='cover_penalty_override'&&e.partial===0&&e.important===-2),'precisionCover']
   ];
   for(const [slug,present,counter]of presence){
    const wanted=projectedPaths.has(slug);
    if(present!==wanted)throw Error('Projection de rang 1 incorrecte '+slug+' : attendue '+wanted+' obtenue '+present);
    if(present)reports.r1RuleProjectionAssertions[counter]++;
   }

   const pathSlug=first.id.split(':')[1],weapon=sticky.attacks?.find(a=>a.weaponId==='weapon:powder-pistol');
   if(pathSlug==='voie-de-l-artilleur'&&(age==='mature'||age==='venerable')){
    const want=2+expected.int+(age==='venerable'?1:0);
    if(!weapon?.magazine||weapon.magazine.capacity!==want||weapon.magazine.current!==want)throw Error('Arme à répétition: chargeur attendu '+want+' obtenu '+JSON.stringify(weapon?.magazine));
    reports.numericEffectAssertions['Arme à répétition — chargeur 2 + INT et +1 au rang 3']++;
   }
   if(pathSlug==='voie-des-explosifs'&&age==='venerable'){
    if(!weapon||weapon.rangeMeters!==30||weapon.damage!=='1d10+1'||!weapon.tags?.includes('magical_projectile'))throw Error('Poudre puissante: +10m, +1DM et munitions magiques absents '+JSON.stringify(weapon));
    reports.numericEffectAssertions['Poudre puissante — portée +10 m, dommages +1 et projectile magique']++;
   }
   if(pathSlug==='voie-de-la-precision'&&age==='venerable'){
    const distance=sticky.attacks?.filter(a=>a.type==='distance')||[],melee=sticky.attacks?.filter(a=>a.type==='contact')||[];
    if(!distance.length||distance.some(a=>a.criticalThreshold!==19)||melee.some(a=>a.criticalThreshold!==20))throw Error('Tir précis: seuil 19-20 distance uniquement '+JSON.stringify(sticky.attacks));
    reports.numericEffectAssertions['Tir précis — critique sur 19-20 à distance']++;
   }
   if(pathSlug==='voie-du-mercenaire'&&age==='venerable'){
    const armor=T.armors.find(a=>a.id===s.equip.armorId),armorDEF=armor?.defBonus??armor?.def??0;
    const expectedDEF=10+Math.min(expected.agi,Number(armor?.agiCap??99))+armorDEF+airGift+1;
    if(sticky.DEF<expectedDEF)throw Error('Combattant aguerri: +1 DEF obligatoire, attendu au moins '+expectedDEF+' obtenu '+sticky.DEF);
    reports.numericEffectAssertions['Combattant aguerri — défense +1']++;
   }
   const saved=E.createHeroSavePayload(s,sticky.characterState,{id:'arq-'+race+'-'+i+'-'+age}),back=E.computeCharacterN1(E.restoreHeroSavePayload(copy(saved)).draft);
   if(back.errors.length)throw Error('Restored character cannot be created '+back.errors.join('; '));
   if(JSON.stringify(copy(back.sticky.characterState.derived))!==JSON.stringify(copy(sticky.characterState.derived)))throw Error('Derived stats changed after saving');
   reports.pass++;pr.pass++;pp.pass++;
  }catch(e){reports.failed++;pr.failed++;pp.failed++;if(reports.failures.length<80)reports.failures.push({tag,type:'ASSERTION',reason:String(e)});}
 }
}
reports.complete=reports.cases===reports.expected&&reports.pass===reports.expected&&reports.failed===0&&reports.refused===0;
const dst=path.join(ROOT,'QA/N1/arquebusier-pure-age-ranks.json');fs.writeFileSync(dst,JSON.stringify(reports,null,2)+'\n');
console.log(JSON.stringify({complete:reports.complete,attempted:reports.cases,passed:reports.pass,failed:reports.failed,refused:reports.refused,perRace:reports.perRace,failures:reports.failures.slice(0,12)}));
if(!reports.complete)process.exitCode=1;
