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

  // finding a resolver
  let currentResolver = null;
  resolvers.forEach(resolver => {
    if (resolver.matchUrl(event.request.ur))
      currentResolver = resolver;
  });

  if (currentResolver) {
    event.respondWith( async function() {

      const requestClone = event.request.clone();
      let body = null;
      if (requestClone.method === 'POST') {
        body = requestClone.json();
      }
      console.log('SW RESOLVERD', requestClone.url, body);
      return fetch(event.request);
    });
  }
  else {
    console.log('SW FETCH BYPASS', event.request.url);
  }

  // return fetch(event.request).then(response => {
  //
  //   // Check if we received a valid response
  //   if (!response || response.status !== 200 || response.type !== 'basic') {
  //     return response;
  //   }
  //
  //   event.respondWith();
  //
  //   caches.match(event.request)
  //     .then(response => {
  //
  //       if (response) {
  //         return response;
  //       }
  //
  //       return fetch(event.request).then(response => {
  //           // Check if we received a valid response
  //           if (!response || response.status !== 200 || response.type !== 'basic') {
  //             return response;
  //           }
  //
  //           // // IMPORTANT: Clone the response. A response is a stream
  //           // // and because we want the browser to consume the response
  //           // // as well as the cache consuming the response, we need
  //           // // to clone it so we have two streams.
  //           // const responseToCache = response.clone();
  //           //
  //           // caches.open(CACHE_NAME)
  //           //   .then(function(cache) {
  //           //     cache.put(event.request, responseToCache);
  //           //   });
  //
  //           return response;
  //         }
  //       );
  //     })



});

class NoteResolver {
  matchUrl(url) {
    return url.startsWidth('http://localhost:3000/api/notes');
  }
}

const resolvers = [new NoteResolver()];


