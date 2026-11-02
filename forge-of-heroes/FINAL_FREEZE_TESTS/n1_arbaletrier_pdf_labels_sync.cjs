'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),{load}=require('./forge_product_runner');
const {db}=load(path.join(root,'index.html')),d=db.tables,file=path.join(root,'progression/pdf-labels.json'),labels=JSON.parse(fs.readFileSync(file,'utf8'));
const added={};for(const key of ['classes','paths_class','abilities_class']){
 const known=new Set(labels[key].map(x=>x.id)),extra=d[key].filter(x=>!known.has(x.id));
 for(const x of extra){if(!x.id.includes('arbaletrier'))throw Error('Unexpected non-Arbalétrier new '+key+' '+x.id)}
 for(const x of extra)labels[key].push(JSON.parse(JSON.stringify(x)));
 added[key]=extra.length;
}
assert.deepEqual(added,{classes:1,paths_class:5,abilities_class:25});
for(const key of ['abilities_class','abilities_people','history_abilities','abilities_prestige']){
 const a=labels[key];assert.equal(a.length,d[key].length);
 for(const record of d[key]){
  const match=a.find(x=>x.id===record.id);
  if(!match)throw Error('Missing '+record.id);
  for(const field of ['path_id','rank','label','desc'])if(match[field]!==record[field])throw Error('Source text differs: '+record.id+' '+field);
 }
}
fs.writeFileSync(file,JSON.stringify(labels,null,2)+'\n');
console.log(JSON.stringify({status:'PASS',newLabels:added,totalClasses:labels.classes.length,totalProfilePaths:labels.paths_class.length,totalProfilePowers:labels.abilities_class.length}));
