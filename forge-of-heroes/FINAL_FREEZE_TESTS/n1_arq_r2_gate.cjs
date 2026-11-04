'use strict';
// Certificate must fall back to open when a current R2 proof is missing/stale.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const dir=__dirname,source=fs.readFileSync(path.join(dir,'n1_focus_split.cjs'),'utf8');
function score(change){let focus;const mock={...fs,readFileSync(file,...args){const content=fs.readFileSync(file,...args);if(!String(file).endsWith('.json'))return content;const parsed=JSON.parse(content);change(String(file),parsed);return JSON.stringify(parsed);},writeFileSync(file,content){if(String(file).endsWith('/focus.json'))focus=JSON.parse(content);}};const box={__dirname:dir,require:n=>n==='node:fs'?mock:require(n),console:{log(){}}};vm.runInNewContext(source,box);return focus.profile.checks.find(c=>c.id==='r2effects').status;}
// Only run the positive assertion on a fully current successful dataset.
const original=score(()=>{});assert.equal(original,'ACQUIS','Run after the source-bound age, oracle and five mobile reports');
const mutations=[
 ['stale-mobile-hash',(p,r)=>{if(p.endsWith('/arquebusier-venerable-context-click.json'))r.indexSha256='obsolete';}],
 ['failed-mobile',(p,r)=>{if(p.endsWith('/arquebusier-venerable-context-click.json'))r.status='FAIL';}],
 ['missing-mobile-r2',(p,r)=>{if(p.endsWith('/arquebusier-venerable-context-click.json'))for(const c of r.cases)c.abilities=c.abilities.filter(a=>a.slug!=='demolition');}],
 ['missing-negative-oracle',(p,r)=>{if(p.endsWith('/arquebusier-context-canonical.json'))r.cases=r.cases.filter(c=>c.tag!=='demolition/no-context');}],
 ['failed-oracle',(p,r)=>{if(p.endsWith('/arquebusier-context-canonical.json'))r.failed=1;}]
];
for(const[name,change]of mutations)assert.equal(score(change),'A_VERIFIER',name+' must reopen R2');
console.log('PASS current R2 certificate and five anti-false-green mutations');
