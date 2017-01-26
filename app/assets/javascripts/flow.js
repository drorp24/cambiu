// F L O W
//
// First entry, page reloads, direct linking
// This should be the only code doing something that's not event-driven


$(document).ready(function() {

        if (desktop) return;

    console.log('flow');

    populateParams();
    getLocation()
        .then(search_and_show)
        .catch(showError);
    setProperPage();

});

search_and_show = function(location) {
    start_show();
    return Promise.all([showMap(location), search(location)])
        .then(placeGoogleMarkers)
        .then(sortExchanges)
        .then(addCards)
        .then(followUser)
        .then(revealCards)
        .then(stop_show)
        .then(zoomIn)
        .then(show_best)
        .catch(showError);
};

function setProperPage() {
     if (mobile && window.location.pathname == '/') {
        setPage({page1: 'exchanges', pane1: 'intro', populate: false});
    } else {
        setPage({url: window.location.pathname, populate: false});
    }
}

