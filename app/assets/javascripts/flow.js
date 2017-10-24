// F L O W
//
// First entry, page reloads, direct linking
// This should be the only code doing something that's not event-driven




// Chrome manages very well with getUserLocaion() done *before* document ready. But not Safari:
// With Safari, global variables set inside document ready aren't recognized by the getUserLocation (when done before ready),
// and vice-versa: variables set in the pre-ready getUserLocation aren't recognized anywhere after document ready

$(document).ready(function() {  // TODO: only populate Params needs to wait to document. For the other (userLocation) it's just unneeded latency

    console.log('flow');

    populateParams();
    getUserLocation()
        .then(doStuffThatRequiresLocation)
        .catch(showError);
    setProperPage();

});

function doStuffThatRequiresLocation(location) {

    setLocale(location);
    populateLocalCurrency();
    populateTransaction();
    fetchAndPopulateLocaloffers();
    verifyMapIsShown = showMap(location);
    geocode(location);
//    search_and_show();
}


function setProperPage() {
        setPage({url: window.location.pathname + window.location.hash});
}

