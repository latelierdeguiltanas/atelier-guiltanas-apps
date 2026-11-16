const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root={FOHPlayerLibrary:{}};new Function('window',fs.readFileSync(path.join(__dirname,'../cloud.js'),'utf8'))(root);
const merge=root.GuiltanasPlayerCloud.mergeVault,entry=(id,n,level=1)=>({id,system:'cof2',character:{name:id,level,n},play:{hp:n},revision:1,updatedAt:'a'}),pack=entries=>({format:'GUILTANAS_PLAYER_LIBRARY',version:1,entries});
const A=entry('a',1),B=entry('b',1),P=entry('paladin',1),A2=entry('a',2),A3=entry('a',3),B2=entry('b',2);
let p=merge(pack({a:A,b:B}),pack({a:A2,b:B,p:P}),pack({a:A,b:B2}));assert.equal(p.conflicts.length,0);assert.deepEqual(p.remote.entries,{a:A2,b:B2,p:P});
p=merge(pack({a:A,b:B}),pack({a:A2,b:B,p:P}),pack({a:A3,b:B2}));assert.equal(p.conflicts.length,1);assert.deepEqual(p.remote.entries,{a:A3,b:B2,p:P});assert.deepEqual(p.device.entries,{a:A2,b:B2,p:P});assert.deepEqual(p.baseline.entries.a,A);
p=merge(p.baseline,p.device,p.remote);assert.equal(p.conflicts.length,1);assert.deepEqual(p.remote.entries.a,A3);
p=merge(pack({a:A}),pack({a:{...A,revision:2,updatedAt:'later'},p:P}),pack({a:A3}));assert.equal(p.conflicts.length,0);assert.deepEqual(p.remote.entries.a,A3);
p=merge(pack({a:A}),pack({a:A,p:P}),pack({a:A}));assert.deepEqual(p.remote.entries.p,P);
p=merge(pack({a:A,p:P}),pack({a:A,p:P}),pack({a:A}));assert.deepEqual(p.remote.entries.p,P);
p=merge(pack({}),pack({a:A2}),pack({a:A3}));assert.equal(p.conflicts.length,1);assert.deepEqual(p.device.entries.a,A2);
p=merge(pack({a:A}),pack({a:entry('a',1,2)}),pack({a:A2}));assert.equal(p.conflicts.length,1);
p=merge(pack({a:A}),pack({a:{...A,character:{n:1,level:1,name:'a'}}}),pack({a:A}));assert.equal(p.conflicts.length,0);
console.log('PASS 9 vault merge scenarios: independent additions, overlapping edits, stale baseline and canonical ordering.');
const base=entry('mix',1),local={...base,play:{hp:0}},remote={...base,appearance:{portrait:'test'}};p=merge(pack({mix:base}),pack({mix:local}),pack({mix:remote}));assert.equal(p.conflicts.length,0);assert.equal(p.device.entries.mix.play.hp,0);assert.equal(p.remote.entries.mix.appearance.portrait,'test');p=merge(pack({mix:base}),pack({mix:{...base,play:{hp:0}}}),pack({mix:{...base,play:{hp:2}}}));assert.equal(p.conflicts.length,1);console.log('PASS | indépendance apparence/partie, conflit vrai conservé');

// Canonical JSONB ordering must not cause a new play revision; stale windows must not overwrite.
const L=require('../library.js'),storage=new class{constructor(){this.m=new Map()}getItem(k){return this.m.get(k)??null}setItem(k,v){this.m.set(k,v)}};const char={id:'syncqa',name:'Sync QA',level:1,stats:{FOR:1,AGI:1,CON:1,PER:1,INT:1,VOL:1,CHA:1},combat:{pvMax:12,pmMax:2,pcMax:2,recoveryMax:4,def:13,init:10,contact:2,distance:2,magic:2},paths:[],attacks:[],equipment:[]};const first=L.upsert(char,{storage}),saved=L.savePlay(first.id,{hp:10,uses:{a:1,b:2}},storage,first.revision,0),again=L.savePlay(first.id,{uses:{b:2,a:1},hp:10},storage,first.revision,saved.playRevision);assert.equal(again.playRevision,saved.playRevision);assert.throws(()=>L.savePlay(first.id,{hp:9},storage,first.revision,0),/autre fenêtre/);assert.equal(L.read(storage).data.entries[first.id].play.hp,10);console.log('PASS | ordre JSON indifférent et garde contre fenêtre obsolète');
