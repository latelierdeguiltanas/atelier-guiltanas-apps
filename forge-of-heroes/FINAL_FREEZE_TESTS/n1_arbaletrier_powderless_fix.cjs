'use strict';
// COF2 p.62: powderless variant must replace firearms, including GM-approved swaps.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),write=process.argv.includes('--write'),hash=x=>crypto.createHash('sha256').update(x).digest('hex'),rows=[];
for(const file of ['index.html','FORGE_OF_HEROES_ATELIER_GUILTANAS_PRODUCT_MASTER.html']){
 const fp=path.join(root,file),before=fs.readFileSync(fp,'utf8'),match=before.match(/(<script[^>]*id="FOH_DB_JSON"[^>]*>)([\s\S]*?)(<\/script>)/);assert(match);
 const db=JSON.parse(match[2]),original=JSON.stringify(db),rule=db.tables.profile_rules.find(r=>r.profileId==='class:arbaletrier:cof2-variant-2024');assert(rule);
 const mw=rule.masteries.weapons,previous=mw.forbiddenCategories;
 mw.forbiddenCategories=[...new Set([...(previous||[]),'powder'])];const updated=JSON.stringify(db);
 if(previous===undefined)delete mw.forbiddenCategories;else mw.forbiddenCategories=previous;
 assert.equal(JSON.stringify(db),original,'No other rule or Companion data may change');
 const after=before.replace(match[0],match[1]+updated+match[3]);
 const engine=h=>h.match(/<script[^>]*id="FOH_ENGINE_BUNDLE"[^>]*>([\s\S]*?)<\/script>/)[1];assert.equal(engine(after),engine(before));
 if(write)fs.writeFileSync(fp,after);else assert.equal(after,before,'Powderless rule not packaged '+file);
 rows.push({file,beforeSha256:hash(before),afterSha256:hash(after),scope:'Arbalétrier.masteries.weapons.forbiddenCategories only',engineUnchanged:true});
}
console.log(JSON.stringify({status:'PASS',write,rows}));
