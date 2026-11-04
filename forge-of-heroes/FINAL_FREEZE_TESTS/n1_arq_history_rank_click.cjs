'use strict';
/* Real mobile taps: Courtisan/Expert in both pure profile variants.
 * One profile path + geographic/professional histories, canonical skill bonus,
 * save/reload/reopen. Read-only inspection of the UI-created state.
 */
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const jobs=[{variant:'Arquebusier',history:'Courtisan',key:'courtier'},{variant:'Arquebusier',history:'Expert',key:'expert'},{variant:'Arbalétrier',history:'Courtisan',key:'courtier'},{variant:'Arbalétrier',history:'Expert',key:'expert'}];
const crypto=require('node:crypto');
const shaIndex=crypto.createHash('sha256').update(fs.readFileSync('forge-of-heroes/index.html')).digest('hex');
const report={indexSha256:shaIndex,schema:'FOH_N1_ARQ_HISTORY_RANK_BONUS_REAL_CLICK',at:new Date().toISOString(),scope:'Quatre créations humaines au N1, deux variantes et deux historiques : choix au clic, bonus canonique +3, sauvegarde et réouverture',cases:[],status:'PENDING',passed:0,failed:0};
(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROME_BIN||undefined,args:['--no-sandbox']});
try{
  for(const job of jobs){
   const name='QA Historique '+job.variant+' '+job.history;
   const ctx=await browser.newContext({viewport:{width:393,height:852},hasTouch:true,isMobile:true});
   const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(String(e)));
   page.setDefaultTimeout(7000);const next=()=>page.locator('#next-btn').tap();
   const choose=async(sel,part)=>{const el=page.locator(sel),option=await el.locator('option').evaluateAll((oo,v)=>oo.find(o=>o.textContent.toLowerCase().includes(v.toLowerCase()))?.value,part);assert.ok(option,sel+' missing '+part+' options '+(await el.locator('option').allTextContents()).join('; '));await el.selectOption(option);};
   const rec={variant:job.variant,history:job.key,name,status:'FAIL',steps:[]};report.cases.push(rec);
   try{
    await page.goto('http://127.0.0.1:4173/forge-of-heroes/',{waitUntil:'domcontentloaded'});
    await page.locator('#start-classic').tap();await page.locator('#mode-classic').tap();await page.locator('#hero-name').fill(name);
    await next();await page.locator('#rule-history').tap();await next();await next();await choose('#people-selector','Humain');await next();await choose('#profile-selector',job.variant);await next();
    for(const [n,key]of ['FOR','AGI','CON','PER','INT','VOL','CHA'].entries()){
      const value=[2,1,0,1,3,0,-1][n],el=page.getByRole('combobox',{name:new RegExp('^'+key+' ')});
      const opt=await el.locator('option').evaluateAll((xs,v)=>xs.find(o=>parseInt(o.textContent)===v)?.value,value);
      assert.ok(opt,'Characteristic '+key+' '+value+' not allowed');await el.selectOption(opt);
    }
    await choose('#human-stat-final','CON');await next();await choose('#history-geo','montagnes');await choose('#history-pro',job.history);
    const profession=page.locator('#history-human-profession');if(await profession.isVisible())await profession.fill('Charpentier');await next();await choose('#path-one','artilleur');
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
    const bonus=await page.evaluate(key=>{const r=window.__FOH_ENGINE__.computeCharacterN1(window.__FOH_PRODUCT__.buildState());return r.sticky.skillBonuses.filter(b=>b.sourceAbilityId==='ability:history:'+key+':r1')},job.key);assert.equal(bonus.length,1);assert.equal(bonus[0].value,3);assert.deepEqual(bonus[0].tests,job.key==='courtier'?['séduire','baratiner','mentir']:['profession']);rec.steps.push('canonical-bonus-after-reopen');
    assert.equal(errors.length,0,'Browser JS errors '+errors.join(' ; '));
    rec.status='PASS';report.passed++;
   }catch(e){rec.message=String(e.stack||e).slice(0,1500);rec.stepView=await page.locator('.step.active').innerText().then(s=>s.slice(0,850)).catch(()=>null);rec.jsErrors=errors.slice(0,3);report.failed++;}
   finally{await ctx.close()}
   console.log(job.variant+' '+job.history+': '+rec.status+(rec.message?' '+rec.message.slice(0,120):''));
  }
}finally{await browser.close()}
report.status=report.failed===0&&report.passed===4?'PASS':'FAIL';
fs.writeFileSync('forge-of-heroes/QA/N1/arquebusier-history-rank-click.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,passed:report.passed,failed:report.failed,failures:report.cases.filter(x=>x.status!=='PASS').slice(0,8)}).slice(0,5700));
if(report.status!=='PASS')process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});