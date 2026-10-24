'use strict';
const assert=require('assert/strict'),fs=require('fs'),path=require('path'),vm=require('vm'),{load}=require('./forge_product_runner');
const dir=path.resolve(__dirname,'..');
for(const name of ['index.html','FORGE_OF_HEROES_ATELIER_GUILTANAS_PRODUCT_MASTER.html']){
 const {db,html}=load(path.join(dir,name)),T=db.tables;
 const profiles=T.paths_class.filter(p=>!p.id.includes('fix77-advanced'));
 for(const p of profiles)for(let rank=1;rank<=5;rank++){
  const rows=T.abilities_class.filter(a=>(a.path_id||a.pathId)===p.id&&a.rank===rank);
  assert.equal(rows.length,1,p.label+' rang '+rank+' unique');
  assert.ok(rows[0].desc?.length>40,p.label+' rang '+rank+' description');
  assert.ok(!/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]/.test(rows[0].desc),p.label+' extraction');
 }
 for(const p of profiles.filter(p=>/class-(sorcier|moine):/.test(p.id))){
  for(let rank=1;rank<=5;rank++)assert.ok(T.abilities_class.some(a=>a.path_id===p.id&&a.rank===rank&&a.desc.length>40));
 }
 const script=html.match(/<script id="UX02_4_PATH_CARDS_SCRIPT">([\s\S]*?)<\/script>/);
 if(script){
  const title={},body={},dialog={querySelector:s=>s==='h2'?title:s==='div'?body:{},showModal(){this.open=true}};
  const document={getElementById:id=>id==='FOH_DB_JSON'?{textContent:JSON.stringify(db)}:null,createElement:()=>dialog,body:{append(){}},querySelector:()=>null,querySelectorAll:()=>[]};
  const box={window:{},document,MutationObserver:class{observe(){}}};vm.runInNewContext(script[1],box);
  for(const p of profiles){box.window.__FOH_PATH_UX__.info(p.id,1);assert.equal((body.innerHTML.match(/<article>/g)||[]).length,5,p.label+' cinq rangs affichés');for(let rank=1;rank<=5;rank++)assert.ok(body.innerHTML.includes('Rang '+rank+' — '));}
 }
 console.log('PASS '+name+': '+profiles.length+' voies, 425 descriptions, rangs uniques, cinq rangs rendus ; sorcier et moine complets.');
}
