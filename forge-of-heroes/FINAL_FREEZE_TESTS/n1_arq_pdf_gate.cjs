'use strict';
// Certificate must fall back to open when a current PDF proof is missing/stale.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const dir=__dirname,source=fs.readFileSync(path.join(dir,'n1_focus_split.cjs'),'utf8');
function score(change){let focus;const mock={...fs,readFileSync(file,...args){const content=fs.readFileSync(file,...args);if(!String(file).endsWith('.json'))return content;const parsed=JSON.parse(content),before=JSON.stringify(parsed);change(String(file),parsed);const after=JSON.stringify(parsed);return after===before?content:(typeof content==='string'?after:Buffer.from(after));},writeFileSync(file,content){if(String(file).endsWith('/focus.json'))focus=JSON.parse(content);}};const box={__dirname:dir,require:n=>n==='node:fs'?mock:require(n),console:{log(){}}};vm.runInNewContext(source,box);return focus.profile.checks.find(c=>c.id==='pdf').status;}
// Only run the positive assertion on a fully current successful dataset.
const original=score(()=>{});assert.equal(original,'ACQUIS','Run after the source-bound age, oracle and five mobile reports');
const mutations=[
 ['stale-template-report',(p,r)=>{if(p.endsWith('/arquebusier-official-template.json'))r.products[0].sha256='obsolete';}],
 ['wrong-template',(p,r)=>{if(p.endsWith('/arquebusier-official-template.json'))r.templateSha256='other-file';}],
 ['incomplete-widgets',(p,r)=>{if(p.endsWith('/arquebusier-official-template.json'))r.widgetAudit.widgets=1;}],
 ['stale-shared-exporter',(p,r)=>{if(p.endsWith('/arquebusier-official-template.json'))r.sharedExporterSha256='obsolete';}],
 ['failed-granted-annex',(p,r)=>{if(p.endsWith('/arquebusier-granted-pdf-annex.json'))r.failed=1;}]
];
for(const[name,change]of mutations)assert.equal(score(change),'A_VERIFIER',name+' must reopen PDF');
console.log('PASS current PDF certificate and five anti-false-green mutations');
