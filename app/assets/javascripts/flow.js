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
        .then(followUser)
        .then(geocode)
        .then(wait)
        .then(revealCards)
        .then(stop_show)
        .then(zoomIn)
        .then(show_best)
        .catch(showError);

    setProperPage();

});

function setProperPage() {
     if (mobile && window.location.pathname == '/') {
        setPage({page1: 'exchanges', pane1: 'help', populate: false});
    } else {
        setPage({url: window.location.pathname, populate: false});
    }
}

