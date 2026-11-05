'use strict';
// COF2 p.76: +1 ranged damage with daggers AND knives at R1.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),root=path.resolve(__dirname,'..'),write=process.argv.includes('--write'),hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const id='ability:doigts-agiles:classpath:voie-du-roublard:class-voleur:cof2-lb-2024:rank1:cof2-lb-2024';
const rows=[];
for(const file of ['index.html','progression/pdf-labels.json']){
 const fp=path.join(root,file),before=fs.readFileSync(fp,'utf8'),embedded=file.endsWith('.html'),match=embedded?before.match(/(<script[^>]*id="FOH_DB_JSON"[^>]*>)([\s\S]*?)(<\/script>)/):null,db=JSON.parse(embedded?match[2]:before),T=db.tables||db;
 const a=T.abilities_class.find(a=>a.id===id);assert(a);const original=JSON.stringify(db),effect=a.mechanics.effects.find(e=>e.type==='weapon_damage_bonus'&&e.mode==='ranged');assert(effect&&effect.value===1&&effect.weaponIds.includes('weapon:dagger'));
 const old=effect.weaponIds;effect.weaponIds=[...new Set([...old,'weapon:throwing-knives'])];const updated=JSON.stringify(db,undefined,embedded?undefined:2);effect.weaponIds=old;assert.equal(JSON.stringify(db),original,'Unrelated rules and source text must stay identical');
 const after=embedded?before.replace(match[0],match[1]+updated+match[3]):updated+'\n';
 if(embedded){const engine=h=>h.match(/<script[^>]*id="FOH_ENGINE_BUNDLE"[^>]*>([\s\S]*?)<\/script>/)[1];assert.equal(engine(after),engine(before));}
 if(write)fs.writeFileSync(fp,after);else assert.equal(after,before,'Knives bonus not packaged '+file);
 rows.push({file,beforeSha256:hash(before),afterSha256:hash(after)});
}
console.log(JSON.stringify({status:'PASS',write,source:'Livre de base p.76',rows}));
