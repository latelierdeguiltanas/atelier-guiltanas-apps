'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const scenarios=[
 ['Voleur','assassin','aventurier',[9,13,11,3,0]],
 ['Voleur','assassin','aventurier',[9,14,11,4,0]],
 ['Barbare','pagne','brute',[15,12,11,2,0]],
 ['Guerrier','maître d’armes','bouclier',[10,16,11,2,0]],
 ['Arquebusier','artilleur','explosifs',[9,13,11,3,0]],
 ['Arquebusier','mercenaire','artilleur',[8,14,12,3,0]],
 ['Voleur','assassin','artilleur',[9,13,11,3,0]],
 ['Voleur','assassin',null,[8,12,11,3,0]],
 ['Magicien','magie des arcanes','magie destructrice',[7,11,11,2,3]],
 ['Chevalier','noblesse','cavalier',[11,18,11,2,0]],
 ['Sans profil','assassin','artilleur',[9,13,11,3,0]],
 ['Voleur','assassin','aventurier',[9,12,11,3,0]]
];
async function run(browser,n){
 const ctx=await browser.newContext({viewport:{width:393,height:852},isMobile:true,hasTouch:true,acceptDownloads:false});
 const p=await ctx.newPage();p.setDefaultTimeout(4000);
 const click=id=>p.locator(id).tap(),next=()=>click('#next-btn');
 const choose=async(id,part)=>{const el=p.locator(id);const opt=await el.locator('option').evaluateAll((oo,v)=>oo.find(o=>o.textContent.toLowerCase().includes(v.toLowerCase()))?.value,part);assert.notEqual(opt,undefined,id+' '+part);await el.selectOption(opt);};
 const [profile,first,second,expected]=scenarios[n-1],age=({3:'Mûr',4:'Vénérable',5:'Mûr',6:'Vénérable',8:'Vénérable',12:'Mûr'})[n];
 try{
  await p.goto((process.env.FORGE_BASE||'http://127.0.0.1:4173/forge-of-heroes/'));await click('#start-classic');await click('#mode-classic');
  assert.equal(await p.locator('#next-btn').isEnabled(),false);await p.locator('#hero-name').fill('Recette '+n);await next();
  if(age)await click('#rule-age');if(n===8)await click('#rule-history');if(n===12)await click('#rule-a-la-carte');await next();
  if(n===7)await click('[data-type=hybrid]');if(n===11)await click('#type-no-profile');await next();
  await choose('#people-selector','HUMAIN');await next();
  if(n===7){await choose('#primary-profile',profile);await choose('#secondary-profile','Arquebusier');assert.equal(await p.locator('#next-btn').isEnabled(),false);await click('#gm-approved');}
  else if(n!==11)await choose('#profile-selector',profile);await next();
  if(n===2)await choose('#characteristic-method','achat');
  for(const [i,key] of ['FOR','AGI','CON','PER','INT','VOL','CHA'].entries()){
   const val=(n===2?[2,2,1,1,0,0,-1]:[2,1,0,1,3,0,-1])[i];
   const el=p.getByRole('combobox',{name:new RegExp('^'+key+' ')});const value=await el.locator('option').evaluateAll((oo,v)=>oo.find(o=>parseInt(o.textContent)===v)?.value,val);
   await el.selectOption(value);
  }
  await choose('#human-stat-final',n===2?'CHA':'CON');await next();if(age)await choose('#age-category',age);await next();
  if(n===11){
   for(const [i,v] of [first,second].entries()){
    await p.getByRole('searchbox').nth(i).fill(v);await p.getByRole('button',{name:new RegExp('Voie.*'+v,'i')}).first().tap();
   }
  }else{
   await choose(n===7?'#hybrid-primary-path':'#path-one',first);
   if(second)await choose(n===7?'#hybrid-secondary-path':'#path-two',second);
  }
  if(n===9)await choose('#mage-r2','Lévitation');
  if(age&&n!==12){
   const ranks=n===8?['campagnes','campagnes','campagnes','campagnes']:age==='Mûr'?[first,second]:[first,first,second];
   for(const name of ranks)await p.locator('article.choice').filter({hasText:new RegExp('voie.*'+name,'i')}).getByRole('button',{name:/Acquérir/}).tap();
  }
  if(n===4)await p.getByRole('button',{name:'Épées',exact:true}).tap();
  if(n===10)await click('[data-extra-language=celestien]');
  if(n===6)await choose('select[data-ability-choice$="|combattantAguerriAbility"]','Archer émérite');
  if(n===12){
   for(const [type,val] of [['language','sylvestre'],['skill','Survie']]){
    await p.locator('#alc-type').selectOption(type);await choose('#alc-choice',val);await click('#alc-add');
   }
  }
  await next();
  if(n===5||n===6){await click('[data-pistol-count="1"]');if(n===5){await click('[data-pistol-count="2"]');await click('[data-pistol-count="3"]');assert.match(await p.locator('#repeating-pistol-status').innerText(),/maximum 2/);await click('[data-pistol-count="1"]');}}
  await next();await click('#reveal-view');
  const summary=()=>p.locator('#summary-content').innerText();const verify=async()=>{const text=await summary();for(const [i,k] of ['PV','DEF','INIT','PC','PM'].entries())assert.match(text,new RegExp('(?:^|\\n)'+k+'\\n'+expected[i]+'(?:\\n|$)'));return text};
  const before=await verify();await p.getByRole('button',{name:'Enregistrer dans Mes héros',exact:true}).tap();await p.reload();await click('#open-heroes');await p.getByRole('button',{name:'Voir la fiche',exact:true}).first().tap();assert.equal(await verify(),before);
  await click('#native-play-sheet');const sheet=p.frameLocator('#sheet');await sheet.getByRole('heading',{name:'Recette '+n,exact:true}).waitFor();await p.reload();await sheet.getByRole('heading',{name:'Recette '+n,exact:true}).waitFor();assert.equal(await sheet.getByText(expected[0]+'/'+expected[0],{exact:true}).count(),1);
  return {n,status:'PASS',expected};
 }catch(e){return {n,status:'FAIL',message:e.message,screen:await p.locator('.step.active').innerText().catch(()=>'')};}finally{await ctx.close();}
}
(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROME_BIN||undefined,args:['--no-sandbox']});let results=[];try{for(const n of process.argv.slice(2).map(Number).length?process.argv.slice(2).map(Number):scenarios.map((_,i)=>i+1)){const r=await run(browser,n);console.log(n,r.status,r.message?.slice(0,180)||'');results.push(r);}}finally{await browser.close();}fs.writeFileSync(process.env.CLICK_REPORT||'n1-click-results.json',JSON.stringify(results,null,2));if(results.some(x=>x.status==='FAIL'))process.exitCode=1;})().catch(e=>{console.error(e);process.exitCode=1});
