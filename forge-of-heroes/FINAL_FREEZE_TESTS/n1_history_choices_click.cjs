'use strict';
/* Real mobile taps: Scholar choices and Courtisan R5 grants in both pure profile variants.
 * One profile path + geographic/professional histories, canonical skill bonus,
 * save/reload/reopen. Read-only inspection of the UI-created state.
 */
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const jobs=['Arquebusier','Arbalétrier'].flatMap(variant=>[{variant,history:'Érudit',key:'scholar',rank:1},{variant,history:'Érudit',key:'scholar',rank:5},{variant,history:'Courtisan',key:'courtier',rank:5}]);
const crypto=require('node:crypto');
const shaIndex=crypto.createHash('sha256').update(fs.readFileSync('forge-of-heroes/index.html')).digest('hex');
const report={indexSha256:shaIndex,schema:'FOH_N1_ARQ_HISTORY_CHOICES_REAL_CLICK',at:new Date().toISOString(),scope:'Six créations humaines N1 : Érudit R1/R5, Courtisan R5 avec don R3 et sous-don R1, deux variantes. Domaines, langues pondérées, bonus, sauvegarde et réouverture au clic.',cases:[],status:'PENDING',passed:0,failed:0};
(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROME_BIN||undefined,args:['--no-sandbox']});
try{
  for(const job of jobs){
   const name='QA Choix '+job.variant+' '+job.history+' R'+job.rank;
   const ctx=await browser.newContext({viewport:{width:393,height:852},hasTouch:true,isMobile:true});
   const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(String(e)));
   page.setDefaultTimeout(7000);const next=()=>page.locator('#next-btn').tap();
   const choose=async(sel,part)=>{const el=page.locator(sel),option=await el.locator('option').evaluateAll((oo,v)=>oo.find(o=>o.textContent.toLowerCase().includes(v.toLowerCase()))?.value,part);assert.ok(option,sel+' missing '+part+' options '+(await el.locator('option').allTextContents()).join('; '));await el.selectOption(option);};
   const rec={variant:job.variant,history:job.key,rank:job.rank,name,status:'FAIL',steps:[]};report.cases.push(rec);
   try{
    await page.goto('http://127.0.0.1:4173/forge-of-heroes/',{waitUntil:'domcontentloaded'});
    await page.locator('#start-classic').tap();await page.locator('#mode-classic').tap();await page.locator('#hero-name').fill(name);
    await next();await page.locator('#rule-history').tap();if(job.rank>1)await page.locator('#rule-age').tap();await next();await next();await choose('#people-selector','Humain');await next();await choose('#profile-selector',job.variant);await next();
    for(const [n,key]of ['FOR','AGI','CON','PER','INT','VOL','CHA'].entries()){
      const value=[2,1,0,1,3,0,-1][n],el=page.getByRole('combobox',{name:new RegExp('^'+key+' ')});
      const opt=await el.locator('option').evaluateAll((xs,v)=>xs.find(o=>parseInt(o.textContent)===v)?.value,value);
      assert.ok(opt,'Characteristic '+key+' '+value+' not allowed');await el.selectOption(opt);
    }
    await choose('#human-stat-final','CON');await next();await choose('#history-geo','montagnes');await choose('#history-pro',job.history);if(job.rank>1)await page.locator('#age-category').selectOption('venerable');
    const profession=page.locator('#history-human-profession');if(await profession.isVisible())await profession.fill('Charpentier');await next();await choose('#path-one','artilleur');
    if(job.rank>1)for(let n=0;n<4;n++)await page.locator('button[data-rank-add="history:'+job.key+'"]').tap();
    if(job.key==='scholar'){
      await page.locator('select[data-ability-choice$="|scholarDomain"]').selectOption('science_technology');
      const languages=job.rank===5?['argotien','sylvestre','runique','noir-parle']:['sylvestre'];
      for(const language of languages)await page.locator('input[data-ability-choice-multi$="|scholarLanguages"][value="'+language+'"]').tap();
      if(job.rank>=3)await page.locator('select[data-ability-choice$="|scholarSecondaryDomain"]').selectOption('plants_creatures');
    }else{
      const select=page.locator('select[data-ability-choice$="|courtierGrantedAbility"]'),value=await select.locator('option').evaluateAll(xs=>xs.find(o=>o.value.startsWith('ability:combattant-aguerri:')&&o.value.includes('class-arquebusier:'))?.value);assert(value,'Rang 3 aventurier proposé');await select.selectOption(value);await choose('select[data-ability-choice$="|combattantAguerriAbility"]','Robustesse');
    }
    await next();rec.steps.push('one-profile-path-and-two-histories');
    await next();await page.locator('#reveal-view').tap();
    const before=await page.locator('#summary-content').innerText();
    assert(before.includes(job.variant)&&before.includes(name),'Summary missing name or variant');
    for(const field of ['PV','DEF','INIT'])assert(new RegExp('(?:^|\\n)'+field+'(?:\\n|\\s)').test(before),'Derived field '+field+' absent');
    rec.steps.push('sheet');
    await page.getByRole('button',{name:'Enregistrer dans Mes héros',exact:true}).tap();
    await page.reload({waitUntil:'domcontentloaded'});await page.locator('#open-heroes').tap();
    await page.getByRole('button',{name:'Voir la fiche',exact:true}).first().tap();
    const after=await page.locator('#summary-content').innerText();
    assert.equal(after,before,'Save/reopen changed summary');rec.steps.push('save-reopen');
    const character=await page.evaluate(()=>{const r=window.__FOH_ENGINE__.computeCharacterN1(window.__FOH_PRODUCT__.buildState());return{errors:r.errors,skills:r.sticky?.skillBonuses,languages:r.sticky?.languages,abilities:r.sticky?.acquiredAbilities,PV:r.sticky?.PV,DEF:r.sticky?.DEF};});assert.equal(character.errors.length,0,character.errors.join('; '));
    if(job.key==='scholar'){const main=character.skills.find(b=>b.sourceAbilityId==='ability:history:scholar:r1');assert.equal(main.value,job.rank+2);assert.deepEqual(main.tests,['Sciences et techniques']);assert.equal(character.languages.scholarLanguages.length,job.rank===5?4:1);if(job.rank===5){assert(character.languages.scholarLanguages.includes('argotien'));const secondary=character.skills.find(b=>b.sourceAbilityId==='ability:history:scholar:r3');assert.equal(secondary.value,3);assert.equal(secondary.bonusType,'people');assert.deepEqual(secondary.tests,['Plantes et créatures']);}}else{assert(character.abilities.some(a=>a.id.startsWith('ability:combattant-aguerri:')&&a.rank===3));assert(character.abilities.some(a=>a.id.startsWith('ability:robustesse:')&&a.rank===1));assert.equal(character.PV,11);assert.equal(character.DEF,14);}
    rec.steps.push('canonical-choices-and-values-after-reopen');
    assert.equal(errors.length,0,'Browser JS errors '+errors.join(' ; '));
    rec.status='PASS';report.passed++;
   }catch(e){rec.message=String(e.stack||e).slice(0,1500);rec.stepView=await page.locator('.step.active').innerText().then(s=>s.slice(0,850)).catch(()=>null);rec.jsErrors=errors.slice(0,3);report.failed++;}
   finally{await ctx.close()}
   console.log(job.variant+' '+job.history+' R'+job.rank+': '+rec.status+(rec.message?' '+rec.message.slice(0,120):''));
  }
}finally{await browser.close()}
report.status=report.failed===0&&report.passed===6?'PASS':'FAIL';
fs.writeFileSync('forge-of-heroes/QA/N1/arquebusier-history-choices-click.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,passed:report.passed,failed:report.failed,failures:report.cases.filter(x=>x.status!=='PASS').slice(0,8)}).slice(0,5700));
if(report.status!=='PASS')process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});