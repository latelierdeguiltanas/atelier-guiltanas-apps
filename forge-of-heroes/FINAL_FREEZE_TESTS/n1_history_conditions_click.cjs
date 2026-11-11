'use strict';
/* Real mobile taps: Scholar choices and Courtisan R5 grants in both pure profile variants.
 * One profile path + geographic/professional histories, canonical skill bonus,
 * save/reload/reopen. Read-only inspection of the UI-created state.
 */
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const jobs=['Arquebusier','Arbalétrier'].flatMap(variant=>[{variant,history:'Courtisan',key:'courtier',rank:3},{variant,history:'Érudit',key:'scholar',rank:3},{variant,history:'Expert',key:'expert',rank:2}]);
const crypto=require('node:crypto');
const shaIndex=crypto.createHash('sha256').update(fs.readFileSync('forge-of-heroes/index.html')).digest('hex');
const report={indexSha256:shaIndex,schema:'FOH_N1_ARQ_HISTORY_CONDITIONS_REAL_CLICK',at:new Date().toISOString(),scope:'Six créations au clic : Courtisan R3, Érudit R3, Expert R2 sur deux variantes ; bonus communautaire, cinq règles contextuelles, situations favorables et défavorables, sauvegarde et reprise.',cases:[],status:'PENDING',passed:0,failed:0};
(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROME_BIN||undefined,args:['--no-sandbox']});
try{
  for(const job of jobs){
   const name='QA Situations '+job.variant+' '+job.history+' R'+job.rank;
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
    for(let n=1;n<job.rank;n++)await page.locator('button[data-rank-add="history:'+job.key+'"]').tap();
    for(let n=0;n<5-job.rank;n++)await page.locator('button[data-rank-add="history:mountains"]').tap();
    if(job.key==='scholar'){
      await page.locator('select[data-ability-choice$="|scholarDomain"]').selectOption('science_technology');
      for(const language of ['sylvestre','runique','noir-parle'])await page.locator('input[data-ability-choice-multi$="|scholarLanguages"][value="'+language+'"]').tap();
      await page.locator('select[data-ability-choice$="|scholarSecondaryDomain"]').selectOption('plants_creatures');
    }
    const layout=await page.evaluate(()=>({viewport:innerWidth,bodyWidth:document.documentElement.scrollWidth,choiceWidth:document.querySelector('#ability-choice-fields')?.getBoundingClientRect().width}));assert(layout.bodyWidth<=layout.viewport+2,'Persistent choices overflow the mobile viewport: '+JSON.stringify(layout));rec.steps.push('choices-fit-mobile-viewport');
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
    const panel=page.locator('#foh-history-context');await panel.waitFor({state:'visible'});await panel.locator('summary').tap();
    const expected=job.key==='courtier'?['community','courtier_secrets','courtier_details']:job.key==='scholar'?['community','scholar_persuasion']:['community','expert_work'];
    const originKeys=Array.from({length:5-job.rank},(_,index)=>'ability:history:mountains:r'+(index+2));
    assert.deepEqual(await page.locator('#foh-history-ability option').evaluateAll(xs=>xs.map(x=>x.value)),[...expected,...originKeys]);
    const checks=[['Bonus de compétence : +3','Diviseur des dommages : 2'],['Réduction des dommages : 3'],['Bonus de DEF : 2']];
    for(const [index,key] of originKeys.entries()){
      await page.locator('#foh-history-ability').selectOption(key);
      for(const [situation,value] of checks[index].entries()){
        await page.locator('#foh-history-example').selectOption(String(situation));
        await page.locator('#foh-history-run').tap();
        assert((await page.locator('#foh-history-result').innerText()).includes(value));
      }
      const last=await page.locator('#foh-history-example option').count()-1;
      await page.locator('#foh-history-example').selectOption(String(last));
      await page.locator('#foh-history-run').tap();
      assert.match(await page.locator('#foh-history-result').innerText(),/NON applicable/);
      rec.steps.push('origin-positive-negative-'+key);
    }
    for(const key of expected){
      await page.locator('#foh-history-ability').selectOption(key);
      await page.locator('#foh-history-example').selectOption('0');await page.locator('#foh-history-run').tap();
      const result=await page.locator('#foh-history-result').innerText();assert(result.includes('Règle applicable dans cette situation.'));assert(result.includes('Référence : voies d’historique COF2'));
      if(key==='expert_work'){assert(result.includes('Dé bonus : oui'));assert(result.includes('Temps de travail : × 0.5'));}else assert(result.includes('Bonus de compétence : +'+(key==='community'?3:5)));
      const last=await page.locator('#foh-history-example option').count()-1;await page.locator('#foh-history-example').selectOption(String(last));await page.locator('#foh-history-run').tap();const negative=await page.locator('#foh-history-result').innerText();assert(negative.includes('Règle NON applicable'));assert(!negative.includes('Bonus de compétence :'));
      rec.steps.push('context-positive-negative-'+key);
    }
    if(job.key==='courtier')for(const rank of [2,3])assert.equal(character.skills.find(b=>b.sourceAbilityId==='ability:history:courtier:r'+rank).value,5);
    if(job.key==='scholar')assert.equal(character.skills.find(b=>b.sourceAbilityId==='ability:history:scholar:r2').value,5);
    rec.steps.push('canonical-conditions-after-reopen');
    assert.equal(errors.length,0,'Browser JS errors '+errors.join(' ; '));
    rec.status='PASS';report.passed++;
   }catch(e){rec.message=String(e.stack||e).slice(0,1500);rec.stepView=await page.locator('.step.active').innerText().then(s=>s.slice(0,850)).catch(()=>null);rec.jsErrors=errors.slice(0,3);report.failed++;}
   finally{await ctx.close()}
   console.log(job.variant+' '+job.history+' R'+job.rank+': '+rec.status+(rec.message?' '+rec.message.slice(0,120):''));
  }
}finally{await browser.close()}
report.status=report.failed===0&&report.passed===6?'PASS':'FAIL';
fs.writeFileSync('forge-of-heroes/QA/N1/arquebusier-history-conditions-click.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,passed:report.passed,failed:report.failed,failures:report.cases.filter(x=>x.status!=='PASS').slice(0,8)}).slice(0,5700));
if(report.status!=='PASS')process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});