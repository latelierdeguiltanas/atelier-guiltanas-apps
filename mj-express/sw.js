/* MJ Express — notifications Android/PWA, version 2.
   Keep this worker independent of the Bastide root worker. */
const PUSH_ACK='https://jitatmdbipjkvjstcgdc.supabase.co/functions/v1/guiltanas-push?action=test-ack';
const ROOT=self.registration.scope;
const ICON=new URL('icons/mj-express-192.png?v=2',ROOT).href;
const BADGE=new URL('icons/mj-express-192.png?v=2',ROOT).href;

const CACHE='mj-express-shell-v4';
const SHELL=['./','./manifest.webmanifest','./app.js','./icons/mj-express-192.png','./icons/mj-express-512.png'];
self.addEventListener('install',event=>event.waitUntil((async()=>{
 // Only cache the public app shell. Never cache requests for private Bastide/Supabase data.
 try{const cache=await caches.open(CACHE);await cache.addAll(SHELL);}catch{/* Installation must remain possible even if caching fails. */}
 await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 const names=await caches.keys();
 await Promise.all(names.filter(k=>k.startsWith('mj-express-shell-')&&k!==CACHE).map(k=>caches.delete(k)));
 await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
 if(event.request.mode!=='navigate'||event.request.method!=='GET')return;
 const url=new URL(event.request.url);
 if(url.origin!==self.location.origin||!url.pathname.startsWith(new URL(ROOT).pathname))return;
 event.respondWith((async()=>{
  try{return await fetch(event.request);}
  catch{
   const cached=await caches.match(new URL('./',ROOT).href);
   return cached||new Response('MJ Express est hors ligne. Réessaie lorsque le réseau est disponible.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
  }
 })());
});

async function receipt(test,shown,error){
 if(!test?.id||!test?.secret)return;
 try{
  await fetch(PUSH_ACK,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:test.id,secret:test.secret,shown,error:error||null}),cache:'no-store'});
 }catch{/* If offline, this receipt may be absent; never mark the push successful by assumption. */}
}
self.addEventListener('push',event=>{
 let data={};try{data=event.data?.json()||{}}catch{data={title:'MJ Express',body:'Nouvelle activité'};}
 event.waitUntil((async()=>{
  const url=typeof data.url==='string'&&data.url.startsWith(self.location.origin+'/')?data.url:ROOT;
  const tag=data.test?.id?'mj-test-'+data.test.id:'mj-express-'+Date.now();
  try{
   await self.registration.showNotification(String(data.title||'MJ Express'),{
    body:String(data.body||'Nouvelle activité'),icon:ICON,badge:BADGE,
    data:{url},tag,renotify:true,vibrate:[160,80,180]
   });
   await receipt(data.test,true,null);
  }catch(err){
   await receipt(data.test,false,String(err?.message||err));
  }
 })());
});
self.addEventListener('notificationclick',event=>{
 event.notification.close();
 const wanted=event.notification.data?.url;
 const target=typeof wanted==='string'&&wanted.startsWith(self.location.origin+'/')?wanted:ROOT;
 event.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(async windows=>{
  for(const client of windows){if(client.url.startsWith(self.location.origin+'/')&&'focus'in client){await client.navigate(target);return client.focus();}}
  return self.clients.openWindow(target);
 }));
});
