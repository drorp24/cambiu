window.onload = function() {

  if('PushManager' in window) {
    console.log('push is supported');
    //Push supported!
  } else {
    console.log('push is not supported')
  }

/* SW registration is done in serviceworker-companion.js
  if ('serviceWorker' in navigator) {
    console.log('service worker is supported');
    navigator.serviceWorker.register('/sw.js').then(function() {
        return navigator.serviceWorker.ready;
    }).then(function(reg) {
        console.log('Service Worker is ready :^)', reg);
        reg.pushManager.subscribe({
            userVisibleOnly: true
        }).then(function(sub) {
            console.log('endpoint:', sub.endpoint);
            // TODO
        });
    }).catch(function(error) {
        console.log('Service Worker error :^(', error);
    });
  } else {
    console.log('service worker is not supported')
  }
*/

};

push = function(pushid) {
    $.ajax({
        type: 'GET',
        url: 'https://android.googleapis.com/gcm/send',
        headers: {
            'Authorization': 'key=' + gcm_apikey,
            'Content-Type': 'application/json'
        },
        data: JSON.stringify({
            "registration_ids": [
                pushid
            ]
        })
    })
    .done(function() {
        console.log('push was successful');
    })
    .fail(function() {
        console.log('push failed');
    });

};
