const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(__dirname+'/../assets/packs-admin.js','utf8');
const fields={};const $=key=>fields[key]??={value:'',hidden:false,textContent:''};
const w={data:{items:[{id:'a',price_silver:8},{id:'b',price_silver:4}]},readLines:()=>[{itemId:'a',quantity:2,gift:false},{itemId:'b',quantity:1,gift:true}],$,Number,Math};
vm.createContext(w);vm.runInContext(source.slice(source.indexOf('function total(){'),source.indexOf('function reset(){')),w);
$('[data-pack-mode]').value='percent';$('[data-pack-percent]').value='25';w.total();assert.match($('[data-pack-total]').textContent,/Cadeaux : 4 PA · Prix du pack : 12 PA/);assert.equal($('[data-pack-price-label]').hidden,true);
$('[data-pack-mode]').value='fixed';$('[data-pack-price]').value='0';w.total();assert.match($('[data-pack-total]').textContent,/Prix du pack : 0 PA/);assert.equal($('[data-pack-percent-label]').hidden,true);
(async()=>{
 let click,buys=0,release,events=0;const list={innerHTML:''},message={},buttons=[{}];
 const section={style:{},querySelector:s=>s==='[data-packs]'?list:message,querySelectorAll:()=>buttons,addEventListener:(name,f)=>click=f};
 const context={document:{querySelector:()=>({prepend(){}}),createElement:()=>section},window:{BastideInventory:{hasKey:()=>true,call:async action=>{if(action==='packs')return{access:'player',packs:[{id:'test',name:'Pack test',price_pa:0,regular_pa:4,stock:1,lines:[{name:'Potion',quantity:1,gift:true}]}]};buys++;await new Promise(r=>release=r);return{state:{}};}},dispatchEvent(){events++;}},setInterval(){},Event:class{},String,Number,Math,confirm:()=>true};
 vm.runInNewContext(fs.readFileSync(__dirname+'/../assets/packs-player.js','utf8'),context);await new Promise(setImmediate);assert.match(list.innerHTML,/offert/);assert.match(list.innerHTML,/Recevoir/);
 const e={target:{closest:()=>({dataset:{buyPack:'test'}})}};const first=click(e);await click(e);assert.equal(buys,1);release();await first;assert.equal(events,1);assert.match(message.textContent,/Pack reçu/);
 console.log('PASS interface packs : remise, cadeaux, prix final, affichage PJ et protection double clic.');
})().catch(e=>{console.error(e);process.exitCode=1});
