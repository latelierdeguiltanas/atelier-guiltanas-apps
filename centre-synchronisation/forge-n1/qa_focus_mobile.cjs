'use strict';
const fs=require('fs'),assert=require('node:assert/strict'),{chromium}=require('playwright');
const f=JSON.parse(fs.readFileSync('centre-synchronisation/forge-n1/focus.json','utf8'));
const current=f.certificationPlan.current;
const score=current.percent==null?'En cours':current.percent+' %';
(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROME_BIN||undefined,args:['--no-sandbox']});
const report={schema:'FOH_N1_FOCUS_REAL_MOBILE',at:new Date().toISOString(),expectedProfile:current.name,expectedProgress:current.percent,expectedPeoples:f.peoples.length,steps:[],errors:[],status:'PASS'};
try{const page=await browser.newPage({viewport:{width:393,height:852},hasTouch:true,isMobile:true});page.on('pageerror',err=>report.errors.push(String(err)));await page.goto('http://127.0.0.1:4173/centre-synchronisation/forge-n1/',{waitUntil:'domcontentloaded'});await page.locator('#focus-profile .focus-line').waitFor({timeout:14000});
const profile=await page.locator('#focus-profile .focus-line').innerText(),people=await page.locator('#focus-peoples .focus-line').count(),queue=await page.locator('#focus-queue span').count();
assert(profile.includes(current.name)&&profile.includes(score),'Le profil actif ou son taux ne s’affiche pas');
assert.equal(people,8,'Huit peuples requis');assert.equal(queue,14,'Quatorze profils requis');
const active=await page.locator('#focus-queue span').filter({hasText:current.name}).count();assert.equal(active,1,'Profil courant unique');
for(const p of f.peoples){const rows=page.locator('#focus-peoples .focus-line').filter({hasText:p.name});assert.equal(await rows.count(),1,'Peuple manquant : '+p.name);assert((await rows.innerText()).includes(p.percent+' %'),'Pourcentage incorrect '+p.name);}
await page.locator('#refresh').tap();await page.locator('#focus-profile .focus-line').waitFor({timeout:14000});
const after=await page.locator('#focus-profile .focus-line').innerText();assert(after.includes(current.name)&&after.includes(score),'Actualiser modifie la progression sans preuves');
if(f.profile.name!==current.name){
 const archive=page.locator('#focus-certified');
 assert.match(await archive.locator('summary').innerText(),new RegExp(f.profile.name+' · '+f.profile.percent+' %'));
 assert.equal(await archive.evaluate(el=>el.open),false);
 await archive.locator('summary').tap();
 assert.equal(await archive.locator('.focus-check').count(),f.profile.checks.length);
 const open=f.certificationPlan.priorityProgress.checks.filter(x=>x.status!=='ACQUIS');
 assert.equal(await page.locator('#focus-open .focus-check').count(),open.length);
 for(const check of open)assert((await page.locator('#focus-open').innerText()).includes(check.name));
}
assert.equal(report.errors.length,0,'Erreur JS navigateur : '+report.errors.join(' | '));
report.steps.push({test:'profil prioritaire et progression',pass:true},{test:'8 peuples indépendants',pass:true},{test:'14 profils ordonnés',pass:true},{test:'actualiser fonctionne au clic mobile',pass:true});await page.close();
}catch(e){report.status='FAIL';report.errors.push(String(e.stack||e));process.exitCode=1;}finally{await browser.close();}
fs.writeFileSync('centre-synchronisation/forge-n1/qa-focus-mobile-result.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,steps:report.steps,errors:report.errors}));
})().catch(e=>{console.error(e);process.exitCode=1});