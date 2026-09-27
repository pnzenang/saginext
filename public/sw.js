const cacheVersion = 'sagi-pwa-v1'
const shellCacheName = `${cacheVersion}-shell`
const staticCacheName = `${cacheVersion}-static`

const shellAssets = [
  '/offline.html',
  '/manifest.json',
  '/favicon/android-chrome-192x192.png',
  '/favicon/android-chrome-512x512.png',
  '/favicon/apple-touch-icon.png',
  '/favicon/favicon-32x32.png'
]

const staticPathPrefixes = ['/favicon/', '/images/', '/_next/static/', '/_next/image']

self.addEventListener('install', event => {
  event.waitUntil(
    caches
      .open(shellCacheName)
      .then(cache => cache.addAll(shellAssets))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches
      .keys()
      .then(cacheNames =>
        Promise.all(
          cacheNames
            .filter(
              cacheName =>
                cacheName.startsWith('sagi-pwa-') && cacheName !== shellCacheName && cacheName !== staticCacheName
            )
            .map(cacheName => caches.delete(cacheName))
        )
      )
      .then(() => self.clients.claim())
  )
})

const isStaticRequest = request => {
  const url = new URL(request.url)

  if (url.origin !== self.location.origin) return false
  if (staticPathPrefixes.some(prefix => url.pathname.startsWith(prefix))) return true

  return ['font', 'image', 'script', 'style'].includes(request.destination)
}

const putInStaticCache = async (request, response) => {
  if (!response || (!response.ok && response.type !== 'opaque')) return

  const cache = await caches.open(staticCacheName)

  await cache.put(request, response.clone())
}

self.addEventListener('fetch', event => {
  const { request } = event

  if (request.method !== 'GET') return

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match('/offline.html')))

    return
  }

  if (!isStaticRequest(request)) return

  event.respondWith(
    caches.match(request).then(cachedResponse => {
      const fetchedResponse = fetch(request)
        .then(response => {
          putInStaticCache(request, response).catch(() => undefined)

          return response
        })
        .catch(() => cachedResponse || Response.error())

      return cachedResponse || fetchedResponse
    })
  )
})
