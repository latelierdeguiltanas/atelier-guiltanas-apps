'use strict';
// Certificate must fall back to open when a current equipment proof is missing/stale.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const dir=__dirname,source=fs.readFileSync(path.join(dir,'n1_focus_split.cjs'),'utf8');
function score(change){let focus;const mock={...fs,readFileSync(file,...args){const content=fs.readFileSync(file,...args);if(!String(file).endsWith('.json'))return content;const parsed=JSON.parse(content),before=JSON.stringify(parsed);change(String(file),parsed);const after=JSON.stringify(parsed);return after===before?content:(typeof content==='string'?after:Buffer.from(after));},writeFileSync(file,content){if(String(file).endsWith('/focus.json'))focus=JSON.parse(content);}};const box={__dirname:dir,require:n=>n==='node:fs'?mock:require(n),console:{log(){}}};vm.runInNewContext(source,box);return focus.profile.checks.find(c=>c.id==='gear').status;}
// Only run the positive assertion on a fully current successful dataset.
const original=score(()=>{});assert.equal(original,'ACQUIS','Run after the source-bound age, oracle and five mobile reports');
const mutations=[
 ['stale-equipment-proof',(p,r)=>{if(p.endsWith('/arquebusier-equipment-source.json'))r.products[0].sha256='obsolete';}],
 ['failed-weapon',(p,r)=>{if(p.endsWith('/arquebusier-equipment-source.json'))r.cases[0].status='FAIL';}],
 ['duplicate-weapon',(p,r)=>{if(p.endsWith('/arquebusier-equipment-source.json'))r.cases[1]={...r.cases[0]};}],
 ['failed-grant-armor',(p,r)=>{if(p.endsWith('/arquebusier-grants-armor.json'))r.failed=1;}],
 ['stale-mobile-proof',(p,r)=>{if(p.endsWith('/arquebusier-20-real-mobile-pairs.json'))r.indexSha256='obsolete';}]
];
for(const[name,change]of mutations)assert.equal(score(change),'A_VERIFIER',name+' must reopen equipment');
console.log('PASS current equipment certificate and five anti-false-green mutations');
