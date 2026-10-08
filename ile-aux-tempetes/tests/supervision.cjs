const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),crypto=require('node:crypto'),{stripTypeScriptTypes}=require('node:module');
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');const mj='m'.repeat(48),player='p'.repeat(48);
const writes=[];let handler;const ids=['vax','hammerz','lelio','loris'];
const fixtures={campaign_admin_tokens:[{id:'admin',token_hash:hash(mj),revoked_at:null}],campaign_player_tokens:[{id:'token',player_id:'vax',token_hash:hash(player),revoked_at:null}],campaign_players:ids.map(id=>({id,display_name:id})),nespresso_inventories:ids.map(id=>({player_id:id,initialized:false,revision:0,state:{money:{PC:0,PA:0,PE:0,PO:0,PP:0},inventory:[]}})),nespresso_activity:[],nespresso_events:[],nespresso_shop:[],nespresso_requests:[],campaign_handout_assignments:[{player_id:'vax',handout_id:'h',assigned_at:'2026-10-08T08:00:00Z',delivered_at:null,viewed_at:null,revoked_at:null,campaign_handouts:{id:'h',title:'Lettre',kind:'text',content_text:'Secret',storage_path:null}}]};
function query(table){let filters=[],op='select',body,single=false,offset=0,end=9999,options={},limit=9999;const q={
 select(columns,opts){options=opts||{};return q;},eq(k,v){filters.push(x=>x[k]===v);return q;},neq(k,v){filters.push(x=>x[k]!==v);return q;},is(k,v){filters.push(x=>x[k]===v);return q;},in(k,vs){filters.push(x=>vs.includes(x[k]));return q;},order(){return q;},limit(n){limit=n;return q;},range(a,b){offset=a;end=b;return q;},maybeSingle(){single=true;return q;},update(x){op='update';body=x;return q;},upsert(x){op='upsert';body=x;return q;},then(resolve,reject){try{
 let data=(fixtures[table]||[]).filter(x=>filters.every(f=>f(x)));const count=data.length;
 if(op!=='select'){writes.push({table,op,body});if(op==='upsert'){let row=fixtures[table].find(x=>x.player_id===body.player_id);if(row)Object.assign(row,body);else fixtures[table].push({...body});}else data.forEach(x=>Object.assign(x,body));data=null;}
 else data=single?(data[0]||null):data.slice(offset,Math.min(end+1,offset+limit));
 return Promise.resolve({data,error:null,count}).then(resolve,reject);
 }catch(e){return Promise.reject(e).then(resolve,reject);}}};return q;}
const db={from:query,storage:{from:()=>({createSignedUrl:async()=>({data:{signedUrl:'https://example.test/image'},error:null})})}};
let source=fs.readFileSync(__dirname+'/../backend/index.ts','utf8').replace(/^import .*;\n/,'');source=stripTypeScriptTypes(source,{mode:'transform'});
const context={createClient:()=>db,Deno:{env:{get:()=>''},serve:f=>handler=f},crypto:crypto.webcrypto,Request,Response,URL,TextEncoder,console};vm.runInNewContext(source,context);
async function call(action,key=mj,body){const req=new Request('https://example.test/?action='+action,{method:body?'POST':'GET',headers:{'x-campaign-token':key,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});const res=await handler(req);return{status:res.status,data:await res.json()};}
(async()=>{
 let r=await call('supervision&playerId=vax');assert.equal(r.status,200);assert.equal(r.data.readOnly,true);assert.equal(r.data.handouts[0].handout.content_text,'Secret');assert.equal(writes.length,0);assert.equal(fixtures.campaign_handout_assignments[0].viewed_at,null);
 r=await call('diagnostics');assert.equal(r.status,200);assert.equal(r.data.results.length,4);assert.ok(r.data.results.every(x=>x.serverReadable&&x.inventoryValid));assert.equal(writes.length,0);assert.equal(r.data.services.catalogReadable,true);assert.equal(r.data.services.transactionRegistryReadable,true);
 assert.equal((await call('supervision&playerId=vax',player)).status,403);assert.equal((await call('diagnostics',player)).status,403);
 assert.equal((await call('state&playerId=hammerz',player)).status,403);
 assert.equal((await call('activity',mj,{playerId:'vax',page:'sheet'})).status,403);
 assert.equal((await call('activity',player,{playerId:'hammerz',page:'sheet'})).status,403);
 r=await call('activity',player,{playerId:'vax',page:'sheet',saved:true,snapshot:{hp:7},notes:'Notes joueur'});assert.equal(r.status,200);assert.equal(fixtures.nespresso_activity[0].snapshot.hp,7);assert.equal(fixtures.nespresso_activity[0].notes,'Notes joueur');
 r=await call('state&playerId=vax',player);assert.equal(r.status,200);assert.ok(fixtures.nespresso_activity[0].state_read_at);assert.equal(fixtures.nespresso_activity[0].snapshot.hp,7);
 const before=writes.length;r=await call('state&playerId=vax',mj);assert.equal(r.status,200);assert.equal(writes.length,before);
 for(let i=0;i<70;i++)fixtures.nespresso_events.push({id:String(i),player_id:'vax'});
 r=await call('supervision&playerId=vax&offset=50');assert.equal(r.data.events.length,20);assert.equal(r.data.totalEvents,70);
 console.log('PASS: MJ server diagnostics and private supervision, no player activity/read mutation from MJ, player isolation, snapshot/notes, full-history pagination');
})();
