'use strict';
/* Chrome tactile: cinq vénérables Arquebusier (rang 3 dans chacune des cinq
 * voies) et calcul contextuel au clic de chaque pouvoir R1/R2/R3.
 * Ne remplace pas les huit peuples, les hybrides et toutes les variantes d'équipement.
 */
const fs=require('node:fs'),crypto=require('node:crypto'),{chromium}=require('playwright'),assert=require('node:assert/strict');
const jobs=[
 {first:'artilleur',second:'mercenaire',slugs:['mecanismes','arme-a-repetition','tir-de-barrage-l'],r2:['arme-a-repetition',0,'6']},
 {first:'explosifs',second:'mercenaire',slugs:['tir-de-grenaille-l','demolition','poudre-puissante'],r2:['demolition',0,'3d4°']},
 {first:'mercenaire',second:'artilleur',slugs:['pilier-de-bar','mort-ou-vif-l','combattant-aguerri'],r2:['mort-ou-vif-l',0,'2']},
 {first:'pistolero',second:'précision',slugs:['plus-vite-que-son-ombre','ajuster-le-tir','tir-double-l'],r2:['ajuster-le-tir',0,'5']},
 {first:'précision',second:'pistolero',slugs:['joli-coup','defaut-dans-la-cuirasse-a','tir-precis'],r2:['defaut-dans-la-cuirasse-a',0,'12']}
];
const report={schema:'FOH_N1_ARQUEBUSIER_VENERABLE_CONTEXT_REAL_CLICK',at:new Date().toISOString(),indexSha256:crypto.createHash('sha256').update(fs.readFileSync('forge-of-heroes/index.html')).digest('hex'),scope:'5 voies Arquebusier x rang 3 accessibles à N1 vénérable, Humain, vrai clic Chrome mobile et calculs contextuels. N’est pas un certificat universel des races/équipements.',passed:0,failed:0,status:'PENDING',cases:[]};
(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROME_BIN||undefined,args:['--no-sandbox']});try{
for(const job of jobs){
const ctx=await browser.newContext({viewport:{width:393,height:852},hasTouch:true,isMobile:true});
const p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));p.setDefaultTimeout(7000);
const rec={first:job.first,second:job.second,status:'FAIL',abilities:[],steps:[],error:null};report.cases.push(rec);
const next=()=>p.locator('#next-btn').tap();
const choose=async(id,s)=>{const el=p.locator(id),val=await el.locator('option').evaluateAll((os,s)=>os.find(o=>o.textContent.toLowerCase().includes(s.toLowerCase()))?.value,s);assert.ok(val,'Option '+id+' '+s+' missing');await el.selectOption(val);};
try{
 await p.goto('http://127.0.0.1:4173/forge-of-heroes/',{waitUntil:'domcontentloaded'});
 await p.locator('#start-classic').tap();await p.locator('#mode-classic').tap();await p.locator('#hero-name').fill('Venerable '+job.first);
 await next();await p.locator('#rule-age').tap();await next();await next();
 await choose('#people-selector','Humain');await next();await choose('#profile-selector','Arquebusier');await next();
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
 if(job.first==='mercenaire')await choose('select[data-ability-choice$="|combattantAguerriAbility"]','Vivacité');
 await next();
 if(job.first==='artilleur'||job.second==='artilleur'){
  const count=p.locator('[data-pistol-count="1"]');
  if(await count.count())await count.tap();
 }
 await next();await p.locator('#reveal-view').tap();rec.steps.push('hero');
 const panel=p.locator('#foh-n1-context-situations');await panel.waitFor({state:'visible',timeout:15000});await panel.locator('summary').tap();
 for(const slug of job.slugs){
  const opts=await p.locator('#foh-n1-context-ability option').evaluateAll(xs=>xs.map(x=>x.value));
  assert(opts.includes(slug),'Rang requis '+slug+' absent : '+opts.join('; '));
  await p.locator('#foh-n1-context-ability').selectOption(slug);
  await p.locator('#foh-n1-context-example').selectOption('0');await p.locator('#foh-n1-context-run').tap();
  const result=await p.locator('#foh-n1-context-result').innerText();assert(result.includes('Référence : livre de base COF2'),'Calcul '+slug+' absent');
  rec.abilities.push({slug,result:result.slice(0,350)});
 }
 await p.locator('#foh-n1-context-ability').selectOption(job.r2[0]);
 await p.locator('#foh-n1-context-example').selectOption(String(job.r2[1]));
 await p.locator('#foh-n1-context-run').tap();assert((await p.locator('#foh-n1-context-result').innerText()).includes(job.r2[2]),'R2 formula '+job.r2[0]+' absent');
 if(job.first==='mercenaire'){
  await p.locator('#foh-n1-context-ability').selectOption('don:vivacite');
  const result=p.locator('#foh-n1-context-result');
  await p.locator('#foh-n1-context-example').selectOption('0');
  await p.locator('#foh-n1-context-run').tap();
  assert.match(await result.innerText(),/Actions de mouvement en plus : 1/);
  await p.locator('#foh-n1-context-example').selectOption('1');
  await p.locator('#foh-n1-context-run').tap();
  assert.match(await result.innerText(),/NON applicable/);
  rec.steps.push('vivacite-condition-verified');
 }
 assert.equal(errors.length,0,'Erreurs navigateur '+errors.join(' ; '));
 rec.status='PASS';report.passed++;
}catch(e){rec.error=String(e.stack||e).slice(0,2200);rec.browserErrors=errors.slice(0,5);rec.view=await p.locator('.step.active').innerText().then(x=>x.slice(0,700)).catch(()=>null);report.failed++;}
finally{await ctx.close();}
console.log(job.first+' '+rec.status+(rec.error?' '+rec.error.slice(0,160):''));
}}finally{await browser.close()}
report.status=report.failed===0&&report.passed===5?'PASS':'FAIL';
fs.writeFileSync('forge-of-heroes/QA/N1/arquebusier-venerable-context-click.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,passed:report.passed,failed:report.failed,errors:report.cases.filter(x=>x.status!=='PASS')}).slice(0,5800));
if(report.status!=='PASS')process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
