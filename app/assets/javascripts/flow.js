// F L O W
//
// First entry, page reloads, direct linking
// This should be the only code doing something that's not event-driven



    console.log('flow');

    verifyUserLocation = getUserLocation();                // in case I need to verify location was found before doing something that requires it (e.g., search, particularly here below)
    //    if (value_of('search_id')) verifyUserLocation.then(search_and_show);

function doStuffThatRequiresLocation(location) {

    geocode(location);
    local = nearest_locale(location.lat, location.lng);
    populateLocalCurrency(local);
    populateLocalBestRate(local);
}


$(document).ready(function() {  // TODO: only populate Params needs to wait to document. For the other (userLocation) it's just unneeded latency

    populateParams();
    verifyUserLocation.then(doStuffThatRequiresLocation);  // that's the way to run multiple then's in parallel, and to separate one promise from a chain of promises
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

