'use strict';
const fs=require('fs'),path=require('path'),{load}=require('./forge_product_runner');
const root=path.resolve(__dirname,'..'),{db}=load(path.join(root,'index.html')),T=db.tables;
const main='class:arquebusier:cof2-lb-2024';
const data={
 tables:Object.fromEntries(Object.entries(T).map(([k,v])=>[k,Array.isArray(v)?v.length:typeof v])),
 class:T.classes.find(x=>x.id===main),
 profileRule:T.profile_rules.find(x=>x.profileId===main),
 warriorMaster:T.paths_class.find(x=>x.classId==='class:guerrier:cof2-lb-2024'&&x.id.includes('voie-du-maitre-d-armes')),
 crossbowWeapons:T.weapons.filter(x=>/arbal|balist|crossbow/i.test(JSON.stringify(x))),
 sourceArquebusierPaths:T.paths_class.filter(x=>x.classId===main).map(x=>({id:x.id,label:x.label,rank1:x.rank1})),
 sourceArbaletrierOptions:T.profile_rules.filter(x=>/arbalet/i.test(JSON.stringify(x)))
};
fs.writeFileSync(path.join(root,'QA/N1/arbaletrier-blueprint.json'),JSON.stringify(data,null,2));
console.log(JSON.stringify({tables:data.tables,rule:data.profileRule,crossbows:data.crossbowWeapons,paths:data.sourceArquebusierPaths}).slice(0,9200));
