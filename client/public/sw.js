const CACHE_NAME = 'dokan-hisab-v2';
const API_CACHE_NAME = 'dokan-hisab-api-v1';

// Assets to cache for offline use  
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Supabase API endpoints to cache
const API_ENDPOINTS = [
  'https://lkhqdqlryjzalsemofdt.supabase.co/rest/v1/customers',
  'https://lkhqdqlryjzalsemofdt.supabase.co/rest/v1/products',
  'https://lkhqdqlryjzalsemofdt.supabase.co/rest/v1/sales',
  'https://lkhqdqlryjzalsemofdt.supabase.co/rest/v1/expenses',
  'https://lkhqdqlryjzalsemofdt.supabase.co/rest/v1/collections',
  'https://lkhqdqlryjzalsemofdt.supabase.co/rest/v1/users'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker installed successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker install failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - handle network requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle Supabase API requests
  if (url.hostname === 'lkhqdqlryjzalsemofdt.supabase.co' && url.pathname.startsWith('/rest/v1/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static assets and navigation
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        // For navigation requests, return index.html
        if (request.mode === 'navigate') {
          return caches.match('/');
        }

        // Try network for other requests
        return fetch(request)
          .then((response) => {
            // Cache successful responses
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(request, responseClone);
                });
            }
            return response;
          })
          .catch(() => {
            // Return offline page or default response
            if (request.mode === 'navigate') {
              return caches.match('/');
            }
            return new Response('অফলাইন মোডে এই সুবিধা পাওয়া যাচ্ছে না', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: { 'Content-Type': 'text/plain; charset=utf-8' }
            });
          });
      })
  );
});

// Handle API requests with caching strategy
async function handleApiRequest(request) {
  const url = new URL(request.url);
  const method = request.method;

  try {
    // For GET requests, try network first, then cache
    if (method === 'GET') {
      try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
          // Cache successful GET responses
          const responseClone = networkResponse.clone();
          const cache = await caches.open(API_CACHE_NAME);
          await cache.put(request, responseClone);
          
          // Add online indicator to response
          const data = await networkResponse.clone().json();
          return new Response(JSON.stringify({ ...data, _offline: false }), {
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        throw new Error('Network response not ok');
      } catch (networkError) {
        // Network failed, try cache
        console.log('Network failed, trying cache:', networkError);
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
          const data = await cachedResponse.json();
          return new Response(JSON.stringify({ ...data, _offline: true }), {
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        // No cache available
        return new Response(JSON.stringify({ 
          error: 'অফলাইন মোডে এই তথ্য পাওয়া যাচ্ছে না',
          _offline: true 
        }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // For POST/PUT/DELETE requests, try network first
    if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
      try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
          // Invalidate related cache entries
          await invalidateRelatedCache(url.pathname);
          return networkResponse;
        }
        
        throw new Error('Network response not ok');
      } catch (networkError) {
        // Store the request for later sync
        await storeFailedRequest(request);
        
        return new Response(JSON.stringify({
          success: true,
          message: 'অফলাইনে সংরক্ষিত হয়েছে। অনলাইন হলে সিঙ্ক হবে।',
          _offline: true
        }), {
          status: 202,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // For other methods, just try network
    return await fetch(request);
  } catch (error) {
    console.error('API request failed:', error);
    return new Response(JSON.stringify({
      error: 'সার্ভার সংযোগ ব্যর্থ',
      _offline: true
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Invalidate cache entries related to a specific endpoint
async function invalidateRelatedCache(pathname) {
  const cache = await caches.open(API_CACHE_NAME);
  const keys = await cache.keys();
  
  const relatedKeys = keys.filter(key => {
    const keyUrl = new URL(key.url);
    return keyUrl.pathname.startsWith(pathname.split('/').slice(0, -1).join('/'));
  });
  
  await Promise.all(relatedKeys.map(key => cache.delete(key)));
}

// Store failed requests for background sync
async function storeFailedRequest(request) {
  try {
    const requestData = {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      body: request.method !== 'GET' ? await request.text() : null,
      timestamp: Date.now()
    };

    // Store in IndexedDB (simplified version)
    const db = await openDB();
    const transaction = db.transaction(['failed_requests'], 'readwrite');
    const store = transaction.objectStore('failed_requests');
    await store.add(requestData);
  } catch (error) {
    console.error('Failed to store request for sync:', error);
  }
}

// Simple IndexedDB wrapper
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('dokan-hisab-offline', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('failed_requests')) {
        const store = db.createObjectStore('failed_requests', { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        store.createIndex('timestamp', 'timestamp');
      }
    };
  });
}

// Background sync event
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(syncFailedRequests());
  }
});

// Sync failed requests when online
async function syncFailedRequests() {
  try {
    const db = await openDB();
    const transaction = db.transaction(['failed_requests'], 'readonly');
    const store = transaction.objectStore('failed_requests');
    const requests = await store.getAll();

    for (const requestData of requests) {
      try {
        const response = await fetch(requestData.url, {
          method: requestData.method,
          headers: requestData.headers,
          body: requestData.body
        });

        if (response.ok) {
          // Remove from failed requests
          const deleteTransaction = db.transaction(['failed_requests'], 'readwrite');
          const deleteStore = deleteTransaction.objectStore('failed_requests');
          await deleteStore.delete(requestData.id);
          
          console.log('Synced request:', requestData.url);
        }
      } catch (error) {
        console.error('Failed to sync request:', requestData.url, error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Push notification event
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || 'নতুন আপডেট পাওয়া গেছে',
    icon: '/manifest-icon-192.png',
    badge: '/manifest-icon-192.png',
    tag: data.tag || 'general',
    data: data.data || {},
    actions: [
      {
        action: 'view',
        title: 'দেখুন'
      },
      {
        action: 'dismiss',
        title: 'বাতিল'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'দোকান হিসাব', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    );
  }
});

// Message event for communication with main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Handle connection changes
self.addEventListener('online', () => {
  console.log('App is online, triggering sync');
  self.registration.sync.register('background-sync');
});

console.log('Service Worker loaded successfully');
