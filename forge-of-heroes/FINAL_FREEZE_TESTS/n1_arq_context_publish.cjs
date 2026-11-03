'use strict';
/* Install the verified contextual rule calculators into BOTH standalone HTML
 * products without modifying either FOH_ENGINE_BUNDLE or FOH_DB_JSON.
 * Inline packaging is required for offline usage of downloaded Forge HTML.
 */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const moduleSource=fs.readFileSync(path.join(root,'ENGINE/arquebusier_context_n1.js'),'utf8');
const uiSource=fs.readFileSync(path.join(root,'ENGINE/arquebusier_context_ui_n1.js'),'utf8');
const files=['index.html','FORGE_OF_HEROES_ATELIER_GUILTANAS_PRODUCT_MASTER.html'],write=process.argv.includes('--write');
function locate(html,id){
 const needle='id="'+id+'"',i=html.indexOf(needle);
 if(i<0)return null;
 const startTag=html.lastIndexOf('<script',i),start=html.indexOf('>',i)+1,end=html.indexOf('</script>',start);
 assert(startTag>=0&&startTag<i&&start>i&&end>start,'Malformed script '+id);
 return {startTag,start,end:end+9,content:html.slice(start,end)};
}
const block=(id,source)=>'<script id="'+id+'">\n'+source+'\n</script>';
const runtimeId='FOH_ARQ_CONTEXT_RUNTIME_N1',uiId='FOH_ARQ_CONTEXT_UI_N1';
const report={schema:'FOH_N1_CONTEXT_ACTIVATION',at:new Date().toISOString(),sourceBook:'COF2 Livre de base pages 62-65',status:'PASS',installMode:write?'WRITE':'VERIFY',products:[]};
assert(!moduleSource.includes('</script>')&&!uiSource.includes('</script>'),'Embedded script terminator forbidden');
for(const file of files){
 const fp=path.join(root,file),before=fs.readFileSync(fp,'utf8'),engine=locate(before,'FOH_ENGINE_BUNDLE')?.content,db=locate(before,'FOH_DB_JSON')?.content;
 assert(engine&&db,file+' must have an embedded engine and rules database');
 let after=before;
 for(const [id,src]of [[runtimeId,moduleSource],[uiId,uiSource]]){
  const markup=block(id,src),found=locate(after,id);
  if(found)after=after.slice(0,found.startTag)+markup+after.slice(found.end);
  else{
   const closing=after.lastIndexOf('</body>');
   assert(closing>=0,'No closing body in '+file);
   after=after.slice(0,closing)+markup+'\n'+after.slice(closing);
  }
 }
 assert.equal(locate(after,'FOH_ENGINE_BUNDLE')?.content,engine,'The production engine must not change');
 assert.equal(locate(after,'FOH_DB_JSON')?.content,db,'Rules DB must not change');
 assert.equal(locate(after,runtimeId)?.content.trim(),moduleSource.trim(),'Runtime embedded incorrectly');
 assert.equal(locate(after,uiId)?.content.trim(),uiSource.trim(),'UI embedded incorrectly');
 for(const id of [runtimeId,uiId])assert.equal(after.split('id="'+id+'"').length-1,1,'Duplicated '+id);
 if(write&&after!==before)fs.writeFileSync(fp,after,'utf8');
 if(!write)assert.equal(after,before,'HTML not synced to source: '+file);
 report.products.push({file,beforeSha256:sha(before),afterSha256:sha(after),engineSha256:sha(engine),databaseSha256:sha(db),changed:before!==after,readyForOffline:true});
}
fs.writeFileSync(path.join(root,'QA/N1/arquebusier-context-publish.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,write,products:report.products.map(x=>({file:x.file,changed:x.changed,sha:x.afterSha256,engine:x.engineSha256}))}));
