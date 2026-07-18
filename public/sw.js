const CACHE_NAME = 'pawcare-v2'
const STATIC_URLS = ['/', '/home', '/chat', '/hospitals', '/history', '/profile', '/prescription']

self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_URLS).catch(() => {}))
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  // API, Supabase, Kakao 요청은 캐시하지 않음
  const url = new URL(event.request.url)
  if (
    event.request.method !== 'GET' ||
    url.pathname.startsWith('/api/') ||
    url.hostname.includes('supabase') ||
    url.hostname.includes('kakao')
  ) {
    return
  }

  // 페이지 이동(HTML 문서)은 네트워크를 먼저 쓰고, 오프라인일 때만 캐시로 대체한다.
  // 예전처럼 캐시를 무조건 먼저 보여주면, 배포로 정적 자산 파일명(해시)이 바뀐 뒤에도
  // 오래된 HTML이 이미 삭제된 옛 JS 청크를 참조해서 화면이 깨질 수 있다(흔한 PWA 함정).
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          if (res.ok) {
            const clone = res.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
          }
          return res
        })
        .catch(() => caches.match(event.request))
    )
    return
  }

  // 그 외 정적 자산(JS/CSS/이미지 등)은 파일명 자체가 콘텐츠 해시라 안전하게 캐시 우선으로 서빙하고
  // 백그라운드에서 최신본으로 갱신해둔다.
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request).then((res) => {
        if (res.ok) {
          const clone = res.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
        }
        return res
      })
      return cached || network
    })
  )
})
