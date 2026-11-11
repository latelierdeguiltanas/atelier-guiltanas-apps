'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const {createHash}=require('node:crypto');
const {chromium}=require('playwright');
const rankTwo=[
 {path:'brute',ability:'tour-de-force',label:'Tour de force',totals:[13,13,14]},
 {path:'pagne',ability:'peau-de-pierre',label:'Peau de pierre',totals:[15,12,11]},
 {path:'pourfendeur',ability:'charge',label:'Charge',totals:[13,13,14]},
 {path:'primitif',ability:'armure-de-vent',label:'Armure de vent',totals:[14,13,11]},
 {path:'rage',ability:'defier-la-mort',label:'Défier la mort',totals:[13,12,11]}
];
const pathIds={brute:'voie-de-la-brute',pagne:'voie-du-pagne',pourfendeur:'voie-du-pourfendeur',primitif:'voie-du-primitif',rage:'voie-de-la-rage'};
const jobs=[
 {people:'humain',defense:'AGI',stats:[2,1,0,1,3,0,-1],tattoo:'FOR'},
 {people:'humain',defense:'CON',stats:[2,1,3,1,0,0,-1],tattoo:'CON'},
 {people:'halfelin',defense:'AGI',stats:[2,1,0,1,3,0,-1],tattoo:'PER'},
 ...rankTwo.map(r=>({people:'humain',defense:'AGI',stats:[2,1,0,1,3,0,-1],rankTwo:r.path}))
];
const report={status:'FAIL',cases:[],indexSha256:createHash('sha256').update(fs.readFileSync('forge-of-heroes/index.html')).digest('hex')};

async function runCase(browser,job){
 const ctx=await browser.newContext({viewport:{width:393,height:852},isMobile:true,hasTouch:true});
 const page=await ctx.newPage(),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 page.setDefaultTimeout(9000);
 const next=()=>page.locator('#next-btn').tap();
 const snapshot=()=>page.evaluate(()=>{
  const draft=window.__FOH_PRODUCT__.buildState();
  const r=window.__FOH_ENGINE__.computeCharacterN1(draft);
  return {errors:r.errors,def:r.sticky.DEF,skills:r.sticky.skillBonuses,pv:r.sticky.PV,init:r.sticky.INIT,ranks:r.sticky.acquiredAbilities.map(a=>[a.id,a.rank]),choices:draft.abilityChoices,attacks:r.sticky.attacks};
 });
 const row={...job,status:'FAIL'};
 report.cases.push(row);
 try{
  await page.goto('http://127.0.0.1:4173/forge-of-heroes/');
  await page.locator('#start-classic').tap();
  await page.locator('#mode-classic').tap();
  await page.locator('#hero-name').fill('QA Barbare '+job.people+' '+job.defense);
  await next();
  await page.locator('#rule-age').tap();
  await next();
  await next();
  await page.locator('#people-selector').selectOption('people:'+job.people+':cof2-lb-2024');
  if(job.people==='halfelin')await page.locator('#people-bonus').selectOption('agi');
  await next();
  await page.locator('#profile-selector').selectOption('class:barbare:cof2-lb-2024');
  await next();
  for(const [i,key] of ['FOR','AGI','CON','PER','INT','VOL','CHA'].entries()){
   const field=page.getByRole('combobox',{name:new RegExp('^'+key+' ')});
   const value=await field.locator('option').evaluateAll((options,n)=>options.find(o=>parseInt(o.textContent)===n)?.value,job.stats[i]);
   assert.ok(value,key);
   await field.selectOption(value);
  }
  if(job.people==='humain')await page.locator('#human-stat-final').selectOption(job.defense==='CON'?'vol':'con');
  await next();
  await page.locator('#age-category').selectOption(job.tattoo?'venerable':'mature');
  await next();
  const primary=job.rankTwo||'pagne',secondary=primary==='brute'?'pourfendeur':'brute';
  const selectPath=(slot,name)=>page.locator('#path-'+slot).selectOption('classpath:'+pathIds[name]+':class-barbare:cof2-lb-2024');
  await selectPath('one',primary);
  await selectPath('two',secondary);
  const path=name=>page.locator('article.choice').filter({hasText:new RegExp('voie.*'+name,'i')});
  for(const name of (job.tattoo?[primary,primary,secondary]:[primary,secondary]))await path(name).getByRole('button',{name:/Acquérir/}).first().tap();
  if(primary==='pagne')await page.locator('.stone-skin-choice-buttons button[data-value="'+job.defense+'"]').tap();
  if(job.tattoo){
   const tattoo=page.locator('select[data-ability-choice$="|tattooStat"]');
   const available=await tattoo.locator('option').evaluateAll(options=>options.filter(o=>o.value).map(o=>o.value));
   assert.deepEqual(available,['FOR','CON','AGI','PER','CHA','INT','VOL']);
   await tattoo.selectOption(job.tattoo);
  }
  await next();
  if(job.people==='halfelin'){
   await page.locator('#equipment-swap-approved').check();
   await page.locator('#equipment-swap-weapon-0').selectOption('weapon:axe');
  }
  await next();
  await page.locator('#reveal-view').tap();
  const target=rankTwo.find(r=>r.path===job.rankTwo);
  const ability=target?.ability||'tatouages';
  const expected=target?/rang 2/:new RegExp('\\+3 aux tests de '+job.tattoo);
  const verifySummary=async()=>assert.match(await page.locator('[data-summary-ability^="ability:'+ability+':"],[data-summary-ability^="ability:'+ability+'-"]').innerText(),expected);
  await verifySummary();
  const before=await snapshot();
  assert.deepEqual(before.errors,[]);
  if(target){
   assert.ok(before.ranks.some(([id,rank])=>id.startsWith('ability:'+ability)&&rank===2));
   assert.equal(before.ranks.some(([,rank])=>rank>2),false);
   assert.deepEqual([before.pv,before.def,before.init],target.totals);
  }else{
   assert.equal(before.def,job.defense==='CON'?14:job.people==='halfelin'?15:13);
   const skill=before.skills.filter(s=>s.sourceAbilityId.includes('ability:tatouages:'));
   assert.deepEqual(skill.map(s=>[s.tests,s.value]),[[[job.tattoo],3]]);
   if(job.people==='halfelin')assert.equal(before.attacks.find(a=>a.weaponId==='weapon:axe').hands,2);
  }
  await page.getByRole('button',{name:'Enregistrer dans Mes héros',exact:true}).tap();
  await page.reload();
  await page.locator('#open-heroes').tap();
  await page.getByRole('button',{name:'Voir la fiche',exact:true}).first().tap();
  await verifySummary();
  const reopened=await snapshot();
  assert.deepEqual(reopened,before);
  assert.deepEqual(errors,[]);
  row.status='PASS';
  row.result=target?{ability:target.label,rank:2,defense:before.def,pv:before.pv,initiative:before.init}:{defense:before.def,skill:job.tattoo,bonus:3};
 }catch(error){
  row.error=error.message;
  row.view=await page.locator('.step.active').innerText().then(s=>s.slice(0,500)).catch(()=>null);
  row.errors=errors;
 }finally{
  await ctx.close();
 }
}

(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_BIN,args:['--no-sandbox']});
 try{for(const job of jobs)await runCase(browser,job);}
 finally{await browser.close();}
 report.passed=report.cases.filter(c=>c.status==='PASS').length;
 report.status=report.passed===jobs.length?'PASS':'FAIL';
 fs.writeFileSync('forge-of-heroes/QA/N1/barbare-choices-click.json',JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify(report));
 if(report.status!=='PASS')process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});
