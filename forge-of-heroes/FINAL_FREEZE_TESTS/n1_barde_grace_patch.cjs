'use strict';

const {createHash}=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const before='3358aa4fcbd516287f051f3707f8fdf59ac7544b8a69ebc1c072e9244c01e4cd';
const after='250274e9d2879bc9acde9043b56bb670de6c697a4c9bb8920c371e1393951759';
const sourceId='ability:grace-feline:classpath:voie-du-saltimbanque:class-barde:cof2-lb-2024:rank2:cof2-lb-2024';
const bonus=[{value:3,tests:['dance','mime','juggling']}];
const sha=text=>createHash('sha256').update(text).digest('hex');

function change(html,reverse){
 const marker=/(<script id="FOH_DB_JSON"[^>]*>)([\s\S]*?)(<\/script>)/;
 const m=html.match(marker);
 assert(m,'Base Forge manquante');
 const db=JSON.parse(m[2]);
 const rows=db.tables.abilities_class.filter(a=>a.id===sourceId);
 assert.equal(rows.length,1);
 const mechanics=rows[0].mechanics;
 if(reverse){
  assert.deepEqual(mechanics.skillBonuses,bonus);
  delete mechanics.skillBonuses;
 }else{
  assert.equal(mechanics.skillBonuses,undefined);
  mechanics.skillBonuses=bonus;
 }
 return html.slice(0,m.index+m[1].length)+JSON.stringify(db)+html.slice(m.index+m[1].length+m[2].length);
}

// Only the byte-for-byte known update can retain earlier profile-specific evidence.
function previousForUnaffectedProfiles(html){
 if(sha(html)!==after)return null;
 const previous=change(html,true);
 assert.equal(sha(previous),before);
 return previous;
}

if(require.main===module){
 const filename=path.resolve(__dirname,'../index.html');
 const original=fs.readFileSync(filename,'utf8');
 assert.equal(sha(original),before);
 const fixed=change(original,false);
 assert.equal(sha(fixed),after);
 assert.equal(previousForUnaffectedProfiles(fixed),original);
 fs.writeFileSync(filename,fixed);
 console.log('Grâce féline : ajout du seul bonus de compétence du Barde.');
}
module.exports={previousForUnaffectedProfiles};
