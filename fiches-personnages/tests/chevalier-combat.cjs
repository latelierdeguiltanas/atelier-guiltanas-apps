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
    character:{id:'chevalier-combat-qa',name:'Chevalier QA',profile:'Chevalier',level:1,
     stats:{FOR:2,AGI:1,CON:1,CHA:0,VOL:1},combat:{pvMax:20,pcMax:2,pmMax:0,recoveryMax:3,def:17},
     attacks:[{name:'Épée longue',type:'contact',attack:3,damage:'1d8+2'}],
     equipment:[{id:'mailles-test',name:'Cotte de mailles',quantity:1,equipped:true,equipment:{slot:'armor',bonuses:{armorDef:5}}}],
     traits:[],paths:[
      {name:'Voie du cavalier',ranks:[{rank:1,name:'Fidèle monture',owned:true},{rank:2,name:'Cavalier émérite',owned:true}]},
      {name:'Voie du preux',ranks:[{rank:1,name:'Ignorer la douleur (G)',owned:true},{rank:2,name:'Piqûres d’insectes',owned:true}]},
      {name:'Voie de la guerre',ranks:[{rank:2,name:'Encaisser un coup (M)',owned:true}]},
      {name:'Voie du meneur d’homme',ranks:[{rank:2,name:'Intercepter (G)',owned:true}]}
     ]},play:{}
   }));
  });
  await page.goto('http://127.0.0.1:4173/fiches-personnages/fiche/');
  const open=name=>page.locator('#play').getByRole('button',{name}).tap();
  const dialog=page.locator('dialog'),close=()=>dialog.locator('[data-ui-close]').tap();
  const button=name=>dialog.getByRole('button',{name,exact:true});
  const damage=()=>dialog.locator('[data-chevalier-damage]');
  const hp=()=>page.locator('#resources .counter b').first().innerText();
  const sword=()=>page.locator('#play .attack').filter({hasText:'Épée longue'}).innerText();
  await open(/Fidèle monture/);
  assert.match(await dialog.innerText(),/À pied.*DEF de la monture 14/);
  await button('Monter en selle').tap();
  assert.match(await dialog.innerText(),/En selle.*DEF de la monture 17/);
  assert.match(await sword(),/1d8\+2 \+ 1/);
  await page.reload();
  await open(/Fidèle monture/);
  assert.match(await dialog.innerText(),/En selle/);
  await button('Descendre de selle').tap();
  assert.doesNotMatch(await sword(),/\+ 1/);
  await close();

  await open(/Piqûres d’insectes/);
  assert.match(await dialog.innerText(),/2 DM/);
  await close();
  await open(/Intercepter/);
  await button('Déclarer avant le jet d’attaque').tap();
  assert.match(await dialog.innerText(),/allié à ton contact/);
  await dialog.locator('[data-chevalier-adjacent]').check();
  await dialog.locator('[data-chevalier-attack]').selectOption('distance');
  await button('Déclarer avant le jet d’attaque').tap();
  assert.match(await dialog.innerText(),/DEF \(17\)/);
  await damage().fill('7');
  await button('Appliquer les dégâts').tap();
  assert.equal(await hp(),'17/20');
  assert.equal(await button('Déclarer avant le jet d’attaque').count(),0);
  await button('Passer au round suivant').tap();
  await close();

  await open(/Encaisser un coup/);
  await button('Se mettre en garde').tap();
  assert.match(await dialog.innerText(),/ne peut pas te renverser ni t’étourdir/);
  await close();
  await open(/Intercepter/);
  await dialog.locator('[data-chevalier-adjacent]').check();
  await button('Déclarer avant le jet d’attaque').tap();
  await damage().fill('6');
  await button('Appliquer les dégâts').tap();
  assert.equal(await hp(),'16/20');
  await close();

  await open(/Ignorer la douleur/);
  await damage().fill('4');
  await dialog.locator('[data-chevalier-critical]').check();
  await button('Reporter les dégâts').tap();
  assert.match(await dialog.innerText(),/critique ne peut pas être reporté/);
  await dialog.locator('[data-chevalier-critical]').uncheck();
  await button('Reporter les dégâts').tap();
  assert.equal(await hp(),'16/20');
  assert.match(await dialog.innerText(),/4 DM seront appliqués/);
  await page.reload();
  await page.locator('[data-page="rest"]').tap();
  assert.match(await page.locator('#rest').innerText(),/Applique les 4 DM reportés/);
  await page.getByRole('button',{name:'Réinitialiser le combat'}).tap();
  assert.equal(await hp(),'12/20');
  await page.getByRole('button',{name:'Réinitialiser le combat'}).tap();
  assert.equal(await hp(),'12/20');
  assert.deepEqual(errors,[]);
  console.log('PASS Chevalier : selle et retour à pied, RD à distance, interception avant jet et cumul, garde, dette de dégâts et sauvegarde.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
