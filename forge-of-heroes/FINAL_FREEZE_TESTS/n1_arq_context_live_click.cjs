'use strict';
/* Real Chrome touch test of the contextual power calculations on released Forge.
 * Uses four different legal rank-1 pathway combinations and the actual UI.
 */
const {chromium}=require('playwright'),fs=require('fs'),assert=require('node:assert/strict');
const scenarios=[
 {variant:'Arquebusier',first:'pistolero',second:'précision',checks:[
  ['plus-vite-que-son-ombre',0,'5'],['plus-vite-que-son-ombre',1,'oui'],['joli-coup',1,'-2']]},
 {variant:'Arquebusier',first:'mercenaire',second:'explosifs',checks:[
  ['pilier-de-bar',0,'1d4°'],['pilier-de-bar',1,'2'],['tir-de-grenaille-l',0,'0.5']]},
 {variant:'Arquebusier',first:'artilleur',second:'mercenaire',checks:[
  ['mecanismes',0,'3'],['mecanismes',1,'oui']]},
 {variant:'Arbalétrier',first:'maître d’armes',second:'pistolero',checks:[
  ['plus-vite-que-son-ombre',1,'oui']]}
];
const report={schema:'FOH_N1_ARQ_CONTEXT_REAL_CHROME',at:new Date().toISOString(),source:'Livre de base COF2 pp.62-65',cases:[],passed:0,failed:0,status:'PENDING'};
(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROME_BIN||undefined,args:['--no-sandbox']});
try{for(const sample of scenarios){
 const ctx=await browser.newContext({viewport:{width:393,height:852},isMobile:true,hasTouch:true});
 const p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));p.setDefaultTimeout(8000);
 const info={variant:sample.variant,first:sample.first,second:sample.second,checks:[],status:'FAIL'};report.cases.push(info);
 const next=()=>p.locator('#next-btn').tap();
 const choose=async(sel,label)=>{const el=p.locator(sel),v=await el.locator('option').evaluateAll((oo,s)=>oo.find(x=>x.textContent.toLowerCase().includes(s.toLowerCase()))?.value,label);assert.ok(v,'No '+label+' in '+sel);await el.selectOption(v)};
 try{
  await p.goto('http://127.0.0.1:4173/forge-of-heroes/',{waitUntil:'domcontentloaded'});
  await p.locator('#start-classic').tap();await p.locator('#mode-classic').tap();await p.locator('#hero-name').fill('QA CONTEXT '+sample.variant);await next();await next();await next();
  await choose('#people-selector','Humain');await next();await choose('#profile-selector',sample.variant);await next();
  for(const [i,key]of ['FOR','AGI','CON','PER','INT','VOL','CHA'].entries()){
   const val=[2,1,0,1,3,0,-1][i],el=p.getByRole('combobox',{name:new RegExp('^'+key+' ')});
   const v=await el.locator('option').evaluateAll((oo,n)=>oo.find(x=>parseInt(x.textContent)===n)?.value,val);assert.ok(v,key);await el.selectOption(v);
  }
  await choose('#human-stat-final','CON');await next();await next();await choose('#path-one',sample.first);await choose('#path-two',sample.second);
  if(sample.variant==='Arbalétrier'){await p.getByRole('button',{name:'Arbalètes',exact:true}).tap();}
  await next();await next();await p.locator('#reveal-view').tap();
  const panel=p.locator('#foh-n1-context-situations');
  await panel.waitFor({state:'visible',timeout:13000});
  await panel.locator('summary').tap();
  assert.equal(await p.evaluate(()=>typeof window.FOH_ARQ_CONTEXT_N1?.resolve),'function','Resolution non exposée');
  for(const [ability,preset,expect]of sample.checks){
   await p.locator('#foh-n1-context-ability').selectOption(ability);
   await p.locator('#foh-n1-context-example').selectOption(String(preset));
   await p.locator('#foh-n1-context-run').tap();
   const txt=await p.locator('#foh-n1-context-result').innerText();
   assert(txt.includes(expect),'Expected '+ability+' result '+expect+' but got '+txt);
   info.checks.push({ability,preset,expected:expect,pass:true});
  }
  assert.equal(errors.length,0,'JS exceptions '+errors.join(' | '));
  info.status='PASS';report.passed++;
 }catch(e){info.error=String(e.stack||e).slice(0,2000);info.browserErrors=errors.slice(0,5);report.failed++;}
 finally{await ctx.close();}
 console.log(sample.variant+' '+sample.first+' / '+sample.second+' = '+info.status+(info.error?' '+info.error.slice(0,200):''));
}}finally{await browser.close()}
report.status=report.failed===0&&report.passed===scenarios.length?'PASS':'FAIL';
fs.writeFileSync('forge-of-heroes/QA/N1/arquebusier-context-real-click.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,passed:report.passed,failed:report.failed,errors:report.cases.filter(x=>x.error)}).slice(0,5800));
if(report.status!=='PASS')process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});