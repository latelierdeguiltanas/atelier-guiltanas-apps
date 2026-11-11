// Exercise the actual click handlers with an isolated campaign fixture.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const{JSDOM}=require(process.env.NESPRESSO_JSDOM||'/tmp/nespresso-dom/node_modules/jsdom');
const read=f=>fs.readFileSync(__dirname+'/../'+f,'utf8'),tick=()=>new Promise(r=>setTimeout(r,15));
const boot=(html,url)=>new JSDOM(html,{url,runScripts:'outside-only',pretendToBeVisual:true});
const run=(d,f)=>vm.runInContext(read('assets/'+f),d.getInternalVMContext());
(async()=>{
 const prefix='https://example.test/ile-aux-tempetes/mj/outils/',d=boot(read('mj/outils/economie/index.html'),prefix+'economie/#sacs'),w=d.window,q=s=>w.document.querySelector(s),sent=[];
 const players=['vax','hammerz'].map(id=>({id,display_name:id,initialized:true,state:{inventory:[],money:{}},activity:{}}));
 const items=[{id:'dague',name:'Dague',description:'Une arme légère',active:true}];
 w.NespressoEconomy={call:async(action,{body,query}={})=>{if(action==='admin')return{players,items,events:[]};if(action==='supervision')return{player:players.find(p=>p.id===query.playerId),activity:{},handouts:[],events:[],totalEvents:0};if(action==='send'){sent.push(body);return{ok:true};}}};
 let confirmation='';w.confirm=s=>{confirmation=s;return true;};w.HTMLElement.prototype.scrollIntoView=function(){};
 run(d,'economy-admin.js');run(d,'mj-desk.js');await tick();
 assert.equal(q('[data-mj-view=sacs]').hidden,false);
 q('[data-view=hammerz]').click();await tick();assert.match(q('#supervision-title').textContent,/hammerz/);
 q('[data-give=hammerz]').click();await tick();assert.equal(q('[data-mj-view=envoyer]').hidden,false);assert.equal(q('#recipients input:checked').value,'hammerz');
 const template=q('#reward-template');template.value='dague';template.dispatchEvent(new w.Event('change'));assert.equal(q('#send [name=name]').value,'Dague');
 q('#send [name=qty]').value=2;q('#send [name=PO]').value=3;
 q('#send .primary').click();await tick();
 assert.match(confirmation,/2 × Dague \+ 3 PO/);assert.equal(sent.length,1);assert.equal(sent[0].playerId,'hammerz');assert.equal(sent[0].money.PO,3);assert.equal(sent[0].items[0].qty,2);
 assert.equal(q('#recipients input:checked'),null);
 for(const id of ['boutique','historique']){q('.mj-views a[href="#'+id+'"]').click();await tick();assert.equal(q('[data-mj-view='+id+']').hidden,false);}
 w.close();
 const m=boot('<header><div class="title"></div><div id="tabs"><button onclick="showPage(\'combat\')">Combat</button></div></header><section id="combat"><input value="Tour en cours"></section>',prefix+'combat/');
 const mw=m.window;mw.showPage=id=>assert.equal(id,'combat');mw.HTMLDialogElement.prototype.showModal=function(){this.open=true;};mw.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new mw.Event('close'));};
 run(m,'mj-desk.js');const buttons=mw.document.querySelectorAll('.mj-combat-tools button'),drawer=mw.document.querySelector('dialog');
 buttons[0].click();const frame=drawer.querySelector('iframe');assert.match(frame.src,/economie\/\?atelier=1#envoyer$/);assert.ok(drawer.open);
 drawer.querySelector('button').click();assert.ok(!drawer.open);assert.equal(mw.document.querySelector('#combat input').value,'Tour en cours');
 buttons[1].click();assert.equal(drawer.querySelector('iframe'),frame);assert.equal(frame.contentWindow.location.hash,'#sacs');mw.close();
 console.log('PASS: sac PJ, destinataire précoché, modèle Mila, envoi confirmé objet et pièces, onglets, retour au combat sans rechargement.');
})().catch(e=>{console.error(e);process.exitCode=1;});
