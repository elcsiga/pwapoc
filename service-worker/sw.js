const CACHE_NAME = 'my-site-cache-v1';
const urlsToCache = [];

self.addEventListener('install', event => {

  console.log('[SW] INSTALLED');

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
  console.log('[SW] ACTIVATE');
});

self.addEventListener('fetch', event => {

  let currentResolver = null;
  resolvers.forEach(resolver => {
    if (resolver.matchUrl(event.request.url))
      currentResolver = resolver;
  });

  if (currentResolver) {
    event.respondWith((async () => {

      if (event.request.url.endsWith('sync')) {
        console.log('[SW] SYNC:', event.request.url);
        return fetch(event.request)
      }
      else if (event.request.method === 'POST') {
        console.log('[SW] POST:', event.request.url);

        const requestBody = await event.request.clone().json();
        const text = requestBody.text;

        const modifyCache = async status => {
          const addedNote = { id: -1, text, status };
          await patchCache(currentResolver.url, async body => {
            addedNote.id = body.reduce((a,n) => a > n.id+1 ? a : n.id+1, 1000);
            body.push(addedNote);
            return body;
          });
          return addedNote;
        };

        return fetch(event.request)
          .then(async response => {
            console.log('[SW] SERVING FROM BACKEND:', response.url);
            await modifyCache('saved');
            return response;
          })
          .catch(async error => {
            console.log('[SW] RETURNING AN OK RESPONSE FROM SW');
            const modifiedNote = await modifyCache('cached');
            return composeOkResponse(modifiedNote);
          });

      }
      else if (event.request.method === 'PUT') {
        console.log('[SW] PUT:', event.request.url);

        const requestBody = await event.request.clone().json();
        const id = +event.request.url.replace(currentResolver.url+'/', '');
        const text = requestBody.text;

        const modifyCache = async status => {
          const modifiedNote = { id, text, status };
          await patchCache(currentResolver.url, async body => {
            const index = body.findIndex(n => n.id === id);
            body[index] = modifiedNote;
            return body;
          });
          return modifiedNote;
        };

        return fetch(event.request)
          .then(async response => {
            console.log('[SW] SERVING FROM BACKEND:', response.url);
            await modifyCache('saved');
            return response;
          })
          .catch(async error => {
            console.log('[SW] RETURNING AN OK RESPONSE FROM SW');
            const modifiedNote = await modifyCache('cached');
            return composeOkResponse(modifiedNote);
          });

      } else if (event.request.method === 'DELETE') {
        console.log('[SW] DELETE:', event.request.url);

        const id = +event.request.url.replace(currentResolver.url+'/', '');

        return fetch(event.request)
          .then(async response => {
            console.log('[SW] SERVING FROM BACKEND:', response.url);
            await patchCache(currentResolver.url, async body => {
              const index = body.findIndex(n => n.id === id);
              body.splice(index,1);
              return body;
            });
            return response;
          })
          .catch(async error => {
            console.log('[SW] RETURNING AN OK RESPONSE FROM SW');
            let noteDeleted;
            await patchCache(currentResolver.url, async body => {
              noteDeleted = body.find(n => n.id === id);
              noteDeleted.status = 'deleted';
              return body;
            });
            return composeOkResponse(noteDeleted);
          });

      } else if (event.request.method === 'GET') {
        console.log('[SW] GET:', event.request.url);

        return fetch(event.request)
          .then(response => {
            console.log('[SW] SERVING FROM BACKEND:', response.url);

            if (response && response.status === 200) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  console.log('[SW] RESPONSE ADDED TO CACHE:', currentResolver.url);
                  cache.put(currentResolver.url, responseToCache);
                });
            }
            return response;
          })
          .catch(error => {
            return caches.open(CACHE_NAME)
              .then(cache => {
                return cache.match(currentResolver.url)
                  .then(async response => {
                    if (response) {
                      console.log('[SW] SERVING FROM CACHE:', response.url);
                      return response;
                    } else {
                      console.log('SW RESPOND ERROR ');
                      return error;
                    }
                  });
              });
          });
      }
      else {
        console.log('[SW] UNHANDLED REQUEST:', event.request.url);
        return fetch(event.request)
      }

    })());
  } else {
    //console.log('SW FETCH BYPASS', event.request.url);
  }

});

class NoteResolver {

  constructor() {
    this.changelog = [];
    this.url = 'http://localhost:3000/api/notes';
  }

  matchUrl(url) {
    return url.startsWith('http://localhost:3000/api/notes');
  }

  patchGet(notes) {
    this.changelog.forEach(c => {
      const index = notes.findIndex(n => c.id === n.id);
      if (index) {
        notes[index] = c;
      } else {
        notes.puh(c);
      }
    });
  }

  handlePut(note) {
    const index = this.changelog.findIndex(n => n.id === note.id);
    if (index) {
      this.changelog.splice(index, 1);
    }
    this.changelog.push({...note, status: 'cached'});
  }
}

const resolvers = [new NoteResolver()];

function composeResponse(body, response) {

  const init = {
    status: response.status,
    statusText: response.statusText,
    type: response.type,
    url: response.url,
    headers: {}
  };

  response.headers.forEach(function (v, k) {
    init.headers[k] = v;
  });

  return new Response(JSON.stringify(body), init);
}

function composeOkResponse(body) {
  const init = {
    status: 200,
    statusText: 'OK',
    headers: {'Content-Type': 'application/json'}
  };
  return new Response(JSON.stringify(body), init);
}



function patchCache(matcher, fn) {
  return caches.open(CACHE_NAME)
    .then(cache => {
      return cache.match(matcher)
        .then(async responseInCache => {
          if (responseInCache) {
            const body = await responseInCache.clone().json();

            fn(body)
              .then( patchedBody => {
                const patchedResponse = composeResponse(patchedBody, responseInCache);
                cache.put(matcher, patchedResponse);
                console.log('[SW] CACHE PATCHED WITH:', patchedBody);
              })
              .catch( e => {
                console.log('[SW] Unavle to patch cache!')
              });
          } else {
            console.log('[SW] Cannot find cache!');
          }
        });
    });


}
