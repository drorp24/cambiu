// L O C A T I O N
// service

getUserLocation = function() {

    return new Promise(function(resolve, reject) {

        console.log('getUserLocation');

        recordTime('location', 'get');

        if (!navigator.geolocation) {
            positionError('unsupported');
            return
        }

        var options = {
            enableHighAccuracy: true,
            timeout: 60000,
            maximumAge: 60000
        };

        navigator.geolocation.getCurrentPosition(
            positionFound,
            positionError,
            options
        );

        function positionFound(position) {

            recordTime('location', 'found', 'get');

            user.lat = position.coords.latitude;
            user.lng = position.coords.longitude;

            console.log('user initial location:', user);

            setSearchLocation(user.lat, user.lng, 'user', 'positionFound');
            setUserLocation(user);
        }

        function positionError(error) {

            recordTime('location', 'error', 'get');

            $('.bestOffer').css('visibility', 'hidden');

            var message = error.message ? error.message : error;
            console.log('user position error:', message);

            setSearchLocation(Number(dfault.lat), Number(dfault.lng), 'default', 'PositionError: ' + message);
            snack('We couldn\'t locate you. Have you given us the permission to?', {upEl: $('.swiper-container'), klass: 'oops', timeout: 3000});

        }

        function setSearchLocation(location_lat, location_lng, type, reason) {

            search.location = {};

            set('location_lat',     search.location.lat         = location_lat);
            set('location_lng',     search.location.lng         = location_lng);
            set('location_type',    search.location.type        = type);
            set('location_reason',  search.location.reason      = reason);
            
            console.log('search location:', search.location);
            resolve(search.location);

        }

        function setUserLocation(user) {  //to include user's initial position in the persisted search
            set('user_lat', user.lat);
            set('user_lng', user.lng);
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
            resolve(user);
        }

        function currPositionError(error) {

//            hideSearchLocation();  // In desktop a timeout error always occurs after 30 seconds, making the blue dot disappear
            var message = error.message ? error.message : error;
            console.warn('currPosition error: ' + message);
//            reject('currPositionError: ' + message);
            resolve(user);

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
//                console.log('GeocodeStatus.OK. results: (going to use results[0])', results);
                if (results[0]) {
                    geocodeFound(results[0]);
                } else {
                    geocodeError('no results');
                }
            } else {
                geocodeError(status);
            }

        });

        function geocodeFound(result) {

//            console.log('geocodeFound. result: (going to use formatted_address)', result);

            var location_name = result.formatted_address;

            set('location',         search.location.name = location_name);

            if (sessionStorage.location_type == 'user') {
                set('user_location', location_name);
            }

            unlock($('[data-hash=delivery_location], [data-hash=pickup_location]'));
            $('[data-model=user][data-field=location]').val(location_name).addClass('active');

            recordTime('location', 'geocoded', 'found');
            resolve(search.location);

        }

        function geocodeError(status) {

            var message = 'geocode error: ' + status;

            console.log('message');

            set('location',         search.location.name = message);

            if (sessionStorage.location.type == 'user') {
                set('user_location', search.user.location = message);
            }

            // reject would halt the execution flow!
            recordTime('location', 'not_geocoded');
            resolve(message);
        }
    })
};


function geocodeExchange(exchange) {

    var geocoder = new google.maps.Geocoder();
    var address = exchange.address;

    geocoder.geocode({'address': address}, function(results, status) {

        if (status === 'OK') {
            console.log('hurray', results[0].geometry.location.lat(), results[0].geometry.location.lng());
        } else {
            console.log('Geocode was not successful for the following reason: ' + status);
        }

    })
}


// Handle user location changes
// Changing back to 'where i'm at' is in search.es6

