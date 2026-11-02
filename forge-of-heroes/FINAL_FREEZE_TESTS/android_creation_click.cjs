'use strict';
const { _android } = require('playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
 const [device]=await _android.devices();assert.ok(device,'Android absent');
 let page,report={model:device.model(),steps:[],passed:false};
 try{
  const context=await device.launchBrowser({pkg:'com.android.chrome',args:['--no-first-run','--disable-fre']});
  const url='http://127.0.0.1:4173/forge-of-heroes/';
  const opened=context.pages()[0]||await (async()=>{
   const tab=context.waitForEvent('page',{timeout:20000});
   await device.shell('am start -a android.intent.action.VIEW -d '+url+' com.android.chrome');
   return tab;
  })();
  page=opened;page.setDefaultTimeout(12000);
  await page.goto('http://127.0.0.1:4173/forge-of-heroes/');
  assert.match(await page.evaluate(()=>navigator.userAgent),/Android/);
  const button=name=>page.getByRole('button',{name,exact:true}),label=name=>page.getByLabel(name,{exact:true});
  const tap=async loc=>{const box=await loc.boundingBox();assert.ok(box);await loc.tap();};
  const next=()=>tap(button('Continuer'));
  await tap(button('Créer un héros'));await tap(page.locator('#mode-classic'));
  assert.equal(await button('Continuer').isEnabled(),false);
  await label('Nom du personnage').fill('Android Forge N1');await next();
  await next();await tap(button('Hybride Deux profils distincts et une voie de chacun.'));await next();
  await label('Peuple').selectOption({label:'HUMAIN'});await next();
  await label('Profil principal').selectOption({label:'Voleur'});await label('Profil secondaire').selectOption({label:'Arquebusier'});
  assert.equal(await button('Continuer').isEnabled(),false);await tap(page.locator('#gm-approved'));await next();
  for(const [k,v] of Object.entries({FOR:'+2',AGI:'+1',CON:'+0',PER:'+1',INT:'+3',VOL:'+0',CHA:'-1'}))
   await page.getByRole('combobox',{name:new RegExp('^'+k+' ')}).selectOption({label:v});
  await label('Bonus humain — choisis après ta répartition').selectOption({label:'+1 CON'});await next();await next();await next();await next();
  await tap(button('Voir mon héros'));const summary=await page.locator('#summary-content').innerText();
  for(const rx of [/PV\s+9\b/,/DEF\s+13\b/,/INIT\s+11\b/,/Discrétion/,/Mécanismes/])assert.match(summary,rx);
  report.steps.push('hybride validé avec les valeurs attendues');
  await tap(button('Enregistrer dans Mes héros'));await page.reload();await tap(page.locator('#open-heroes'));
  await tap(button('Voir la fiche').first());await page.getByText('Android Forge N1',{exact:true}).first().waitFor();
  await tap(button('Valider et jouer — ma fiche interactive'));
  const sheet=page.frameLocator('#sheet');await sheet.getByRole('heading',{name:'Android Forge N1'}).waitFor();
  await page.reload();await sheet.getByRole('heading',{name:'Android Forge N1'}).waitFor();
  assert.equal(await sheet.getByText('9/9',{exact:true}).count(),1);
  await page.screenshot({path:'android-sheet.png'});report.steps.push('fiche interactive rechargée à 9/9 PV');report.passed=true;
 }finally{if(page&&!report.passed)await page.screenshot({path:'android-sheet.png'}).catch(()=>{});fs.writeFileSync('android-state.json',JSON.stringify(report,null,2));await device.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
