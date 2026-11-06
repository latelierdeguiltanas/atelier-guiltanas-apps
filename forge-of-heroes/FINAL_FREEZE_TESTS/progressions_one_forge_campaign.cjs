'use strict';
// N2/N3 = modules de la SEULE Forge publiée, jamais un deuxième HTML à certifier.
// Tests sur six fixtures Bastide et deux variantes Halfelin ; non généralisables aux 14 profils.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),cwd=path.resolve(root,'..'),sha=s=>crypto.createHash('sha256').update(fs.readFileSync(s)).digest('hex');
const source=path.join(root,'index.html'),before=sha(source);
const cases=[
 {id:'n2-six-heros',cmd:'progression_runner.js',scope:'six héros de Bastide; choix N2 et N1 conservé'},
 {id:'n2-halfelin-sorcier',cmd:'halfelin_n2_interactive.cjs',args:['--sorcier'],scope:'Halfelin hybride Sorcier principal N2'},
 {id:'n2-halfelin-moine',cmd:'halfelin_n2_interactive.cjs',scope:'Halfelin hybride Moine principal N2'},
 {id:'n3-six-heros',cmd:'level3_runner.cjs',scope:'six héros N3 et calculs de niveau'},
 {id:'n3-tous-choix-fixtures',cmd:'bastide_n3_all_choices_runner.cjs',scope:'options légales de six fixtures, pas toutes les combinaisons N3'},
 {id:'n3-interface-dom',cmd:'level3_ui_runner.cjs',scope:'parcours DOM N3 / Hub simulé, pas Android réel'},
 {id:'n3-hub-simulation',cmd:'level3_hub_runner.cjs',scope:'simulateur backend / droits, pas serveur connecté'},
 {id:'n3-dialogues',cmd:'bastide_n3_choice_dialogs.cjs',scope:'boîtes de choix vénérable / monture, DOM simulé'}
];
const rows=[];for(const item of cases){
 const file=path.join(root,'FINAL_FREEZE_TESTS',item.cmd),t=Date.now(),r=cp.spawnSync(process.execPath,[file,...(item.args||[])],{cwd,encoding:'utf8',timeout:100000,maxBuffer:3*1024*1024});
 const row={id:item.id,scope:item.scope,script:'FINAL_FREEZE_TESTS/'+item.cmd,args:item.args||[],status:r.status===0&&!r.error?'PASS':'FAIL',ms:Date.now()-t,stdoutTail:String(r.stdout||'').slice(-1600),stderrTail:String(r.stderr||r.error||'').slice(-1200)};
 rows.push(row);console.log(row.id+' '+row.status);
 if(sha(source)!==before){row.status='FAIL';row.stderrTail+=' / FATAL : index.html modifié pendant le test';break}
}
const report={schema:'FOH_PROGRESSIONS_TARGETED_TESTS_V1',at:new Date().toISOString(),sourceProduct:'forge-of-heroes/index.html',indexSha256:before,sourceUnchanged:sha(source)===before,scope:'N2/N3 actuels : six personnages Bastide et Halfelin Moine/Sorcier. Aucune preuve de couverture universelle de tous les peuples, 14 profils, hybrides, PDF et mobile.',passed:rows.filter(x=>x.status==='PASS').length,failed:rows.filter(x=>x.status==='FAIL').length,total:cases.length,cases:rows};
fs.mkdirSync(path.join(root,'QA/N3/lot2'),{recursive:true});fs.writeFileSync(path.join(root,'QA/N3/lot2/forge-unique-progression-retest.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({passed:report.passed,total:report.total,failed:report.failed,indexSha256:before}));
if(report.failed||report.passed!==cases.length||!report.sourceUnchanged)process.exitCode=1;
