'use strict';
/* Safe installation in BOTH standalone HTML products. Preserves engine/DB bytes;
 * no external dependency is introduced for offline use of the saved HTML file.
 */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const moduleSource=fs.readFileSync(path.join(root,'ENGINE/arquebusier_context_n1.js'),'utf8'),uiSource=fs.readFileSync(path.join(root,'ENGINE/arquebusier_context_ui_n1.js'),'utf8');
const files=['index.html','FORGE_OF_HEROES_ATELIER_GUILTANAS_PRODUCT_MASTER.html'],write=process.argv.includes('--write');
const extract=(html,id)=>{const rx=new RegExp('<script\\b[^>]*\\bid=["\\\']'+id+'["\\\'][^>]*>([\\s\\S]*?)<\\/script>','i');return rx.exec(html)?.[1]??null;};
const block=(id,content)=>'<script id="'+id+'">\n'+content.replace(/<\\/script>/gi,'<\\/script>')+'\n</script>';
const runtimeId='FOH_ARQ_CONTEXT_RUNTIME_N1',uiId='FOH_ARQ_CONTEXT_UI_N1',report={schema:'FOH_N1_CONTEXT_ACTIVATION',at:new Date().toISOString(),sourceBook:'COF2 Livre de base pages 62-65',status:'PASS',installMode:write?'WRITE':'VERIFY',products:[]};
assert(!moduleSource.includes('</script>')&&!uiSource.includes('</script>'),'Embedded script terminator forbidden');
for(const file of files){
 const fp=path.join(root,file),before=fs.readFileSync(fp,'utf8'),engine=extract(before,'FOH_ENGINE_BUNDLE'),db=extract(before,'FOH_DB_JSON');
 assert(engine&&db,file+' must have embedded engine and database');
 let after=before;
 for(const [id,src]of [[runtimeId,moduleSource],[uiId,uiSource]]){
  const markup=block(id,src),rx=new RegExp('<script\\b[^>]*\\bid=["\\\']'+id+'["\\\'][^>]*>[\\s\\S]*?<\\/script>','i');
  if(rx.test(after))after=after.replace(rx,markup);
  else {assert(/<\/body>/i.test(after),'Expected closing body');after=after.replace(/<\/body>/i,markup+'\n</body>');}
 }
 assert.equal(extract(after,'FOH_ENGINE_BUNDLE'),engine,'Never change FOH engine bundle');
 assert.equal(extract(after,'FOH_DB_JSON'),db,'Never change rules database');
 assert.equal(extract(after,runtimeId)?.trim(),moduleSource.trim(),'Module must be embedded exactly');
 assert.equal(extract(after,uiId)?.trim(),uiSource.trim(),'UI must be embedded exactly');
 for(const id of [runtimeId,uiId])assert.equal(after.split('id="'+id+'"').length-1,1,'Duplicate script '+id);
 if(write&&after!==before)fs.writeFileSync(fp,after,'utf8');
 if(!write)assert.equal(after,before,'HTML not synced to audited modules: '+file);
 report.products.push({file,beforeSha256:sha(before),afterSha256:sha(after),engineSha256:sha(engine),databaseSha256:sha(db),changed:before!==after,readyForOffline:true});
}
fs.writeFileSync(path.join(root,'QA/N1/arquebusier-context-publish.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,write,products:report.products.map(x=>({file:x.file,changed:x.changed,sha:x.afterSha256,engine:x.engineSha256}))}));
