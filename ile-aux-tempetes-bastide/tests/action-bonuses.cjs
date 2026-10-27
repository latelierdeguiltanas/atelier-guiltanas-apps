const assert=require('node:assert/strict');
const {run}=require('./sheets-runtime.cjs');
(async()=>{
 const w=await run('prepotante','simple');
 const html=w.__fixture.nodes.get('play').innerHTML;
 assert.match(html,/Bonus aux actions/);
 assert.match(html,/Crochetage/);
 assert.match(html,/Crochetage <b>\+3<\/b>/);
 assert.doesNotMatch(html,/rang 1 \+ 2|À ajouter seulement|Voie du roublard ·/);
 assert.doesNotMatch(html,/Tests et actions<\/strong><p>Le voleur augmente sa valeur de CHA/);
 assert.match(w.__fixture.nodes.get('stats').innerHTML,/Bonus aux actions/);
 w.__sheetTest.setView('complete');
 assert.match(w.__fixture.nodes.get('play').innerHTML,/Crochetage/);
 console.log('OK — actions, rang acquis, source et deux vues');
})().catch(e=>{console.error(e);process.exitCode=1});
