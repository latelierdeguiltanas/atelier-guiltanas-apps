(()=>{'use strict';
const endpoint='https://jitatmdbipjkvjstcgdc.supabase.co/functions/v1/nespresso-social',params=new URLSearchParams(location.search),ids=['vax','hammerz','lelio','loris'];
const adminMode=location.pathname.includes('/mj/')||params.get('mj')==='1';let playerId=params.get('pj')||location.pathname.match(/personnages\/([^/]+)/)?.[1]||localStorage.getItem('iat_last_player')||'',who=null;
if(!ids.includes(playerId))playerId='';let incoming=(new URLSearchParams(location.hash.slice(1)).get('key')||'').trim();
const key=()=>incoming||localStorage.getItem((who?who.access==='admin':adminMode)?'iat_mj_handout_token':'iat_player_handout_token_'+playerId)||'';
async function call(action,{body,query={},requestId}={}){const r=await fetch(endpoint+'?'+new URLSearchParams({action,...query}),{method:body===undefined?'GET':'POST',headers:{'Content-Type':'application/json','x-campaign-token':key()},body:body===undefined?undefined:JSON.stringify({...body,requestId:requestId||crypto.randomUUID()})});const data=await r.json().catch(()=>({}));if(!r.ok){const e=new Error(data.error||'Connexion aux échanges impossible.');e.status=r.status;throw e;}return data;}
async function identity(){const data=await call('identity');who=data;if(data.access==='player'){playerId=data.playerId;localStorage.setItem('iat_last_player',playerId);}if(incoming){localStorage.setItem(data.access==='admin'?'iat_mj_handout_token':'iat_player_handout_token_'+playerId,incoming);history.replaceState(null,'',location.pathname+location.search);incoming='';}return data;}
const owner=()=>who?.access==='admin'?'mj':who?.playerId||playerId;
const pendingKey=()=> 'iat_nespresso_social_pending_'+owner();
function getPending(){try{return JSON.parse(localStorage.getItem(pendingKey())||'null')}catch{return null;}}
async function mutate(action,body){const p=getPending();if(p&&(p.action!==action||JSON.stringify(p.body)!==JSON.stringify(body)))throw new Error('Une opération attend confirmation. Utilise « Réessayer l’opération en attente » avant un nouvel envoi.');const pending=p||{action,body,requestId:crypto.randomUUID()};localStorage.setItem(pendingKey(),JSON.stringify(pending));try{const data=await call(action,pending);localStorage.removeItem(pendingKey());if(action==='message')localStorage.removeItem('iat_nespresso_message_draft_'+owner()+'_'+(body.playerId||playerId));return data;}catch(e){if(e.status&&e.status<500)localStorage.removeItem(pendingKey());throw e;}}
async function retry(){const p=getPending();if(!p)return null;return{operation:p,result:await mutate(p.action,p.body)};}
async function login(value){const old=incoming;let token=String(value||'').trim();try{const u=new URL(token);token=new URLSearchParams(u.hash.slice(1)).get('key')||'';}catch{}if(token.length<32)throw new Error('Colle le lien personnel complet ou sa clé existante.');incoming=token;try{return await identity();}catch(e){incoming=old;throw e;}}
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const label=id=>id==='loris'?'Prométhée':({vax:'Vax’Ildan',hammerz:'Hammerz',lelio:'Lelio',mj:'MJ'}[id]||id);
function link(url,text='Ouvrir le lien'){try{const u=new URL(url);if(['http:','https:'].includes(u.protocol))return `<a class="button" href="${esc(u.href)}" target="_blank" rel="noopener noreferrer">${esc(text)}</a>`;}catch{}return '';}
const pageBase=new URL('../',document.currentScript.src);
function href(path,person=playerId){const u=new URL(path,pageBase);if(who?who.access==='admin':adminMode)u.searchParams.set('mj','1');else if(person)u.searchParams.set('pj',person);return u.href;}
window.NespressoSocial={call,identity,mutate,retry,login,getPending,esc,label,link,href,getWho:()=>who,key};
})();
