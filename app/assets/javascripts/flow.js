// F L O W
//
// First entry, page reloads, direct linking
// This should be the only code doing something that's not event-driven


$(document).ready(function() {

    console.log('flow');

    start_show();
    populateParams();

    getLocation()
        .then(function(location) {
        return Promise.all([
            drawMap(location)
                .then(followUser),
            search(location)
                .then(sortExchanges)
                .then(addCards),
            geocode(location)
        ])
        .then(stop_show)
        .then(addGoogleMarkers)
        .then(zoomIn)
        .then(revealCards)
    })
    .catch(showError);

    setPage({url: window.location.pathname, populate: false});

});