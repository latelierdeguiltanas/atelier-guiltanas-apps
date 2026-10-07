(()=>{'use strict';
const URL='https://jitatmdbipjkvjstcgdc.supabase.co/functions/v1/bastide-inventory',KEY='iot_bastide_inventory_key_v1',ANON='sb_publishable_XKVr4_kE2qsywCTgurH0CQ_GTXrEFeU';
const normalizeKey=value=>String(value||'').replace(/ /g,'+').trim(),rawKey=location.hash.slice(1).match(/(?:^|&)key=([^&]*)/)?.[1]||'';let incoming='';try{incoming=normalizeKey(decodeURIComponent(rawKey))}catch{incoming=normalizeKey(rawKey)}if(incoming){localStorage.setItem(KEY,incoming);history.replaceState(null,'',location.pathname+location.search)}
const key=()=>{const stored=localStorage.getItem(KEY)||'',normalized=normalizeKey(stored);if(normalized&&normalized!==stored)localStorage.setItem(KEY,normalized);return normalized};
async function call(action,{method='GET',body}={}){const [actionName,...extra]=String(action).split('&'),suffix=extra.length?'&'+extra.join('&'):'';const r=await fetch(URL+'?action='+encodeURIComponent(actionName)+suffix,{method,headers:{'Content-Type':'application/json','Authorization':'Bearer '+ANON,'apikey':ANON,'x-bastide-key':key()},body:body===undefined?undefined:JSON.stringify(body)});let data={};try{data=await r.json()}catch{}if(!r.ok)throw new Error(data.error||'Service indisponible');return data}
window.BastideInventory={hasKey:()=>!!key(),call,forget:()=>localStorage.removeItem(KEY)};
})();
