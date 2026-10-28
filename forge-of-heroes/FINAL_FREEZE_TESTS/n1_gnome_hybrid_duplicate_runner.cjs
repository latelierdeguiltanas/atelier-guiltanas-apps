'use strict';
const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs'),{load}=require('./forge_product_runner'),root=path.resolve(__dirname,'..'),fixture=require('../QA/N1/defects/gnome-hybrid-duplicate.json');
let count=0;
for(const file of ['index.html','FORGE_OF_HEROES_ATELIER_GUILTANAS_PRODUCT_MASTER.html']){
 const {db,engine}=load(root+'/'+file),T=db.tables,options=T.abilities_class.filter(a=>a.rank===1&&T.paths_class.some(p=>p.id===a.path_id&&p.classId==='class:ensorceleur:cof2-lb-2024'));
 for(const row of fixture.cases){const state=JSON.parse(JSON.stringify(row.state)),before=JSON.stringify(state),bad=engine.computeCharacterN1(state);assert.ok(bad.errors.length);assert.match(bad.errors.join(' '),/Don étrange.*différente/);assert.equal(JSON.stringify(state),before);
  const selected=new Set(state.voies.profilePathIds);const gift=options.find(a=>!selected.has(a.path_id));assert.ok(gift);state.peupleChoices.grantedAbilityId=gift.id;const good=engine.computeCharacterN1(state);assert.equal(good.errors.length,0,good.errors.join(' | '));const acquired=good.sticky.acquiredAbilities;assert.equal(new Set(acquired.map(a=>a.id)).size,acquired.length);assert.ok(acquired.some(a=>a.id===gift.id));for(const p of selected)assert.ok(acquired.some(a=>a.pathId===p&&a.rank===1));const payload=engine.createHeroSavePayload(state,good.sticky.characterState,{id:'gnome-proof'}),again=engine.computeCharacterN1(engine.restoreHeroSavePayload(JSON.parse(JSON.stringify(payload))).draft);assert.equal(again.errors.length,0);assert.equal(new Set(again.sticky.acquiredAbilities.map(a=>a.id)).size,again.sticky.acquiredAbilities.length);count++;
 }
}
console.log('PASS '+count+' Gnome hybrid cases across both products: duplicate rejected for the right reason, alternative gift accepted, both chosen paths retained, immutable input and save/reload.');
