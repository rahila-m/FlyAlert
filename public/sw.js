// FlyAlert service worker: shows phone/browser notifications.
//
// The browser keeps this small script running in the background, so a
// notification can appear even when the FlyAlert tab is closed.
// It does NOT cache pages (no offline mode), so updates to the site are
// always visible immediately.

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))

// A message arrived from our server (decrypted by the browser).
self.addEventListener('push', (event) => {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch {
    data = { body: event.data ? event.data.text() : '' }
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'FlyAlert', {
      body: data.body || '',
      icon: '/icons/icon-192.png',
      badge: '/icons/badge-96.png', // small monochrome icon in the Android status bar
      tag: data.tag, // a newer notification for the same alert replaces the old one
      renotify: Boolean(data.tag),
      data: { url: typeof data.url === 'string' ? data.url : '/dashboard' },
    }),
  )
})

// The user tapped the notification: open (or focus) FlyAlert on that page.
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  // Only our own pages can be opened, never another website.
  const target = new URL(event.notification.data?.url || '/dashboard', self.location.origin)
  const url = target.origin === self.location.origin ? target.href : self.location.origin + '/dashboard'

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      for (const client of windows) {
        if (new URL(client.url).origin === self.location.origin && 'focus' in client) {
          await client.focus()
          if ('navigate' in client) await client.navigate(url)
          return
        }
      }
      await self.clients.openWindow(url)
    })(),
  )
})
