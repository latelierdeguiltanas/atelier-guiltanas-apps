'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'../..');
const sheet=path.join(root,'fiches-personnages/fiche');
const js=fs.readFileSync(path.join(sheet,'fiche.js'),'utf8');
const html=fs.readFileSync(path.join(sheet,'index.html'),'utf8').replace(/<script[\s\S]*?<\/script>/g,'');
const hero={id:'verification-combat',name:'Barbare QA',profile:'Barbare',level:1,stats:{FOR:2,AGI:1,CON:1,VOL:0},combat:{pvMax:12,pcMax:2,pmMax:0,recoveryMax:4,def:13},
 attacks:[{name:'Hache',type:'contact',attack:3,damage:'1d8+2'},{name:'Arc',type:'distance',attack:2,damage:'1d6'}],
 equipment:[{id:'cuir',name:'Cuir simple',quantity:1,equipped:true,equipment:{slot:'armor',bonuses:{armorDef:2}}}],
 paths:[{name:'Voie du pourfendeur',ranks:[{rank:2,name:'Charge (L)',owned:true}]},{name:'Voie du primitif',ranks:[{rank:2,name:'Armure de vent',owned:true}]},
 {name:'Voie de la rage',ranks:[{rank:1,name:'Cri de guerre (G)',owned:true},{rank:2,name:'Défier la mort',owned:true},{rank:3,name:'Rage du berserk (L)',owned:true}]}]};
