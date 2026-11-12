'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const {createHash}=require('node:crypto');
const paths=['voie-des-animaux','voie-du-fauve','voie-de-la-nature','voie-du-protecteur','voie-des-vegetaux'];
const jobs=['humain','nain','demi-elfe','demi-orc','elfe-haut','elfe-sylvain','gnome','halfelin'].map((people,i)=>({
 people,primary:paths[i%5],secondary:paths[(i+1)%5],stats:[0,1,2,3,0,1,-1]
}));
const report={status:'FAIL',environment:'chromium',testSha256:createHash('sha256').update(fs.readFileSync(__filename)).digest('hex'),cases:[],indexSha256:createHash('sha256').update(fs.readFileSync('forge-of-heroes/index.html')).digest('hex')};

async function runCase(browser,job){
 const ctx=await browser.newContext({viewport:{width:393,height:852},isMobile:true,hasTouch:true});
 const page=await ctx.newPage(),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 page.setDefaultTimeout(9000);
 const next=()=>page.locator('#next-btn').tap();
 const snapshot=()=>page.evaluate(()=>{
  const draft=window.__FOH_PRODUCT__.buildState();
  const r=window.__FOH_ENGINE__.computeCharacterN1(draft);
  return {errors:r.errors,people:draft.peupleId,age:draft.age?.categoryId,resource:draft.age?.choice,equip:draft.equip,def:r.sticky.DEF,skills:r.sticky.skillBonuses,pv:r.sticky.PV,init:r.sticky.INIT,ranks:r.sticky.acquiredAbilities.map(a=>[a.id,a.rank]),choices:draft.abilityChoices,attacks:r.sticky.attacks};
 });
 const row={...job,status:'FAIL'};
 report.cases.push(row);
 try{
  await page.goto('http://127.0.0.1:4178/forge-of-heroes/');
  await page.locator('#start-classic').tap();
  await page.locator('#mode-classic').tap();
  await page.locator('#hero-name').fill('QA Druide '+job.people);
  await next();
  await page.locator('#rule-age').tap();
  await next();
  await next();
  await page.locator('#people-selector').selectOption('people:'+job.people+':cof2-lb-2024');
  for(const id of ['#people-bonus','#people-malus','#people-path','#gnome-granted-ability']){
   const field=page.locator(id);
   if(!await field.isVisible())continue;
   const options=await field.locator('option').evaluateAll(nodes=>nodes.filter(o=>!o.disabled&&o.value).map(o=>o.value));
   if(options.length)await field.selectOption(options[0]);
  }
  await next();
  await page.locator('#profile-selector').selectOption('class:druide:cof2-lb-2024');
  await next();
  for(const [i,key] of ['FOR','AGI','CON','PER','INT','VOL','CHA'].entries()){
   const field=page.getByRole('combobox',{name:new RegExp('^'+key+' ')});
   const value=await field.locator('option').evaluateAll((options,n)=>options.find(o=>parseInt(o.textContent)===n)?.value,job.stats[i]);
   assert.ok(value,key);
   await field.selectOption(value);
  }
  if(job.people==='humain')await page.locator('#human-stat-final').selectOption('con');
  await next();
  await page.locator('#age-category').selectOption('mature');
  await next();
  const pathId=name=>'classpath:'+name+':class-druide:cof2-lb-2024';
  for(const [slot,name] of [['one',job.primary],['two',job.secondary]])await page.locator('#path-'+slot).selectOption(pathId(name));
  for(const name of [job.primary,job.secondary])await page.locator('[data-rank-add="'+pathId(name)+'"][data-rank="2"]').tap();
  await next();
  await next();
  await page.locator('#reveal-view').tap();
  const verifySummary=async()=>assert.match(await page.locator('#summary-content').innerText(),/Druide/);
  await verifySummary();
  const before=await snapshot();
  assert.deepEqual(before.errors,[]);
  assert.equal(before.people,'people:'+job.people+':cof2-lb-2024');
  for(const name of [job.primary,job.secondary])assert.equal(Math.max(...before.ranks.filter(([id])=>id.includes(pathId(name))).map(([,rank])=>rank)),2);
  await page.getByRole('button',{name:'Enregistrer dans Mes héros',exact:true}).tap();
  await page.reload();
  await page.locator('#forge-main-menu [data-foh-route="heroes"]').tap();
  await page.getByRole('button',{name:'Voir la fiche',exact:true}).first().tap();
  await verifySummary();
  const reopened=await snapshot();
  assert.deepEqual(reopened,before);
  assert.deepEqual(errors,[]);
  row.status='PASS';
  row.result={defense:before.def,pv:before.pv,initiative:before.init};
 }catch(error){
  row.error=error.message;
  row.view=await page.locator('.step.active').innerText().then(s=>s.slice(0,500)).catch(()=>null);
  row.errors=errors;
 }finally{
  await ctx.close();
 }
}

if(require.main===module)(async()=>{
 const {chromium}=require('playwright');
 const browser=await chromium.launch({executablePath:process.env.CHROME_BIN,args:['--no-sandbox']});
 try{for(const job of jobs)await runCase(browser,job);}
 finally{await browser.close();}
 report.passed=report.cases.filter(c=>c.status==='PASS').length;
 report.status=report.passed===jobs.length?'PASS':'FAIL';
 fs.writeFileSync('forge-of-heroes/QA/N1/druide-choices-chrome.json',JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify(report));
 if(report.status!=='PASS')process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});
