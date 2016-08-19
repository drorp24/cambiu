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
        set_default_location('Browser does not support geolocation');
        positionCallback();
    }
};


// Draw map and invoke search as soon as user position is known. Geocode too.
positionFound = function(position) {

    user_lat = position.coords.latitude;
    user_lng = position.coords.longitude;

    // Search position is the user's position until user exlpicitly changes it in params
    set('location_lat',     user_lat);
    set('location_lng',     user_lng);
    set('location_type',    'user');

    positionCallback(user_lat, user_lng);

    var user_latlng =   new google.maps.LatLng(user_lat, user_lng);
    var geocoder =      new google.maps.Geocoder();

    geocoder.geocode({'latLng': user_latlng}, function(results, status) {

        if (status == google.maps.GeocoderStatus.OK) {
            if (results[1]) {
                geocodeCallback(results[1], 'successful');
            } else {
                geocodeCallback(null, 'no results');
            }
        } else {
            geocodeCallback(null, 'failed');
        }

    });
};

// Draw map and invoke search by user's position
positionCallback = function(user_lat, user_lng) {

    console.log('positionCallback');

    if (mapIsDrawn) {
        console.log('positionCallback. Map already drawn')
    } else {
        console.log('positionCallback: drawing map');
        drawMap(user_lat, user_lng);
    }
    if (exchanges && exchanges.length > 0) {
        console.log('positionCallback. exchanges exist - no search performed')
    } else {
        console.log('positionCallback: invoking search');
        search();
    }
};





//////
    set_default_location = function(reason) {

        console.log('Setting default location. Reason: ' + reason);

        var def = def_vals();

        set('location',         def.location);
        set('location_short',   def.location_short);
        set('location_lat',     def.location_lat);
        set('location_lng',     def.location_lng);
        set('location_type',    def.location_type);
        set('location_reason',  reason);
    };

    // Update formatted address fields
    geocodeCallback = function(result, status) {

        console.log('geocodeCallback. Status: ' + status);

        if (result) {
            set('user_location',    result.formatted_address);
            set('location',         result.formatted_address);
            set('location_short',   result.address_components[1].short_name);
        }

     };

    // Find user location and set session/forms accordingly

     positionError = function(error) {
        var errors = {
            1: 'Permission denied',
            2: 'Position unavailable',
            3: 'Request timeout'
        };

        if (!value_of('location')) {
            set_default_location('geolocation error: ' + error.message);
            positionCallback();
        }
    };

/*
    stopFollowingUser = function() {
        navigator.geolocation.clearWatch(watchId);
    };
*/


    reportPosition = function(position) {

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


    followUser = function() {
        if (navigator.geolocation) {
            navigator.geolocation.watchPosition(
                handleCurrPosition,
                positionError,
                {
                    enableHighAccuracy: true,
                    timeout: 30000,
                    maximumAge: 30000
                }
            )
        }
    };

    handleCurrPosition = function(position) {

        user_lat = position.coords.latitude;
        user_lng = position.coords.longitude;
        showUserLocation(user_lat, user_lng);

        // TODO: comment. Use for testing only! unnecessary & quota limited
//        reportPosition(position);

     };

    showUserLocation = function(user_lat, user_lng) {

        if (!map || !map.getProjection()) {
            console.log('showUserLocation: map isnt ready yet');
            return
        } else {
            console.log('showUserLocation: map is ready')
        }

        var user_latlng = new google.maps.LatLng(user_lat, user_lng);
        var point = fromLatLngToPoint(user_latlng, map);
        var x = String(centerX - 30) + 'px';
        var y = String(centerY - 30) + 'px';

        // TODO: check panTo (or setCenter) doesnt remove the directions
        map.panTo(user_latlng);
        $('#userLoc').css('top', y).css('left', x);

        userLocationShown = true;

    };
