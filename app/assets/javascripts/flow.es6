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

    if (value_of('bias') == 'default') {
        fetchOffer('default');
        getUserLocation()
            .then((location) => {
                doStuffThatRequiresLocation(location)
            })
    } else {
        getUserLocation()
            .then((location) => {
                fetchOffer(location);
                doStuffThatRequiresLocation(location)
            })
    }

    setProperPage();

});

function fetchOffer(location) {
    setLocale(location);
    populateLocalCurrency();
    populateTransaction();
    fetchAndPopulateLocaloffers();
}

function doStuffThatRequiresLocation(location) {
    verifyMapIsShown = showMap(location);
    geocode(location)
        .catch(showError);
}


function setProperPage() {
        setPage({url: window.location.pathname + window.location.hash});
}

