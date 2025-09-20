const CACHE_NAME = 'valutcalc-v1.0.3';
const STATIC_CACHE = 'valutcalc-static-v1.0.3';
const DYNAMIC_CACHE = 'valutcalc-dynamic-v1.0.3';

// Файлы для кэширования
const STATIC_FILES = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/manifest.json',
    '/icons/icon-192.png',
    '/icons/icon-512.png',
    '/favicon.ico'
];

// API endpoints для кэширования
const API_CACHE_PATTERNS = [
    /^https:\/\/api\.exchangerate-api\.com\/v4\/latest\//,
    /^https:\/\/api\.currencyapi\.com\/v3\/latest\//
];

// Установка Service Worker
self.addEventListener('install', event => {
    console.log('SW: Установка');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('SW: Кэширование статических файлов');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('SW: Статические файлы закэшированы');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('SW: Ошибка кэширования статических файлов:', error);
            })
    );
});

// Активация Service Worker
self.addEventListener('activate', event => {
    console.log('SW: Активация');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('SW: Удаление старого кэша:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('SW: Активация завершена');
                return self.clients.claim();
            })
    );
});

// Обработка запросов
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Обработка API запросов курсов валют
    if (API_CACHE_PATTERNS.some(pattern => pattern.test(request.url))) {
        event.respondWith(
            caches.open(DYNAMIC_CACHE)
                .then(cache => {
                    return cache.match(request)
                        .then(response => {
                            if (response) {
                                console.log('SW: API ответ из кэша');
                                return response;
                            }

                            return fetch(request)
                                .then(fetchResponse => {
                                    if (fetchResponse.ok) {
                                        cache.put(request, fetchResponse.clone());
                                        console.log('SW: API ответ сохранен в кэш');
                                    }
                                    return fetchResponse;
                                })
                                .catch(error => {
                                    console.error('SW: Ошибка API запроса:', error);
                                    // Возвращаем кэшированный ответ если есть
                                    return cache.match(request);
                                });
                        });
                })
        );
        return;
    }

    // Обработка статических файлов
    if (request.method === 'GET') {
        event.respondWith(
            caches.match(request)
                .then(response => {
                    // Если файл есть в кэше, проверяем его актуальность
                    if (response) {
                        // Для файлов с версиями (app.js?v=12) всегда запрашиваем свежую версию
                        if (request.url.includes('?v=')) {
                            console.log('SW: Файл с версией, запрашиваем свежую версию:', request.url);
                            return fetch(request)
                                .then(fetchResponse => {
                                    if (fetchResponse.ok) {
                                        const responseClone = fetchResponse.clone();
                                        caches.open(STATIC_CACHE)
                                            .then(cache => {
                                                cache.put(request, responseClone);
                                            });
                                    }
                                    return fetchResponse;
                                })
                                .catch(() => response); // Fallback на кэш если fetch не удался
                        }
                        
                        console.log('SW: Статический файл из кэша:', request.url);
                        return response;
                    }

                    return fetch(request)
                        .then(fetchResponse => {
                            if (fetchResponse.ok) {
                                const responseClone = fetchResponse.clone();
                                caches.open(STATIC_CACHE)
                                    .then(cache => {
                                        cache.put(request, responseClone);
                                    });
                            }
                            return fetchResponse;
                        })
                        .catch(error => {
                            console.error('SW: Ошибка загрузки файла:', error);
                            
                            // Fallback для HTML файлов
                            if (request.destination === 'document') {
                                return caches.match('/index.html');
                            }
                            
                            throw error;
                        });
                })
        );
    }
});

// Обработка сообщений от основного потока
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        console.log('SW: Получена команда SKIP_WAITING');
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CACHE_RATES') {
        // Сохраняем курсы валют в кэш
        const rates = event.data.rates;
        caches.open(DYNAMIC_CACHE)
            .then(cache => {
                const response = new Response(JSON.stringify(rates), {
                    headers: { 'Content-Type': 'application/json' }
                });
                cache.put('/api/rates', response);
                console.log('SW: Курсы валют сохранены в кэш');
            });
    }
});

// Обработка активации нового Service Worker
self.addEventListener('activate', event => {
    console.log('SW: Активация');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('SW: Удаление старого кэша:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('SW: Активация завершена');
                // Уведомляем клиентов о том, что новый SW активирован
                return self.clients.claim();
            })
    );
});

// Уведомляем клиентов о доступности обновления
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'CHECK_UPDATE') {
        // Проверяем, есть ли обновления
        self.registration.update().then(() => {
            console.log('SW: Проверка обновлений завершена');
        });
    }
});

// Периодическое обновление кэша
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        console.log('SW: Фоновое обновление кэша');
        event.waitUntil(updateCache());
    }
});

async function updateCache() {
    try {
        const cache = await caches.open(DYNAMIC_CACHE);
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        
        if (response.ok) {
            await cache.put('/api/rates', response.clone());
            console.log('SW: Кэш курсов валют обновлен');
        }
    } catch (error) {
        console.error('SW: Ошибка обновления кэша:', error);
    }
}

// Обработка push уведомлений (для будущих функций)
self.addEventListener('push', event => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: '/icons/icon-192.png',
            badge: '/icons/icon-192.png',
            vibrate: [100, 50, 100],
            data: data.data,
            actions: [
                {
                    action: 'open',
                    title: 'Открыть',
                    icon: '/icons/icon-192.png'
                },
                {
                    action: 'close',
                    title: 'Закрыть'
                }
            ]
        };

        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// Обработка кликов по уведомлениям
self.addEventListener('notificationclick', event => {
    event.notification.close();

    if (event.action === 'open') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});
