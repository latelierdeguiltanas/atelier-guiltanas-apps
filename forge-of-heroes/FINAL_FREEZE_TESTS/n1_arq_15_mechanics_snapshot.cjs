'use strict';
/* Oracle de diagnostic : toutes les capacités Arquebusier R1-R3 accessibles au N1 via les âges,
   sans déclarer qu'un effet actif est exécuté simplement parce qu'il figure en JSON.
   Source : Livre de base COF2 pages imprimées 62 à 65. */
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const {load}=require('./forge_product_runner');
const root=path.resolve(__dirname,'..');
const ids=['voie-de-l-artilleur','voie-des-explosifs','voie-du-mercenaire','voie-du-pistolero','voie-de-la-precision'];
const target='class:arquebusier:cof2-lb-2024';
const out={schema:'FOH_N1_ARQUEBUSIER_FIFTEEN_MECHANICS_SOURCE_AUDIT',at:new Date().toISOString(),source:'COF2 Livre de base p.62 à 65; rangs 1,2,3 accessibles au niveau 1 selon âge',products:[],missing:[],status:'DIAGNOSTIC_NON_CERTIFIANT'};
for(const file of ['index.html','FORGE_OF_HEROES_ATELIER_GUILTANAS_PRODUCT_MASTER.html']){
 const {db,html}=load(path.join(root,file)),t=db.tables,paths=t.paths_class.filter(x=>x.classId===target);
 const sorted=ids.map(n=>paths.find(p=>p.id.split(':')[1]===n));
 if(sorted.some(x=>!x))throw Error('Une des cinq voies officielles manque dans '+file);
 const rows=[];
 for(const p of sorted)for(const rank of [1,2,3]){
   const same=t.abilities_class.filter(a=>a.path_id===p.id&&a.rank===rank);
   if(same.length!==1){out.missing.push({file,path:p.id,rank,found:same.length});continue}
   const a=same[0],mech=a.mechanics||null;
   rows.push({pathId:p.id,path:p.label,rank,id:a.id,label:a.label,kind:mech?.kind||null,mechanics:mech,descriptionKeys:Object.keys(a).filter(k=>/effect|rule|bonus|choice|source|text|description|summary/i.test(k))});
 }
 out.products.push({file,sha256:crypto.createHash('sha256').update(html).digest('hex'),paths:sorted.length,abilities:rows,mechanicsPresent:rows.filter(x=>x.mechanics).length,unstructured:rows.filter(x=>!x.mechanics||x.mechanics.kind==='structured_sheet_effect').map(x=>x.label)});
}
const a=out.products[0],b=out.products[1];
if(out.missing.length||out.products.some(x=>x.abilities.length!==15)||a.abilities.map(x=>JSON.stringify(x.mechanics)).join('\n')!==b.abilities.map(x=>JSON.stringify(x.mechanics)).join('\n')){out.status='FAIL';}
else out.status='SNAPSHOT_COHERENT_STRUCTURE_UNEVALUATED';
const dest=path.join(root,'QA/N1/arquebusier-all-mechanics-probe.json');fs.writeFileSync(dest,JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({status:out.status,missing:out.missing,products:out.products.map(x=>({file:x.file,paths:x.paths,abilities:x.abilities.length,mechanicsPresent:x.mechanicsPresent,unstructured:x.unstructured}))}));
if(out.status==='FAIL')process.exitCode=1;
