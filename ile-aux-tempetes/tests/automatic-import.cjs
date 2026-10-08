const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),crypto=require('node:crypto');
function setup({mj=false,saved=null,timeout=false}={}){
 const map=new Map(),calls=[];let initialized=false,attempts=0,serverState;
 const key=mj?'iat_mj_handout_token':'iat_player_handout_token_vax';map.set(key,'test-only-existing-key');if(saved)map.set('guiltanas_pj_v2_vax',JSON.stringify(saved));
 const ctx={URLSearchParams,crypto,location:{pathname:mj?'/ile-aux-tempetes/mj/outils/economie/':'/ile-aux-tempetes/inventaire/',search:'?pj=vax',hash:''},history:{replaceState(){}},localStorage:{getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,String(v)),removeItem:k=>map.delete(k)},window:{dispatchEvent(){}},CustomEvent:function(){},fetch:async(url,opts)=>{const action=new URL(url).searchParams.get('action'),body=opts.body&&JSON.parse(opts.body);calls.push({action,body});let data={ok:true};if(action==='state')data={access:mj?'admin':'player',player:{player_id:'vax',initialized,revision:initialized?1:0,state:serverState||{money:{PC:0,PA:0,PE:0,PO:0,PP:0},inventory:[]}}};if(action==='bootstrap'){attempts++;if(timeout&&attempts===1)throw Error('timeout');initialized=true;serverState={money:body.money,inventory:body.inventory};data={state:serverState,revision:1};}return{ok:true,status:200,json:async()=>data};}};
 vm.runInNewContext(fs.readFileSync(__dirname+'/../assets/economy-api.js','utf8'),ctx);return{A:ctx.window.NespressoEconomy,calls,map};
}
(async()=>{
 const saved={hp:7,resources:{slots:1},money:{PC:1,PA:2,PE:3,PO:4,PP:5},inventory:[{name:'Corde',qty:1,weight:5}]};
 let s=setup({saved});let d=await s.A.call('state');assert.equal(d.player.initialized,true);assert.equal(d.player.state.money.PO,4);assert.equal(s.calls.filter(x=>x.action==='bootstrap').length,1);assert.equal(JSON.parse(s.map.get('iat_nespresso_before_sync_vax')).hp,7);await s.A.call('state');assert.equal(s.calls.filter(x=>x.action==='bootstrap').length,1);
 s=setup({saved,timeout:true});d=await s.A.call('state');assert.equal(d.player.initialized,false);const pending=JSON.parse(s.map.get('iat_nespresso_pending_vax'));d=await s.A.call('state');assert.equal(d.player.initialized,true);const attempts=s.calls.filter(x=>x.action==='bootstrap');assert.equal(attempts[1].body.requestId,pending.requestId);assert.equal(attempts[1].body.inventory[0].id,attempts[0].body.inventory[0].id);
 s=setup({mj:true,saved});await s.A.call('state');assert.equal(s.calls.filter(x=>x.action==='bootstrap').length,0);assert.equal(s.calls.filter(x=>x.action==='activity').length,0);
 s=setup();await s.A.call('state');assert.equal(s.calls.filter(x=>x.action==='bootstrap').length,0);
 console.log('PASS: automatic import of real saved state only, one-time import, backup, timeout retry preserves IDs, no MJ import/activity, no invented initial inventory');
})();
