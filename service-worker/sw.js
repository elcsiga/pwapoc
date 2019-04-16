const CACHE_NAME = 'my-site-cache-v1';
const urlsToCache = [];

self.addEventListener('install', event => {

  console.log('SW INSTALLED');

  /*
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('SW CACHE OPENED');
        return cache.addAll(urlsToCache);
      })
  );
  */
});

self.addEventListener('activate', event => {
  console.log('SW ACTIVATE');
});

/*
self.addEventListener('fetch', event => {

  console.log('SW FETCH');

  let currentResolver = null;
  resolvers.forEach(resolver => {
    if (resolver.matchUrl(event.request.url))
      currentResolver = resolver;
  });

  if (currentResolver) {
    event.respondWith(async function () {

      let body = null;
      if (event.request.method === 'POST' || event.request.method === 'PUT') {
        body = await event.request.clone().json();
      }

      if (event.request.method === 'GET') {
        console.log('SW GET:', event.request.url);

        return fetch(event.request)
          .then( response => {
            console.log('SW RESPOND ONLNE:');

            if (response && response.status === 200 && response.type === 'basic') {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then(cache =>  {
                  console.log('SW RESPOND ADDED TI CACHE');
                  cache.put(event.request, responseToCache);
              });
            }
            return response;
          })
          .catch( error => {
            return caches.match(event.request)
              .then(response => {

                if (response) {
                  console.log('SW RESPOND FROM CACHE:');
                  return response;
                } else {
                  console.log('SW RESPOND ERROR ');
                  return error;
                }
              });
          });
      } else {
        console.log('SW POST RESOLVED', event.request.url, body);
        return fetch(event.request);
      }
    }());
  } else {
    console.log('SW FETCH BYPASS', event.request.url);
  }

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

  return response.clone().json().then(body => {
    //return response;
    const r = new Response(JSON.stringify(body), init);
    return r;
  });
}
*/
