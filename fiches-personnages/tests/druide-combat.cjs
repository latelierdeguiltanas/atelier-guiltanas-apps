'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {createHash}=require('node:crypto');
const {chromium}=require('playwright');
const {load}=require('../../forge-of-heroes/FINAL_FREEZE_TESTS/forge_product_runner');

(async()=>{
 const {db}=load();
 const paths=db.tables.paths_class.filter(p=>p.classId==='class:druide:cof2-lb-2024'&&p.group==='Base').map(p=>({
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
    id:'druide-combat-qa',name:'Druide QA',level:1,profile:'Druide',
    stats:{PER:3,AGI:1,FOR:1,CON:1,VOL:1,INT:0,CHA:0},
    combat:{def:12,init:13,contact:2,distance:3,magic:4,pvMax:9,pmMax:8,pcMax:2,recoveryMax:3,speedMeters:10},
    attacks:[{name:'Bâton',type:'contact',attack:2,damage:'1d6'}],equipment:[],traits:[],paths
   },play:{}}));
  },paths);
  await page.goto('http://127.0.0.1:4173/fiches-personnages/fiche/');
  const dialog=page.locator('dialog'),open=name=>page.locator('#play').getByRole('button',{name}).tap();
  const close=()=>dialog.locator('[data-ui-close]').tap();
  const click=command=>dialog.locator('[data-druide-command="'+command+'"]').tap();
  const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('cof2_solo_play_druide-combat-qa')));
  const defense=()=>page.locator('#resources .resource').filter({hasText:'Défense'}).locator('b').innerText();

  await open(/Baies magiques/);
  await click('grow');
  assert.match(await dialog.innerText(),/Il faut un arbre/);
  for(let i=0;i<2;i++){
   await dialog.locator('[data-druide-plant]').check();
   await click('grow');
  }
  assert.equal((await state()).pm,6);
  assert.equal((await state()).druideBerries,6);
  for(const target of ['Léa',' LEA ','Math']){
   await dialog.locator('[data-druide-target]').fill(target);
   await click('serve');
  }
  assert.deepEqual((await state()).druideBerryTargets,['lea','math']);
  assert.equal((await state()).druideBerries,4);
  await close();

  await open(/Forêt vivante/);
  await click('forest');
  assert.match(await dialog.innerText(),/Confirme la fin du rituel/);
  await dialog.locator('[data-druide-ritual]').check();
  await click('forest');
  assert.equal((await state()).pm,4);
  assert.equal(await dialog.locator('[data-druide-command="forest"]').count(),0);
  await close();

  await open(/Terrains difficiles/);
  await click('terrain');
  assert.equal(await defense(),'13');
  assert.match(await page.locator('#play .attack').filter({hasText:'Bâton'}).innerText(),/Bâton · \+3/);
  assert.match(await page.locator('#resources').innerText(),/10 m/);
  await close();
  await page.locator('[data-ui-modal="resources"]').tap();
  assert.match(await dialog.innerText(),/Initiative\s*16/);
  await close();

  await open(/Peau d’écorce/);
  await dialog.locator('[data-druide-protection]').check();
  await click('bark');
  assert.equal((await state()).pm,4);
  await dialog.locator('[data-druide-protection]').uncheck();
  await click('bark');
  assert.equal(await defense(),'15');
  assert.equal((await state()).pm,3);
  await close();

  await open(/Petit compagnon/);
  await click('familiar');
  assert.equal(await defense(),'17');
  await page.reload();
  assert.equal(await defense(),'17');
  await open(/Peau d’écorce/);
  await click('expire');
  assert.equal(await defense(),'15');
  await close();
  await page.locator('[data-page="rest"]').tap();
  await page.getByRole('button',{name:'Réinitialiser le combat'}).tap();
  assert.equal(await defense(),'14');
  assert.equal((await state()).uses['voie-du-protecteur-2-foret-vivante'],1);
  await page.getByRole('button',{name:'Valider les 8 heures'}).tap();
  assert.equal((await state()).pm,8);
  assert.equal((await state()).uses['voie-du-protecteur-2-foret-vivante'],0);
  assert.equal((await state()).druideBerryTargets,undefined);
  assert.deepEqual(errors,[]);
  const sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
  console.log(JSON.stringify({status:'PASS',environment:'chromium',sheetSha256:sha('fiches-personnages/fiche/fiche.js'),
   testSha256:sha(__filename),checks:['Baies et bénéficiaires','Rituel et quota','Déplacement, DEF, INIT et attaque','Peau et protection','Compagnon et réouverture','Récupération et compteurs']}));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
