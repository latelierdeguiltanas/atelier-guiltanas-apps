'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');

(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_BIN,args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:393,height:852},isMobile:true,hasTouch:true});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{
   parent.saveSoloSheet=()=>{};
   sessionStorage.setItem('guiltanas-player-open',JSON.stringify({
    character:{id:'barde-combat-qa',name:'Barde QA',profile:'Barde',level:1,
     stats:{FOR:0,AGI:2,CON:1,CHA:3,VOL:1},combat:{pvMax:9,pcMax:3,pmMax:3,recoveryMax:3,def:12},
     attacks:[],equipment:[],traits:[],paths:[
      {name:'Voie de l’escrime',ranks:[{rank:2,name:'Feinte (L)',owned:true}]},
      {name:'Voie du musicien',ranks:[{rank:1,name:'Chant des héros (L)*',owned:true},{rank:2,name:'Chant de réconfort (L)*',owned:true}]},
      {name:'Voie du saltimbanque',ranks:[{rank:2,name:'Grâce féline',owned:true,text:'Il ajoute son rang + 2 aux tests de danse, de mime ou de jonglerie.'}]}
     ]},play:{}
   }));
  });
  await page.goto('http://127.0.0.1:4173/fiches-personnages/fiche/');
  const open=name=>page.locator('#play').getByRole('button',{name}).tap();
  const dialog=page.locator('dialog');
  const close=()=>dialog.locator('[data-ui-close]').tap();
  const button=name=>dialog.getByRole('button',{name,exact:true});
  const hp=()=>page.locator('#resources .counter b').first().innerText();
  assert.match(await page.locator('#play .action-bonuses').innerText(),/Danse, mime et jonglerie.*\+4/);
  await open(/Feinte/);
  await button('Préparer la feinte').tap();
  assert.match(await dialog.innerText(),/Indique l’adversaire/);
  await dialog.locator('[data-barde-target]').fill('Garde');
  await button('Préparer la feinte').tap();
  assert.match(await dialog.innerText(),/round suivant/);
  await button('Passer au round suivant').tap();
  assert.match(await dialog.innerText(),/Garde.*\+4/);
  assert.doesNotMatch(await dialog.innerText(),/\+2d4/);
  await button('Marquer la première attaque effectuée').tap();
  await dialog.locator('[data-barde-target]').fill('Capitaine');
  await dialog.locator('[data-barde-won]').check();
  await button('Préparer la feinte').tap();
  await page.reload();
  await open(/Feinte/);
  await button('Passer au round suivant').tap();
  assert.match(await dialog.innerText(),/Capitaine.*\+4.*\+2d4/);
  await button('Marquer la première attaque effectuée').tap();
  await close();

  await open(/Chant des héros/);
  await button('Lancer le chant · 1 PM').tap();
  assert.match(await dialog.innerText(),/Bonus \+1.*3 min/);
  await button('Terminer le chant').tap();
  await close();
  await page.locator('#resources [data-count="hp"][data-delta="-1"]').tap();
  await page.locator('#resources [data-count="hp"][data-delta="-1"]').tap();
  await open(/Chant de réconfort/);
  await button('Commencer la récupération · 2 PM').tap();
  assert.match(await dialog.innerText(),/30 min.*10 m/);
  const heal=dialog.locator('[data-barde-heal]');
  await heal.fill('5');
  await button('Appliquer les soins après les 30 min').tap();
  assert.equal(await hp(),'7/9');
  await heal.fill('4');
  await button('Appliquer les soins après les 30 min').tap();
  assert.equal(await hp(),'9/9');
  await close();
  await open(/Chant des héros/);
  await button('Lancer le chant · 1 PM').tap();
  assert.match(await dialog.innerText(),/Mana insuffisant/);
  assert.deepEqual(errors,[]);
  console.log('PASS Barde : Grâce féline affichée, Feinte réussite/échec et réouverture, chants à 1 et 2 PM, soin plafonné et mana épuisé.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
