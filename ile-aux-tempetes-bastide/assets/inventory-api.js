(()=>{'use strict';
const URL='https://jitatmdbipjkvjstcgdc.supabase.co/functions/v1/bastide-inventory',KEY='iot_bastide_inventory_key_v1',ANON='sb_publishable_XKVr4_kE2qsywCTgurH0CQ_GTXrEFeU';
const fragment=new URLSearchParams(location.hash.slice(1)),incoming=fragment.get('key');if(incoming){localStorage.setItem(KEY,incoming);history.replaceState(null,'',location.pathname+location.search)}
const key=()=>localStorage.getItem(KEY)||'';
async function call(action,{method='GET',body}={}){const [actionName,...extra]=String(action).split('&'),suffix=extra.length?'&'+extra.join('&'):'';const r=await fetch(URL+'?action='+encodeURIComponent(actionName)+suffix,{method,headers:{'Content-Type':'application/json','Authorization':'Bearer '+ANON,'apikey':ANON,'x-bastide-key':key()},body:body===undefined?undefined:JSON.stringify(body)});let data={};try{data=await r.json()}catch{}if(!r.ok)throw new Error(data.error||'Service indisponible');return data}
window.BastideInventory={hasKey:()=>!!key(),call,forget:()=>localStorage.removeItem(KEY)};
})();
