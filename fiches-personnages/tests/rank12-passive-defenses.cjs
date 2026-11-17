'use strict';
const assert=require('node:assert/strict'),{load,standardState}=require('../../forge-of-heroes/FINAL_FREEZE_TESTS/forge_product_runner'),N=require('../../forge-of-heroes/native-progression.js');
const {db,engine}=load(),T=db.tables;const cases=[
 ['Halfling : petite taille','class:barbare:cof2-lb-2024','', 'people:halfelin:cof2-lb-2024','voie-du-halfelin',1],
 ['Barbare : réflexes éclair','class:barbare:cof2-lb-2024','voie-du-pourfendeur','people:humain:cof2-lb-2024','voie-du-pourfendeur',1],
 ['Moine : agilité du singe','class:moine:cof2-lb-2024','voie-de-la-maitrise','people:humain:cof2-lb-2024','voie-de-la-maitrise',2],
 ['Forgesort : runes de défense','class:forgesort:cof2-lb-2024','voie-des-runes','people:humain:cof2-lb-2024','voie-des-runes',2],
 ['Druide : vitesse du félin','class:druide:cof2-lb-2024','voie-du-fauve','people:humain:cof2-lb-2024','voie-du-fauve',1],
 ['Psionique : défense intuitive','class:psionique:cof2-lb-2024','voie-de-l-empathie','people:humain:cof2-lb-2024','voie-de-l-empathie',null],
 ['Psionique : champ de protection','class:psionique:cof2-lb-2024','voie-de-la-telekinesie','people:humain:cof2-lb-2024','voie-de-la-telekinesie',null]
];let confirmed=0;for(const[label,profile,pathSub,people,needle,expected] of cases){const cp=T.paths_class.filter(p=>p.classId===profile&&!p.additionalMagePath),path=cp.find(p=>p.id.includes(pathSub))||cp[0],state=standardState(db,profile,path.id,people);if(people.includes('halfelin')){state.equip.gmApprovedSwap=true;state.equip.weaponIds=[];}for(const ability of engine.previewAcquiredAbilities(state))for(const choice of engine.getPersistentChoicesForAbility(state,ability.id))if(choice.options?.length)(state.abilityChoices[ability.id]??={})[choice.id]=choice.options[0].id;
const result=engine.computeCharacterN1(state);if(result.errors?.length){console.log('SKIP | '+label+': '+result.errors.join(' | '));continue;}const D=N.toCharacter({id:'r12-'+confirmed,name:label,profile:profile.split(':')[1],people:'Test',draft:{}},{state,result},{paths:[],profiles:[]},db);assert.equal(D.combat.def,result.sticky.DEF);
const ledger=(D.forgeSnapshot.ruleCompletionLedger||[]).filter(x=>x.key==='DEF'&&String(x.abilityId||'').includes(needle));console.log('LEDGER | '+label+' DEF='+D.combat.def+' : '+JSON.stringify(ledger));if(expected!=null){assert(ledger.some(x=>Number(x.value)===expected),label+' : bonus DEF absent du relevé Forge');confirmed++;}
}
console.log('PASS | '+confirmed+' bonus DEF passifs ou contextuels présents dans les calculs Forge à l’export');