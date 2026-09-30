(()=>{'use strict';
const URL='https://jitatmdbipjkvjstcgdc.supabase.co/functions/v1/bastide-inventory',KEY='iot_bastide_inventory_key_v1';
const fragment=new URLSearchParams(location.hash.slice(1)),incoming=fragment.get('key');if(incoming){localStorage.setItem(KEY,incoming);history.replaceState(null,'',location.pathname+location.search)}
const key=()=>localStorage.getItem(KEY)||'';
async function call(action,{method='GET',body}={}){const r=await fetch(URL+'?action='+encodeURIComponent(action),{method,headers:{'Content-Type':'application/json','x-bastide-key':key()},body:body===undefined?undefined:JSON.stringify(body)});let data={};try{data=await r.json()}catch{}if(!r.ok)throw new Error(data.error||'Service indisponible');return data}
window.BastideInventory={hasKey:()=>!!key(),call,forget:()=>localStorage.removeItem(KEY)};
})();
