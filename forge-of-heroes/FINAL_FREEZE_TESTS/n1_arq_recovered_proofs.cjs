'use strict';
// Recover the successful rule/browser proofs of run 41808599204. Its final
// certificate step failed because equipment was hashed before PDF packaging.
// Do not transfer ANY proof to a different product or shared PDF renderer.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),root=path.resolve(__dirname,'..');
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,f))).digest('hex'),read=f=>JSON.parse(fs.readFileSync(path.join(root,'QA/N1',f),'utf8'));
const products=['index.html'],current=f=>products.includes(f),report={schema:'FOH_N1_ARQ_RECOVERED_CURRENT_PROOFS',sourceRun:41808599204,at:new Date().toISOString(),status:'PENDING',checks:[]};
function requireResult(file,count){const r=read(file);assert.equal(r.status,'PASS',file);assert.equal(r.passed??r.pass,count,file);assert.equal(r.failed,0,file);report.checks.push({file,passed:count,status:'PASS'});return r;}
function inputs(rows,key){assert.equal(rows.length,2);assert.equal(new Set(rows.map(p=>p.file)).size,2);for(const p of rows){assert(current(p.file));assert.equal(p[key],hash(p.file),'Stale proof '+p.file);}}
for(const[file,count]of [['arquebusier-20-real-mobile-pairs.json',20],['arquebusier-context-real-click.json',4],['arquebusier-venerable-context-click.json',5]]){const r=requireResult(file,count);assert.equal(r.indexSha256,hash('index.html'),file);}
const age=read('arquebusier-pure-age-ranks.json');assert(age.complete);assert.equal(age.pass,400);assert.equal(age.failed,0);inputs(age.products,'htmlSha256');
inputs(requireResult('arquebusier-context-canonical.json',73).inputSha256,'sha256');
inputs(requireResult('arquebusier-all-pairs-current.json',800).inputs,'sha256');
inputs(requireResult('arquebusier-grants-armor.json',240).products,'sha256');
inputs(requireResult('arquebusier-grants-weapons.json',48).products,'sha256');
const annex=requireResult('arquebusier-granted-pdf-annex.json',60);assert.equal(annex.indexSha256,hash('index.html'));assert.equal(annex.sharedExporterSha256,hash('progression/official-pdf-engine.js'));
inputs(requireResult('arquebusier-equipment-source.json',200).products,'sha256');
report.status='PASS';report.products=products.map(file=>({file,sha256:hash(file)}));report.browserJourneys=29;report.note='All source hashes match exactly. Only equipment evidence was regenerated after final packaging; browser proofs are the original successful 29 journeys.';
fs.writeFileSync(root+'/QA/N1/arquebusier-recovered-current-proofs.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
