(()=>{'use strict';
const endpoint='https://jitatmdbipjkvjstcgdc.supabase.co/functions/v1/nespresso-inventory';
const ids=['vax','hammerz','lelio','loris'];
const valid=x=>ids.includes(x)?x:'';
const params=new URLSearchParams(location.search);
const id=valid(params.get('pj'))||valid(location.pathname.match(/personnages\/([^/]+)\//)?.[1])||valid(localStorage.getItem('iat_last_player'));
const isMJ=location.pathname.includes('/mj/');
const storage=isMJ?'iat_mj_handout_token':'iat_player_handout_token_'+id;
const raw=new URLSearchParams(location.hash.slice(1)).get('key');
if(raw&&(id||isMJ)){localStorage.setItem(storage,raw.trim());history.replaceState(null,'',location.pathname+location.search);}
const key=()=>localStorage.getItem(storage)||'';
async function call(action,{body,query={},requestId}={}){
 const q=new URLSearchParams({action,...(action==='state'&&id?{playerId:id}:{}),...query});
 let r;try{r=await fetch(endpoint+'?'+q,{method:body===undefined?'GET':'POST',headers:{'Content-Type':'application/json','x-campaign-token':key()},body:body===undefined?undefined:JSON.stringify({...body,requestId:requestId||crypto.randomUUID()})});}catch(e){if(action==='state'&&!isMJ)report({syncError:'Connexion au sac interrompue.'});throw e;}
 const data=await r.json().catch(()=>({}));if(!r.ok){const e=new Error(data.error||'Connexion indisponible');e.status=r.status;if(action==='state'&&!isMJ)report({syncError:e.message});throw e;}if(action==='state'&&!isMJ){report({syncOk:true});if(data.access==='player'&&data.player&&!data.player.initialized)await importExisting(data);}return data;
}
// Keep a failed request unchanged so a timeout retry cannot duplicate an operation.
async function mutate(action,body,owner=id){const k='iat_nespresso_pending_'+owner;let pending;try{pending=JSON.parse(localStorage.getItem(k)||'null')}catch{}
 if(pending&&(pending.action!==action||JSON.stringify(pending.body)!==JSON.stringify(body)))throw new Error('Une opération attend confirmation. Réessaie-la avant d’en lancer une autre.');
 pending=pending||{action,body,requestId:crypto.randomUUID()};localStorage.setItem(k,JSON.stringify(pending));
 try{const data=await call(pending.action,pending);localStorage.removeItem(k);return data;}catch(e){if(e.status&&e.status<500)localStorage.removeItem(k);throw e;}
}
async function retry(owner=id){const k='iat_nespresso_pending_'+owner;let p;try{p=JSON.parse(localStorage.getItem(k)||'null')}catch{}if(!p)return null;return mutate(p.action,p.body,owner);}
function localState(data){let saved=null;try{saved=JSON.parse(localStorage.getItem('guiltanas_pj_v2_'+data.id)||'null')}catch{}
 const state=saved||{money:{...data.money},inventory:(data.inventory||[]).map(x=>({name:x[0],qty:x[1],weight:x[2]}))};
 return{money:state.money,inventory:(state.inventory||[]).filter(x=>Number(x.qty)>0).map(x=>({...x,id:x.id||crypto.randomUUID()}))};}
let importInFlight=null;
async function importExisting(data){if(isMJ||data.player.player_id!==id)return;
 const raw=localStorage.getItem('guiltanas_pj_v2_'+id);if(!raw)return;let saved;try{saved=JSON.parse(raw);}catch{return;}
 if(!Array.isArray(saved.inventory)||!saved.money||!['PC','PA','PE','PO','PP'].every(k=>Number.isInteger(saved.money[k])&&saved.money[k]>=0))return;
 if(!importInFlight)importInFlight=(async()=>{let pending;try{pending=JSON.parse(localStorage.getItem('iat_nespresso_pending_'+id)||'null')}catch{}
 if(pending&&pending.action!=='bootstrap')return null;
 if(!localStorage.getItem('iat_nespresso_before_sync_'+id))localStorage.setItem('iat_nespresso_before_sync_'+id,raw);
 return pending?retry():mutate('bootstrap',localState({id}));})();
 try{const result=await importInFlight;if(result){data.player={...data.player,state:result.state,revision:result.revision,initialized:true};}}catch(e){report({syncError:e.message});}finally{importInFlight=null;}
}
function mirror(player){if(!player.initialized)return;const k='guiltanas_pj_v2_'+player.player_id;let s={};try{s=JSON.parse(localStorage.getItem(k)||'{}')}catch{}
 if(!localStorage.getItem('iat_nespresso_before_sync_'+player.player_id))localStorage.setItem('iat_nespresso_before_sync_'+player.player_id,JSON.stringify(s));
 s.money=player.state.money;s.inventory=player.state.inventory;localStorage.setItem(k,JSON.stringify(s));localStorage.setItem('iat_nespresso_cache_'+player.player_id,JSON.stringify(player));window.dispatchEvent(new CustomEvent('nespresso-economy',{detail:player}));}
let lastReport=0;
const page=()=>location.pathname.includes('/personnages/')?'sheet':location.pathname.includes('/boutique/')?'shop':location.pathname.includes('/inventaire/')?'inventory':'hub';
async function report(extra={}){if(isMJ||!key()||!id)return;if(typeof document!=='undefined'&&document.visibilityState==='hidden')return;
 const now=Date.now();if(!Object.keys(extra).length&&now-lastReport<60000)return;lastReport=now;
 try{await call('activity',{body:{page:page(),playerId:id,...extra}});}catch{/* Activity reporting never blocks game actions. */}}
window.NespressoEconomy={id,isMJ,key,call,mutate,retry,localState,mirror,report};
report();
if(typeof document!=='undefined'){document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')report();});document.addEventListener('pointerdown',()=>report(),{passive:true});}
})();
