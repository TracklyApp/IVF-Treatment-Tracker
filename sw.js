/* Bump VERSION for every release, including HTML, icons and pwa.js changes. */
const VERSION = '1.0.0';
const PREFIX = 'ivf-tracker-' + encodeURIComponent(self.registration.scope) + '-';
const CACHE = PREFIX + VERSION;
const APP = new URL('IVF-Fertility-Treatment-Tracker.html', self.registration.scope).href;
const ASSETS = [APP, 'pwa.js', 'manifest.webmanifest', 'icons/icon-192.png',
  'icons/icon-512.png', 'icons/apple-touch-icon.png'].map(path => new URL(path, self.registration.scope).href);

self.addEventListener('install', event => {
  // Atomic precache: a failed download leaves the existing release active.
  // Do not skipWaiting: open forms and other tabs keep their current release.
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(
    ASSETS.map(url => new Request(url, {cache: 'reload'}))
  )));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key.startsWith(PREFIX) && key !== CACHE).map(key => caches.delete(key))
  )));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  const isApp = url.origin === new URL(APP).origin && url.pathname === new URL(APP).pathname;
  const key = isApp && event.request.mode === 'navigate' ? APP : url.href;
  if (!ASSETS.includes(key)) return;
  // Only static application files are cached, never treatment data or arbitrary URLs.
  event.respondWith(caches.open(CACHE).then(async cache => {
    const cached = await cache.match(key);
    return cached || fetch(event.request);
  }));
});
