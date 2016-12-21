if (navigator.serviceWorker) {
    navigator.serviceWorker.register('/sw.js', { scope: './' })
        .then(function(reg) {
            console.log('[Page] Service worker registered!');
        });
}