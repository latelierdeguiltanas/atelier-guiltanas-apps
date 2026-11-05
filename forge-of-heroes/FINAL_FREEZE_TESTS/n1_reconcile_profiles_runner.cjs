'use strict';
const fs=require('node:fs');
const path=require('node:path');
const cp=require('node:child_process');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const reportPath=path.join(root,'QA/N1/profile-checkpoint.json');
const sha=(s)=>crypto.createHash('sha256').update(s).digest('hex');
const tasks=[
  ['profiles-to-interactive-sheet','n1_player_sheet_all_profiles.cjs'],
  ['half-orc-hybrid-numeric','n1_half_orc_hybrid_defence.cjs'],
  ['age-history-equipment','n1_age_history_armour_oracle.cjs'],
  ['r1-independent-numerics','n1_pair_numeric_oracle.cjs'],
  ['r2-independent-numerics','n1_r2_pair_numeric_oracle.cjs']
];
const index=fs.readFileSync(path.join(root,'index.html'));
const master=fs.readFileSync(path.join(root,'index.html'));
const checks=[];
for(const [id,filename] of tasks){
  const t=Date.now();
  const output=path.join('/tmp','foh-profile-'+id+'.json');
  const env={...process.env,FOH_ORACLE_REPORT:output};
  const x=cp.spawnSync(process.execPath,[path.join(__dirname,filename)],{cwd:path.resolve(root,'..'),encoding:'utf8',maxBuffer:25*1024*1024,timeout:210000,env});
  const log=((x.stdout||'')+'\n'+(x.stderr||'')).trim();
  let analysis=null;
  if((id==='r1-independent-numerics'||id==='r2-independent-numerics')&&fs.existsSync(output)){
    const j=JSON.parse(fs.readFileSync(output,'utf8'));
    analysis={status:j.status,counts:j.counts,failures:j.failures?.length||0,sourceExpectations:j.sourceExpectations,scope:j.scope,inputSha256:j.inputs};
  }
  const result={id,runner:filename,runnerSha256:sha(fs.readFileSync(path.join(__dirname,filename))),status:x.status===0?'PASS':'FAIL',exitCode:x.status,signal:x.signal||null,elapsedSeconds:Math.round((Date.now()-t)/1000),summary:log.slice(-3500),analysis};
  checks.push(result);
  console.log(id+' '+result.status+' '+result.elapsedSeconds+'s');
}
const profileBaseline=checks.every(c=>c.status==='PASS');
const report={
  schema:'FOH_N1_PROFILE_RECONCILIATION',
  generatedAt:new Date().toISOString(),
  sourceCommit:process.env.GITHUB_SHA||null,
  input:{indexSha256:sha(index),masterSha256:sha(master)},
  scope:'Targeted reconciliation of all 17 profiles on native interactive sheet + reference R1/R2 numeric oracles and two complicated historical scenarios. Not a universal certification or a physical phone test.',
  checks,
  profileBaseline:{profilesTested:17,profilesValidatedInThisScope:profileBaseline?17:0,scopeStatus:profileBaseline?'PASS':'NOT_PASS',completeCertification:false},
  limitations:[
    'No individual all-races all-ages all-hybrids certificate per profile',
    'R1/R2 independent oracles use human representative configurations',
    'Additional context-sensitive abilities and end-to-end browser/UI flows are separate gates',
    'Known legal refusals in the oracles are not counted as creation successes'
  ]
};
fs.writeFileSync(reportPath,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({source:report.input,checks:checks.map(c=>({id:c.id,status:c.status,counts:c.analysis?.counts})),profileBaseline:report.profileBaseline}));
if(checks.some(c=>c.status!=='PASS'))process.exitCode=1;