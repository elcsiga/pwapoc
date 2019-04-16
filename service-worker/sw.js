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

self.addEventListener('fetch', event => {

  let currentResolver = null;
  resolvers.forEach(resolver => {
    if (resolver.matchUrl(event.request.url))
      currentResolver = resolver;
  });

  if (currentResolver) {
    event.respondWith(async function () {

      let body = null;
      if (event.request.method === 'PUT') {
        console.log('SW PUT:', event.request.url);
        const body = await event.request.clone().json();

        return fetch(event.request)
          .then(response => {
            console.log('SW PUT ONLNE');
            return response;
          })
          .catch( error => {
            currentResolver.handlePut(body);
            return composeResponse(body);
          });
      }

      else if (event.request.method === 'POST') {
        console.log('SW POST:', event.request.url);
        const body = await event.request.clone().json();

        return fetch(event.request)
          .then(response => console.log('SW PUT ONLNE'))
          .catch( error => {
            currentResolver.handlePut(body);
            return composeResponse(body);
          });
      }

      else if (event.request.method === 'GET') {
        console.log('SW GET:', event.request.url);

        return fetch(event.request)
          .then( response => {
            console.log('SW RESPOND ONLNE:', response);

            if (response && response.status === 200) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then(cache =>  {
                  console.log('SW RESPOND ADDED TO CACHE');
                  cache.put(event.request, responseToCache);
              });
            }
            return response;
          })
          .catch( error => {
            return caches.match(event.request)
              .then(async function(response) {

                if (response) {
                  const body = await response.clone().json();
                  currentResolver.patchGet(body);
                  const responsePatched = composeResponse(body, response);

                  console.log('SW RESPOND FROM CACHE:');
                  return responsePatched;
                } else {
                  console.log('SW RESPOND ERROR ');
                  return error;
                }
              });
          });
      }
    }());
  } else {
    //console.log('SW FETCH BYPASS', event.request.url);
  }

});

class NoteResolver {

  constructor() {
    this.changelog = [];
  }

  matchUrl(url) {
    return url.startsWith('http://localhost:3000/api/notes');
  }

  patchGet(notes) {
    this.changelog.forEach( c => {
      const index = notes.findIndex(n => c.id === n.id);
      if (index) {
        notes[index] = c;
      } else {
        notes.puh(c);
      }
    });
  }

  handlePut(note) {
    const index = this.changelog.findIndex( n => n.id === note.id);
    if (index) {
      this.changelog.splice(index, 1);
    }
    this.changelog.push( {...note, status: 'cached'});
  }
}

const resolvers = [new NoteResolver()];

let responseTemplate;
function composeResponse(body, response) {

  const r = response || responseTemplate;
  if (!responseTemplate) {
    responseTemplate = response.clone();
  }

  const init = {
    status: r.status,
    statusText: r.statusText,
    type: r.type,
    url: r.url,
    headers: {}
  };

  r.headers.forEach(function (v, k) {
    init.headers[k] = v;
  });

  return new Response(JSON.stringify(body), init);
}

