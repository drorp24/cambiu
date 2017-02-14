(function() {

    var version = '0.8.3';
    window.version = version;
//post_to_sw({version: version});

    if (location.pathname.indexOf('admin') > -1) {
        console.log('admin - not registering any serivceworker');
        return;
    }

    if (navigator.serviceWorker) {
        navigator.serviceWorker.register('/serviceworker.js', { scope: './' })
            .then(function(reg) {
                console.log('[Page] Service worker registered!');
            })
            .catch(function(err){
                snack("SW registration failed with error " + err , {$upEl: $('.swiper-container'), klass: 'oops'});
            });
    }


    window.addEventListener('beforeinstallprompt', function(e) {
        // beforeinstallprompt Event fired

        // e.userChoice will return a Promise.
        // For more details read: https://developers.google.com/web/fundamentals/getting-started/primers/promises
        e.userChoice.then(function(choiceResult) {

            console.log(choiceResult.outcome);

            if(choiceResult.outcome == 'dismissed') {
                console.log('User cancelled home screen install');
            }
            else {
                console.log('User added to home screen');
            }
        });
    });



// To post a message TO the sw
    function post_to_sw(msg){
        if (navigator.serviceWorker) {
            navigator.serviceWorker.controller.postMessage(msg)
        }
    }

// To receive a message coming FROM the service worker
    if (navigator.serviceWorker) {

        navigator.serviceWorker.addEventListener('message', function (event) {

            console.log("Client 1 Received Message: ", event.data);
//      set('version', version = event.data.version);
//      $('.version').html(version);

//    Uncomment the following line to respond back to the calling sw
//    event.ports[0].postMessage("Client 1 Says 'Hello back!'");

        });
    }

})();
