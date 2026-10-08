const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),crypto=require('node:crypto');
function setup(path,search='',hash=''){
 const storage=new Map(),calls=[],queue=[];const location={pathname:path,search,hash};
 const ctx={URLSearchParams,crypto,location,history:{replaceState(_,__,url){location.hash='';}},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)},window:{dispatchEvent:()=>{}},CustomEvent:function(_,opts){this.detail=opts.detail},fetch:async(url,options)=>{calls.push({url,options});const next=queue.shift();if(next instanceof Error)throw next;return {ok:next?.ok??true,status:next?.status??200,json:async()=>next?.data||{ok:true}};}};
 vm.runInNewContext(fs.readFileSync(__dirname+'/../assets/economy-api.js','utf8'),ctx);return {A:ctx.window.NespressoEconomy,storage,calls,queue};
}
(async()=>{
 const s=setup('/atelier-guiltanas-apps/ile-aux-tempetes/inventaire/','?pj=vax','#key=secret-existing-token');
 assert.equal(s.storage.get('iat_player_handout_token_vax'),'secret-existing-token');
 await s.A.call('state');assert.match(s.calls[0].url,/playerId=vax/);assert.equal(s.calls[0].options.headers['x-campaign-token'],'secret-existing-token');
 s.queue.push(new Error('timeout'));
 await assert.rejects(s.A.mutate('transfer-money',{recipientId:'hammerz',amount:{PO:1}}));
 const pending=JSON.parse(s.storage.get('iat_nespresso_pending_vax'));
 await assert.rejects(s.A.mutate('change',{}),/attend confirmation/);
 await s.A.retry();assert.equal(JSON.parse(s.calls.at(-1).options.body).requestId,pending.requestId);assert.equal(s.storage.has('iat_nespresso_pending_vax'),false);
 s.queue.push({ok:false,status:400,data:{error:'Monnaie insuffisante'}});await assert.rejects(s.A.mutate('purchase',{lines:[]}),/Monnaie insuffisante/);assert.equal(s.storage.has('iat_nespresso_pending_vax'),false);
 const t=setup('/atelier-guiltanas-apps/ile-aux-tempetes/mj/outils/economie/','','#key=existing-mj-key');assert.equal(t.storage.get('iat_mj_handout_token'),'existing-mj-key');assert.equal(t.storage.has('iot_bastide_inventory_key_v1'),false);
 s.storage.set('guiltanas_pj_v2_vax',JSON.stringify({hp:7,resources:{slots:1},money:{PO:10},inventory:[{name:'Potion',qty:1}]}));
 s.A.mirror({player_id:'vax',initialized:true,state:{money:{PO:8},inventory:[{id:'x',name:'Dague',qty:1}]}});
 const saved=JSON.parse(s.storage.get('guiltanas_pj_v2_vax'));assert.equal(saved.hp,7);assert.equal(saved.resources.slots,1);assert.equal(saved.money.PO,8);assert.equal(JSON.parse(s.storage.get('iat_nespresso_before_sync_vax')).money.PO,10);
 const init=s.A.localState({id:'lelio',money:{PO:10},inventory:[['Corde',1,5]]});assert.equal(init.money.PO,10);assert.equal(init.inventory[0].name,'Corde');assert.ok(init.inventory[0].id);
 console.log('PASS: existing tokens, target identity, timeout idempotency/retry, rejected operation cleanup, MJ key isolation, local rules-state preservation, backup, initial inventory conversion');
})();
