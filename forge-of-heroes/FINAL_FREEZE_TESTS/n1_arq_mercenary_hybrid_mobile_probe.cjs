'use strict';
const fs=require('node:fs'),{chromium}=require('playwright');
const report={schema:'FOH_N1_ARQ_MERCENAIRE_HYBRIDE_REAL_UI_DIAGNOSTIC',at:new Date().toISOString(),steps:[],status:'PENDING',errors:[],source:'COF2 Livre de base pages 65 et 177'};
(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROME_BIN||undefined,args:['--no-sandbox']});const ctx=await browser.newContext({viewport:{width:393,height:852},isMobile:true,hasTouch:true});const p=await ctx.newPage();p.setDefaultTimeout(9000);
const next=()=>p.locator('#next-btn').tap();
const choose=async(sel,part)=>{const el=p.locator(sel),v=await el.locator('option').evaluateAll((xs,term)=>xs.find(o=>o.textContent.toLowerCase().includes(term.toLowerCase()))?.value,part);if(!v)throw Error('Missing '+part+' in '+sel+' options '+(await el.locator('option').allTextContents()).join(','));await el.selectOption(v)};
const inspect=async stage=>{report.steps.push({stage,nextEnabled:await p.locator('#next-btn').isEnabled().catch(()=>null),activeStep:await p.locator('.step.active').innerText().then(x=>x.slice(0,3400)).catch(()=>null),controls:await p.locator('.step.active select,.step.active input,.step.active button').evaluateAll(xs=>xs.map(x=>({tag:x.tagName,id:x.id,role:x.getAttribute('data-action'),type:x.type,value:x.value,checked:x.checked,text:x.innerText?.slice(0,150),options:x.tagName==='SELECT'?[...x.options].slice(0,14).map(o=>({value:o.value,text:o.textContent.slice(0,70)})):null})).slice(0,60)),draft:await p.evaluate(()=>({d:window.__FOH_PRODUCT__?.getDraft?.(),errors:(()=>{try{return window.__FOH_ENGINE__?.computeCharacterN1?.(window.__FOH_PRODUCT__.buildState())?.errors}catch(e){return [String(e)]}})()})).catch(()=>null)});};
try{
 await p.goto('http://127.0.0.1:4173/forge-of-heroes/',{waitUntil:'domcontentloaded'});
 await p.locator('#start-classic').tap();await p.locator('#mode-classic').tap();
 await p.locator('#hero-name').fill('QA Mercenaire bouclier');await next();await next();
 await p.locator('[data-type=hybrid]').tap();await next();
 await choose('#people-selector','Humain');await next();
 await choose('#primary-profile','Arquebusier');await choose('#secondary-profile','Guerrier');
 await p.locator('#gm-approved').tap();await next();
 for(const [i,k]of ['FOR','AGI','CON','PER','INT','VOL','CHA'].entries()){
  const val=[2,1,0,1,3,0,-1][i],el=p.getByRole('combobox',{name:new RegExp('^'+k+' ')});
  const o=await el.locator('option').evaluateAll((xs,n)=>xs.find(x=>parseInt(x.textContent)===n)?.value,val);if(!o)throw Error('Missing characteristic '+k);await el.selectOption(o);
 }
 await choose('#human-stat-final','CON');await next();await next();
 await choose('#hybrid-primary-path','Mercenaire');await choose('#hybrid-secondary-path','Bouclier');
 await inspect('paths');
 await next();await inspect('equipment-or-next');
 await next();await inspect('before-reveal');
 report.status='PROBED';
}catch(e){report.status='INCOMPLETE';report.errors.push(String(e.stack||e));}finally{await ctx.close();await browser.close();}
fs.writeFileSync('forge-of-heroes/QA/N1/arquebusier-mercenary-hybrid-mobile-probe.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,errors:report.errors,steps:report.steps.map(x=>({stage:x.stage,nextEnabled:x.nextEnabled,controls:x.controls?.slice(0,25),errors:x.draft?.errors}))}).slice(0,9800));
})().catch(e=>{console.error(e);process.exitCode=1});
