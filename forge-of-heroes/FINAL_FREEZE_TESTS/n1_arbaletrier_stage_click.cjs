'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
const browser=await chromium.launch({executablePath:process.env.CHROME_BIN||undefined,args:['--no-sandbox']});
const results=[],failures=[];
try{
 const ctx=await browser.newContext({viewport:{width:393,height:852},isMobile:true,hasTouch:true});
 const p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 const choose=async(sel,v)=>{const loc=p.locator(sel),val=await loc.locator('option').evaluateAll((opts,v)=>opts.find(o=>o.textContent.toLowerCase().includes(v.toLowerCase()))?.value,v);assert.ok(val,sel+': choice '+v+' unavailable');await loc.selectOption(val);return val};
 const next=()=>p.locator('#next-btn').tap();
 const go=async(name)=>{
  await p.goto('http://127.0.0.1:4173/forge-of-heroes/',{waitUntil:'domcontentloaded'});
  await p.locator('#start-classic').tap();await p.locator('#mode-classic').tap();
  await p.locator('#hero-name').fill(name);await next();await next();await next();
  await choose('#people-selector','Humain');await next();
 };
 await go('Arbalétrier de préproduction');
 const variants=await p.locator('#profile-selector option').allTextContents();
 assert.ok(variants.some(s=>/Arbalétrier/i.test(s)),'Arbalétrier invisible in profile selector: '+variants.slice(0,25).join(', '));
 await choose('#profile-selector','Arbalétrier');await next();
 for(const [i,key]of ['FOR','AGI','CON','PER','INT','VOL','CHA'].entries()){
  const val=[2,1,0,1,3,0,-1][i],el=p.getByRole('combobox',{name:new RegExp('^'+key+' ')});
  const v=await el.locator('option').evaluateAll((oo,val)=>oo.find(o=>parseInt(o.textContent)===val)?.value,val);await el.selectOption(v);
 }
 await choose('#human-stat-final','CON');await next();await next();
 await choose('#path-one','maître d’armes');await choose('#path-two','artilleur');
 const paths=await p.locator('#path-one option').allTextContents();assert.ok(!paths.some(t=>/Explosifs/i.test(t)),'Explosifs illegal for Arbalétrier');
 results.push({stage:'create',pathsAllowed:paths.filter(x=>x.includes('Voie')).length});
 const opt=p.locator('select[data-ability-choice$="|preferredWeaponCategory"]');
 const opts=await opt.locator('option').allTextContents().catch(()=>[]);
 results.push({stage:'weapon-selection',values:opts});
 const crossbow=await opt.locator('option').evaluateAll(items=>items.find(o=>o.textContent.toLowerCase().includes('arbalète'))?.value).catch(()=>undefined);
 assert.ok(crossbow,'Crossbows missing from mastered-weapon selection');
 await opt.selectOption(crossbow);await next();
 await next();
 await p.locator('#reveal-view').tap();
 const summary=await p.locator('#summary-content').innerText();
 assert.match(summary,/Arbalétrier/);
 results.push({stage:'summary',snippet:summary.slice(0,380)});
 await p.getByRole('button',{name:'Enregistrer dans Mes héros',exact:true}).tap();
 await p.reload();await p.locator('#open-heroes').tap();
 await p.getByRole('button',{name:'Voir la fiche',exact:true}).first().tap();
 assert.match(await p.locator('#summary-content').innerText(),/Arbalétrier/);
 results.push({stage:'saved',status:'PASS'});
 assert.equal(errors.length,0,'JS errors '+errors.join(', '));
 await ctx.close();
}catch(e){failures.push({error:String(e.stack||e)});}
finally{await browser.close()}
const output={status:failures.length?'FAIL':'PASS',results,failures};fs.writeFileSync('arbaletrier-stage-click.json',JSON.stringify(output,null,2));console.log(JSON.stringify(output).slice(0,5200));if(failures.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
