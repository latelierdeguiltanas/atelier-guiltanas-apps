'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const root=path.resolve(__dirname,'..');
const baseline='250274e9d2879bc9acde9043b56bb670de6c697a4c9bb8920c371e1393951759';
const hash=s=>createHash('sha256').update(s).digest('hex');
const file=path.join(root,'index.html');
const runtime=fs.readFileSync(path.join(root,'rules/ability-runtime.js'),'utf8').trimEnd();
function bounds(html){
 const start=html.indexOf("(function(root){'use strict';",html.indexOf('id="FOH_ENGINE_BUNDLE"'));
 const closing="})(typeof window==='undefined'?globalThis:window);";
 const last=html.indexOf(closing,start);
 assert(start>=0&&last>start,'Module du moteur de pouvoirs absent');
 return [start,last+closing.length];
}
function apply(html){
 assert.equal(hash(html),baseline,'Version de référence Forge différente');
 const [start,end]=bounds(html);
 return html.slice(0,start)+runtime+html.slice(end);
}
if(require.main===module)fs.writeFileSync(file,apply(fs.readFileSync(file,'utf8')));
module.exports={apply,bounds,baseline,hash};
