'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),crypto=require('crypto');
const root=path.resolve(__dirname,'../..'),out=root+'/forge-of-heroes/QA/N1/lot-2026-11-19',report=JSON.parse(fs.readFileSync(out+'/coverage-register.json')),sha=p=>crypto.createHash('sha256').update(fs.readFileSync(root+'/'+p)).digest('hex');
const highRank=JSON.parse(fs.readFileSync(out+'/high-rank-access.json'));
function validate(r){assert.equal(r.inputs.indexSha256,sha('forge-of-heroes/index.html'));assert.equal(r.inputs.sheetSha256,sha('fiches-personnages/fiche/fiche.js'));assert.equal(new Set(r.rows.map(x=>x.id)).size,r.rows.length);let passed=r.extra.filter(c=>c.status==='PASS').length,total=r.extra.length,specialReviewed=0;for(const row of r.rows){if(row.n1Applicability==='IN_SCOPE'){total+=r.obligations.length;for(const c of Object.values(row.checks))if(c.status==='PASS'){assert(c.evidence,'PASS without proof');assert(fs.existsSync(path.resolve(out,c.evidence)),'Missing proof');passed++;}if(row.mechanicallyClosed)assert(Object.values(row.checks).every(c=>c.status==='PASS'),'Incomplete rule marked closed');}else{assert.equal(row.n1Applicability,'SPECIAL_ACCESS_REVIEW');total++;if(row.reachability?.status==='PASS'){
 const proof=highRank.cases[row.id];assert.equal(highRank.inputs.indexSha256,r.inputs.indexSha256);
 assert.deepEqual(proof,{status:'PASS',pathId:row.pathId,rank:row.rank,blockedAt:4});
 assert.equal(row.reachability.verdict,'NOT_ACQUIRABLE_AT_N1');
 assert.equal(row.reachability.evidence,'high-rank-access.json');
 specialReviewed++;passed++;
}}}assert.equal(r.summary.specialAccessReviewed,specialReviewed);assert.equal(r.summary.criteriaPassed,passed);assert.equal(r.summary.criteriaTotal,total);assert.equal(r.summary.percent,Math.round(passed/total*10000)/100);assert.equal(r.untracked.total,r.rows.filter(r=>r.untrackedByOldAudit).length);assert.equal(r.summary.certified,false);return true;}
validate(report);let sabotage=0;
const changed=fn=>{const x=JSON.parse(JSON.stringify(report));fn(x);assert.throws(()=>validate(x));sabotage++;};
changed(r=>r.summary.criteriaPassed++);changed(r=>r.summary.criteriaTotal--);changed(r=>r.inputs.indexSha256='wrong');changed(r=>r.rows.push(r.rows[0]));changed(r=>{const row=r.rows.find(r=>Object.values(r.checks).some(c=>c.status!=='PASS'));row.mechanicallyClosed=true;});changed(r=>{const row=r.rows.find(r=>Object.values(r.checks).some(c=>c.status==='PASS'));Object.values(row.checks).find(c=>c.status==='PASS').evidence=null;});
changed(r=>{r.rows.find(row=>row.reachability?.status==='PASS').reachability.verdict='ACQUIRABLE_AT_N1';});
console.log('PASS current register contract; '+sabotage+' false-green mutations rejected; no old profile certificate promoted.');
