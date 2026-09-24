// RC Atölyesi — basit servis çalışanı (service worker).
// Amaç: siteyi "yüklenebilir" (installable) bir uygulama haline getirmek
// ve statik dosyaları (ikonlar, css, js) önbelleğe alarak açılışı
// hızlandırmak. Sorular/ilanlar gibi CANLI veriler her zaman ağdan
// (network-first) çekiliyor, böylece eski/bayat içerik gösterilmiyor.

const CACHE_NAME = 'rc-atolyesi-v1';
const STATIC_CACHE_PATTERNS = ['/_next/static/', '/icons/'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const isStaticAsset = STATIC_CACHE_PATTERNS.some((p) => url.pathname.startsWith(p));

  if (isStaticAsset) {
    // Statik dosyalar: önce önbellek, yoksa ağdan çekip önbelleğe ekle.
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        });
      })
    );
    return;
  }

  // Sayfa/veri istekleri: her zaman ağdan dene (canlı kalsın),
  // sadece tamamen çevrimdışıysak son önbelleğe düş.
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

// Sunucudan gerçek bir bildirim geldiğinde ekranda göster.
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = {};
  }

  const title = data.title || 'RC Atölyesi';
  const options = {
    body: data.body || '',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    data: { url: data.url || '/' }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Bildirime tıklanınca ilgili sayfayı aç (site zaten açıksa ona odaklan).
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data && event.notification.data.url ? event.notification.data.url : '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
