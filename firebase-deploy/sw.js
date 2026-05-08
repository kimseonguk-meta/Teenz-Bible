// Teenz Bible Service Worker v47 - Network First
const CACHE = 'teenz-bible-v47';

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(['/app.html']))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => 
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  
  if(e.request.method !== 'GET') return;
  if(url.hostname === 'generativelanguage.googleapis.com') return;
  if(url.hostname === 'texttospeech.googleapis.com') return;
  
  // Network-first for same-origin (always try to get fresh content)
  if(url.origin === self.location.origin) {
    e.respondWith(
      fetch(e.request).then(response => {
        if(response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return response;
      }).catch(() => caches.match(e.request).then(c => c || caches.match('/app.html')))
    );
    return;
  }
  
  // Cache-first for CDN resources
  if(url.hostname.includes('googleapis.com') || url.hostname.includes('gstatic.com') || 
     url.hostname.includes('unsplash.com') || url.hostname.includes('cdn') ||
     url.hostname.includes('cloudfront.net')) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if(cached) return cached;
        return fetch(e.request).then(response => {
          if(response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
          return response;
        }).catch(() => new Response('', {status: 408}));
      })
    );
    return;
  }
  
  // Network-first for everything else
  e.respondWith(
    fetch(e.request).then(response => {
      if(response && response.status === 200) {
        const clone = response.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return response;
    }).catch(() => caches.match(e.request))
  );
});
