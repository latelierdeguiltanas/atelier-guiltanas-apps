'use strict';
const fs=require('fs'),path=require('path'),{load}=require('./forge_product_runner');
const root=path.resolve(__dirname,'..'),{db,html}=load(path.join(root,'index.html')),T=db.tables;
const main='class:arquebusier:cof2-lb-2024';
const data={
 tables:Object.fromEntries(Object.entries(T).map(([k,v])=>[k,Array.isArray(v)?v.length:typeof v])),
 class:T.classes.find(x=>x.id===main),
 profileRule:T.profile_rules.find(x=>x.profileId===main),
 warriorMaster:T.paths_class.find(x=>x.classId==='class:guerrier:cof2-lb-2024'&&x.id.includes('voie-du-maitre-d-armes')),
 warriorR1Ability:T.abilities_class.find(x=>x.path_id==='classpath:voie-du-maitre-d-armes:class-guerrier:cof2-lb-2024'&&x.rank===1),
 engineChoiceSnippets:[...html.slice(html.indexOf('FOH_ENGINE_BUNDLE')).matchAll(/Armes de prédilection|preferred_weapon_category|preferredWeaponCategory|option illégale|crossbows/g)].slice(-55).map(m=>{const i=html.indexOf('FOH_ENGINE_BUNDLE')+m.index;return {query:m[0],index:i,code:html.slice(Math.max(0,i-250),i+650)}}),
 criticalSnippets:[...html.slice(html.indexOf('FOH_ENGINE_BUNDLE')).matchAll(/criticalThreshold|critical_range|criticalRange|weapon_critical|criticalBonus|specialization_damage/g)].slice(0,35).map(m=>{const i=html.indexOf('FOH_ENGINE_BUNDLE')+m.index;return {query:m[0],index:i,code:html.slice(Math.max(0,i-340),i+600)}}),
 crossbowWeapons:Object.entries(T).filter(([k,a])=>/weapons|arms|equip/i.test(k)&&Array.isArray(a)).flatMap(([k,a])=>a.filter(x=>/arbal|balist|crossbow/i.test(JSON.stringify(x))).map(x=>({...x,sourceTable:k}))),
 sourceArquebusierPaths:T.paths_class.filter(x=>x.classId===main).map(x=>({id:x.id,label:x.label,rank1:x.rank1})),
 sourceArbaletrierOptions:T.profile_rules.filter(x=>/arbalet/i.test(JSON.stringify(x)))
};
fs.writeFileSync(path.join(root,'QA/N1/arbaletrier-blueprint.json'),JSON.stringify(data,null,2));
console.log(JSON.stringify({tables:data.tables,rule:data.profileRule,crossbows:data.crossbowWeapons,paths:data.sourceArquebusierPaths}).slice(0,9200));
