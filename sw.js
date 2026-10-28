const C='nosor-v4',A=['./','index.html','manifest.json','icon-192.png','icon-512.png','logo.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(A)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request,u=new URL(r.url);if(r.method!=='GET')return;
if(!(u.origin===location.origin||['cdnjs.cloudflare.com','fonts.googleapis.com','fonts.gstatic.com','www.gstatic.com'].includes(u.host)))return;
e.respondWith(fetch(r,{cache:'no-store'}).then(x=>{const c=x.clone();caches.open(C).then(k=>k.put(r,c)).catch(()=>{});return x}).catch(()=>caches.match(r).then(m=>m||caches.match('index.html'))))});
