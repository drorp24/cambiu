// F L O W
//
// First entry, page reloads, direct linking
// This should be the only code doing something that's not event-driven


$(document).ready(function() {

    console.log('flow');

    start_show();
    populateParams();

    getLocation()
        .then(
            function(location) {
                return Promise.all([drawMap(location), search(location)])
            })
        .then(placeGoogleMarkers)
        .then(sortExchanges)
        .then(addCards)
//        .then(followUser)
        .then(geocode)
        .then(wait)
        .then(revealCards)
        .then(zoomIn)
        .then(stop_show)
        .catch(showError);

    setPage({url: window.location.pathname, populate: false});

});