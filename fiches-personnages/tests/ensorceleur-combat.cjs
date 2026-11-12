'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {createHash}=require('node:crypto');
const {chromium}=require('playwright');
const {load}=require('../../forge-of-heroes/FINAL_FREEZE_TESTS/forge_product_runner');

(async()=>{
 const {db}=load();
 const paths=db.tables.paths_class.filter(p=>p.classId==='class:ensorceleur:cof2-lb-2024'&&p.group==='Base').map(p=>({
  name:p.label,pathId:p.id,ranks:db.tables.abilities_class.filter(a=>a.path_id===p.id&&a.rank<=2).map(a=>({name:a.label,text:a.desc,rank:a.rank,owned:true}))
 }));
 const browser=await chromium.launch({executablePath:process.env.CHROME_BIN,args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:393,height:852},isMobile:true,hasTouch:true});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(paths=>{
   parent.saveSoloSheet=()=>{};
   sessionStorage.setItem('guiltanas-player-open',JSON.stringify({character:{
    id:'ensorceleur-combat-qa',name:'Ensorceleur QA',level:1,profile:'Ensorceleur',
    stats:{CHA:3,AGI:1,FOR:1,CON:1,VOL:2,INT:0,PER:1},
    combat:{def:12,init:13,contact:2,distance:3,magic:4,pvMax:9,pmMax:8,pcMax:2,recoveryMax:3,speedMeters:10},
    attacks:[{name:'Sous tension (M)*',type:'magique',attack:4,damage:'1d4+3',range:'10 m'},{name:'Choc (A)*',type:'magique',attack:4,damage:'1d4+3',range:'20 m'}],
    equipment:[],traits:[],paths
   },play:{}}));
  },paths);
  await page.goto('http://127.0.0.1:4173/fiches-personnages/fiche/');
  const dialog=page.locator('dialog');
  const open=name=>page.locator('#play').getByRole('button',{name}).tap();
  const close=()=>dialog.locator('[data-ui-close]').tap();
  const btn=name=>dialog.locator('[data-spell-action="'+name+'"]');
  const click=name=>btn(name).tap();
  const fill=(name,value)=>dialog.locator('[data-spell-field="'+name+'"]').fill(value);
  const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('cof2_solo_play_ensorceleur-combat-qa')));
  assert.equal(await page.locator('#play .attack').filter({hasText:'1d4°+3'}).count(),2);

  await open(/Sous tension/);
  await click('cast');
  assert.equal((await state()).pm,6);
  await click('touch');
  assert.match(await dialog.innerText(),/Contact : 1d4° DM/);
  await click('discharge');
  assert.equal(await btn('discharge').isDisabled(),true);
  assert.equal((await state()).pm,6);
  await page.reload();
  await open(/Sous tension/);
  assert.equal(await btn('discharge').isDisabled(),true);
  await click('round');
  assert.equal(await btn('discharge').isEnabled(),true);
  await click('expire');
  assert.equal((await state()).ensorceleurTension,undefined);
  await close();

  await open(/Image décalée/);
  await fill('roll','4');
  await click('cast');
  assert.equal((await state()).ensorceleurImage,7);
  await fill('roll','4');
  await click('evade');
  assert.match(await dialog.innerText(),/normalement/);
  await fill('roll','5');
  await click('evade');
  assert.match(await dialog.innerText(),/aucun DM/);
  await click('round');
  assert.equal((await state()).ensorceleurImage,6);
  await close();

  await open(/Sommeil/);
  await fill('roll','2');
  await click('cast');
  assert.equal((await state()).ensorceleurSleep,5);
  assert.equal((await state()).pm,2);
  assert.equal(await btn('cast').count(),0);
  await close();

  await open(/Choc/);
  await fill('distance','21');
  await click('cast');
  assert.equal((await state()).pm,2);
  assert.match(await dialog.innerText(),/20 m ou moins/);
  await fill('distance','20');
  await dialog.locator('[data-spell-hit]').check();
  await fill('nc','0.5');
  await fill('force','9');
  await click('concentrate');
  assert.match(await dialog.innerText(),/renversée/);
  assert.equal((await state()).pm,2);
  await fill('distance','20');
  await dialog.locator('[data-spell-hit]').check();
  await fill('nc','2');
  await click('cast');
  assert.match(await dialog.innerText(),/reste debout/);
  assert.equal((await state()).pm,1);
  await close();
  await page.locator('[data-page="rest"]').tap();
  await page.getByRole('button',{name:'Réinitialiser le combat'}).tap();
  assert.equal((await state()).ensorceleurImage,undefined);
  assert.equal((await state()).ensorceleurSleep,undefined);
  assert.deepEqual(errors,[]);
  const sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
  console.log(JSON.stringify({status:'PASS',environment:'chromium',sheetSha256:sha('fiches-personnages/fiche/fiche.js'),
   testSha256:sha(__filename),checks:['Sous tension : coût, contact, décharge et round','Image décalée : durée et seuil du d6','Sommeil : quota et capacité','Choc : portée, NC, FOR et concentration','Affichage du dé évolutif et sauvegarde']}));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
