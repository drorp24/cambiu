// F L O W
//
// First entry, page reloads, direct linking
// This should be the only code doing something that's not event-driven


$(document).ready(function() {

    console.log('flow');


    openning_scene('start');
    populateParams();

    getLocation()
        .then(function(location) {
        return Promise.all([
            drawMap(location)
                .then(followUser),
            search(location)
                .then(addCards),
            geocode(location)
        ])
        .then(idMarkerLayer)
        .then(addGoogleMarkers)
        .then(function()  {smoothZoom(map, 16, map.getZoom())}    )
        .then(function() {openning_scene('stop')})
    })
    .catch(alertError);

    setPage({url: window.location.pathname, populate: false});


});