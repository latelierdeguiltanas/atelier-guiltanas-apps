'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');

(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_BIN,args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:393,height:852},isMobile:true,hasTouch:true});
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.addInitScript(()=>{
   parent.saveSoloSheet=()=>{};
   sessionStorage.setItem('guiltanas-player-open',JSON.stringify({
    character:{id:'barbare-combat-test',name:'Barbare QA',profile:'Barbare',people:'Humain',family:'Combattants',level:1,
     stats:{FOR:2,AGI:1,CON:1,PER:0,INT:0,CHA:0,VOL:0},
     combat:{pvMax:12,pcMax:2,pmMax:0,recoveryMax:4},attacks:[],equipment:[],traits:[],
     paths:[
      {name:'Voie de la brute',ranks:[{rank:2,name:'Tour de force (G)',owned:true,text:'Avant le jet, +10 au test de FOR. Coûte 1d4° PV.'}]},
      {name:'Voie du primitif',ranks:[{rank:2,name:'Armure de vent',owned:true,text:'Sans armure, se relever devient une action de mouvement.'}]}
     ]},play:{}
   }));
  });
  await page.goto('http://127.0.0.1:4173/fiches-personnages/fiche/');
  const hp=()=>page.locator('#resources .counter b').first().innerText();
  const tour=()=>page.getByRole('button',{name:/Tour de force/}).first().tap();
  assert.equal(await page.locator('#play').getByRole('button',{name:/Armure de vent/}).count(),0);
  await tour();
  const modal=page.locator('dialog');
  const roll=modal.locator('[data-tour-de-force-roll]');
  const spend=modal.getByRole('button',{name:'Déduire les PV'});
  assert.equal(await roll.getAttribute('max'),'4');
  await roll.fill('5');
  await spend.tap();
  assert.equal(await hp(),'12/12');
  await roll.fill('3');
  await spend.tap();
  assert.equal(await hp(),'9/12');
  assert.match(await page.locator('#toast').innerText(),/\+10 au test de FOR/);
  await spend.tap();
  assert.equal(await hp(),'9/12');
  await page.reload();
  assert.equal(await hp(),'9/12');
  assert.deepEqual(errors,[]);
  console.log('PASS Tour de force : coût d4 validé, 3 PV déduits, +10 indiqué, saisie effacée et PV conservés au rechargement. Armure de vent : capacité passive.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
