self.importScripts('sw-polyfills.js');

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
    if (resolver.matchUrl(event.request.url))
      currentResolver = resolver;
  });

  if (currentResolver) {
    event.respondWith(async function () {

      let body = null;
      if (event.request.method === 'POST') {
        body = await event.request.clone().json();
      }

      if (event.request.method === 'GET') {
        console.log('SW GET:', event.request.url);

        return fetch(event.request).then(response => {
          return cloneWritableResponse(response);
        });

      } else {
        console.log('SW POST RESOLVED', event.request.url, body);
        return fetch(event.request);
      }

    }());
  } else {
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
    return url.startsWith('http://localhost:3000/api/notes');
  }
}

const resolvers = [new NoteResolver()];


function cloneWritableResponse(response) {

  var init = {
    status: response.status,
    statusText: response.statusText,
    type: response.type,
    url: response.url,
    headers: {}
  };

  response.headers.forEach(function (v, k) {
    init.headers[k] = v;
  });

  console.log('RESPONSE', response);
  return response.clone().json().then(body => {
    //return response;
    const r = new Response(JSON.stringify(body), init);
    console.log('RESPONSE2', r);
    return r;
  });
}
