/* One Bastide space for historical links and installed shortcuts. No credentials in URLs. */
(()=>{
 const script=document.currentScript,root=new URL('./',script.src),url=new URL(location.href);
 const scope='ba571de0-0000-4000-8000-000000000001',context='guiltanas_combat_last_entry_v1';
 const canonical=new URL('multi/',root);canonical.search=new URLSearchParams({space:scope,name:'Île aux Tempêtes',format:'campaign',pack:'island',source:'bastide'});
 const historical=url.pathname===root.pathname||url.pathname===root.pathname+'index.html';
 const bare=!url.search&&!url.hash;
 if(historical){canonical.hash=url.hash;location.replace(canonical.href);return;}
 if(bare&&localStorage.getItem(context)==='bastide'){location.replace(canonical.href);return;}
 if(url.searchParams.get('source')==='bastide'&&url.searchParams.get('space')===scope){
  localStorage.setItem(context,'bastide');
  document.addEventListener('DOMContentLoaded',()=>{const manifest=document.querySelector('link[rel="manifest"]');if(manifest)manifest.href=new URL('multi/bastide.install.webmanifest',root).href;},{once:true});
 }else if(url.search)localStorage.removeItem(context);
})();