function searchbox_addListener(searchBox) {
    google.maps.event.addListener(searchBox, 'places_changed', function () {
        var places = searchBox.getPlaces();
        if (places.length == 0) {
            console.warn('Not changing location - getPlaces found no place');
            return
        }
        locationDirty = false;
        place = places[0];
//        console.log('changed location from ' + value_of('location') + ' to ' + place.formatted_address);
        set_change('location', value_of('location'), place.formatted_address);
//        console.log(place, place.formatted_address);
        set('location',             search.location.name = place.formatted_address);
        set('location_lat',         search.location.lat = place.geometry.location.lat());
        set('location_lng',         search.location.lng = place.geometry.location.lng());
        set('location_type',        search.location.type = 'selected');
        set('location_reason',      search.location.reason = 'changed by user');

        $('[data-model=user][data-field=location]').val(place.formatted_address).addClass('active');

        $('input[data-field=location]').removeClass('empty invalid');
        var $slide = swiperIactiveSlide();
        if (iSlideValid($slide)) unlock($slide);

        setLocale(search.location);
        populateTransaction();
        fetchAndPopulateLocaloffers();

        console.log('Location changed by user to: ', search.location);
        console.log('Stopping userWatch & userPositionCheck');
        if (typeof userWatch !== 'undefined' && userWatch) navigator.geolocation.clearWatch(userWatch);
        if (typeof userPositionCheck !== 'undefined' && userPositionCheck) clearInterval(userPositionCheck);
        report('Set', 'Location', null, search.location.name);

        hideSearchLocation();
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

    if (arrivedToExchange) return;

    if (!(user && user.lat && user.lng)) return;
    var user_current_location = user;

    var currExchange = currentExchange();
    if (!currExchange) return;

    var distance_from_exchange =
        distance(
            new google.maps.LatLng(currExchange.latitude, currExchange.longitude),
            new google.maps.LatLng(user_current_location.lat, user_current_location.lng)
    );

    if (!distance_from_exchange) return;

    if (distance_from_exchange < 50) {
        report('Arrived', 'To exchange');
        arrivedToExchange = true;
        return
    }

    if (prev_distance_from_exchange) {

        var distance_from_exchange_delta = distance_from_exchange - prev_distance_from_exchange;

        if (distance_from_exchange_delta < -50) {
            console.log('prev_distance_from_exchange : ', prev_distance_from_exchange, 'distance_from_exchange: ', distance_from_exchange);
            console.log('Walk towards exchange. Zooming in.');
            report('Walk', 'Towards exchange');
            map.setZoom(map_final_zoom);
        }

        if (distance_from_exchange_delta > 50) {
            console.log('prev_distance_from_exchange : ', prev_distance_from_exchange, 'distance_from_exchange: ', distance_from_exchange);
            console.log('Walk away from exchange. Zooming in.');
            report('Walk', 'Away from exchange');
            map.setZoom(map_final_zoom);
        }
    }

    prev_distance_from_exchange = distance_from_exchange;

}

checkUserPosition = function() {

    return; // Currently supressed

    if (search.location.type != 'user') {
        console.log('search location is not the user\'s location: not checking user position');
        return;
    } else {
        console.log('checkUserPosition');
    }

    userPositionCheck = window.setInterval(function(){
        checkUserDistances();
    }, 30000);
};

showSearchLocation = function(lat, lng) {


    console.log('showSearchLocation');

/*
    if (!map) {
        console.warn('showSearchLocation: map isnt ready yet');
        return
    }
*/

    if (typeof lat === 'undefined' && typeof lng === 'undefined') var lat = search.location.lat, lng = search.location.lng;
    var search_latlng = new google.maps.LatLng(lat, lng);
    map.panTo(search_latlng);

    $('#searchLoc').addClass('show');

};

hideSearchLocation = function() {
    $('#searchLoc').removeClass('show');
};


setLocale = function(location) {

    // TODO: Enchance to include all cities
    // TODO: Fetch this data from the server

    console.log('setLocale setting a new locale to match location: ', location);

    if (location == 'default') return local = def('locale');

    var centers = {
        ISR: {
            lat: 32.0853,
            lng: 34.7818,
            country: 'ISR',
            city: 'Tel Aviv',
            currency: 'ILS'
        },
        GBR: {
            lat: Number(dfault.lat),
            lng: Number(dfault.lng),
            country: 'GBR',
            city: 'London',
            currency: 'GBP'
        }
    };

    var shortest_distance = Infinity;
    var nearest_center = null;
    $.each(centers, function(key, center) {

        var distance_from_that_center =
            distance(
                new google.maps.LatLng(location.lat, location.lng),
                new google.maps.LatLng(center.lat, center.lng)
            )/1000;
        if (distance_from_that_center < shortest_distance) {
            shortest_distance = distance_from_that_center;
            nearest_center = center;
            nearest_center.user_distance = distance_from_that_center;
        }

    });

    // prepare form for the upcoming ref rates search
    set('country', nearest_center.country);
    set('city', nearest_center.city);

    // update local for potential amount changes
//    Object.assign(local, nearest_center);
    for (var attrname in nearest_center) { local[attrname] = nearest_center[attrname]; } // For Androids...
    var locale = $('body').attr('locale');
    local.language = locale ? locale : 'en';

    // required for the initial call
    return nearest_center;

};

positionFound = function() {
    return search.location && search.location.reason == 'positionFound';
};