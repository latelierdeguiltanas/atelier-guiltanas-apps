(()=>{'use strict';
 const root='https://jitatmdbipjkvjstcgdc.supabase.co/functions/v1/guiltanas-owner-auth';
 const KEY='guiltanas_atelier_owner_session_v1';
 const token=()=>localStorage.getItem(KEY)||'';
 const headers=()=>token()?{'x-guiltanas-owner':token()}:{};
 async function request(action,body){
  const r=await fetch(root+'?action='+encodeURIComponent(action),{method:body?'POST':'GET',cache:'no-store',
   headers:{'Content-Type':'application/json',...headers()},body:body?JSON.stringify(body):undefined});
  let d={};try{d=await r.json()}catch{}
  if(!r.ok)throw Error(d.error||'Connexion au service Atelier momentanément indisponible.');
  return d;
 }
 function remember(data){if(!/^[a-f0-9]{64}$/.test(data?.session||''))throw Error('Connexion serveur incomplète.');localStorage.setItem(KEY,data.session);}
 async function login(password){const d=await request('login',{password});remember(d);return d}
 async function setup(bootstrap,password){const d=await request('setup',{bootstrap,password});remember(d);return d}
 async function validate(){if(!token())return false;try{const d=await request('validate');if(!d.authenticated)localStorage.removeItem(KEY);return !!d.authenticated}catch{return false}}
 async function logout(){try{if(token())await request('logout',{})}finally{localStorage.removeItem(KEY)}}
 window.GuiltanasOwnerAuth={headers,token,request,remember,login,setup,validate,logout,clear:()=>localStorage.removeItem(KEY)};
})();