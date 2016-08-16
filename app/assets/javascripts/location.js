// L O C A T I O N
// service
//
// 1 - find user's location thru browser                                                            navigator.geolocation.getCurrentPosition
// 2 - upon callback:
//     2.1 populate session/forms with user location using google.maps.Geocoder                     findPosition
//     2.2 perform passed callback
//          search SPA  - submit form now that user's location is known, to populate map and exchanges (not applicable to homepage)
//          direct      - complete missing data that depends on user's location
//3 - define UI & location change event handler

// submit() is called on 3 occasions (only):
// Non homepage: triggered by location change (here)
// 1 - location successfully found or otherwise set to default
// 2 - location is changed by user
// 3 - location is refreshed upon pageload
// Homepage: trigger by button click (search.js)
// 3 - either of the homepage buttons is clicked


    set_default_location = function(reason) {
        var def = def_vals();
        if (reason === undefined) reason = "no reason";
        console.log('Setting default location. Reason: ' + reason);
        set('location',         def.location);
        set('location_short',   def.location_short);
        set('location_lat',     def.location_lat);
        set('location_lng',     def.location_lng);
        set('location_type',    def.location_type);
        set('location_reason',  reason);
    };

    locationCallback = function(reason) {

        console.log('locationCallback. Reason: ' + reason);
        if (mapIsDrawn) {
            console.log('locationCallback. Map already drawn')
        } else {
            console.log('locationCallback. Drawing map for the first time');
            drawMap(value_of('location_lat'), value_of('location_lng'));
        }
        if (paramsPopulated) {
            console.log('locationCallback. search params already populated')
        } else {
            console.log('locationCallback. populating search params in form & navbar');
            paramsPopulate()
        }
        if (exchanges && exchanges.length > 0) {
            console.log('locationCallback. exchanges exist - no search performed')
        } else {
            console.log('locationCallback. performing search');
            search_exchanges();
        }
    };

    // Find user location and set session/forms accordingly

     // handlePosition is called as soon as (and every time) user position is found. It is getLocation()'s successful callback
    // Only at this point can the form be submitted, since location is one of the search criteria

    handlePosition = function(position) {

        user_lat = position.coords.latitude;
        user_lng = position.coords.longitude;

        var user_latlng = new google.maps.LatLng(user_lat, user_lng);
        var geocoder = new google.maps.Geocoder();
        geocoder.geocode({'latLng': user_latlng}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                if (results[1]) {

                    var formatted_address = results[1].formatted_address;
                    var d = new Date(position.timestamp);

                    set('user_location',    formatted_address);
                    set('user_lat',         user_lat);
                    set('user_lng',         user_lng);
                    set('user_location_timestamp',  d.toLocaleTimeString());
                    set('user_location_accuracy',   position.coords.accuracy);
                    set('user_location_heading',    position.coords.heading);
                    set('user_location_speed',      position.coords.speed);

                    var def_latlng =            new google.maps.LatLng(def('location_lat'), def('location_lng'));
                    var user_distance_from_def = Math.round(google.maps.geometry.spherical.computeDistanceBetween(user_latlng, def_latlng)/1000);
                    console.log('user distance from Default is: ' + user_distance_from_def.toString() + ' km');

                    if (/*user_distance_from_def < 50*/1==1 ) {
                        set('location',         formatted_address);
                        set('location_short',   results[1].address_components[1].short_name);
                        set('location_lat',     user_lat);
                        set('location_lng',     user_lng);
                        set('location_type',    'user');
                        locationCallback('User position found. Searched location is user position');
                    } else {
                        set_default_location('user is far');
                        locationCallback('User position found. Searched location is the default since user is far');
                    }

                } else {
                    console.log('User position found and GeocoderStatus is OK, but no results were found');
                    set_default_location('geocoder found no results');
                    locationCallback('User position found. Searched location is the default since geocoder found no result');
                }
            } else {
                console.log('Geocoder failed due to: ' + status);
                set_default_location('geocoder error: ' + status);
                locationCallback('User position found. Searched location is the default since google geocoder failed');
            }
        });
    };

    displayError = function(error) {
        var errors = {
            1: 'Permission denied',
            2: 'Position unavailable',
            3: 'Request timeout'
        };
        console.log("navigator.geolocation has an error: " + errors[error.message]);
        set_default_location('geolocation error: ' + error.message);
        locationCallback('User position not found, device geolocation failed. Searched location is the default');
    };

    getLocation = function() {

         if (navigator.geolocation) {
            console.log('calling navigator.geolocation....');
            navigator.geolocation.getCurrentPosition(
                handlePosition,
                displayError,
                {
                    enableHighAccuracy: true,
                    timeout: 30000,
                    maximumAge: 30000
                }
            );
        }
        else {
            console.log('Browser does not support geolocation');
            console.log('Populating the default location');
            set_default_location('Browser does not support geolocation');
            locationCallback('Device/browser does not support gelocation. Searched location is the default');
        }
     };

/*
    stopFollowingUser = function() {
        navigator.geolocation.clearWatch(watchId);
    };
*/


    reportPosition = function(position) {

        var user_lat = position.coords.latitude;
        var user_lng = position.coords.longitude;
        var user_latlng = new google.maps.LatLng(user_lat, user_lng);
        var geocoder = new google.maps.Geocoder();

        geocoder.geocode({'latLng': user_latlng}, function(results, status) {

            if (status == google.maps.GeocoderStatus.OK) {
                if (results[1]) {

                    var address = results[1].formatted_address;
                    var d = new Date(position.timestamp);
                    var timestamp = d.toLocaleTimeString();
                    var accuracy = position.coords.accuracy;
                    var heading = position.coords.heading;
                    var speed =   position.coords.speed;

                    console.log('Timestamp: ' + timestamp + '\nAddress: ' + address + '\nAccuracy: ' + accuracy + '\nHeading: ' + heading + '\nSpeed: ' + speed)

                }
            }
        })
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

    followUser = function() {
        if (navigator.geolocation) {
            navigator.geolocation.watchPosition(
                handleCurrPosition,
                displayError,
                {
                    enableHighAccuracy: true,
                    timeout: 30000,
                    maximumAge: 30000
                }
            )
        }
    };

