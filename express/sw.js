const CACHE='guiltanas-express-shell-v1';
const FILES=['./','./app.js','./manifest.webmanifest'];
self.addEventListener('install',event=>event.waitUntil((async()=>{try{const c=await caches.open(CACHE);await c.addAll(FILES)}catch{}await self.skipWaiting()})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{const all=await caches.keys();await Promise.all(all.filter(k=>k.startsWith('guiltanas-express-shell-')&&k!==CACHE).map(k=>caches.delete(k)));await self.clients.claim()})()));
self.addEventListener('fetch',event=>{if(event.request.mode!=='navigate')return;
const url=new URL(event.request.url);if(url.origin!==self.location.origin||!url.pathname.startsWith(new URL(self.registration.scope).pathname))return;
event.respondWith(fetch(event.request).catch(async()=>await caches.match('./')||new Response('Guiltanas Express hors ligne',{status:503})))});
