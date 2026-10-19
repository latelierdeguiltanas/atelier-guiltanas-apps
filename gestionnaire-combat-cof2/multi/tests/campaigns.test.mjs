import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import {webcrypto} from 'node:crypto';
const root=new URL('../',import.meta.url),html=fs.readFileSync(new URL('index.html',root),'utf8'),controller=fs.readFileSync(new URL('campaigns.js',root),'utf8');
assert(!html.includes('bridge.js'));assert(!html.includes('inventory-api.js'));assert(html.includes('const PLAYER_PRESETS=[];'));
const base=html.match(/<script>([\s\S]*?)<\/script>/)[1];
function setup(space,pack=false){const data=new Map(),els=new Map();function el(id){if(!els.has(id))els.set(id,{value:id==='partyLevel'?'1':id==='difficulty'?'ordinary':'',innerHTML:'',textContent:'',hidden:false,classList:{add(){},remove(){}},querySelector(){return el('child')},append(){},showModal(){},close(){},remove(){}});return els.get(id);}
const context={console,structuredClone,crypto:webcrypto,URLSearchParams,location:{search:'?space='+space+(pack?'&pack=island':'')},localStorage:{getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)},window:{addEventListener(){}},document:{body:null,getElementById:el,querySelectorAll:()=>[]},alert(){},confirm:()=>true,prompt:()=>null,Blob,URL,setTimeout};for(const id of ['campaignSelect','partyLevel','partySize','partySummary','partyPicker','addPartyButton','encounter','difficulty','recommendation','bestSearch','bestiary','modal','modalTitle','modalBody','rules','log','initStrip','timelineStatus','playerBoard','monsterBoard','playerCount','monsterCount'])context[id]=el(id);vm.createContext(context);vm.runInContext(base,context);vm.runInContext('renderAll=function(){};renderRules=function(){};',context);vm.runInContext(controller,context);return {run:s=>vm.runInContext(s,context),data,context};}
const a=setup('11111111-1111-1111-1111-111111111111',true);assert.equal(a.run('Object.keys(ENCOUNTERS).length'),0);assert.equal(a.run('state.party.length'),0);assert.equal(a.run('Object.keys(MONSTERS).length'),20);assert.equal(a.run('islandAccess'),true);
a.run("current.encounters['custom-test']={name:'Garde',original:'',zone:'',defaultLevel:1,allowed:['zombie'],limits:{zombie:[0,100]},variants:{1:{zombie:2}}};current.selectedEncounter='custom-test';selectCampaign(current.id)");a.context.encounter.value='custom-test';a.run('recommend()');assert.equal(a.run('state.lastRecommendation.composition.zombie'),2);
const first=a.run('current.id');a.run("state.party.push({id:'pj-test',name:'Héros A',pv:10,def:12,init:11,selected:true,custom:true});save();installIsland()");assert.equal(a.run('Object.keys(ENCOUNTERS).length'),19);assert.equal(a.run('state.party.length'),7);assert.equal(a.run("state.party.some(p=>p.name==='Faëlar')"),true);a.run(`switchCampaign('${first}')`);assert.equal(a.run('Object.keys(ENCOUNTERS).length'),1);assert.equal(a.run('state.party[0].name'),'Héros A');
const b=setup('22222222-2222-2222-2222-222222222222');assert.notEqual(a.run('LIBRARY_KEY'),b.run('LIBRARY_KEY'));assert.equal(b.run('Object.keys(ENCOUNTERS).length'),0);
assert.equal(b.run('islandAccess'),false);const beforeIsland=b.run('library.campaigns.length');b.run('installIsland()');assert.equal(b.run('library.campaigns.length'),beforeIsland);
assert.throws(()=>a.run('validateLibrary({format:"bad"})'));
a.run('save()');const backup=JSON.parse(a.data.get(a.run('LIBRARY_KEY')));a.context.importTest={format:'guiltanas-cof2-campaigns-1',library:backup};assert.equal(a.run('validateLibrary(importTest).campaigns.length'),2);backup.campaigns[0].encounters['custom-test'].variants[1].missing=1;assert.throws(()=>a.run('validateLibrary(importTest)'));
console.log('PASS: démarrage vierge, 20 monstres, 19 rencontres pack facultatif, compositions, PJ et espaces isolés, sauvegarde et import invalides.');

a.context.FormData=class{constructor(target){return target.formData;}};
a.run('editMonster()');
const mf=new Map(Object.entries({name:'Gardien test',nc:'1',pv:'22',def:'14',init:'12',agi:'1',con:'2',for:'3',per:'0',cha:'-1',int:'0',vol:'1',type:'Humanoïde',size:'Moyenne',move:'10 m',notes:'Notes',source:'MJ',attacks:'Épée | 4 | 1d8+2 | Contact',abilities:'Armure | RD 1'}));
a.context.document.getElementById('monsterForm').onsubmit({preventDefault(){},target:{formData:mf}});
assert.equal(a.run('Object.values(current.monsters)[0].pv'),22);assert.equal(a.run('Object.values(current.monsters)[0].attacks[0].bonus'),4);
a.run('editPrepared()');const mid=a.run('Object.keys(current.monsters)[0]');const pf=new Map([['name','Embuscade test'],['notes','Dans la forêt'],['level','2'],['count-'+mid,'3']]);
a.context.document.getElementById('preparedForm').onsubmit({preventDefault(){},target:{formData:pf}});
assert.equal(a.run("Object.values(current.encounters).find(e=>e.name==='Embuscade test').variants[2]['"+mid+"']"),3);
const prev=a.run('library.campaigns.length');a.run('save()');const bundle={format:'guiltanas-cof2-campaigns-1',library:JSON.parse(a.data.get(a.run('LIBRARY_KEY')))};
await a.context.importJSON({files:[{size:100,text:async()=>JSON.stringify(bundle)}],value:'test'});assert.equal(a.run('library.campaigns.length'),prev*2);
assert.equal(a.run('Object.values(current.monsters)[0].name'),'Gardien test');
console.log('PASS: création de monstre complet, rencontre personnalisée et import en copies sans écrasement.');
