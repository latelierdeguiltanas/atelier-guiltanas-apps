/* MJ Express — notifications Android/PWA, version 2.
   Keep this worker independent of the Bastide root worker. */
const PUSH_ACK='https://jitatmdbipjkvjstcgdc.supabase.co/functions/v1/guiltanas-push?action=test-ack';
const ROOT=self.registration.scope;
const ICON=new URL('icons/mj-express-192.png?v=2',ROOT).href;
const BADGE=new URL('icons/mj-express-192.png?v=2',ROOT).href;

self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));

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
