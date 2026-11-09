'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const V2=require('../peuples-compagnon-v2');
const base='http://127.0.0.1:4173';
(async()=>{
  const browser=await chromium.launch({executablePath:process.env.CHROME_BIN,args:['--no-sandbox']});
  try {
    const page=await browser.newPage({viewport:{width:393,height:852},isMobile:true,hasTouch:true});
    const errors=[];page.on('pageerror',e=>errors.push(String(e)));
    await page.goto(base+'/forge-of-heroes/');
    await page.locator('#start-classic').tap();
    await page.locator('#mode-classic').tap();
    await page.locator('#hero-name').fill('Recette Lutin');
    await page.locator('#hero-sex').selectOption('female');
    for(let i=0;i<3;i++)await page.locator('#next-btn').tap();
    const picker=page.locator('#people-selector');
    await picker.waitFor({state:'visible'});
    assert.equal(await picker.locator('option[value="'+V2.ids.fairy+'"]').count(),0);
    assert.equal((await picker.locator('option[value="'+V2.ids.sprite+'"]').innerText()).trim(),'Lutin');
    await picker.selectOption(V2.ids.sprite);
    assert.equal(await page.locator('#lutin-form').inputValue(),V2.ids.fairy);
    assert.equal(await page.locator('#people-path').inputValue(),V2.paths.fairy);
    await page.locator('#lutin-form').selectOption(V2.ids.sprite);
    assert.equal(await page.locator('#people-path').inputValue(),V2.paths.sprite);
    await picker.selectOption(V2.ids.soul);
    assert.deepEqual(await page.locator('#people-malus option').evaluateAll(xs=>xs.map(x=>x.value)),['cha','int']);
    assert.deepEqual(errors,[]);
    console.log('PASS sélection mobile Lutin, voies Fée et Farfadet, malus Âme-forgée.');
    await page.close();
    for(const id of ['zepheline','vivelame']){
      const sheet=await browser.newPage({viewport:{width:393,height:852},isMobile:true,hasTouch:true});
      const errors=[];sheet.on('pageerror',e=>errors.push(String(e)));
      const box={window:{}};
      vm.runInNewContext(fs.readFileSync('ile-aux-tempetes-bastide/personnages/'+id+'/data.js','utf8'),box);
      const character=JSON.parse(JSON.stringify(box.window.BASTIDE_CHARACTER));character.level=3;
      character.combat.pvMax=id==='zepheline'?6:19;
      if(id==='zepheline'){
        character.paths[0].ranks.find(r=>r.rank===3).owned=true;
        character.companions=[{name:'Monture féerique',pv:12,def:16}];
      }
      await sheet.route('https://**.supabase.co/**',async route=>{
        const url=new URL(route.request().url());
        if(route.request().method()==='OPTIONS')return route.fulfill({status:204,headers:{'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'*'}});
        const body=url.pathname.endsWith('/bastide-character')?{character,revision:2}:{access:'player',player:{id},state:{inventory:[],money:{po:0,pa:0,pc:0}},payload:{},resources:[]};
        return route.fulfill({json:body,headers:{'access-control-allow-origin':'*'}});
      });
      await sheet.goto(base+'/ile-aux-tempetes-bastide/personnages/'+id+'/');
      await sheet.waitForFunction(()=>window.BASTIDE_CHARACTER?.companionPeopleVersion===2);
      const actual=await sheet.evaluate(()=>window.BASTIDE_CHARACTER);
      assert.equal(actual.level,3);
      assert.equal(actual.combat.pvMax,character.combat.pvMax);
      assert.deepEqual(actual.paths.slice(1),character.paths.slice(1));
      if(id==='zepheline'){
        assert.equal(actual.people,'Lutin · Fée');
        assert(actual.peoplePendingChoice);
        assert.equal(actual.companions[0].name,'Monture féerique');
      }else assert.equal(actual.paths[0].ranks[0].name,'Métallique');
      await sheet.locator('main.sheet').waitFor({state:'visible'});
      assert.deepEqual(errors,[]);
      console.log('PASS fiche synchronisée '+id+' niveau 3.');
      await sheet.close();
    }
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
