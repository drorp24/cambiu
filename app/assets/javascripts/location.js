// L O C A T I O N
// service

getLocation = function() {

    if (navigator.geolocation) {
        console.log('calling navigator.geolocation....');
        navigator.geolocation.getCurrentPosition(
            positionFound,
            positionError,
            {
                enableHighAccuracy: true,
                timeout: 30000,
                maximumAge: 30000
            }
        );
    }
    else {
        positionError('unsupported');
    }
};


positionFound = function(position) {

    // user_lat & user_lng are global variables (non persisted)
    user_lat = position.coords.latitude;
    user_lng = position.coords.longitude;

    positionDetermined(user_lat, user_lng, 'user', 'found');
};

positionError = function(error) {
    positionDetermined(def_lat, def_lng, 'default', 'Position error: ' + error);
};


// Invoke search, draw map and geocode as soon as position is determined
positionDetermined = function(lat, lng, type, reason) {

    console.log('positionDetermined: Type: ' + type + '. Reason: ' + reason);

    // populate search params
    set('location_lat',     lat);
    set('location_lng',     lng);
    set('location_type',    type);
    set('location_reason',  reason);

    map_p = drawMap(lat, lng);

    map_p
        .then(followUser)
        .catch(showError);


    search_p = search('positionDetermined');

    search_p
        .then(updateCards)
        .catch(showError);


    Promise.all([map_p, search_p])
        .then(updateMap);

    var location_latlng =   new google.maps.LatLng(user_lat, user_lng);
    var geocoder =      new google.maps.Geocoder();

    geocoder.geocode({'latLng': location_latlng}, function(results, status) {

        if (status == google.maps.GeocoderStatus.OK) {
            if (results[1]) {
                geocodeFound(results[1]);
            } else {
                geocodeError('no results');
            }
        } else {
            geocodeError('failed');
        }

    });

};


// Update formatted address fields
geocodeFound = function(result) {

    console.log('geocode found');

    set('user_location',    result.formatted_address);
    set('location',         result.formatted_address);
    set('location_short',   result.address_components[1].short_name);

};

geocodeError = function(error) {

    console.log('geocode failed: ' + error);

    set('user_location',    'geocode failed');
    set('location',         'geocode failed');
    set('location_short',   'geocode failed');

};



followUser = function() {
    console.log('followUser')
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
            currPositionFound,
            currPositionError,
            {
                enableHighAccuracy: true,
                timeout: 30000,
                maximumAge: 30000
            }
        )
    } else {
        currPositionError('unsupported')
    }
};

currPositionFound = function(position) {

    // user_lat & user_lng are global variables (non persisted)
    user_lat = position.coords.latitude;
    user_lng = position.coords.longitude;

    showUserPosition(user_lat, user_lng);
//      reportUserPosition(position);

};

currPositionError = function(error) {
    console.warn('currPositionError: ' + error);
};

showUserPosition = function(user_lat, user_lng) {

    if (!map || !map.getProjection()) {
        console.warn('showUserPosition: map isnt ready yet');
        return
    }

    var user_latlng = new google.maps.LatLng(user_lat, user_lng);
//    var point = fromLatLngToPoint(user_latlng, map);
    var x = String(centerX - 30) + 'px';
    var y = String(centerY - 30) + 'px';

    // TODO: check panTo (or setCenter) doesnt remove the directions
    map.panTo(user_latlng);
    $('#userLoc').css('top', y).css('left', x);

};

reportUserPosition = function(position) {

    var user_lat =  position.coords.latitude;
    var user_lng =  position.coords.longitude;
    var accuracy =  position.coords.accuracy;
    var heading =   position.coords.heading;
    var speed =     position.coords.speed;
    var d = new Date(position.timestamp);
    var timestamp = d.toLocaleTimeString();

    var user_latlng = new google.maps.LatLng(user_lat, user_lng);
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({'latLng': user_latlng}, function(results, status) {

        if (status == google.maps.GeocoderStatus.OK) {
            if (results[1]) {

                var address = results[1].formatted_address;
                console.log('Timestamp: ' + timestamp + '\nAddress: ' + address + '\nAccuracy: ' + accuracy + '\nHeading: ' + heading + '\nSpeed: ' + speed)

            }
        }
    })
};

// Handle user location changes

function searchbox_addListener(searchBox) {
    google.maps.event.addListener(searchBox, 'places_changed', function () {
        console.log('Location changed by user');
        var places = searchBox.getPlaces();
        if (places.length == 0) {
            set_default_location('Location changed by user, but getPlaces found no place');
            return
        }
        place = places[0];
        set('location', place.formatted_address);
        set('location_short', place.name);
        set('location_lat', place.geometry.location.lat());
        set('location_lng', place.geometry.location.lng());
        set('location_type', 'selected');
        set('location_reason', null);

        search('search location changed by user')
            .then(updateCards)
            .catch(showError);
    });
}


/*
 stopFollowingUser = function() {
 navigator.geolocation.clearWatch(watchId);
 };
 */



