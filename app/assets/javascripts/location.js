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

    map_p = drawMap(lat, lng)
        .catch(showError);

    map_p
        .then(followUser)
        .catch(showError);


    search_p =
        search('positionDetermined')
        .catch(showError);


    search_p
        .then(addCards)
        .catch(showError);


  // Use for testing - to check all my exchange markers are in place with Google's
    Promise.all([map_p, search_p])
        .then(placeGoogleMarkers);

    Promise.all([map_p, search_p])
        .then(function() {
            placeSoftMarkers();
            radarScan()
        });

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
    map.panTo(user_latlng);
    $('#userLoc').css('top', centerYpx).css('left', centerXpx);

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
            .then(addCards)
            .catch(showError);
    });
}
function radians(n) {
    return n * (Math.PI / 180);
}
function degrees(n) {
    return n * (180 / Math.PI);
}


function getBearing(startLat,startLong,endLat,endLong){
    startLat = radians(startLat);
    startLong = radians(startLong);
    endLat = radians(endLat);
    endLong = radians(endLong);

    var dLong = endLong - startLong;

    var dPhi = Math.log(Math.tan(endLat/2.0+Math.PI/4.0)/Math.tan(startLat/2.0+Math.PI/4.0));
    if (Math.abs(dLong) > Math.PI){
        if (dLong > 0.0)
            dLong = -(2.0 * Math.PI - dLong);
        else
            dLong = (2.0 * Math.PI + dLong);
    }

    return (degrees(Math.atan2(dLong, dPhi)) + 360.0) % 360.0;
}



// Get degree between 2 latlan points
// source: http://www.igismap.com/formula-to-find-bearing-or-heading-angle-between-two-points-latitude-longitude/
/*
 getDeg = function(latA, lngA, latB, lngB) {

 var toDeg = 180 / Math.PI;
 var latA = latA / toDeg;
 var lngA = lngA / toDeg;
 var latB = latB / toDeg;
 var lngB = lngB / toDeg;
 var dLng = Math.abs(lngA - lngB);
 var x = Math.cos(latB) * Math.sin(dLng);
 var y = Math.cos(latA) * Math.sin(latB) - Math.sin(latA) * Math.cos(latB) * Math.cos(dLng);

 return Math.atan2(x, y) * toDeg;
 };

 */
/*
 stopFollowingUser = function() {
 navigator.geolocation.clearWatch(watchId);
 };
 */




