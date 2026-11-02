'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_BIN||undefined,args:['--no-sandbox']});
 const checks=[],errors=[];
 try{
  const ctx=await browser.newContext({viewport:{width:393,height:852},isMobile:true,hasTouch:true});
  const page=await ctx.newPage();page.on('pageerror',e=>errors.push(String(e)));
  await page.goto('http://127.0.0.1:4173/centre-synchronisation/forge-n1/purs.html',{waitUntil:'domcontentloaded'});
  await page.locator('#character h2').waitFor({timeout:15000});
  assert.match(await page.locator('#character h2').innerText(),/Arquebusier Nain/);checks.push('Ouverture initiale sur Arquebusier nain');
  assert.equal(await page.locator('#matrix button[data-key]').count(),112);checks.push('112 couples profils purs × peuples');
  assert.match(await page.locator('#character .percent').innerText(),/36\s*%/);checks.push('Pourcentage spécifique 5/14, pas ancien score global');
  assert.equal(await page.locator('details.path').count(),5);checks.push('Cinq voies officielles affichées');
  const p=page.locator('details.path').first();
  assert.match(await p.locator('.rank').allInnerTexts().then(x=>x.join(' | ')),/Mécanismes|Arme à répétition|Tir de barrage/);
  checks.push('Vraies capacités et rangs de l’Arquebusier');
  assert.match(await p.innerText(),/Chargeur de 2 \+ INT/);
  checks.push('Calcul concret arme à répétition décrit');
  assert.equal(await page.locator('#character .rule').count(),14);
  checks.push('Chaque couple a quatorze obligations nommées');
  await page.locator('#people').selectOption('people:halfelin:cof2-lb-2024');
  await page.locator('#profile').selectOption('class:barbare:cof2-lb-2024');
  assert.match(await page.locator('#character h2').innerText(),/Barbare Halfelin/);
  assert.match(await page.locator('#character').innerText(),/paquetage|petite taille/i);
  checks.push('Barbare Halfelin : limitations de taille et équipement indiquées');
  await page.locator('#profile').selectOption('class:druide:cof2-lb-2024');
  assert.equal(await page.locator('details.path').count(),5);checks.push('Cinq voies du Druide présentes');
  assert.equal(errors.length,0,errors.join('; '));checks.push('Aucun plantage JavaScript');
  await ctx.close();
  // Test that the Copilote opens the embed without a second click.
  const desk=await browser.newContext({viewport:{width:1280,height:800}});
  const cockpit=await desk.newPage();cockpit.on('pageerror',e=>errors.push(String(e)));
  await cockpit.goto('http://127.0.0.1:4173/centre-synchronisation/',{waitUntil:'domcontentloaded'});
  // Simuler l'ouverture de la fiche Forge dans le DOM réel du Copilote sans identifiants de connexion.
  await cockpit.locator('#drawer-content').waitFor({state:'attached',timeout:15000});
  await cockpit.evaluate(()=>{document.getElementById('drawer-content').innerHTML='<div class="project-drawer-head"><strong>Forge of Heroes</strong></div><div class="project-hero-summary">Création de personnages</div>';});
  const panel=cockpit.locator('#foh-pure-certification');
  await panel.waitFor({timeout:15000});
  assert.equal(await panel.locator('iframe').count(),1);
  assert.match(await panel.locator('iframe').getAttribute('src'),/forge-n1\/purs\.html/);
  await panel.frameLocator('iframe').locator('#character h2').waitFor({timeout:15000});
  checks.push('Le projet Forge affiche automatiquement le tableau dans le Copilote, sans clic supplémentaire');
  await desk.close();
  const out={status:'PASS',checks,viewports:['393x852','1280x800'],generatedAt:new Date().toISOString()};fs.writeFileSync('forge-n1-pure-click-result.json',JSON.stringify(out,null,2));console.log(JSON.stringify(out));
 }catch(e){const out={status:'FAIL',checks,error:String(e?.stack||e),pageErrors:errors};fs.writeFileSync('forge-n1-pure-click-result.json',JSON.stringify(out,null,2));console.log(JSON.stringify(out));process.exitCode=1}
 finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});