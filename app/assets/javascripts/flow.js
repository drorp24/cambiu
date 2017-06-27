// F L O W
//
// First entry, page reloads, direct linking
// This should be the only code doing something that's not event-driven


$(document).ready(function() {

    console.log('flow');

    populateParams();
    findUserLocation = getUserLocation().then(geocode);
    setProperPage();

});



search_and_show = function(location) {
    return Promise.all([showMap(location), search()])
        .then(selectOffers)
        .then(populateOffers)
        .then(placeGoogleMarkers)
        .then(showSearchLocation)
        .then(revealCards)
        .then(zoomIn2)
        .then(postAnimations)
        .then(followUser)
        .then(checkUserPosition)
        .catch(showError);
};

function setProperPage() {
     if (mobile && window.location.pathname == '/') {
        setPage({page1: 'exchanges', pane1: 'intro', search: location.search});
    } else {
        setPage({url: window.location.pathname});
    }
}

