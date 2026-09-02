/* CKP service worker (patch-25) — conservative:
 * - /_next/static + /assets: cache-first (immutable build assets)
 * - navigations: network-first with offline fallback to /offline
 * - NEVER caches /learner, /admin, /sign-in, /pay, /api (auth/data must stay fresh)
 */
const VERSION = 'ckp-sw-v1';
const STATIC_CACHE = `${VERSION}-static`;
const RUNTIME_CACHE = `${VERSION}-runtime`;

self.addEventListener('install', (event) => {
    event.waitUntil(caches.open(STATIC_CACHE).then((c) => c.addAll(['/offline', '/favicon.svg'])).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
            .then(() => self.clients.claim()),
    );
});

const NEVER = [/^\/learner/, /^\/admin/, /^\/sign-in/, /^\/pay/, /^\/api\//];

self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (request.method !== 'GET') return;
    const url = new URL(request.url);
    if (url.origin !== self.location.origin) return; // cross-origin (API) untouched
    if (NEVER.some((re) => re.test(url.pathname))) return; // freshness > cache for auth/data

    // Immutable build assets → cache-first
    if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/assets/')) {
        event.respondWith(
            caches.open(STATIC_CACHE).then(async (cache) => {
                const hit = await cache.match(request);
                if (hit) return hit;
                const res = await fetch(request);
                if (res.ok) cache.put(request, res.clone());
                return res;
            }),
        );
        return;
    }

    // Page navigations → network-first, offline falls back to cached page or /offline
    if (request.mode === 'navigate') {
        event.respondWith(
            (async () => {
                try {
                    const res = await fetch(request);
                    if (res.ok) {
                        const cache = await caches.open(RUNTIME_CACHE);
                        cache.put(request, res.clone());
                    }
                    return res;
                } catch {
                    const cached = await caches.match(request);
                    if (cached) return cached;
                    return (await caches.match('/offline')) ?? Response.error();
                }
            })(),
        );
    }
});
