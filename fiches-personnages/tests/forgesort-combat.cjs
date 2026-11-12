'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {createHash}=require('node:crypto');
const {chromium}=require('playwright');
const {load}=require('../../forge-of-heroes/FINAL_FREEZE_TESTS/forge_product_runner');

(async()=>{
 const {db}=load();
 const paths=db.tables.paths_class.filter(p=>p.classId==='class:forgesort:cof2-lb-2024'&&p.group==='Base').map(p=>({
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
    id:'forgesort-combat-qa',name:'Forgesort QA',level:1,profile:'Forgesort',
    stats:{INT:3,AGI:1,FOR:1,CON:1,VOL:2,CHA:0,PER:1},
    combat:{def:12,init:13,contact:2,distance:3,magic:4,pvMax:9,pmMax:8,pcMax:2,recoveryMax:3,speedMeters:10},
    attacks:[{name:'Bâton ferré',type:'contact',attack:4,damage:'1d4°+3'},{name:'Marteau',type:'contact',attack:4,damage:'1d6+1'}],
    equipment:[],traits:[],paths
   },play:{}}));
  },paths);
  await page.goto('http://127.0.0.1:4173/fiches-personnages/fiche/');
  const dialog=page.locator('dialog');
  const open=name=>page.locator('#play').getByRole('button',{name}).tap();
  const close=()=>dialog.locator('[data-ui-close]').tap();
  const btn=name=>dialog.locator('[data-forge-action="'+name+'"]');
  const click=name=>btn(name).tap();
  const field=name=>dialog.locator('[data-forge-field="'+name+'"]');
  const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('cof2_solo_play_forgesort-combat-qa')));
  for(let i=0;i<4;i++)await page.getByRole('button',{name:'Retirer un point de vie'}).tap();
  await open(/Fortifiant/);
  await field('roll').fill('3');
  await click('cast');
  assert.equal((await state()).hp,8);
  for(const left of [2,1,0]){
   await click('test');
   assert.equal((await state()).forgeTonic,left);
  }
  assert.equal((await state()).pm,8);
  await close();

  await open(/Feu grégeois/);
  await field('distance').fill('11');
  await field('roll').fill('7');
  await field('save').fill('13');
  await click('cast');
  assert.match(await dialog.innerText(),/distance valide/);
  await field('distance').fill('10');
  await click('cast');
  assert.match(await dialog.innerText(),/3 DM de feu/);
  assert.equal((await state()).pm,8);
  await close();

  await open(/Morsure de la forge/);
  await field('weapon').selectOption('Bâton ferré');
  await click('cast');
  assert.equal((await state()).pm,7);
  assert.match(await page.locator('#play .attack').filter({hasText:'Bâton ferré'}).innerText(),/\+ 2 feu/);
  assert.doesNotMatch(await page.locator('#play .attack').filter({hasText:'Marteau'}).innerText(),/\+ 2 feu/);
  await click('end');
  assert.equal((await state()).forgeBite,undefined);
  await close();

  await open(/Métal brûlant/);
  await field('distance').fill('20');
  await field('object').selectOption('Armure');
  await field('roll').fill('1');
  await dialog.locator('[data-forge-hit]').check();
  await click('cast');
  assert.equal((await state()).pm,5);
  assert.deepEqual((await state()).forgeHeat,{object:'Armure',rounds:4});
  await click('round');
  assert.equal((await state()).forgeHeat.rounds,3);
  assert.match(await dialog.innerText(),/1d4° DM au porteur/);
  await close();

  await open(/Rune de puissance/);
  await field('weapon').selectOption('Marteau');
  await click('cast');
  assert.equal((await state()).pm,3);
  await click('trigger');
  assert.equal(await btn('trigger').isDisabled(),true);
  assert.equal((await state()).pm,3);
  await page.reload();
  await open(/Rune de puissance/);
  assert.equal(await btn('trigger').isDisabled(),true);
  await close();
  await page.locator('[data-page="rest"]').tap();
  await page.getByRole('button',{name:'Réinitialiser le combat'}).tap();
  assert.deepEqual((await state()).forgeRune,{weapon:'Marteau',used:false});
  assert.equal((await state()).forgeHeat,undefined);
  assert.deepEqual(errors,[]);
  const sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
  console.log(JSON.stringify({status:'PASS',environment:'chromium',sheetSha256:sha('fiches-personnages/fiche/fiche.js'),
   testSha256:sha(__filename),checks:['Fortifiant : soin et trois tests','Feu grégeois : portée et AGI','Morsure : arme et dégâts','Métal brûlant : durée et dégâts','Rune : coût, quota, réouverture et nouveau combat']}));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
