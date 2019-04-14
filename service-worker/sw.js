const CACHE_NAME = 'my-site-cache-v1';
const urlsToCache = [];

self.addEventListener('install', event => {

  console.log('SW INSTALLED');

  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('SW CACHE OPENED');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', event => {
  console.log('SW ACTIVATE');
});


self.addEventListener('fetch', event => {

  if (event.request.url !== 'http://localhost:3000/api/notes') {
    console.log('SW FETCH', event.request.url);
    return fetch(event.request);
  }

  const request = event.request.clone();
  if (request.method === 'POST') {
    request.json().then(
      r => console.log('BODY', r),
      e => console.log(e)
    );
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {


        if (response) {
          return response;
        }

        return fetch(event.request).then(
          function (response) {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // // IMPORTANT: Clone the response. A response is a stream
            // // and because we want the browser to consume the response
            // // as well as the cache consuming the response, we need
            // // to clone it so we have two streams.
            // const responseToCache = response.clone();
            //
            // caches.open(CACHE_NAME)
            //   .then(function(cache) {
            //     cache.put(event.request, responseToCache);
            //   });

            return response;
          }
        );
      })
  );
});
