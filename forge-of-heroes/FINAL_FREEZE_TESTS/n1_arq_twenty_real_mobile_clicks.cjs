'use strict';
/* Test *real taps* in actual Forge; not VM simulation. 10 legal two-path combinations
 * for Arquebusier and 10 for the published Arbalétrier variant, one separate
 * complete create/save/reload/open/sheet journey per combination.
 * COF2 printed p.62-65. Does not certify ages, 8 peoples or conditional combat effects.
 */
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const variants=[
 {label:'Arquebusier',paths:['artilleur','explosifs','mercenaire','pistolero','précision']},
 {label:'Arbalétrier',paths:['artilleur','mercenaire','pistolero','précision','maître d’armes']}
];
const crypto=require('node:crypto');
const shaIndex=crypto.createHash('sha256').update(fs.readFileSync('forge-of-heroes/index.html')).digest('hex');
const report={indexSha256:shaIndex,schema:'FOH_N1_ARQ_BOTH_VARIANTS_ALL_TEN_PAIRS_REAL_CLICKS',at:new Date().toISOString(),scope:'20 parcours utilisateur Chrome tactile 393x852, peuple Humain jeune, création et choix de deux voies, fiche, sauvegarde, réouverture, contrôles JavaScript et feuille interactive. Ni huit peuples, ni âges avancés, ni tous effets contextuels.',cases:[],status:'PENDING',passed:0,failed:0};
(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROME_BIN||undefined,args:['--no-sandbox']});
try{
  for(const variant of variants)for(let i=0;i<variant.paths.length;i++)for(let j=i+1;j<variant.paths.length;j++){
   const first=variant.paths[i],second=variant.paths[j],name='QA '+variant.label+' '+i+'-'+j;
   const ctx=await browser.newContext({viewport:{width:393,height:852},hasTouch:true,isMobile:true});
   const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(String(e)));
   page.setDefaultTimeout(7000);const next=()=>page.locator('#next-btn').tap();
   const choose=async(sel,part)=>{const el=page.locator(sel),option=await el.locator('option').evaluateAll((oo,v)=>oo.find(o=>o.textContent.toLowerCase().includes(v.toLowerCase()))?.value,part);assert.ok(option,sel+' missing '+part+' options '+(await el.locator('option').allTextContents()).join('; '));await el.selectOption(option);};
   const rec={variant:variant.label,first,second,name,status:'FAIL',steps:[]};report.cases.push(rec);
   try{
    await page.goto('http://127.0.0.1:4173/forge-of-heroes/',{waitUntil:'domcontentloaded'});
    await page.locator('#start-classic').tap();await page.locator('#mode-classic').tap();await page.locator('#hero-name').fill(name);
    await next();await next();await next();await choose('#people-selector','Humain');await next();await choose('#profile-selector',variant.label);await next();
    for(const [n,key]of ['FOR','AGI','CON','PER','INT','VOL','CHA'].entries()){
      const value=[2,1,0,1,3,0,-1][n],el=page.getByRole('combobox',{name:new RegExp('^'+key+' ')});
      const opt=await el.locator('option').evaluateAll((xs,v)=>xs.find(o=>parseInt(o.textContent)===v)?.value,value);
      assert.ok(opt,'Characteristic '+key+' '+value+' not allowed');await el.selectOption(opt);
    }
    await choose('#human-stat-final','CON');await next();await next();
    await choose('#path-one',first);await choose('#path-two',second);
    if(variant.label==='Arbalétrier'&&(first.includes('maître')||second.includes('maître'))){
      const cat=page.getByRole('button',{name:'Arbalètes',exact:true});
      if(await cat.count())await cat.tap();
      else await choose('select[data-ability-choice$="|preferredWeaponCategory"]','arbalète');
    }
    await next();rec.steps.push('chosen-two-paths');
    await next();await page.locator('#reveal-view').tap();
    const before=await page.locator('#summary-content').innerText();
    assert(before.includes(variant.label)&&before.includes(name),'Summary missing name or variant');
    for(const field of ['PV','DEF','INIT'])assert(new RegExp('(?:^|\\n)'+field+'(?:\\n|\\s)').test(before),'Derived field '+field+' absent');
    rec.steps.push('sheet');
    await page.getByRole('button',{name:'Enregistrer dans Mes héros',exact:true}).tap();
    await page.reload({waitUntil:'domcontentloaded'});await page.locator('#open-heroes').tap();
    await page.getByRole('button',{name:'Voir la fiche',exact:true}).first().tap();
    const after=await page.locator('#summary-content').innerText();
    assert.equal(after,before,'Save/reopen changed summary');rec.steps.push('save-reopen');
    const sheet=page.locator('#native-play-sheet');await sheet.waitFor({timeout:7000});await sheet.tap();
    const iframe=page.frameLocator('#sheet');await iframe.getByRole('heading',{name,exact:true}).waitFor({timeout:9000});rec.steps.push('interactive-sheet');
    assert.equal(errors.length,0,'Browser JS errors '+errors.join(' ; '));
    rec.status='PASS';report.passed++;
   }catch(e){rec.message=String(e.stack||e).slice(0,1500);rec.stepView=await page.locator('.step.active').innerText().then(s=>s.slice(0,850)).catch(()=>null);rec.jsErrors=errors.slice(0,3);report.failed++;}
   finally{await ctx.close()}
   console.log(variant.label+' '+first+' / '+second+': '+rec.status+(rec.message?' '+rec.message.slice(0,120):''));
  }
}finally{await browser.close()}
report.status=report.failed===0&&report.passed===20?'PASS':'FAIL';
fs.writeFileSync('forge-of-heroes/QA/N1/arquebusier-20-real-mobile-pairs.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,passed:report.passed,failed:report.failed,failures:report.cases.filter(x=>x.status!=='PASS').slice(0,8)}).slice(0,5700));
if(report.status!=='PASS')process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});