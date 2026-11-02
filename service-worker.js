const CACHE_NAME = "aspect-toeic-sw-github-pages-v7";
const APP_SHELL=["./","./index.html","./style.css","./style-writing.css","./favicon.svg","./icon-192.png","./icon-512.png","./config.js","./supabase-service.js","./utils.js","./session.js","./recorder.js","./upload.js","./response.js","./question-config.js","./test-service.js","./assessment-settings.js","./question-service.js","./audio-cues.js","./assessment-engine.js","./app.js"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE_NAME).then(c=>Promise.allSettled(APP_SHELL.map(u=>c.add(u)))));self.skipWaiting();});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener("fetch",e=>{
  const r=e.request;if(r.method!=="GET")return;
  const u=new URL(r.url);if(u.origin!==self.location.origin)return;
  if(r.mode==="navigate"){e.respondWith(fetch(r).then(resp=>{const copy=resp.clone();caches.open(CACHE_NAME).then(c=>c.put(r,copy));return resp;}).catch(()=>caches.match("./index.html")));return;}
  const fresh=/\.(?:js|css|webmanifest)(?:$|\?)/i.test(u.pathname+u.search);
  if(fresh){e.respondWith(fetch(r).then(resp=>{if(resp&&resp.ok){const copy=resp.clone();caches.open(CACHE_NAME).then(c=>c.put(r,copy));}return resp;}).catch(()=>caches.match(r)));return;}
  e.respondWith(caches.match(r).then(cached=>cached||fetch(r).then(resp=>{if(resp&&resp.ok){const copy=resp.clone();caches.open(CACHE_NAME).then(c=>c.put(r,copy));}return resp;})));
});
