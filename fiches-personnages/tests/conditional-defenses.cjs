'use strict';
const assert=require('node:assert/strict'),{chromium}=require('playwright'),{load,standardState,withRank}=require('../../forge-of-heroes/FINAL_FREEZE_TESTS/forge_product_runner'),N=require('../../forge-of-heroes/native-progression.js');
const {db,engine}=load(),T=db.tables;
function character(profile,pattern,age=false){const profileId=T.classes.find(x=>x.label?.toLowerCase()===profile.toLowerCase())?.id,paths=T.paths_class.filter(p=>p.classId===profileId&&!p.additionalMagePath),p=paths.find(p=>p.label?.includes(pattern))||paths.find(p=>p.id.includes(pattern));assert(p,profile+': missing '+pattern);const state=standardState(db,profileId,p.id);if(profile==='Prêtre')state.profileChoices.priestMode='generalist';if(age)withRank(db,state,p.id,2);const r=engine.computeCharacterN1(state);assert.equal(r.errors.length,0,profile+' '+r.errors.join('|'));return N.toCharacter({id:'conditional-'+profile+'-'+pattern,name:profile+' QA',people:'Humain',profile,draft:{}},{state,result:r},{paths:[],profiles:[]},db);}
(async()=>{const browser=await chromium.launch({headless:true});try{async function open(c){const page=await browser.newPage({viewport:{width:393,height:852},isMobile:true,hasTouch:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());await page.addInitScript(c=>{window.parent.saveSoloSheet=()=>{};sessionStorage.setItem('guiltanas-player-open',JSON.stringify({character:c,play:null}));},c);await page.goto('http://127.0.0.1:4173/atelier-guiltanas-apps/fiches-personnages/fiche/');await page.locator('#play .simple-hint').first().waitFor();const def=async()=>Number(await page.locator('#resources .resource').filter({hasText:'Défense'}).locator('b').innerText());return{page,def,errors};}
{
 const c=character('Magicien','magie-protectrice'),{page,def,errors}=await open(c),base=await def(),pm=Number(await page.locator('#resources [data-count=pm]').first().locator('xpath=following-sibling::b').innerText().catch(()=>0));
 assert.equal(await page.locator('#play [data-mana-armor=cast]').count(),1);await page.locator('#play [data-mana-armor=cast]').click();assert.equal(await def(),base+3);const snapshot=await page.evaluate(id=>JSON.parse(localStorage.getItem('cof2_solo_play_'+id)),c.id);assert.equal(snapshot.pm,c.combat.pmMax-1,'Coût réel d’Armure de mana : 1 PM');
 await page.locator('#play [data-mana-armor-minutes]').fill(String(Math.max(1,c.stats.INT)));await page.locator('#play [data-mana-armor=tick]').click();assert.equal(await def(),base);
 await page.reload();assert.equal(await def(),base);assert.deepEqual(errors,[]);console.log('PASS | magicien Armure de mana : PM, DEF +3, durée de jeu, persistance');await page.close();
}
{
 const c=character('Moine','meditation'),{page,def,errors}=await open(c),base=c.combat.def;assert.equal(await def(),base+5);
 await page.locator('#play [data-pacifism-offense]').click();assert.equal(await def(),base);
 await page.locator('[data-page=rest]').click();await page.locator('[data-reset=combat]').click();assert.equal(await def(),base+5);assert.deepEqual(errors,[]);
 console.log('PASS | moine Pacifisme : DEF conditionnelle et réinitialisation entre combats');await page.close();
}
{
 const c=character('Prêtre','spiritualite'),{page,def,errors}=await open(c),base=c.combat.def;
 assert.equal(await def(),base,'La chemise de mailles initiale donne bien sa DEF');
 await page.locator('[data-page=bag]').click();
 const mail=page.locator('#bag .inventory-item').filter({hasText:'Chemise de mailles'}).first();if((await mail.getAttribute('open'))===null)await mail.locator('summary').click();await mail.locator('[data-equip]').click();
 assert.equal(await def(),base-2,'Sans armure : perte du +4 de maille, gain du +2 de Vêtements sacrés');
 await page.locator('.basic-catalog summary').click();await page.locator('[data-catalog-item=armor2]').click();const armor=page.locator('#bag .inventory-item').filter({hasText:'Cuir simple'}).first();if((await armor.getAttribute('open'))===null)await armor.locator('summary').click();await armor.locator('[data-equip]').click();assert.equal(await def(),base-2,'Cuir +2 remplace Vêtements sacrés +2, sans cumul');
 await armor.locator('[data-equip]').click();assert.equal(await def(),base-2,'Retirer le cuir réactive les vêtements sacrés');
 await mail.locator('[data-equip]').click();const last=await def();if(last!==base){const diag=await page.evaluate(id=>{const entry=JSON.parse(localStorage.getItem('cof2_solo_play_'+id)||'{}');return entry.inventory?.map(x=>({name:x.name,equipped:x.equipped,slot:x.equipment?.slot,armor:x.equipment?.bonuses?.armorDef}));},c.id);console.log('DIAGNOSTIC PRÊTRE',JSON.stringify({expected:base,actual:last,items:diag,defense:await page.locator('#resources .resource').filter({hasText:'Défense'}).innerText()}));}assert.equal(last,base,'Rééquiper la maille rétablit le bonus initial');
 assert.deepEqual(errors,[]);
 console.log('PASS | prêtre Vêtements sacrés : bonus non cumulé avec armure ordinaire');await page.close();
}
{
 const c=character('Magicien','magie-universelle'),{page,def,errors}=await open(c),base=await def(),initiative=c.combat.init;
 assert.equal(await page.locator('#play [data-personal-familiar=existing]').count(),1);await page.locator('#play [data-personal-familiar=existing]').click();assert.equal(await def(),base+2);
 await page.locator('[data-page=stats]').click();assert.match(await page.locator('#stats').innerText(),new RegExp('INIT\\s*'+String(initiative+2)));
 await page.locator('[data-page=play]').click();await page.locator('#play [data-personal-familiar=sight]').click();assert.equal(await def(),base);assert.deepEqual(errors,[]);console.log('PASS | magicien Familier R2 : DEF et initiative seulement en vue');await page.close();
}
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});