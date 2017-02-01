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
            setLocation(user.lat, user.lng, 'user', 'positionFound');
        }

        function positionError(error) {

            var message = error.message ? error.message : error;
            setLocation(Number(dfault.lat), Number(dfault.lng), 'default', 'PositionError: ' + message);
            snack('We couldn\'t locate you. Have you given us the permission to?', {upEl: $('.swiper-container'), klass: 'oops', timeout: 3000});
            persistError('positionError', message);

        }

        function setLocation(lat, lng, type, reason) {

            search.location     = {};
            search.user = {};

            set('location_lat',     search.location.lat = lat);
            set('location_lng',     search.location.lng = lng);
            set('location_type',    search.location.type = type);
            set('location_reason',  search.location.reason = reason);
            if (type == 'user') {
                set('user_lat',         search.user.lat = lat);  // search.user.lat is the *initial* user position, as opposed to user.lat/lng which changes as the user walks
                set('user_lng',         search.user.lng = lng);  // it is passed to 'search' entity where it is persisted
                set('user_location',    search.user.location = null);
            } else {
                set('user_lat',         search.user.lat = null);  // search.user.lat is the *initial* user position, as opposed to user.lat/lng which changes as the user walks
                set('user_lng',         search.user.lng = null);  // it is passed to 'search' entity where it is persisted
                set('user_location',    search.user.location = 'Unknown');
            }

            console.log('location set!', search.location);
            resolve(search.location);

        }
    })
};



followUser = function() {

    return new Promise(function(resolve, reject) {

        console.log('followUser');

        if (!navigator.geolocation) {
            currPositionError('unsupported');
            return
        }

        if (search.location.type != 'user') {
            console.log('search location is not the user\'s location: not following user');
            return
        }

        var options = {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 15000
        };

        userWatch = navigator.geolocation.watchPosition(
            currPositionFound,
            currPositionError,
            options
        );

        function currPositionFound(position) {

            user.lat = position.coords.latitude;
            user.lng = position.coords.longitude;
            showUserPosition(user.lat, user.lng);
            resolve(user);
        }

        function currPositionError(error) {

            hideUserPosition();
            var message = error.message ? error.message : error;
            console.warn('currPosition error: ' + message);
            reject('currPositionError: ' + message);

        }

    })

};


geocode = function(locationArg) {


    return new Promise(function(resolve, reject) {

        console.log('geocode', locationArg);

        var location = (typeof locationArg === 'undefined') ? search.location : locationArg;
        if (location.name) {
            console.log('location.name exists: ' + location.name + ' - not geocoding');
            resolve(location.name);
            return;
        }

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
                geocodeError(status);
            }

        });

        function geocodeFound(result) {

            console.log('geocode found');

            var location_name = result.formatted_address,
                location_short = result.address_components[1].short_name;

            set('location',         search.location.name = location_name);
            set('location_short',   search.location.short = location_short);

            if (sessionStorage.location_type == 'user') {
                set('user_location', search.user.location = location_name);
            }

            resolve(location_name);

        }

        function geocodeError(status) {

            var message = 'geocode error: ' + status;

            console.log('message');

            set('location',         search.location.name = message);
            set('location_short',   search.location.short = message);

            if (sessionStorage.location.type == 'user') {
                set('user_location', search.user.location = message);
            }

            // reject would halt the execution flow!
            resolve(message);
        }
    })
};


showUserPosition = function(lat, lng) {

    if (search.location.type != 'user') {
        console.log('search location is not the user\'s location: not showing user position');
        return;
    } else {
        console.log('show user position');
    }

    if (!map || !map.getProjection()) {
        console.warn('showUserPosition: map isnt ready yet');
        return
    }

    if (typeof lat === 'undefined' && typeof lng === 'undefined') var lat = user.lat, lng = user.lng;
    var user_latlng = new google.maps.LatLng(lat, lng);
    map.panTo(user_latlng);

/*  ??
    $('#userLoc').css('visibility', 'visible');
    $('#userLoc').css('top', centerYpx).css('left', centerXpx);
*/

};

hideUserPosition = function() {
    $('#userLoc').css('visibility', 'hidden');
};


// Handle user location changes
// Changing back to 'where i'm at' is in search.js

function searchbox_addListener(searchBox) {
    google.maps.event.addListener(searchBox, 'places_changed', function () {
        var places = searchBox.getPlaces();
        if (places.length == 0) {
            set_default_location('Location changed by user, but getPlaces found no place');
            return
        }
        locationDirty = false;
        place = places[0];
        set('location',             search.location.name = place.formatted_address);
        set('location_short',       search.location.short = place.name);
        set('location_lat',         search.location.lat = place.geometry.location.lat());
        set('location_lng',         search.location.lng = place.geometry.location.lng());
        set('location_type',        search.location.type = 'selected');
        set('location_reason',      search.location.reason = 'changed by user');
        console.log('Location changed by user to: ', search.location);
//        console.log('Stopping userWatch');
//        if (typeof userWatch !== 'undefined' && userWatch) navigator.geolocation.clearWatch(userWatch);
        $('#userLoc').hide();
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

$('.location').keyup(function() {
    locationDirty = true;
});

function checkUserDistances() {

    if (!(user && user.lat && user.lng)) return;

    var user_initial_location = search.user;
    var user_current_location = user;
    var distance_from_initial_location, distance_from_initial_location_delta;
    var distance_from_exchange, distance_from_exchange_delta;
    var currExchange = currentExchange();

    if (user_initial_location && user_current_location) {
        distance_from_initial_location =
            distance(
                new google.maps.LatLng(user_initial_location.lat, user_initial_location.lng),
                new google.maps.LatLng(user_current_location.lat, user_current_location.lng)
            );
    }
    if (currExchange && user_current_location) {
        distance_from_exchange =
            distance(
                new google.maps.LatLng(currExchange.latitude, currExchange.longitude),
                new google.maps.LatLng(user_current_location.lat, user_current_location.lng)
        );
    }

    if (distance_from_initial_location) {
//        console.log('User distance from initial location: ' + distance_from_initial_location + 'm');
        if (prev_distance_from_initial_location) {
            distance_from_initial_location_delta = distance_from_initial_location - prev_distance_from_initial_location;
        }
        prev_distance_from_initial_location = distance_from_initial_location;
    }

    if (distance_from_exchange) {
//        console.log('User distance from exchange: ' + distance_from_exchange + 'm');
        if (prev_distance_from_exchange) {
            distance_from_exchange_delta = distance_from_exchange - prev_distance_from_exchange;
        }
        prev_distance_from_exchange = distance_from_exchange;
    }

    if (distance_from_exchange_delta < 0) {
        console.log('Walk towards exchange');
        gaEvent('Walk', 'Towards exchange');
        map.setZoom(map_final_zoom);
    } else
    if (distance_from_exchange_delta > 0) {
        console.log('Walk away from exchange');
        gaEvent('Walk', 'Away from exchange');
        map.setZoom(map_final_zoom);
    }
}

checkUserLocation = function() {
    userLocationCheck = window.setInterval(function(){
        checkUserDistances();
    }, 30000);
};
