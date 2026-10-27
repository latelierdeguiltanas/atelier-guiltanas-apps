'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const dir=path.resolve(__dirname,'../progression'),PDFLib=require(dir+'/pdf-lib.js');
global.PDFLib=PDFLib;require(dir+'/official-pdf-engine.js');
const PDF=require(dir+'/pdf-export.js'),catalog=require(dir+'/catalog.json'),seeds=require(dir+'/bastide-seeds.json'),C=require(dir+'/core.js').create(catalog),store=new Map();
global.localStorage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)};
global.fetch=async()=>({ok:true,json:async()=>require(dir+'/pdf-labels.json')});
const choices={prepotante:[['voie-du-roublard',2],['voie-de-l-aventurier',2]],scanlan:[['voie-du-saltimbanque',1],['voie-du-saltimbanque',2]],wilfried:[['voie-des-soins',2],['voie-de-la-foi',2]],vivelame:[['voie-des-explosifs',1],['voie-des-explosifs',2]],zepheline:[['voie-de-la-divination',1],['voie-de-la-divination',2]],faelar:[['voie-de-l-archer',2],['voie-du-compagnon-animal',2]]};
function next(rec){for(const p of C.allowed(rec)){const pick={pathId:p.id,rank:C.rank(rec.head,p.id)+1};try{return C.commit(rec,[pick])}catch{}for(const q of C.allowed(rec)){const second={pathId:q.id,rank:C.rank(rec.head,q.id)+1};if(second.pathId===pick.pathId)second.rank++;try{return C.commit(rec,[pick,second])}catch{}}}throw Error('No legal N3');}
(async()=>{
 const source=process.argv[2],output=process.argv[3]||'/tmp/foh-n2pdf/output';assert.ok(source,'Supply the private official form source');fs.mkdirSync(output,{recursive:true});
 const doc=await PDFLib.PDFDocument.load(fs.readFileSync(source));while(doc.getPageCount()>2)doc.removePage(2);
 const template=fs.readFileSync(source);await PDF.init(catalog);await assert.rejects(()=>PDF.prepare(C.begin(seeds[0])),/Importe/);
 await PDF.importTemplate({size:template.length,arrayBuffer:async()=>template});assert.ok(PDF.ready());
 for(const h of seeds){const rec=C.begin(h),picks=choices[h.recovery.sourceId].map(([name,rank])=>({pathId:C.allowed(rec).find(p=>p.id.includes(name)).id,rank})),n2=C.commit(rec,picks),out=next(n2),built=await PDF.prepare(out),pdf=await PDFLib.PDFDocument.load(built.bytes),form=pdf.getForm();
 assert.equal(form.getTextField('NIVEAU').getText(),'3');assert.equal(form.getTextField('NOM PERSONNAGE').getText(),h.recovery.character.name);
 for(const [field,key] of [['PV MAX','pvMax'],['DEF','def'],['INIT','init'],['PM MAX','pmMax'],['PCmax','pcMax']])assert.equal(form.getTextField(field).getText(),String(out.head.combat[key]));
 for(const stat of Object.keys(out.head.stats))assert.equal(form.getTextField(stat).getText(),(out.head.stats[stat]>=0?'+':'')+out.head.stats[stat]);
 const projected=PDF.projection(out),db=require(dir+'/pdf-labels.json'),slots=[...new Set([...projected.state.voies.profilePathIds,...projected.s.profilePaths.map(p=>p.pathId),...db.paths_class.filter(p=>p.classId===projected.state.classeId&&String(p.group||'Base').toLowerCase()==='base').map(p=>p.id)])].slice(0,5),checks=[[19,22,25,28,31],[20,23,26,29,32],[21,24,27,30,33],[34,37,40,43,46],[35,38,41,44,47]];
 for(let col=0;col<5;col++)for(let rank=1;rank<=5;rank++)assert.equal(form.getCheckBox('undefined_'+checks[col][rank-1]).isChecked(),C.rank(out.head,slots[col])>=rank,'checkbox '+col+'/'+rank);
 for(const field of form.getFields())for(const w of field.acroField.getWidgets())assert.ok(w.getAppearances()?.normal,'missing appearance '+field.getName());
 assert.ok(pdf.getPageCount()>2);fs.writeFileSync(path.join(output,built.name),built.bytes);console.log('PASS '+h.name+' / official '+form.getFields().length+'-field template, level 3 values and full annexes ('+pdf.getPageCount()+' pages)');
 }
 // A failed or absent model never produces a partial PDF.
 store.clear();await assert.rejects(()=>PDF.prepare(C.begin(seeds[0])),/modèle officiel/);
})().catch(e=>{console.error(e);process.exitCode=1});
