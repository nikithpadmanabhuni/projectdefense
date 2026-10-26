/**
 * sw.js - ProjectDefense Service Worker (Phase 5)
 * Version: pd-cache-v5
 * 
 * Rules:
 * 1. Cache-first for static assets (CSS, JS, icons, manifest).
 * 2. Network-first with cache fallback for HTML pages so offline users can still browse.
 * 3. Never cache /api/ or GitHub API requests.
 * 4. Cleans up legacy caches on activation.
 */

const CACHE_NAME = 'pd-cache-v9';

const STATIC_ASSETS = [
  './',
  './index.html',
  './onboarding.html',
  './profile.html',
  './dashboard.html',
  './defense.html',
  './coding.html',
  './resume.html',
  './sprint.html',
  './feedback.html',
  './css/custom.css',
  './js/security.js',
  './js/env.js',
  './js/storage.js',
  './js/github.js',
  './js/mock.js',
  './js/api-client.js',
  './js/problems.js',
  './js/runner.js',
  './js/runner-worker.js',
  './js/resume-rules.js',
  './js/resume.js',
  './js/sprint.js',
  './js/certificate.js',
  './js/nav.js',
  './js/onboarding.js',
  './js/dashboard.js',
  './js/defense.js',
  './js/coding.js',
  './js/feedback.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-192.svg',
  './icons/icon-512.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. DO NOT cache /api/ routes or external APIs (GitHub, Groq)
  if (
    url.pathname.startsWith('/api/') || 
    url.hostname.includes('github.com') ||
    url.hostname.includes('groq.com')
  ) {
    return; // Pass through to network
  }

  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // 2. HTML Pages: Network-first with cache fallback
  if (event.request.mode === 'navigate' || event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(event.request).then((cached) => {
            return cached || caches.match('./index.html');
          });
        })
    );
    return;
  }

  // 3. Static Assets: Cache-first with network fallback
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return networkResponse;
      });
    })
  );
});
