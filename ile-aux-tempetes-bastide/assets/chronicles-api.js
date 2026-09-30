window.BASTIDE_CHRONICLES_API=(()=>{
  const endpoint='https://jitatmdbipjkvjstcgdc.supabase.co/functions/v1/bastide-chronicles';
  const keyName='iot_bastide_chronicle_editor_token';
  const hash=new URLSearchParams(location.hash.slice(1));
  if(hash.get('key')){localStorage.setItem(keyName,hash.get('key'));history.replaceState(null,'',location.pathname+location.search)}
  const token=()=>localStorage.getItem(keyName)||'';
  async function request(action,{method='GET',body,editor=false}={}){
    const headers={};
    if(editor)headers['x-bastide-chronicle-token']=token();
    if(body&&!(body instanceof FormData)){headers['content-type']='application/json';body=JSON.stringify(body)}
    const response=await fetch(`${endpoint}?action=${encodeURIComponent(action)}`,{method,headers,body});
    const data=await response.json().catch(()=>({error:'Réponse serveur illisible.'}));
    if(!response.ok)throw new Error(data.error||'La chronique est indisponible.');
    return data;
  }
  return{request,hasToken:()=>Boolean(token()),forget:()=>localStorage.removeItem(keyName)};
})();
