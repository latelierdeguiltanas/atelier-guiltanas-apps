'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const focus=JSON.parse(fs.readFileSync('centre-synchronisation/forge-n1/focus.json','utf8'));
const profileExpected=focus.profile.percent+' %';
const racePercent=name=>{const row=focus.peoples.find(x=>x.name===name);assert(row,'Peuple absent du rapport '+name);return row.percent+' %'};
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_BIN||undefined,args:['--no-sandbox']});
 const checks=[],errors=[];
 try{
  const ctx=await browser.newContext({viewport:{width:393,height:852},isMobile:true,hasTouch:true});
  const page=await ctx.newPage();page.on('pageerror',e=>errors.push(String(e)));
  await page.goto('http://127.0.0.1:4173/centre-synchronisation/forge-n1/purs.html',{waitUntil:'domcontentloaded'});
  await page.locator('#profile-percent').waitFor({timeout:15000});
  await page.waitForFunction(()=>document.getElementById('profile-percent')?.textContent?.includes('%'),{timeout:15000});
  assert.equal(await page.locator('#profile-name').innerText(),'Arquebusier');
  checks.push('Un seul profil complet : Arquebusier');
  assert.equal(await page.locator('#profile-percent').innerText(),profileExpected);
  assert.equal(await page.locator('#profile-checks .line').count(),16);
  checks.push('Un pourcentage pour les 16 critères du profil entier');
  assert.equal(await page.locator('#races button.race').count(),8);
  assert.equal(await page.locator('#races .value').count(),8);
  checks.push('Huit peuple ont leur propre pourcentage séparé');
  assert.equal(await page.locator('#race-detail h3').innerText(),'Nain · '+racePercent('Nain'));
  await page.locator('#races .race').filter({hasText:'Gnome'}).click();
  assert.equal(await page.locator('#race-detail h3').innerText(),'Gnome · '+racePercent('Gnome'));
  assert.match(await page.locator('#race-detail').innerText(),/Don étrange/);
  assert.equal(await page.locator('#profile-percent').innerText(),profileExpected);
  checks.push('Changer de peuple ne change jamais le pourcentage du profil');
  await page.locator('#details-paths').evaluate(el=>el.open=true);
  assert.equal(await page.locator('#profile-paths > details').count(),5);
  assert.equal(await page.locator('#profile-paths .value').count(),0);
  await page.locator('#profile-paths > details').first().evaluate(el=>el.open=true);
  assert.match(await page.locator('#profile-paths > details').first().innerText(),/Arme à répétition/);
  checks.push('Cinq voies consultables sans sous-pourcentages');
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
  await panel.frameLocator('iframe').locator('#profile-percent').waitFor({timeout:15000});
  checks.push('Le projet Forge affiche automatiquement le tableau dans le Copilote, sans clic supplémentaire');
  await desk.close();
  const out={status:'PASS',checks,viewports:['393x852','1280x800'],generatedAt:new Date().toISOString()};fs.writeFileSync('forge-n1-pure-click-result.json',JSON.stringify(out,null,2));console.log(JSON.stringify(out));
 }catch(e){const out={status:'FAIL',checks,error:String(e?.stack||e),pageErrors:errors};fs.writeFileSync('forge-n1-pure-click-result.json',JSON.stringify(out,null,2));console.log(JSON.stringify(out));process.exitCode=1}
 finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});