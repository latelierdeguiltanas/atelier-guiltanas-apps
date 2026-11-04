'use strict';
/* Chrome tactile: cinq vénérables Arquebusier (rang 3 dans chacune des cinq
 * voies) et calcul contextuel au clic de chaque pouvoir R1/R2/R3.
 * Ne remplace pas les huit peuples, les hybrides et toutes les variantes d'équipement.
 */
const fs=require('node:fs'),crypto=require('node:crypto'),{chromium}=require('playwright'),assert=require('node:assert/strict');
const jobs=[{variant:'Arquebusier',first:'mercenaire',second:'explosifs'},{variant:'Arbalétrier',first:'mercenaire',second:'pistolero'}];
const report={schema:'FOH_N1_ARQ_GRANTED_THROWER_REAL_CLICK',at:new Date().toISOString(),indexSha256:crypto.createHash('sha256').update(fs.readFileSync('forge-of-heroes/index.html')).digest('hex'),scope:'Deux créations vénérables Humain, variante lanceur accordée par Combattant aguerri, vrai clic tactile, sauvegarde et réouverture.',passed:0,failed:0,status:'PENDING',cases:[]};
(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROME_BIN||undefined,args:['--no-sandbox']});try{
for(const job of jobs){
const ctx=await browser.newContext({viewport:{width:393,height:852},hasTouch:true,isMobile:true});
const p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));p.setDefaultTimeout(7000);
const rec={variant:job.variant,first:job.first,second:job.second,status:'FAIL',abilities:[],steps:[],error:null};report.cases.push(rec);
const next=()=>p.locator('#next-btn').tap();
const choose=async(id,s)=>{const el=p.locator(id),val=await el.locator('option').evaluateAll((os,s)=>os.find(o=>o.textContent.toLowerCase().includes(s.toLowerCase()))?.value,s);assert.ok(val,'Option '+id+' '+s+' missing');await el.selectOption(val);};
try{
 await p.goto('http://127.0.0.1:4173/forge-of-heroes/',{waitUntil:'domcontentloaded'});
 await p.locator('#start-classic').tap();await p.locator('#mode-classic').tap();await p.locator('#hero-name').fill('Lanceur '+job.variant);
 await next();await p.locator('#rule-age').tap();await next();await next();
 await choose('#people-selector','Humain');await next();await choose('#profile-selector',job.variant);await next();
 for(const [i,key]of ['FOR','AGI','CON','PER','INT','VOL','CHA'].entries()){
  const n=[2,1,0,1,3,0,-1][i],el=p.getByRole('combobox',{name:new RegExp('^'+key+' ')});
  const value=await el.locator('option').evaluateAll((xs,n)=>xs.find(o=>parseInt(o.textContent)===n)?.value,n);assert.ok(value,key);await el.selectOption(value);
 }
 await choose('#human-stat-final','CON');await next();await choose('#age-category','Vénérable');await next();
 await choose('#path-one',job.first);await choose('#path-two',job.second);
 for(const name of [job.first,job.first,job.second]){
  const area=p.locator('article.choice').filter({hasText:new RegExp('voie.*'+name,'i')});
  const btn=area.getByRole('button',{name:/Acquérir/}).first();
  await btn.tap();rec.steps.push('age-rank-'+name);
 }
 if(job.first==='mercenaire')await choose('select[data-ability-choice$="|combattantAguerriAbility"]','Archer émérite');
 const toggle=p.locator('input[data-ability-choice$="|throwerVariant"]');assert.equal(await toggle.count(),1,'Choix lanceur visible');assert.equal(await toggle.isChecked(),false);await toggle.tap();assert.equal(await toggle.isChecked(),true);await toggle.tap();assert.equal(await toggle.isChecked(),false);await toggle.tap();assert.equal(await toggle.isChecked(),true);rec.steps.push('thrower-off-on-off-on');
 await next();
 if(job.first==='artilleur'||job.second==='artilleur'){
  const count=p.locator('[data-pistol-count="1"]');
  if(await count.count())await count.tap();
 }
 await next();await p.locator('#reveal-view').tap();rec.steps.push('hero');
 const before=await p.locator('#summary-content').innerText();
 await p.getByRole('button',{name:'Enregistrer dans Mes héros',exact:true}).tap();
 await p.reload({waitUntil:'domcontentloaded'});await p.locator('#open-heroes').tap();await p.getByRole('button',{name:'Voir la fiche',exact:true}).first().tap();
 assert.equal(await p.locator('#summary-content').innerText(),before,'Fiche inchangée après réouverture');
 const stored=await p.evaluate(()=>Object.values(localStorage).some(value=>value.includes('"throwerVariant":true')));assert(stored,'Choix lanceur absent de la sauvegarde');rec.steps.push('save-reopen-choice-retained');
 assert.equal(errors.length,0,'Erreurs navigateur '+errors.join(' ; '));
 rec.status='PASS';report.passed++;
}catch(e){rec.error=String(e.stack||e).slice(0,2200);rec.browserErrors=errors.slice(0,5);rec.view=await p.locator('.step.active').innerText().then(x=>x.slice(0,700)).catch(()=>null);report.failed++;}
finally{await ctx.close();}
console.log(job.first+' '+rec.status+(rec.error?' '+rec.error.slice(0,160):''));
}}finally{await browser.close()}
report.status=report.failed===0&&report.passed===2?'PASS':'FAIL';
fs.writeFileSync('forge-of-heroes/QA/N1/arquebusier-granted-thrower-click.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,passed:report.passed,failed:report.failed,errors:report.cases.filter(x=>x.status!=='PASS')}).slice(0,5800));
if(report.status!=='PASS')process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
