'use strict';
const fs=require('fs'),path=require('path'),{load,standardState}=require('./forge_product_runner');
const root=path.resolve(__dirname,'..'),srcClass='class:arquebusier:cof2-lb-2024',altClass='class:arbaletrier:cof2-variant-2024';
const oldWar='classpath:voie-du-maitre-d-armes:class-guerrier:cof2-lb-2024';
const clone=x=>JSON.parse(JSON.stringify(x));
const report={schema:'FOH_N1_ARBALETRIER_IN_MEMORY_PROTOTYPE',createdAt:new Date().toISOString(),source:'COF2 Livre de base p.62, variante sans poudre; Guerrier Voie du maître d’armes pp.88-89',attempts:[],install:null};
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
 const {db,engine:E}=load(path.join(root,file));
 const install=inject(db);report.install=install;
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
}
fs.writeFileSync(path.join(root,'QA/N1/arbaletrier-virtual-prototype.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({install:report.install,attempts:report.attempts.map(a=>({file:a.file,paths:a.paths,errors:a.errors,profileId:a.character?.profileId}))}).slice(0,7000));
