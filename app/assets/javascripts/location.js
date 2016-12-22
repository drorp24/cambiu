// L O C A T I O N
// service

getLocation = function() {

    return new Promise(function(resolve, reject) {

        console.log('getLocation');

        if (!navigator.geolocation) {
            positionError('unsupported');
            return
        }

        var options = {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 15000
        };

        navigator.geolocation.getCurrentPosition(
            positionFound,
            positionError,
            options
        );

        function positionFound(position) {

            user.lat = position.coords.latitude;
            user.lng = position.coords.longitude;
            setLocation(user.lat, user.lng, 'user', 'found');
        }

        function positionError(error) {

            var message = error.message ? error.message : error;
            setLocation(dfault.lat, dfault.lng, 'default', 'Position error: ' + message);
            snack('We couldn\'t locate you. Have you given us permission to?', null, null, $('.swiper-container'), 'oops')

        }

        function setLocation(lat, lng, type, reason) {

            search.location     = {};

            set('location_lat',     search.location.lat = lat);
            set('location_lng',     search.location.lng = lng);
            set('location_type',    search.location.type = type);
            set('location_reason',  search.location.reason = reason);

            console.log('location set!');
            resolve(search.location);

        }
    })
};



followUser = function() {


    console.log('followUser');

    if (!navigator.geolocation) {
        currPositionError('unsupported');
        return
    }

    var options = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 15000
    };

    navigator.geolocation.watchPosition(
        currPositionFound,
        currPositionError,
        options
    );

    function currPositionFound(position) {

        user.lat = position.coords.latitude;
        user.lng = position.coords.longitude;
        showUserPosition(user.lat, user.lng);
    }

    function currPositionError(error) {

        var message = error.message ? error.message : error;
        console.warn('currPosition error: ' + message);

    }

};


geocode = function(locationArg) {


    // though it looks like a classic case for a promise., i don't want any other function to await on it
    // returning a promise would mean the next in line would have to wait for geocode to return
    // but it's not critical. It's anyway called many times

    console.log('geocode');

    var location = (typeof locationArg === 'undefined') ? search.location : locationArg;

    var location_latlng = new google.maps.LatLng(location.lat, location.lng);
    var geocoder = new google.maps.Geocoder();

    geocoder.geocode({'latLng': location_latlng}, function (results, status) {

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

    function geocodeFound(result) {

        console.log('geocode found');

        var location_name = result.formatted_address,
            location_short = result.address_components[1].short_name;

        set('location',         location_name);
        set('location_short',   location_short);

        search.location.name = location_name;

    }

    function geocodeError(error) {

        console.log('geocode failed: ' + error);

        set('location',         'geocode failed');
        set('location_short',   'geocode failed');

    }
};


showUserPosition = function(lat, lng) {

    if (!map || !map.getProjection()) {
        console.warn('showUserPosition: map isnt ready yet');
        return
    }

    if (typeof lat === 'undefined' && typeof lng === 'undefined') var lat = user.lat, lng = user.lng;
    var user_latlng = new google.maps.LatLng(lat, lng);
    map.panTo(user_latlng);
    $('#userLoc').css('visibility', 'visible');
    $('#userLoc').css('top', centerYpx).css('left', centerXpx);

};

hideUserPosition = function() {
    $('#userLoc').css('visibility', 'hidden');
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
        set('location',             search.location.name = place.formatted_address);
        set('location_short',       search.location.short = place.name);
        set('location_lat',         search.location.lat = place.geometry.location.lat());
        set('location_lng',         search.location.lng = place.geometry.location.lng());
        set('location_type',        search.location.type = 'selected');
        set('location_reason',      search.location.reason = 'changed by user');

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


distance = function(location1, location2) {
    return String(Math.round(google.maps.geometry.spherical.computeDistanceBetween(location1, location2)));
};