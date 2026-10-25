const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const source=fs.readFileSync(__dirname+'/../../entry.js','utf8'),root='https://example.test/atelier-guiltanas-apps/gestionnaire-combat-cof2/';
function run(path,remembered){let target,manifest={};const store=new Map(remembered?[['guiltanas_combat_last_entry_v1','bastide']]:[]);vm.runInNewContext(source,{URL,URLSearchParams,location:{href:root+path,replace:x=>target=x},localStorage:{getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)},document:{currentScript:{src:root+'entry.js'},addEventListener:(_,fn)=>fn(),querySelector:()=>manifest}});return {target,store,manifest};}
for(const path of ['', 'index.html','#key=example']){const r=run(path);assert.equal(new URL(r.target).searchParams.get('space'),'ba571de0-0000-4000-8000-000000000001');assert.equal(new URL(r.target).searchParams.get('source'),'bastide');if(path.startsWith('#'))assert.equal(new URL(r.target).hash,path);}
assert.ok(run('multi/',true).target);assert.equal(run('multi/',false).target,undefined);
const generic=run('multi/?space=11111111-1111-4111-8111-111111111111&source=hub',true);assert.equal(generic.target,undefined);assert.equal(generic.store.size,0);
const explicit=run('multi/?space=ba571de0-0000-4000-8000-000000000001&source=bastide');assert.ok(explicit.manifest.href.endsWith('/multi/bastide.install.webmanifest'));
for(const p of ['../../index.install.webmanifest','../bastide.install.webmanifest']){const m=JSON.parse(fs.readFileSync(__dirname+'/'+p));assert.ok(m.start_url.includes('source=bastide'));assert.ok(!m.start_url.includes('key='));}
console.log('PASS anciens liens, raccourcis, contexte Bastide, manifeste sans secret et isolation des autres hubs.');
