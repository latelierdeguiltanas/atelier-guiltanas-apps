'use strict';
/* Gate de régression ACTUELLE : exécute seulement sur l'unique index.html,
   préserve les constats FAIL et n'accorde aucun pourcentage par simple volume.
   Un rapport de test n'est pas un certificat exhaustif de fonctionnalité.
 */
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),base=path.resolve(__dirname);
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const file=path.join(root,'index.html'),initial=sha(file);
const suites=[
 ['historique-catalogue','history_completeness_runner.cjs'],
 ['historique-ages','n1_history_modes_probe.cjs'],
 ['historique-ascendance','n1_history_ancestry_runner.cjs'],
 ['historique-calculs','n1_age_history_armour_oracle.cjs'],
 ['historique-choix','n1_history_choices_oracle.cjs'],
 ['historique-conditions','n1_history_conditions_oracle.cjs'],
 ['historique-pdf','n1_history_choices_pdf.cjs'],
 ['historique-arquebusier-peuples','n1_arq_history_people_cross.cjs'],
 ['arquebusier-mecanismes-15','n1_arq_15_mechanics_snapshot.cjs'],
 ['arquebusier-contextes','n1_arq_context_oracle.cjs'],
 ['arquebusier-pures-ages','n1_arq_pure_age_ranks.cjs'],
 ['arquebusier-toutes-paires','n1_arq_all_pairs_current.cjs'],
 ['arquebusier-grants-armor','n1_arq_grant_armor.cjs'],
 ['arquebusier-grants-weapons','n1_arq_grant_weapons.cjs'],
 ['arquebusier-grants-pdf','n1_arq_granted_pdf_annex.cjs'],
 ['arquebusier-derivees','n1_arq_derived_source_oracle.cjs'],
 ['arquebusier-export-officiel','n1_arq_official_template.cjs'],
 ['regressions-n1','n1_regression_batch.cjs']
];
const at=new Date().toISOString(),report={schema:'FOH_SINGLE_INDEX_REGRESSION_CAMPAIGN_V1',at,scope:'18 suites sur la Forge index.html publiée ; rapport de tests ciblés (dont réutilisation des preuves à SHA identique), PAS certification exhaustive des profils, peuples, effets contextuels, PDF au clic ou passages N2/N3',source:{file:'forge-of-heroes/index.html',sha256:initial},suites:[],summary:null};
const reusable={
 'historique-pdf':{path:'QA/N1/arquebusier-history-choices-pdf.json',check:j=>j.status==='PASS'&&j.indexSha256===initial&&j.exports?.length===24},
 'arquebusier-export-officiel':{path:'QA/N1/arquebusier-official-template.json',check:j=>j.status==='PASS'&&j.products?.some(p=>p.file==='index.html'&&p.sha256===initial)&&j.exports?.length===28},
 'arquebusier-derivees':{path:'QA/N1/arquebusier-derived-source.json',check:j=>j.status==='PASS'&&j.expected===20480&&j.passed===20480&&j.failed===0&&j.products?.some(p=>p.file==='index.html'&&p.sha256===initial)}
};
for(const [id,name]of suites){
 const started=Date.now(),out={id,script:'FINAL_FREEZE_TESTS/'+name,status:'PENDING'};
 const f=path.join(base,name);
 if(reusable[id]){
  const proof=reusable[id],p=path.join(root,proof.path);
  try{
   const j=JSON.parse(fs.readFileSync(p,'utf8'));
   out.status=proof.check(j)?'REUSED_MATCHING_SHA':'BLOCKED_STALE_PROOF';
   out.evidence=proof.path;
   out.scope='Preuve existante directement attachée au SHA du seul index.html ; pas de nouvel essai ni double calcul.';
  }catch(e){out.status='BLOCKED_MISSING_PROOF';out.problem=String(e)}
  report.suites.push(out);console.log(out.id+' : '+out.status);continue;
 }
 if(!fs.existsSync(f)){out.status='FAIL';out.problem='Test absent';report.suites.push(out);continue}
 try{
  const v=cp.spawnSync(process.execPath,[f],{cwd:path.dirname(root),timeout:id==='regressions-n1'?420000:90000,encoding:'utf8',maxBuffer:3*1024*1024,env:{...process.env,FOH_PRODUCT_FILE:'index.html'}});
  out.durationMs=Date.now()-started;out.exitCode=v.status;out.stdoutTail=(v.stdout||'').slice(-2300);out.stderrTail=(v.stderr||'').slice(-1400);
  out.status=v.error||v.signal||v.status!==0?'FAIL':'PASS';
  if(v.error)out.problem=String(v.error);
 }catch(e){out.status='FAIL';out.problem=String(e)}
 if(sha(file)!==initial){out.status='FAIL';out.problem='SECURITE : le test a modifié index.html';report.suites.push(out);break}
 report.suites.push(out);
 console.log(out.id+' : '+out.status+' ('+out.durationMs+' ms)');
}
report.summary={total:suites.length,executed:report.suites.length,passed:report.suites.filter(x=>x.status==='PASS').length,reused:report.suites.filter(x=>x.status==='REUSED_MATCHING_SHA').length,blocked:report.suites.filter(x=>x.status.startsWith('BLOCKED')).length,failed:report.suites.filter(x=>x.status==='FAIL').length};
report.source.unchanged=sha(file)===initial;
fs.writeFileSync(path.join(root,'QA/N1/single-index-regression-campaign.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({summary:report.summary,sha:initial,failed:report.suites.filter(x=>x.status==='FAIL').map(x=>({id:x.id,problem:x.problem,tail:x.stderrTail?.slice(-320)}))}));
if(report.summary.failed||report.summary.blocked||report.summary.executed!==suites.length||!report.source.unchanged)process.exitCode=1;
