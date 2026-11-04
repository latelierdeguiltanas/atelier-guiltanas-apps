'use strict';
// An external ability granted by a creation choice must be exported with its full text,
// without acquiring or checking the rest of that external pathway.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),root=path.resolve(__dirname,'..'),write=process.argv.includes('--write'),sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const begin='// FOH_GRANTED_ANNEX_BEGIN',end='// FOH_GRANTED_ANNEX_END';
const wrapper=`${begin}
function annexPaths(st,s,d){
 const paths=baseAnnexPaths(st,s,d),shown=new Set(paths.flatMap(p=>p.rows.map(a=>a.id))),groups=new Map();
 for(const owned of s.acquiredAbilities||[]){
  if(!owned.grantedByAbilityId||shown.has(owned.id))continue;
  const pathId=owned.pathId||owned.path_id;
  if(!pathId)continue;
  const row=characterCatalog(pathId,s).find(a=>a.id===owned.id);
  if(!row)continue;
  if(!groups.has(pathId))groups.set(pathId,{pathId,kind:'Capacité accordée',retained:false,rows:[]});
  groups.get(pathId).rows.push(row);shown.add(row.id);
 }
 return paths.concat([...groups.values()]);
}
${end}
`;
const rows=[];
for(const file of ['index.html','progression/official-pdf-engine.js']){const fp=path.join(root,file),before=fs.readFileSync(fp,'utf8');let after=before;
 if(after.includes(begin)){const a=after.indexOf(begin),b=after.indexOf(end,a);assert(b>a);after=after.slice(0,a)+after.slice(b+end.length+1);}
 after=after.replace('function baseAnnexPaths(st,s,d){','function annexPaths(st,s,d){');
 const anchor='function annexPaths(st,s,d){';assert.equal(after.split(anchor).length-1,1);after=after.replace(anchor,'function baseAnnexPaths(st,s,d){');
 assert.equal(after.split('async function appendPathAnnex(').length-1,1);after=after.replace('async function appendPathAnnex(',wrapper+'async function appendPathAnnex(');
 if(file.endsWith('.html'))for(const id of ['FOH_ENGINE_BUNDLE','FOH_DB_JSON']){const re=new RegExp('<script[^>]*id="'+id+'"[^>]*>([\\s\\S]*?)<\\/script>');assert.equal(after.match(re)[1],before.match(re)[1]);}
 if(write)fs.writeFileSync(fp,after);else assert.equal(after,before,'Granted annex not packaged '+file);
 rows.push({file,beforeSha256:sha(before),afterSha256:sha(after)});
}
console.log(JSON.stringify({status:'PASS',write,rows}));
