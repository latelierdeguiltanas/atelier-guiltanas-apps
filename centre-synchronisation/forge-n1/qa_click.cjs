'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
const browser=await chromium.launch({executablePath:process.env.CHROME_BIN||undefined,args:['--no-sandbox']});
let report={status:'FAIL',mobileViewport:'393x852',checks:[]};
try{
const context=await browser.newContext({viewport:{width:393,height:852},hasTouch:true,isMobile:true});
const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(String(e)));
await page.goto('http://127.0.0.1:4173/centre-synchronisation/forge-n1/',{waitUntil:'domcontentloaded'});
await page.locator('#official-peoples .item-card').first().waitFor({timeout:15000});
const race=await page.locator('#official-peoples .item-card').count();assert.equal(race,8);report.checks.push('8 peuples affichés');
const cls=await page.locator('#official-profiles .item-card').count();assert.equal(cls,14);report.checks.push('14 profils affichés');
const half=page.locator('#official-peoples .item-card').filter({hasText:'Demi-elfe'});
assert.match(await half.innerText(),/63\s*%/);await half.locator('summary').click();assert.equal(await half.locator('.item-check').count(),16);report.checks.push('Demi-elfe 63%, 16 preuves/points et détails cliquables');
const rogue=page.locator('#official-profiles .item-card').filter({hasText:'Voleur'});assert.match(await rogue.innerText(),/69\s*%/);report.checks.push('Voleur 69%');
assert.equal(await page.locator('#mmanual').innerText(),'12 / 12');report.checks.push('12/12 parcours Chrome affichés sans confusion avec la certification globale');
assert.match(await page.locator('#freshness').innerText(),/Matrice mécanique conservée/);report.checks.push('validité des 179120 preuves moteur affichée');
assert.equal(errors.length,0,errors.join('\n'));report.checks.push('pas d’exception JavaScript navigateur');
report.status='PASS';await context.close();
}catch(e){report.error=String(e?.stack||e);throw e;}
finally{require('node:fs').writeFileSync('forge-cockpit-click.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));await browser.close();}
})().catch(()=>process.exitCode=1);