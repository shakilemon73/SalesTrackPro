/**
 * Service Worker for Dokan Hisab - Offline-First Business Management App
 * Implements comprehensive offline functionality for Bengali entrepreneurs
 */

const CACHE_NAME = 'dokan-hisab-v1.0.0';
const STATIC_CACHE = 'dokan-hisab-static-v1.0.0';
const DATA_CACHE = 'dokan-hisab-data-v1.0.0';

// Assets to cache for offline functionality
const STATIC_ASSETS = [
  '/',
  '/src/main.tsx',
  '/src/index.css',
  '/manifest.json',
  // Core app routes
  '/dashboard',
  '/customers', 
  '/transactions',
  '/sales/new',
  '/customers/new',
  '/expenses/new',
  '/inventory',
  '/reports',
  '/settings',
  // Critical offline pages
  '/offline.html'
];

// Supabase API endpoints to cache
const SUPABASE_ENDPOINTS = [
  'https://lkhqdqlryjzalsemofdt.supabase.co/rest/v1/customers',
  'https://lkhqdqlryjzalsemofdt.supabase.co/rest/v1/sales',
  'https://lkhqdqlryjzalsemofdt.supabase.co/rest/v1/expenses',
  'https://lkhqdqlryjzalsemofdt.supabase.co/rest/v1/products',
  'https://lkhqdqlryjzalsemofdt.supabase.co/rest/v1/collections'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('📱 SW: Installing service worker...');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then(cache => {
        console.log('📱 SW: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      // Initialize data cache
      caches.open(DATA_CACHE).then(cache => {
        console.log('📱 SW: Data cache initialized');
        return Promise.resolve();
      })
    ]).then(() => {
      console.log('📱 SW: Installation complete');
      // Skip waiting to activate immediately
      self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('📱 SW: Activating service worker...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE && 
              cacheName !== DATA_CACHE && 
              cacheName !== CACHE_NAME) {
            console.log('📱 SW: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('📱 SW: Activation complete');
      // Take control of all clients immediately
      return self.clients.claim();
    })
  );
});

// Fetch event - implement offline-first caching strategy
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle different types of requests
  if (request.method === 'GET') {
    if (isStaticAsset(url)) {
      // Cache first for static assets
      event.respondWith(cacheFirst(request, STATIC_CACHE));
    } else if (isSupabaseAPI(url)) {
      // Network first with cache fallback for API calls
      event.respondWith(networkFirstWithCache(request, DATA_CACHE));
    } else if (isAppRoute(url)) {
      // Cache first for app routes, fallback to index.html
      event.respondWith(cacheFirstWithFallback(request));
    }
  } else {
    // Handle POST/PUT/DELETE requests
    if (isSupabaseAPI(url)) {
      event.respondWith(handleMutationRequest(request));
    }
  }
});

// Background sync for offline actions
self.addEventListener('sync', event => {
  console.log('📱 SW: Background sync triggered:', event.tag);
  
  if (event.tag === 'sync-pending-actions') {
    event.waitUntil(syncPendingActions());
  }
});

// Helper Functions

function isStaticAsset(url) {
  return url.pathname.includes('/src/') || 
         url.pathname.includes('/assets/') ||
         url.pathname.endsWith('.css') ||
         url.pathname.endsWith('.js') ||
         url.pathname.endsWith('.json') ||
         url.pathname.endsWith('.svg') ||
         url.pathname.endsWith('.png');
}

function isSupabaseAPI(url) {
  return url.hostname.includes('supabase.co') && url.pathname.includes('/rest/v1/');
}

function isAppRoute(url) {
  const appRoutes = [
    '/', '/dashboard', '/customers', '/transactions', 
    '/sales', '/expenses', '/inventory', '/reports', '/settings'
  ];
  return appRoutes.some(route => url.pathname.startsWith(route));
}

async function cacheFirst(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('📱 SW: Serving from cache:', request.url);
      return cachedResponse;
    }
    
    console.log('📱 SW: Fetching from network:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('📱 SW: Cache first failed:', error);
    return new Response('Offline content unavailable', { 
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

async function networkFirstWithCache(request, cacheName) {
  try {
    console.log('📱 SW: Trying network first:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
      console.log('📱 SW: Updated cache from network:', request.url);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('📱 SW: Network failed, trying cache:', error);
    
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('📱 SW: Serving stale data from cache:', request.url);
      return cachedResponse;
    }
    
    // Return empty array for data requests when offline
    return new Response('[]', {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function cacheFirstWithFallback(request) {
  try {
    const cache = await caches.open(STATIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    // Fallback to main app
    const cache = await caches.open(STATIC_CACHE);
    return cache.match('/') || new Response('App unavailable offline');
  }
}

async function handleMutationRequest(request) {
  try {
    // Try network first for mutations
    const response = await fetch(request);
    console.log('📱 SW: Mutation successful:', request.url);
    return response;
  } catch (error) {
    console.log('📱 SW: Mutation failed, storing for sync:', request.url);
    
    // Store the failed request for background sync
    const requestData = {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers),
      body: await request.text(),
      timestamp: Date.now()
    };
    
    // Store in IndexedDB for sync later
    await storeFailedRequest(requestData);
    
    // Register background sync
    if ('serviceWorker' in self && 'sync' in window.ServiceWorkerRegistration.prototype) {
      await self.registration.sync.register('sync-pending-actions');
    }
    
    // Return success response to prevent UI errors
    return new Response(JSON.stringify({ 
      success: true, 
      offline: true,
      message: 'Data saved offline, will sync when online'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function storeFailedRequest(requestData) {
  try {
    const db = await openDB();
    const tx = db.transaction(['pendingSync'], 'readwrite');
    const store = tx.objectStore('pendingSync');
    await store.add({
      id: Date.now() + Math.random(),
      ...requestData
    });
  } catch (error) {
    console.error('📱 SW: Failed to store request for sync:', error);
  }
}

async function syncPendingActions() {
  try {
    const db = await openDB();
    const tx = db.transaction(['pendingSync'], 'readwrite');
    const store = tx.objectStore('pendingSync');
    const pendingRequests = await store.getAll();
    
    console.log(`📱 SW: Syncing ${pendingRequests.length} pending actions`);
    
    for (const request of pendingRequests) {
      try {
        const response = await fetch(request.url, {
          method: request.method,
          headers: request.headers,
          body: request.body
        });
        
        if (response.ok) {
          await store.delete(request.id);
          console.log('📱 SW: Successfully synced request:', request.url);
        }
      } catch (error) {
        console.log('📱 SW: Sync failed for request:', request.url, error);
      }
    }
  } catch (error) {
    console.error('📱 SW: Background sync failed:', error);
  }
}

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('dokan-hisab-sync', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pendingSync')) {
        const store = db.createObjectStore('pendingSync', { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp');
      }
    };
  });
}

// Listen for messages from main app
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(cacheUrls(event.data.payload));
  }
});

async function cacheUrls(urls) {
  const cache = await caches.open(DATA_CACHE);
  await cache.addAll(urls);
  console.log('📱 SW: Additional URLs cached');
}

console.log('📱 SW: Service Worker script loaded');