const CACHE = "safety-edu-v8";
const FILES = [
"./",
"index.html",
"config.js",
"manifest.webmanifest",
"icons/icon-192.png",
"icons/icon-512.png",
"icons/maskable-512.png",
"icons/apple-touch-icon.png",
"img/g_A01.jpg",
"img/g_A02.jpg",
"img/g_A03.jpg",
"img/g_A04.jpg",
"img/g_A05.jpg",
"img/g_A07.jpg",
"img/g_A08.jpg",
"img/g_B01.jpg",
"img/g_B02.jpg",
"img/g_B04.jpg",
"img/g_B07.jpg",
"img/g_B09.jpg",
"img/g_B10.jpg",
"img/g_B12.jpg",
"img/g_B13.jpg",
"img/g_B14.jpg",
"img/g_B15.jpg",
"img/g_B16.jpg",
"img/g_C01.jpg",
"img/g_C02.jpg",
"img/g_C03.jpg",
"img/g_C04.jpg",
"img/g_C05.jpg",
"img/g_C06.jpg",
"img/g_C07.jpg",
"img/g_C08.jpg",
"img/g_C09.jpg",
"img/g_C11.jpg",
"img/g_D01.jpg",
"img/g_E01.jpg",
"img/ph_fork.jpg",
"img/ph_grind.jpg",
"img/ph_weld.jpg"
];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const req = e.request; if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin === location.origin && (req.mode === "navigate" || url.pathname.endsWith(".html") || url.pathname.endsWith("config.js"))) {
    // 페이지는 최신본 우선, 오프라인이면 캐시
    e.respondWith(fetch(req).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put(req, c)); return r; }).catch(() => caches.match(req).then(r => r || caches.match("index.html"))));
    return;
  }
  // 이미지·아이콘·글꼴은 캐시 우선
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
    if (r.ok || r.type === "opaque") { const c = r.clone(); caches.open(CACHE).then(x => x.put(req, c)); }
    return r;
  }).catch(() => hit)));
});
