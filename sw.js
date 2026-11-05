const VERSION='foxx-bridge-web-v2';
const BASE=new URL(self.registration.scope).pathname;
const CORE=[BASE,BASE+'index.html',BASE+'manifest.webmanifest',BASE+'icons/icon-192.png',BASE+'icons/icon-512.png'];
self.addEventListener('install', event=>{
  event.waitUntil(caches.open(VERSION).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==VERSION).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch', event=>{
  const request=event.request;
  if(request.method!=='GET') return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin) return;
  if(request.mode==='navigate') {
    event.respondWith(fetch(request).catch(()=>caches.match(BASE+'index.html')));
    return;
  }
  if(url.pathname.startsWith(BASE+'assets/')||url.pathname.startsWith(BASE+'icons/')||url.pathname.startsWith(BASE+'ffmpeg-core/')){
    event.respondWith(caches.match(request).then(hit=>hit||fetch(request).then(response=>{
      if(response.ok){const copy=response.clone();caches.open(VERSION).then(cache=>cache.put(request,copy));}
      return response;
    })));
  }
});
