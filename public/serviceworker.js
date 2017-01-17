// O F F L I N E    C A C H E
// Currently, the one in /public is the one being used. Gem serviceworker-rails doesnt work.
// If it ever works - copy this file *again* to its asset-pipelined folder (/assets/javascripts)
// Based on the following:
// Basic recipe: https://github.com/rossta/serviceworker-rails
// Advanced: https://jakearchibald.com/2014/offline-cookbook/#on-network-response

console.log('[Serviceworker] Hello world!');

var version = '0.7.6';

function onInstall(event) {
    console.log('[Serviceworker]', version, "Installing: populating cache with files...");
    self.skipWaiting();
    event.waitUntil(
        caches.open(version).then(function prefill(cache) {
/*
           cache.addAll([
             // load here files that should *not* fail the entire promise if any of them fails loading
             // as opposed to the next, critical list, where if *any* fails, the swerviceworker won't ever be activated, it will be abandoned
               "http://localhost:3000/assets/application.debug-d8954523fb2144e8d700b8e80c5c285b78116110bd664ba1e37f64ce862a9f19.css",
               "http://localhost:3000/assets/application.debug-3baed0d235d83efd95775720824a67ff7aab33f7a55d657d7e60a5fa72fc9174.js"
            ]);
*/
/*
            return cache.addAll([  // NOTICE: This is *counter* the async / loadCSS spirit, that strives for perceived performance and lazily loads everything else later
                "/exchanges/help",
                "/exchanges/map",
                "//fonts.googleapis.com/css?family=Roboto:400,100,300,500,700,900",
                "//fonts.googleapis.com/icon?family=Material+Icons",
                "//cdn.rawgit.com/HubSpot/tether/v1.3.4/dist/js/tether.min.js",
                "//cdn.rawgit.com/FezVrasta/bootstrap-material-design/dist/dist/bootstrap-material-design.iife.min.js",
                "offline.html"
            ]);
*/

            return Promise.resolve()
        })
            .then(function() {
                console.log('[Serviceworker]', version, '... installed!');
            })
    );
}

function onActivate(event) {
    /* Just like with the install event, event.waitUntil blocks activate on a promise.
     Activation will fail unless the promise is fulfilled.
     */
    send_message_to_all_clients({'version': version});
    console.log('[Serviceworker]', version, ' activating: replacing cache...');

    event.waitUntil(
        caches
        /* This method returns a promise which will resolve to an array of available
         cache keys.
         */
            .keys()
            .then(function (keys) {
                // We return a promise that settles when all outdated caches are deleted.
                return Promise.all(
                    keys
                        .filter(function (key) {
                            // Filter by keys that don't start with the latest version prefix.
                            return !key.startsWith(version);
                        })
                        .map(function (key) {
                            /* Return a promise that's fulfilled
                             when each outdated cache is deleted.
                             */
                            return caches.delete(key);
                        })
                );
            })
            .then(function() {
                console.log('[Serviceworker]', version, '... activated!');
            })
    );
}

// https://css-tricks.com/serviceworker-for-offline/

function onFetch(event) {
//  console.log('[Serviceworker]', "fetch", event.request.url);

    /* We should only cache GET requests, and deal with the rest of method in the
     client-side, by handling failed POST,PUT,PATCH,etc. requests.
     */
    if (event.request.method !== 'GET') {
        /* If we don't block the event as shown below, then the request will go to
         the network as usual.
         */
//        console.log('[Serviceworker]: fetch event ignored.', event.request.method, event.request.url);
        return;
    }
    /* Similar to event.waitUntil in that it blocks the fetch event on a promise.
     Fulfillment result will be used as the response, and rejection will end in a
     HTTP response indicating failure.
     */
    event.respondWith(
        caches
        /* This method returns a promise that resolves to a cache entry matching
         the request. Once the promise is settled, we can then provide a response
         to the fetch request.
         */
            .match(event.request)
            .then(function(cached) {
                /* Even if the response is in our cache, we go to the network as well.
                 This pattern is known for producing "eventually fresh" responses,
                 where we return cached responses immediately, and meanwhile pull
                 a network response and store that in the cache.
                 Read more:
                 https://ponyfoo.com/articles/progressive-networking-serviceworker
                 */
                var networked = fetch(event.request)
                // We handle the network request with success and failure scenarios.
                    .then(fetchedFromNetwork, unableToResolve)
                    // We should catch errors on the fetchedFromNetwork handler as well.
                    .catch(unableToResolve);

                /* We return the cached response immediately if there is one, and fall
                 back to waiting on the network as usual.
                 */
//                if (cached) console.log('[Serviceworker]: fetch response from cache', version, event.request.url);
                return cached || networked;

                function fetchedFromNetwork(response) {
                    /* We copy the response before replying to the network request.
                     This is the response that will be stored on the ServiceWorker cache.
                     */
                    var cacheCopy = response.clone();

//              console.log('[Serviceworker]: fetch response from network', event.request.url);

                    caches
                    // We open a cache to store the response for this request.
                        .open(version)
                        .then(function add(cache) {
                            /* We store the response for this request. It'll later become
                             available to caches.match(event.request) calls, when looking
                             for cached responses.
                             */
                            cache.put(event.request, cacheCopy);
                        })
                        .then(function() {
                            //                   console.log('[Serviceworker]: fetch response stored in cache.', event.request.url);
                        });

                    // Return the response so that the promise is settled in fulfillment.
                    return response;
                }

                /* When this method is called, it means we were unable to produce a response
                 from either the cache or the network. This is our opportunity to produce
                 a meaningful response even when all else fails. It's the last chance, so
                 you probably want to display a "Service Unavailable" view or a generic
                 error response.
                 */
                function unableToResolve () {
                    /* There's a couple of things we can do here.
                     - Test the Accept header and then return one of the `offlineFundamentals`
                     e.g: `return caches.match('/some/cached/image.png')`
                     - You should also consider the origin. It's easier to decide what
                     "unavailable" means for requests against your origins than for requests
                     against a third party, such as an ad provider
                     - Generate a Response programmaticaly, as shown below, and return that
                     */

                    console.log('[Serviceworker]: fetch request failed in both cache and network.');

                    /* Here we're creating a response programmatically. The first parameter is the
                     response body, and the second one defines the options for the response.
                     */
                    return new Response('<h1>Service Unavailable</h1>', {
                        status: 503,
                        statusText: 'Service Unavailable',
                        headers: new Headers({
                            'Content-Type': 'text/html'
                        })
                    });
                }
            })
    );
}

function onMessage(event){
    console.log("SW Received Message: ", event.data);
    version = event.data.version;
}


function send_message_to_client(client, msg){
    return new Promise(function(resolve, reject){
        var msg_chan = new MessageChannel();

        msg_chan.port1.onmessage = function(event){
            if(event.data.error){
                reject(event.data.error);
            }else{
                resolve(event.data);
            }
        };

        client.postMessage(msg, [msg_chan.port2]);
    });
}

function send_message_to_all_clients(msg){
    clients.matchAll().then(function(clients) {
        clients.forEach(function(client)  {
            send_message_to_client(client, msg).then(
                function(m)  {console.log("SW Received Message: " + m)}
            );
        })
    })
}



self.addEventListener('install', onInstall);
self.addEventListener('activate', onActivate);
self.addEventListener('fetch', onFetch);
self.addEventListener('message', onMessage);