let win,doc;
async function open(saved){
 await new Promise(resolve=>setImmediate(resolve));
 win?.close();
 win=new JSDOM(html,{url:'http://localhost/fiches-personnages/fiche/',runScripts:'outside-only'}).window;
 doc=win.document;
 win.BASTIDE_CHARACTER=hero;
 win.saveSoloSheet=()=>{};
 win.scrollTo=()=>{};
 win.ResizeObserver=class{observe(){}};
 win.HTMLElement.prototype.scrollIntoView=function(){};
 win.HTMLDialogElement.prototype.showModal=function(){this.open=true};
 win.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new win.Event('close'))};
 if(saved)win.localStorage.setItem('cof2_solo_play_verification-combat',saved);
 return win.eval(js);
}
const get=s=>{const e=doc.querySelector(s);assert.ok(e,s);return e;};
const click=s=>get(s).click();
const value=(s,v)=>{get(s).value=v};
const display=s=>get(s).textContent;
const show=slug=>click('#play [data-ui-ability$="'+slug+'"]');
const close=()=>click('[data-ui-close]');
const def=()=>Number([...doc.querySelectorAll('#resources .resource')].find(x=>x.textContent.includes('Défense')).querySelector('b').textContent);
const hp=()=>display('#resources .counter b');
const saved=()=>win.localStorage.getItem('cof2_solo_play_verification-combat');
const rest=type=>{click('[data-page="rest"]');click('[data-reset="'+type+'"]');click('[data-page="play"]')};
(async()=>{
 await open();
 show('charge-l');
 for(const meters of ['4.99','10.01','5','10']){
  value('dialog [data-charge-distance]',meters);click('dialog [data-barbare-combat]');
  assert.match(display('dialog [data-barbare-result]'),Number(meters)>=5&&Number(meters)<=10?/dé bonus.*1d4/:/entre 5 et 10 m/);
 }
 click('dialog [data-charge-contact]');click('dialog [data-barbare-combat]');
 assert.match(display('dialog [data-barbare-result]'),/impossible au contact/);
 close();
 show('defier-la-mort');value('dialog [data-defy-damage]','11');value('dialog [data-defy-test]','10');click('dialog [data-barbare-combat]');
 assert.equal(hp(),'12/12');assert.match(display('dialog [data-barbare-result]'),/PV positifs/);
 value('dialog [data-defy-damage]','12');value('dialog [data-defy-test]','');click('dialog [data-barbare-combat]');
 assert.match(display('dialog [data-barbare-result]'),/total de ton test/);
 value('dialog [data-defy-test]','9');click('dialog [data-barbare-combat]');assert.equal(hp(),'0/12');
 await open(saved());show('defier-la-mort');assert.match(display('dialog'),/Déjà utilisée/);close();
 rest('combat');click('#resources [data-count="hp"][data-delta="1"]');
 show('defier-la-mort');value('dialog [data-defy-damage]','1');value('dialog [data-defy-test]','10');click('dialog [data-barbare-combat]');assert.equal(hp(),'1/12');close();
 rest('combat');
 assert.equal(def(),13);
 click('[data-page="bag"]');
 click('[data-equip="cuir"]');assert.equal(def(),12);
 click('[data-equip="cuir"]');assert.equal(def(),13);
 click('[data-page="play"]');
 show('cri-de-guerre-g');
 for(const [i,entry] of [['Gobelin','10','1'],['Ogre','9','2'],['Archer','10.01','0'],['Garde','0','-1']].entries()){
  if(i)click('dialog [data-war-cry-add]');
  const row=doc.querySelectorAll('dialog [data-war-cry-target]')[i];
  for(const [j,key] of ['name','distance','strength'].entries())row.querySelector('[data-war-cry-'+key+']').value=entry[j];
 }
 click('dialog [data-barbare-combat]');
 assert.match(display('dialog [data-war-cry-outcome]'),/prochain tour.*Gobelin, Garde/);
 assert.doesNotMatch(display('dialog [data-war-cry-outcome]'),/Ogre|Archer/);
 await open(saved());show('cri-de-guerre-g');
 assert.match(display('dialog [data-war-cry-outcome]'),/Gobelin, Garde/);
 close();rest('combat');show('cri-de-guerre-g');get('dialog [data-war-cry-add]');close();
 show('rage-du-berserk-l');click('dialog [data-rage-command="start"]');
 assert.equal(def(),11);
 assert.match(display('#play .attack'),/\+ 1d4/);
 assert.match(display('#play'),/Attaque à distance interdite/);
 value('dialog [data-rage-roll]','14');click('dialog [data-rage-command="stop"]');
 assert.match(display('dialog'),/Test déjà tenté/);
 await open(saved());show('rage-du-berserk-l');
 assert.equal(def(),11);
 assert.match(display('dialog'),/Test déjà tenté/);
 click('dialog [data-rage-command="turn"]');
 value('dialog [data-rage-roll]','15');click('dialog [data-rage-command="stop"]');
 assert.equal(def(),13);assert.match(display('dialog'),/Réserve de rage épuisée/);
 close();rest('combat');show('rage-du-berserk-l');
 assert.match(display('dialog'),/Réserve de rage épuisée/);
 close();rest('day');show('rage-du-berserk-l');click('dialog [data-rage-command="start"]');close();
 show('defier-la-mort');value('dialog [data-defy-damage]','12');click('dialog [data-barbare-combat]');
 assert.equal(hp(),'1/12');close();
 click('#resources [data-count="hp"][data-delta="-1"]');assert.equal(def(),13);
 click('#resources [data-count="hp"][data-delta="1"]');assert.equal(def(),13);
 const hash=data=>createHash('sha256').update(data).digest('hex');
 const report={status:'PASS',environment:'jsdom',sheetSha256:hash(js),
  testSha256:hash(fs.readFileSync(__filename)),
  checks:['Charge : bornes de distance et contact',
   'Défier la mort : seuil de CON, attaque létale, usage par combat et réouverture',
   'Armure de vent : changement d’armure',
   'Cri de guerre : FOR, distance, cibles et réinitialisation',
   'Rage : DEF, dégâts, restriction de distance, VOL, quota, réouverture, fin à 0 PV et interaction avec Défier la mort']
 };
 fs.writeFileSync(path.join(root,'forge-of-heroes/QA/N1/barbare-combat-dom.json'),JSON.stringify(report,null,2)+'\n');
 console.log('PASS : '+report.checks.join(' | '));
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{await new Promise(resolve=>setImmediate(resolve));win?.close()});
