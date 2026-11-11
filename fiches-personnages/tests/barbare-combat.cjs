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
     combat:{pvMax:12,pcMax:2,pmMax:0,recoveryMax:4,def:13},
     attacks:[{name:'Hache',type:'contact',attack:3,damage:'1d8+2'},{name:'Arc',type:'distance',attack:2,damage:'1d6'}],
     equipment:[{id:'cuir-test',name:'Cuir simple',quantity:1,equipped:true,equipment:{slot:'armor',bonuses:{armorDef:2}}}],traits:[],
     paths:[
      {name:'Voie de la brute',ranks:[{rank:2,name:'Tour de force (G)',owned:true,text:'Avant le jet, +10 au test de FOR. Coûte 1d4° PV.'}]},
      {name:'Voie du primitif',ranks:[{rank:2,name:'Armure de vent',owned:true,text:'Sans armure, se relever devient une action de mouvement.'}]},
      {name:'Voie du pourfendeur',ranks:[{rank:2,name:'Charge (L)',owned:true,text:'Déplacement en ligne droite entre 5 et 10 m.'}]},
      {name:'Voie de la rage',ranks:[
       {rank:1,name:'Cri de guerre (G)',owned:true,text:'Une fois par combat.'},
       {rank:2,name:'Défier la mort',owned:true,text:'Une fois par combat, test de CON difficulté 10.'},
       {rank:3,name:'Rage du berserk (L)',owned:true,text:'Une fois par jour.'}
      ]}
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
  const close=()=>modal.locator('[data-ui-close]').tap();
  const open=name=>page.locator('#play').getByRole('button',{name}).tap();
  await open(/Charge/);
  const distance=modal.locator('[data-charge-distance]');
  const charge=()=>modal.getByRole('button',{name:'Vérifier la charge'}).tap();
  const outcome=()=>modal.locator('[data-barbare-result]').innerText();
  for(const meters of ['4.99','10.01']){
   await distance.fill(meters);
   await charge();
   assert.match(await outcome(),/entre 5 et 10 m/);
  }
  for(const meters of ['5','10']){
   await distance.fill(meters);
   await charge();
   assert.match(await outcome(),/dé bonus.*\+1d4/);
  }
  await modal.locator('[data-charge-contact]').check();
  await charge();
  assert.match(await outcome(),/impossible au contact/);
  await close();

  const death=()=>open(/Défier la mort/);
  const damage=modal.locator('[data-defy-damage]'),test=modal.locator('[data-defy-test]');
  const resolve=()=>modal.getByRole('button',{name:'Résoudre Défier la mort'}).tap();
  await death();
  await damage.fill('8');
  await test.fill('10');
  await resolve();
  assert.match(await outcome(),/passer de PV positifs à 0 PV/);
  assert.equal(await hp(),'9/12');
  await damage.fill('9');
  await test.fill('');
  await resolve();
  assert.match(await outcome(),/total de ton test de CON/);
  await test.fill('10');
  await resolve();
  assert.equal(await hp(),'1/12');
  assert.match(await modal.locator('[data-barbare-outcome]').innerText(),/conserves 1 PV/);
  await page.reload();
  await death();
  assert.match(await modal.innerText(),/Déjà utilisée dans ce combat/);
  await close();

  async function resetCombat(){
   await page.locator('[data-page="rest"]').tap();
   await page.getByRole('button',{name:'Réinitialiser le combat'}).tap();
   await page.locator('[data-page="play"]').tap();
  }
  await resetCombat();
  await death();
  await damage.fill('2');
  await modal.locator('[data-defy-rage]').check();
  await resolve();
  assert.equal(await hp(),'1/12');
  await close();

  await resetCombat();
  await death();
  await damage.fill('1');
  await test.fill('9');
  await resolve();
  assert.equal(await hp(),'0/12');
  assert.match(await modal.locator('[data-barbare-outcome]').innerText(),/échoue/);
  console.log('PASS Charge : bornes 5–10 m et contact. Défier la mort : attaque non létale, réussite, échec, rage, sauvegarde et nouveau combat.');
  await close();
  const statDefense=async()=>Number(await page.locator('#resources .resource').filter({hasText:'Défense'}).locator('b').innerText());
  assert.equal(await statDefense(),13);
  await page.locator('[data-page="bag"]').tap();
  const armor=page.locator('details[data-item="cuir-test"]');
  await armor.locator('summary').tap();
  await armor.locator('[data-equip="cuir-test"]').tap();
  assert.equal(await statDefense(),12);
  await armor.locator('[data-equip="cuir-test"]').tap();
  assert.equal(await statDefense(),13);
  await page.locator('[data-page="play"]').tap();
  console.log('PASS Armure de vent : retirer et remettre le cuir recalcule la DEF.');

  await open(/Cri de guerre/);
  const target=modal.locator('[data-war-cry-target]');
  await target.first().locator('[data-war-cry-name]').fill('Gobelin');
  await modal.getByRole('button',{name:'Pousser le cri'}).tap();
  assert.match(await outcome(),/Renseigne/);
  for(const [i,entry] of [['Gobelin','10','1'],['Ogre','9','2'],['Archer','10.01','0'],['Garde','0','-1']].entries()){
   if(i>0)await modal.getByRole('button',{name:'Ajouter un adversaire'}).tap();
   const row=target.nth(i);
   for(const [j,key] of ['name','distance','strength'].entries())await row.locator('[data-war-cry-'+key+']').fill(entry[j]);
  }
  await modal.getByRole('button',{name:'Pousser le cri'}).tap();
  const cryOutcome=modal.locator('[data-war-cry-outcome]');
  assert.match(await cryOutcome.innerText(),/dé malus|Dé malus/);
  assert.match(await cryOutcome.innerText(),/prochain tour.*Gobelin, Garde/);
  assert.doesNotMatch(await cryOutcome.innerText(),/Ogre|Archer/);
  await page.reload();
  await open(/Cri de guerre/);
  assert.match(await cryOutcome.innerText(),/Gobelin, Garde/);
  await close();
  await resetCombat();
  await open(/Cri de guerre/);
  assert.equal(await modal.getByRole('button',{name:'Pousser le cri'}).count(),1);
  await close();
  console.log('PASS Cri de guerre : plusieurs cibles, rayon de 10 m, FOR strictement inférieure, prochain tour, quota persistant et nouveau combat.');

  await page.locator('[data-count="hp"][data-delta="1"]').tap();
  await open(/Rage du berserk/);
  const enter=()=>modal.getByRole('button',{name:'Entrer en rage'}).tap();
  const rageRoll=modal.locator('[data-rage-roll]');
  const calm=()=>modal.getByRole('button',{name:'Tenter de calmer la rage'}).tap();
  await enter();
  assert.equal(await statDefense(),11);
  assert.match(await page.locator('#play .attack').filter({hasText:'Hache'}).innerText(),/\+ 1d4/);
  assert.match(await page.locator('#play .attack').filter({hasText:'Arc'}).innerText(),/distance interdite/);
  assert.match(await modal.innerText(),/dé bonus aux tests de VOL/);
  await rageRoll.fill('14');
  await calm();
  assert.match(await modal.innerText(),/Test déjà tenté/);
  await page.reload();
  await open(/Rage du berserk/);
  assert.equal(await statDefense(),11);
  assert.match(await modal.innerText(),/Test déjà tenté/);
  await modal.getByRole('button',{name:'Tour suivant'}).tap();
  await rageRoll.fill('15');
  await calm();
  assert.equal(await statDefense(),13);
  assert.match(await modal.innerText(),/Réserve de rage épuisée/);
  await close();
  await resetCombat();
  await open(/Rage du berserk/);
  assert.match(await modal.innerText(),/Réserve de rage épuisée/);
  await close();
  await page.locator('[data-page="rest"]').tap();
  await page.getByRole('button',{name:'Valider les 8 heures'}).tap();
  await page.locator('[data-page="play"]').tap();
  await open(/Rage du berserk/);
  await enter();
  await close();
  await death();
  await damage.fill('1');
  await resolve();
  assert.equal(await hp(),'1/12');
  await close();
  await page.locator('[data-count="hp"][data-delta="-1"]').tap();
  assert.equal(await statDefense(),13);
  await page.locator('[data-count="hp"][data-delta="1"]').tap();
  assert.equal(await statDefense(),13);
  console.log('PASS Rage : DEF, DM, distance, VOL 14/15, persistance, quota quotidien et fin à 0 PV. Défier la mort détecte la rage active.');
  assert.deepEqual(errors,[]);
  console.log('PASS Tour de force : coût d4 validé, 3 PV déduits, +10 indiqué, saisie effacée et PV conservés au rechargement. Armure de vent : capacité passive.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
