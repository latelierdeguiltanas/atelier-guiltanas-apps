(()=>{'use strict';
const URL='https://jitatmdbipjkvjstcgdc.supabase.co/functions/v1/bastide-inventory',KEY='iot_bastide_inventory_key_v1',ANON='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppdGF0bWRiaXBqa3Zqc3RjZ2RjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0MjU2NDMsImV4cCI6MjEwNTAwMTY0M30.fpNY1cFE0RBgls48GM7q9DVwG8eBeLEkARwb0JH6JNc';
const fragment=new URLSearchParams(location.hash.slice(1)),incoming=fragment.get('key');if(incoming){localStorage.setItem(KEY,incoming);history.replaceState(null,'',location.pathname+location.search)}
const key=()=>localStorage.getItem(KEY)||'';
async function call(action,{method='GET',body}={}){const r=await fetch(URL+'?action='+encodeURIComponent(action),{method,headers:{'Content-Type':'application/json','Authorization':'Bearer '+ANON,'apikey':ANON,'x-bastide-key':key()},body:body===undefined?undefined:JSON.stringify(body)});let data={};try{data=await r.json()}catch{}if(!r.ok)throw new Error(data.error||'Service indisponible');return data}
window.BastideInventory={hasKey:()=>!!key(),call,forget:()=>localStorage.removeItem(KEY)};
})();
