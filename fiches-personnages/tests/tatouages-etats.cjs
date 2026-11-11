'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const jobs=[
 {name:'acquis',owned:true,expected:'Ralenti'},
 {name:'non acquis',owned:false,expected:'Étourdi'},
 {name:'ancien état',owned:true,initial:['Étourdi','Ralenti'],expected:'Ralenti'}
];
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_BIN,args:['--no-sandbox']});
 try{
  for(const job of jobs){
   const page=await browser.newPage({viewport:{width:393,height:852},isMobile:true,hasTouch:true});
   const errors=[];
   page.on('pageerror',error=>errors.push(error.message));
   await page.addInitScript(({owned,initial})=>{
    parent.saveSoloSheet=()=>{};
    sessionStorage.setItem('guiltanas-player-open',JSON.stringify({
     character:{id:'barbare-test',name:'Barbare QA',profile:'Barbare',people:'Humain',family:'Combattants',level:1,
      stats:{FOR:2,AGI:1,CON:1,PER:0,INT:0,CHA:0,VOL:0},
      combat:{pvMax:12,pcMax:2,pmMax:0,recoveryMax:4},attacks:[],equipment:[],traits:[],
      paths:[{name:'Voie du pagne',ranks:[{rank:3,name:'Tatouages',owned,text:'Étourdissement remplacé par Ralenti.'}]}]},
     play:initial?{conditions:initial}:{}
    }));
   },job);
   await page.goto('http://127.0.0.1:4173/fiches-personnages/fiche/');
   await page.locator('[data-ui-modal="states"]').first().tap();
   if(!job.initial){
    await page.locator('#condition-select').selectOption('Étourdi');
    await page.locator('#condition-add').tap();
   }
   const condition=page.locator('dialog [data-remove-condition]');
   assert.equal(await condition.count(),1,job.name);
   assert.equal(await condition.first().getAttribute('data-remove-condition'),job.expected,job.name);
   if(!job.initial){
    await page.reload();
    await page.locator('[data-ui-modal="states"]').first().tap();
    assert.equal(await condition.first().getAttribute('data-remove-condition'),job.expected);
   }
   assert.deepEqual(errors,[]);
   console.log('PASS '+job.name+' : '+job.expected);
   await page.close();
  }
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
