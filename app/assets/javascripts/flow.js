// F L O W
//
// First entry, page reloads, direct linking
// This should be the only code doing something that's not event-driven




// Chrome manages very well with getUserLocaion() done *before* document ready. But not Safari:
// With Safari, global variables set inside document ready aren't recognized by the getUserLocation (when done before ready),
// and vice-versa: variables set in the pre-ready getUserLocation aren't recognized anywhere after document ready

$(document).ready(function() {  // TODO: only populate Params needs to wait to document. For the other (userLocation) it's just unneeded latency

    console.log('flow');

    verifyUserLocation = getUserLocation();
    populateParams();
    verifyUserLocation.then(doStuffThatRequiresLocation);
    setProperPage();

    //    if (value_of('search_id')) verifyUserLocation.then(search_and_show);

});

function doStuffThatRequiresLocation(location) {

    geocode(location);
    setLocale(location);
    populateLocalCurrency();
    populateTransaction();
    fetchAndPopulateLocaloffers();
}


search_and_show = function(location) {
    return Promise.all([showMap(location), search()])
        .then(selectOffers)
        .then(populateOffers)
        .then(showBestOffer)
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

