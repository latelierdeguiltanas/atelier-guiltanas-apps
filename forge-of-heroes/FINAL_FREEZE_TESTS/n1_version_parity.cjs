'use strict';
const fs=require('node:fs');
const crypto=require('node:crypto');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const qa=path.join(root,'QA/N1');
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
const master=fs.readFileSync(path.join(root,'FORGE_OF_HEROES_ATELIER_GUILTANAS_PRODUCT_MASTER.html'),'utf8');
const matrix=JSON.parse(fs.readFileSync(path.join(qa,'matrix.json'),'utf8'));
const regression=JSON.parse(fs.readFileSync(path.join(qa,'regressions.json'),'utf8'));
function extract(html,id){
 const m=html.match(new RegExp('<script[^>]*id="'+id+'"[^>]*>([\\s\\S]*?)<\\/script>'));
 if(!m)throw Error('script '+id+' missing');
 return m[1];
}
const sig={index:hash(index),master:hash(master),engine:hash(extract(index,'FOH_ENGINE_BUNDLE')),database:hash(extract(index,'FOH_DB_JSON'))};
const report={
 schema:'FOH_N1_VERSION_PARITY',
 generatedAt:new Date().toISOString(),
 gitCommit:process.env.GITHUB_SHA||null,
 current:sig,
 oldMatrix:matrix.inputs,
 regressionIndexSha256:regression.indexSha256,
 checks:{
  matrixEngineIdentical: sig.engine===matrix.inputs.engineSha256,
  matrixDbIdentical: sig.database===matrix.inputs.databaseSha256,
  productMasterEngineIdentical: sig.engine===hash(extract(master,'FOH_ENGINE_BUNDLE')),
  productMasterDbIdentical: sig.database===hash(extract(master,'FOH_DB_JSON')),
  regressionIndexIdentical: sig.index===regression.indexSha256,
  matrixNoAssertionFailure:(matrix.assertionFailures||[]).length===0,
  regressionsPass:regression.passed===regression.total
 },
 matrixMechanicsReusable:false,
 limitations:'Only identical engine and database allow reusing mechanical matrix assertions. UI, PDFs and browser journeys remain separate. Refusal review and untested choices remain outstanding.'
};
report.matrixMechanicsReusable=report.checks.matrixEngineIdentical&&report.checks.matrixDbIdentical&&report.checks.matrixNoAssertionFailure;
fs.writeFileSync(path.join(qa,'version-parity.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
if(!report.checks.productMasterEngineIdentical||!report.checks.productMasterDbIdentical)process.exitCode=1;