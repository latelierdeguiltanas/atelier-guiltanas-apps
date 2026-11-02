'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),{load,standardState}=require('./forge_product_runner');
const root=path.resolve(__dirname,'..'),srcClass='class:arquebusier:cof2-lb-2024',altClass='class:arbaletrier:cof2-variant-2024';
const oldWar='classpath:voie-du-maitre-d-armes:class-guerrier:cof2-lb-2024';
const clone=x=>JSON.parse(JSON.stringify(x));
const report={schema:'FOH_N1_ARBALETRIER_IN_MEMORY_PROTOTYPE',createdAt:new Date().toISOString(),source:'COF2 Livre de base p.62, variante sans poudre; Guerrier Voie du maître d’armes pp.88-89',attempts:[],matrix:{total:0,passed:0,failed:0,refused:0,failures:[],byRace:{}},install:null};
function inject(db){
 const T=db.tables,orig=T.classes.find(c=>c.id===srcClass),rule=T.profile_rules.find(r=>r.profileId===srcClass);
 const cls=clone(orig);cls.id=altClass;cls.label='Arbalétrier';cls.group='Variante du Livre de base';cls.source={...orig.source,section:'Poudre ou pas poudre ? — Arbalétrier'};
 T.classes.push(cls);
 const equipment=clone(rule);equipment.profileId=altClass;equipment.source.section='Arbalétrier — variante sans poudre';equipment.initialEquipment.packages=[{id:'arbaletrier-standard',weaponIds:['weapon:hand-crossbow','weapon:long-sword','weapon:dagger'],shieldId:''}];
 equipment.items=['Arbalètes et carreaux (armes à poudre remplacées)'];T.profile_rules.push(equipment);
 const sourcePaths=T.paths_class.filter(x=>x.classId===srcClass&&!x.additionalMagePath&&x.id.split(':')[1]!=='voie-des-explosifs');
 const warrior=T.paths_class.find(x=>x.id===oldWar);
 const all=[...sourcePaths,warrior],alts=[];
 for(const p of all){
  const newer='classpath:'+p.id.split(':')[1]+':class-arbaletrier:cof2-variant-2024';
  const row=clone(p);row.id=newer;row.classId=altClass;row.source={...(p.source||{}),section:'Arbalétrier : '+(p.source?.section||p.id)};
  T.paths_class.push(row);alts.push(newer);
  const skills=T.abilities_class.filter(a=>a.path_id===p.id);
  for(const a of skills){
   const d=clone(a);d.id=a.id.replace(p.id,newer);d.path_id=newer;
   if(p.id===oldWar&&d.rank===1){const eff=d.mechanics?.effects?.find(e=>e.type==='weapon_attack_bonus');if(eff)eff.categories=['crossbows'];d.desc='Arbalétrier : arbalètes exclusivement ; +1 aux attaques avec une arbalète. Bonus de rang + 2 aux tests d’estimation de valeur des armes ou réputation martiale.';}
   if(p.id===oldWar)d.sourceVariantRestriction='Arbalétrier : arbalètes uniquement, catégorie imposée';
   T.abilities_class.push(d);
  }
 }
 return {paths:alts,profileId:altClass,firstEquipment:equipment.initialEquipment.packages[0],counts:{classes:T.classes.length,paths:T.paths_class.length,abilities:T.abilities_class.length},warriorId:alts.find(x=>x.includes('voie-du-maitre-d-armes'))};
}
for(const file of ['index.html','FORGE_OF_HEROES_ATELIER_GUILTANAS_PRODUCT_MASTER.html']){
 const {db,html}=load(path.join(root,file));
 const install=inject(db);report.install=install;
 let bundle=html.match(/<script[^>]*id=["']FOH_ENGINE_BUNDLE["'][^>]*>([\s\S]*?)<\/script>/)[1];
 const replaceStrict=(from,to)=>{if(!bundle.includes(from))throw Error('Engine anchor missing: '+from.slice(0,90));bundle=bundle.replace(from,to);};
 replaceStrict("rows.push({id:'preferredWeaponCategory',type:'preferred_weapon_category',sourceMechanic:'legacy.requiresChoice',required:true,persist:true,values:['swords','axes','maces','spears','thrown']})",
  "rows.push({id:'preferredWeaponCategory',type:'preferred_weapon_category',sourceMechanic:'legacy.requiresChoice',required:true,persist:true,values:ability.path_id?.includes(':class-arbaletrier:')?['crossbows']:['swords','axes','maces','spears','thrown']})");
 replaceStrict("if(c.type==='preferred_weapon_category')return[{id:'swords',label:'Épées'},{id:'axes',label:'Haches'},{id:'maces',label:'Masses'},{id:'spears',label:'Lances'},{id:'thrown',label:'Armes de jet'}]",
  "if(c.type==='preferred_weapon_category')return String(abilityId).includes(':class-arbaletrier:')?[{id:'crossbows',label:'Arbalètes'}]:[{id:'swords',label:'Épées'},{id:'axes',label:'Haches'},{id:'maces',label:'Masses'},{id:'spears',label:'Lances'},{id:'thrown',label:'Armes de jet'}]");
 replaceStrict("pred=pref&&w.preferredCategory===pref?1:0",
  "pred=pref&&(w.preferredCategory===pref||(pref==='crossbows'&&w.category==='crossbow'))?1:0");
 const box={window:{},console};vm.createContext(box);vm.runInContext(bundle,box);const E=box.window.__FOH_ENGINE_FACTORY__(db);
 for(const parts of [[install.paths[0],install.paths[1]],[install.warriorId,install.paths[0]]]){
  let state,errors=[],sticky;
  try{
   state=standardState(db,altClass,parts[0]);
   state.voies.profilePathIds=parts;
   state.peupleChoices.humainStat='cha';
   if(parts.includes(install.warriorId)){state.profileChoices.preferredWeaponCategory='crossbows';state.abilityChoices={};}
   const r=E.computeCharacterN1(state);errors=r.errors;
   sticky=r.sticky;
  }catch(err){errors=[String(err?.stack||err)]}
  report.attempts.push({file,paths:parts.map(x=>x.split(':')[1]),errors,character:sticky?{profileId:sticky.profileId,masteries:sticky.masteries,attacks:sticky.attacks?.slice(0,4).map(a=>({id:a.weaponId,damage:a.damage,mastered:a.mastered,attackBonus:a.attackBonus})),paths:sticky.characterState?.paths.map(p=>({path:p.pathId,rank:p.rank}))}:null});
 }

  const raceConfigs={
   humain:{bonus:'cha',malus:null,path:'voie-de-l-humain'},
   nain:{bonus:'con',malus:'agi',path:'voie-du-nain'},
   'demi-elfe':{bonus:'per',malus:'for',path:'voie-de-l-humain'},
   'demi-orc':{bonus:'for',malus:'cha',path:'voie-du-demi-orc'},
   'elfe-haut':{bonus:'int',malus:'for',path:'voie-de-l-elfe-haut'},
   'elfe-sylvain':{bonus:'agi',malus:'for',path:'voie-de-l-elfe-sylvain'},
   gnome:{bonus:'int',malus:'for',path:'voie-du-gnome'},
   halfelin:{bonus:'agi',malus:'for',path:'voie-du-halfelin'}
  };
  for(const [race,rc] of Object.entries(raceConfigs))for(let i=0;i<install.paths.length;i++)for(let j=i+1;j<install.paths.length;j++)for(const age of ['young','mature','venerable']){
   report.matrix.total++;
   const raceRow=report.matrix.byRace[race]||(report.matrix.byRace[race]={total:0,passed:0,failed:0});raceRow.total++;
   const first=install.paths[i],second=install.paths[j],tag=[file,race,first.split(':')[1],second.split(':')[1],age].join('|');
   try{
    const state=standardState(db,altClass,first,'people:'+race+':cof2-lb-2024');
    state.voies.profilePathIds=[first,second];
    state.voies.peoplePathId=db.tables.paths_people.find(x=>x.id.split(':')[1]===rc.path)?.id;
    state.peupleChoices=race==='humain'?{humainStat:'cha'}:{bonusStat:rc.bonus,malusStat:rc.malus};
    if(race==='gnome')state.peupleChoices.grantedAbilityId=db.tables.abilities_class.find(a=>a.rank===1&&a.path_id.includes('voie-de-l-air')&&a.path_id.includes('ensorceleur'))?.id;
    if(first===install.warriorId||second===install.warriorId)state.profileChoices.preferredWeaponCategory='crossbows';
    if(age!=='young'){
     state.advancedRules.age=true;
     state.age={categoryId:age,spending:age==='mature'?[{pathId:first,rank:2},{pathId:second,rank:2}]:[{pathId:first,rank:2},{pathId:first,rank:3},{pathId:second,rank:2}]};
    }
    for(let repeat=0;repeat<4;repeat++)for(const a of E.previewAcquiredAbilities(state))for(const c of E.getPersistentChoicesForAbility(state,a.id)){
      const bag=state.abilityChoices[a.id]||(state.abilityChoices[a.id]={});
      if(c.id==='preferredWeaponCategory'){bag[c.id]='crossbows';state.profileChoices.preferredWeaponCategory='crossbows';}
      else if(c.id==='repeatingWeapons'){bag[c.id]=['weapon:hand-crossbow'];}
      else if(c.type==='boolean')bag[c.id]??=false;
      else if(c.type==='entity')bag[c.id]??={type:'animal',species:'chat',name:'QA'};
      else if(c.type==='weapon_multi')bag[c.id]??=(c.options||[]).slice(0,Math.max(1,c.min||1)).map(o=>o.id);
      else if(c.options?.length)bag[c.id]??=c.options[0].id;
    }
    const calculated=E.computeCharacterN1(state);
    if(calculated.errors.length)throw Error('Création refusée: '+calculated.errors.join(' / '));
    if(calculated.sticky.profileId!==altClass)throw Error('Profil incorrect');
    if(calculated.sticky.characterState?.paths?.some(p=>p.pathId.includes('voie-des-explosifs')))throw Error('Explosifs illégaux dans Arbalétrier');
    const c=calculated.sticky;
    if(!c.attacks?.some(a=>a.weaponId==='weapon:hand-crossbow'&&a.mastered===true))throw Error('Arbalète de poing non maîtrisée');
    if(first===install.warriorId||second===install.warriorId){
     const w=c.attacks.find(a=>a.weaponId==='weapon:hand-crossbow'),sword=c.attacks.find(a=>a.weaponId==='weapon:long-sword');
     if(w.attackBonus!==c.ATK_DISTANCE+1)throw Error('Bonus +1 arbalète absent');
     if(sword.attackBonus!==c.ATK_CONTACT)throw Error('Bonus arbalète illégal sur épée');
     if(age!=='young'){
      if(w.criticalThreshold!==19)throw Error('Science du critique R2 : critique 19–20 avec arbalète non appliqué, obtenu '+w.criticalThreshold);
      if(sword.criticalThreshold!==20)throw Error('Science du critique a modifié l’épée');
     }
     if(first===install.warriorId&&age==='venerable'){
      if(w.damage!=='1d6+1')throw Error('Spécialisation R3 : +1 dommage avec arbalète manquant, DM='+w.damage);
      if(sword.damage!=='1d8+2')throw Error('Spécialisation R3 a modifié les dégâts de l’épée');
     }
    }
    const back=E.computeCharacterN1(E.restoreHeroSavePayload(JSON.parse(JSON.stringify(E.createHeroSavePayload(state,c.characterState,{id:'arbaletrier-qa'})))).draft);
    if(back.errors.length||JSON.stringify(back.sticky.characterState.derived)!==JSON.stringify(c.characterState.derived))throw Error('Sauvegarde/reprise non conforme');
    report.matrix.passed++;raceRow.passed++;
   }catch(err){
    report.matrix.failed++;raceRow.failed++;if(report.matrix.failures.length<90)report.matrix.failures.push({tag,error:String(err)});
   }
  }
}

fs.writeFileSync(path.join(root,'QA/N1/arbaletrier-virtual-prototype.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({matrix:{total:report.matrix.total,passed:report.matrix.passed,failed:report.matrix.failed,byRace:report.matrix.byRace,issues:report.matrix.failures.slice(0,6)},examples:report.attempts.map(a=>({file:a.file,paths:a.paths,errors:a.errors}))}).slice(0,7000));
