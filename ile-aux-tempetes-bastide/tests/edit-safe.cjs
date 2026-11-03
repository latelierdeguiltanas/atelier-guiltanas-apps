const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const src=fs.readFileSync(__dirname+'/../personnages/fiche.js','utf8');
const listeners={},input={value:'Loup des brumes',selectionStart:8,matches:()=>true},other={matches:()=>false};let paints=0;
const root={contains:e=>e===input};const document={activeElement:input,getElementById:()=>root,addEventListener:(name,cb)=>listeners[name]=cb};
// A separate context uses an explicit paint callback so repetitions model 10 s polling.
const w={document,setTimeout:cb=>cb(),paint:()=>paints++};vm.createContext(w);vm.runInContext(src.slice(src.indexOf('const pendingSheetPaints='),src.indexOf('renderBag=protectSheetPaint'))+'\nthis.safe=protectSheetPaint("bag",paint);this.flush=flushSheetPaints;',w);
for(let n=0;n<20;n++)w.safe();assert.equal(paints,0);assert.equal(input.value,'Loup des brumes');assert.equal(input.selectionStart,8);
document.activeElement=other;w.flush();assert.equal(paints,1);w.safe();assert.equal(paints,2);
assert.ok(src.includes("document.addEventListener('change',async event=>{if(event.target.id!=='companion-name'"));assert.ok(!src.includes('companionSaveTimer'));
console.log('PASS 20 rafraîchissements différés pendant saisie, valeur et curseur conservés, une actualisation après validation, loup enregistré sur change.');
