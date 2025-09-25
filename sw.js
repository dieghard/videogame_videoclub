const CACHE_NAME = 'videoclub-sandy-v2.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/styles.css',
  '/assets/audio.js',
  '/assets/game.js',
  '/assets/frases-nostalgicas.js',
  '/assets/images/cazafantasmas.jpg',
  '/assets/images/et.jpg',
  '/assets/images/madonna.jpg',
  '/assets/images/volveralfuturo.jpg',
  '/assets/images/historiasinfin.jpg',
  'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap',
  'https://fonts.gstatic.com/s/pressstart2p/v14/e3t4euO8T-267oIAQAu6jDQyK3nVivM.woff2'
];

// Instalación del service worker
self.addEventListener('install', function(event) {
  console.log('[SW] Instalando service worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('[SW] Cache abierto');
        return cache.addAll(urlsToCache);
      })
      .then(function() {
        console.log('[SW] Todos los archivos han sido cacheados');
        return self.skipWaiting();
      })
  );
});

// Activación del service worker
self.addEventListener('activate', function(event) {
  console.log('[SW] Activando service worker...');
  
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function() {
      console.log('[SW] Service worker activado');
      return self.clients.claim();
    })
  );
});

// Interceptar requests
self.addEventListener('fetch', function(event) {
  // Solo cachear requests GET
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Ignorar requests de chrome-extension y otras que no sean http/https
  if (!event.request.url.startsWith('http')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Si encontramos el archivo en cache, lo devolvemos
        if (response) {
          console.log('[SW] Sirviendo desde cache:', event.request.url);
          return response;
        }
        
        // Si no está en cache, lo descargamos
        console.log('[SW] Descargando:', event.request.url);
        return fetch(event.request)
          .then(function(response) {
            // Verificar que la respuesta sea válida
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clonar la respuesta porque solo se puede usar una vez
            const responseToCache = response.clone();
            
            // Añadir al cache para futuras requests
            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(function(error) {
            console.log('[SW] Error en fetch:', error);
            
            // Si estamos offline y es una request por una página, devolver index.html
            if (event.request.destination === 'document') {
              return caches.match('/index.html');
            }
            
            // Para otros recursos, podrías devolver un fallback
            return new Response('Recurso no disponible offline', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

// Mensaje del service worker
self.addEventListener('message', function(event) {
  console.log('[SW] Mensaje recibido:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Eventos de background sync (para futuras funcionalidades)
self.addEventListener('sync', function(event) {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  // Aquí podrías sincronizar datos cuando vuelva la conexión
  console.log('[SW] Ejecutando background sync...');
  return Promise.resolve();
}

// Notificaciones push (para futuras funcionalidades)
self.addEventListener('push', function(event) {
  console.log('[SW] Push recibido:', event);
  
  const options = {
    body: event.data ? event.data.text() : '¡Vuelve a jugar Retro VideoClub Rush!',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Jugar ahora',
        icon: '/icon-play.png'
      },
      {
        action: 'close',
        title: 'Cerrar',
        icon: '/icon-close.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('🎮 Retro VideoClub Rush', options)
  );
});

// Manejo de clics en notificaciones
self.addEventListener('notificationclick', function(event) {
  console.log('[SW] Notificación clickeada:', event);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    // Abrir o enfocar la aplicación
    event.waitUntil(
      clients.matchAll()
        .then(function(clientList) {
          if (clientList.length > 0) {
            return clientList[0].focus();
          }
          return clients.openWindow('/');
        })
    );
  }
});

// Logging de errores
self.addEventListener('error', function(event) {
  console.error('[SW] Error:', event.error);
});

self.addEventListener('unhandledrejection', function(event) {
  console.error('[SW] Unhandled rejection:', event.reason);
});

console.log('[SW] Service Worker del Retro VideoClub Rush cargado correctamente! 🎮');