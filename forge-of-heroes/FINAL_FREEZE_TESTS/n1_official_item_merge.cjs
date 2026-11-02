'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),shards=path.join(root,'QA/N1/native-item-shards'),rows=[];
for(let i=0;i<8;i++){const f=path.join(shards,'race-'+i+'.json');if(!fs.existsSync(f))throw Error('missing native people '+i);rows.push(JSON.parse(fs.readFileSync(f,'utf8')));}
const source=rows[0].indexSha256;
if(rows.some(x=>x.indexSha256!==source)||new Set(rows.map(x=>x.raceId)).size!==8)throw Error('mismatched source/races');
const all={schema:'FOH_N1_OFFICIAL_BY_ITEM',generatedAt:new Date().toISOString(),sourceCommit:rows[0].sourceCommit,indexSha256:source,peoples:[],profiles:[],summary:{attempted:0,accepted:0,refused:0,failed:0,replays:0},limitations:['This is a full cross-product of official baseline paths, not all advanced ages, circumstances, characteristic methods, persistent option alternatives or PDFs.','Refusals are not converted into successful creations before a separate independent legality classification.','Underlying expected racial modifiers use the stored people schema; independent comparison to source-rule numeric oracles is a distinct gate.'],sourceFiles:['QA/N1/matrix.json','QA/N1/lot10/people-source.json','QA/N1/profile-checkpoint.json','QA/N1/version-parity.json']};
const byProfile=new Map;
for(const race of rows){
 const x={id:race.raceId,attempts:{},refusalReasons:race.refusals,assertions:race.assertions,profiles:race.profiles},total={attempted:0,accepted:0,refused:0,failed:0,replays:0};
 for(const [mode,c] of Object.entries(race.counts)){x.attempts[mode]=c;for(const k of Object.keys(total))total[k]+=c[k]||0;}
 x.total=total;x.hasAssertionFailure=!!total.failed;x.refusalsUnclassified=total.refused>0;x.status=total.failed?'FAILED':total.refused?'PARTIAL_LEGALITY_REVIEW':'BASELINE_PASS';
 all.peoples.push(x);for(const k of Object.keys(total))all.summary[k]+=total[k];
 for(const [id,entry] of Object.entries(race.profiles)){let p=byProfile.get(id);if(!p){p={id,attempted:0,standard:0,hybridPrimary:0,hybridSecondary:0,noProfilePathPairs:0,rejected:0,failures:0,peoples:[]};byProfile.set(id,p);}for(const k of ['attempted','standard','hybridPrimary','hybridSecondary','noProfilePathPairs','rejected','failures'])p[k]+=entry[k]||0;p.peoples.push({id:race.raceId,...entry});}
}
for(const p of byProfile.values()){p.scopeComplete=p.attempted>0&&p.peoples.length===8;p.status=p.failures?'FAILED':p.rejected?'PARTIAL_LEGALITY_REVIEW':'BASELINE_PASS';all.profiles.push(p);}
all.profiles.sort((a,b)=>a.id.localeCompare(b.id));all.peoples.sort((a,b)=>a.id.localeCompare(b.id));
all.summary.officialProfiles=all.profiles.length;all.summary.officialPeoples=all.peoples.length;
all.summary.allNativePeopleAndProfileCasesExecuted=all.peoples.length===8&&all.profiles.length===14;
const out=path.join(root,'QA/N1/native-items.json');fs.writeFileSync(out,JSON.stringify(all,null,2)+'\n');console.log(JSON.stringify({summary:all.summary,races:all.peoples.map(x=>({race:x.id,attempted:x.total.attempted,accepted:x.total.accepted,refused:x.total.refused,failed:x.total.failed})),profiles:all.profiles.map(x=>({profile:x.id,attempted:x.attempted,refused:x.rejected,failed:x.failures}))}));
if(!all.summary.allNativePeopleAndProfileCasesExecuted||all.summary.failed)process.exitCode=1;