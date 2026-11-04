'use strict';
// Certificate must fall back to open when a current derived proof is missing/stale.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const dir=__dirname,source=fs.readFileSync(path.join(dir,'n1_focus_split.cjs'),'utf8');
function score(change){let focus;const mock={...fs,readFileSync(file,...args){const content=fs.readFileSync(file,...args);if(!String(file).endsWith('.json'))return content;const parsed=JSON.parse(content),before=JSON.stringify(parsed);change(String(file),parsed);const after=JSON.stringify(parsed);return after===before?content:(typeof content==='string'?after:Buffer.from(after));},writeFileSync(file,content){if(String(file).endsWith('/focus.json'))focus=JSON.parse(content);}};const box={__dirname:dir,require:n=>n==='node:fs'?mock:require(n),console:{log(){}}};vm.runInNewContext(source,box);return focus.profile.checks.find(c=>c.id==='derived').status;}
// Only run the positive assertion on a fully current successful dataset.
const original=score(()=>{});assert.equal(original,'ACQUIS','Run after the source-bound age, oracle and five mobile reports');
const mutations=[
 ['stale-derived',(p,r)=>{if(p.endsWith('/arquebusier-derived-source.json'))r.products[0].sha256='obsolete';}],
 ['partial-derived',(p,r)=>{if(p.endsWith('/arquebusier-derived-source.json'))r.status='PARTIAL_DIAGNOSTIC';}],
 ['missing-people',(p,r)=>{if(p.endsWith('/arquebusier-derived-source.json'))delete r.perPeople.humain;}],
 ['failed-derived',(p,r)=>{if(p.endsWith('/arquebusier-derived-source.json'))r.failed=1;}],
 ['missing-saves',(p,r)=>{if(p.endsWith('/arquebusier-derived-source.json'))r.saves=0;}],
 ['stale-powder',(p,r)=>{if(p.endsWith('/arquebusier-powder-weapon-boundary.json'))r.products[0].sha256='obsolete';}],
 ['failed-preferences',(p,r)=>{if(p.endsWith('/arquebusier-two-preferences.json'))r.failed=1;}]
];
for(const[name,change]of mutations)assert.equal(score(change),'A_VERIFIER',name+' must reopen derived');
console.log('PASS current derived certificate and seven anti-false-green mutations');
