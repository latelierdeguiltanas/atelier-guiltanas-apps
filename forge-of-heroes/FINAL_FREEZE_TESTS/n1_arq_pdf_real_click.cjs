'use strict';
const {chromium}=require('playwright'),{PDFDocument,StandardFonts}=require('pdf-lib'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),os=require('os'),cp=require('child_process');
const results=[],failures=[];
(async()=>{
 const template=await PDFDocument.create();const f=await template.embedFont(StandardFonts.Helvetica);
 for(let i=0;i<2;i++){const page=template.addPage([612,792]);page.drawText('FICHE VIERGE DE CONTRÔLE - TEST AUTOMATIQUE '+(i+1),{x:24,y:755,size:11,font:f});}
 const templatePath=path.join(os.tmpdir(),'cof2-blank-test-two-pages.pdf');fs.writeFileSync(templatePath,await template.save());
  const browser=await chromium.launch({executablePath:process.env.CHROME_BIN||undefined,args:['--no-sandbox']});
 try{
 for(const variant of ['Arquebusier','Arbalétrier']){
  const ctx=await browser.newContext({viewport:{width:393,height:852},hasTouch:true,isMobile:true,acceptDownloads:true});
  const page=await ctx.newPage();page.setDefaultTimeout(7000);
  page.on('dialog',async d=>{results.push({variant,dialog:d.message()});await d.accept()});
  const click=async locator=>page.locator(locator).tap(),next=()=>click('#next-btn');
  const choose=async(sel,name)=>{const o=page.locator(sel),val=await o.locator('option').evaluateAll((xs,v)=>xs.find(x=>x.textContent.toLowerCase().includes(v.toLowerCase()))?.value,name);assert.ok(val,sel+' missing '+name);await o.selectOption(val)};
  const name='Audit PDF '+variant+' N1';
  try{
   await page.goto('http://127.0.0.1:4173/forge-of-heroes/',{waitUntil:'domcontentloaded'});
   await click('#start-classic');await click('#mode-classic');await page.locator('#hero-name').fill(name);
   await next();await next();await next();await choose('#people-selector','Humain');await next();
   await choose('#profile-selector',variant);await next();
   for(const [i,k]of ['FOR','AGI','CON','PER','INT','VOL','CHA'].entries()){
    const n=[2,1,0,1,3,0,-1][i];const el=page.getByRole('combobox',{name:new RegExp('^'+k+' ')});
    const v=await el.locator('option').evaluateAll((o,n)=>o.find(x=>parseInt(x.textContent)===n)?.value,n);
    await el.selectOption(v);
   }
   await choose('#human-stat-final','CON');await next();await next();
   if(variant==='Arquebusier'){await choose('#path-one','artilleur');await choose('#path-two','mercenaire')}
   else{await choose('#path-one','maître d’armes');await choose('#path-two','artilleur');await page.getByRole('button',{name:'Arbalètes',exact:true}).tap()}
   await next();await next();await click('#reveal-view');
   assert.match(await page.locator('#summary-content').innerText(),new RegExp(variant));
   const btn=page.getByRole('button',{name:/Exporter la fiche officielle PDF/}).first();
   await btn.waitFor({timeout:8000});
   const evt=page.waitForEvent('download',{timeout:30000});
   await btn.tap();
   const input=page.locator('#official-sheet-file');await input.waitFor({timeout:6000});
   await input.setInputFiles(templatePath);
   const download=await evt;
   const filename=path.join(os.tmpdir(),variant.toLowerCase()+'-n1-export.pdf');
   await download.saveAs(filename);
   const meta=cp.execFileSync('pdfinfo',[filename],{encoding:'utf8'});
   const pages=Number(meta.match(/^Pages:\s+(\d+)/m)?.[1]);
   const extracted=cp.execFileSync('pdftotext',['-layout',filename,'-'],{encoding:'utf8'});
   const checks={variant,template:'Fiche vierge de test 2 pages, format Letter (modèle officiel réel non fourni au serveur de test)',filename:download.suggestedFilename(),pages,size:fs.statSync(filename).size,textLength:extracted.length,containsName:extracted.includes(name),containsProfile:extracted.includes(variant),containsArtillerie:/artilleur|Mécanismes/i.test(extracted),containsMaster:/maître d’armes|Armes de prédilection/i.test(extracted)};
   results.push(checks);
   assert.ok(pages>=3,'Official 2-page sheet and path annexes should be at least 3 pages; got '+pages);
   assert.ok(checks.containsName&&checks.containsProfile,'Name and profile must appear in PDF');
  }catch(e){failures.push({variant,message:String(e.stack||e),view:await page.locator('body').innerText().then(s=>s.slice(-1000)).catch(()=>'')});}
  await ctx.close();
 }
 }finally{await browser.close()}
 const report={schema:'FOH_N1_PDF_REAL_CHROME',at:new Date().toISOString(),status:failures.length?'FAIL':'PASS',results,failures};
 fs.writeFileSync('forge-of-heroes/QA/N1/arquebusier-pdf-real-click.json',JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify(report).slice(0,7600));if(failures.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
