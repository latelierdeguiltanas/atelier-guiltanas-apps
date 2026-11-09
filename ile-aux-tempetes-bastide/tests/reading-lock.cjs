/* Bastide — regression tests for reader/editor-safe background polling.
   Run: node ile-aux-tempetes-bastide/tests/reading-lock.cjs */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const sheet=fs.readFileSync(path.join(__dirname,'../personnages/fiche.js'),'utf8');
const bar=fs.readFileSync(path.join(__dirname,'../assets/session-bar.js'),'utf8');
const start=sheet.indexOf('const pendingSheetPaints=new Map();');
const end=sheet.indexOf('\nrenderAll();\nactivatePage(',start);
assert.ok(start>0&&end>start,'Reader guard must exist');
const source=sheet.slice(start,end);
const ids=['bag','companion','notes','rest','atelier','play','abilities','stats','shared-contracts','shared-confidences','resources'];
const listeners={},counts={},emitted=[],scheduled=[];
let activePage='bag',detailsOpen=false,focused=false;
const roots=Object.fromEntries(ids.map(id=>[id,{
  isConnected:true,firstElementChild:true,
  closest:()=>({classList:{contains:x=>x==='active'&&activePage===id}}),
  contains:x=>x?.owner===id,
  querySelector:()=>id==='bag'&&detailsOpen?{}:null
}]));
const document={
  getElementById:id=>roots[id],
  get activeElement(){return focused?{owner:'bag',matches:x=>x.includes('textarea')}:null},
  addEventListener:(type,fn)=>((listeners[type]??=[]).push(fn))
};
const window={dispatchEvent:event=>emitted.push(event.type)};
const Event=class {constructor(type){this.type=type}};
const stubNames=['renderBag','renderCompanion','renderNotes','renderRest','renderAtelier','renderPlay','renderAbilities','renderStats','renderShared','renderResources'];
const stubs=stubNames.map(id=>(...args)=>{counts[id]=(counts[id]||0)+1});
const load=new Function('document','window','setTimeout','Event',...stubNames,source+'\nreturn {renderBag,renderNotes,renderAbilities,flushSheetPaints,pendingSheetPaints};');
const guard=load(document,window,fn=>scheduled.push(fn),Event,...stubs);
const flushTimers=()=>{while(scheduled.length)scheduled.shift()()};
guard.renderBag();
assert.equal(counts.renderBag,1);
detailsOpen=true;
guard.renderBag();guard.renderBag();
assert.equal(counts.renderBag,1,'The open inventory book must not be rebuilt on polling');
listeners.focusout[0]();flushTimers();
assert.equal(counts.renderBag,1,'Losing text focus must not replace the still-open book');
detailsOpen=false;
listeners.toggle[0]({target:{matches:()=>true}});flushTimers();
assert.equal(counts.renderBag,2,'Closing the book must flush one latest repaint');
assert.equal(guard.pendingSheetPaints.size,0);
assert.ok(emitted.includes('bastide-reading-unlocked'));
focused=true;
guard.renderBag();
assert.equal(counts.renderBag,2,'Active editing must preserve its DOM node');
focused=false;
listeners.focusout[0]();flushTimers();
assert.equal(counts.renderBag,3,'The edit must repaint after blur');
detailsOpen=true;activePage='play';
guard.renderBag();
assert.equal(counts.renderBag,4,'A hidden previously opened book cannot block active pages');
activePage='notes';
guard.renderNotes();
assert.equal(counts.renderNotes||0,0,'Long-form note reading freezes the notes root');
activePage='play';guard.flushSheetPaints();
assert.equal(counts.renderNotes,1,'Leaving the reading page flushes pending notes');
activePage='abilities';guard.renderAbilities();
assert.equal(counts.renderAbilities,1,'Ability actions must remain refreshable when no detail is open');
activePage='bag';detailsOpen=true;guard.renderBag({force:true});
assert.equal(counts.renderBag,5,'An intentional user action can explicitly repaint');
assert.ok(sheet.includes('signature===lastBagSignature'),'Unchanged inventory polling must preserve DOM');
assert.ok(bar.includes('window.BastideReadingGuard?.isActive?.()'),'The combat bar must honor the reading lock');
assert.ok(bar.includes("uiDialog.dataset.readerLocked==='true'"),'The effects dialog must keep its reading position');
console.log('PASS — 10 checks: open book, input, tab exit, unchanged inventory, combat bar and modal.');
