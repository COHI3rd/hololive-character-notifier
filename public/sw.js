// Service Worker for Hololive Character Notifier
const CACHE_NAME = 'hololive-notifier-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  // Add other static assets
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});

// Background sync for notifications (if supported)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-notification') {
    event.waitUntil(doBackgroundNotification());
  }
});

// Push event for external notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New message from your Hololive character!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '2'
    },
    actions: [
      {
        action: 'explore',
        title: 'Open App',
        icon: '/icons/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/icon-192x192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Hololive Character Notifier', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

async function doBackgroundNotification() {
  // Background notification logic
  try {
    const registration = self.registration;
    await registration.showNotification('Background notification', {
      body: 'This is a background notification',
      icon: '/icons/icon-192x192.png'
    });
  } catch (error) {
    console.error('Background notification failed:', error);
  }
} 