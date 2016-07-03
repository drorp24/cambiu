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
        search_exchanges(reason)
    };

    // Find user location and set session/forms accordingly

     // findPosition is the callback after getLocation has returned
    // Only at this point can the form be submitted, since location is one of the search criteria

    findPosition = function(position) {

        console.log('at findPosition: user location found');
        var user_lat = position.coords.latitude;
        var user_lng = position.coords.longitude;

        var user_latlng = new google.maps.LatLng(user_lat, user_lng);
        geocoder = new google.maps.Geocoder();
        geocoder.geocode({'latLng': user_latlng}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                if (results[1]) {

                    var formatted_address = results[1].formatted_address;

                    set('user_location',    formatted_address);
                    set('user_lat',         user_lat);
                    set('user_lng',         user_lng);

                    var def_latlng =            new google.maps.LatLng(def('location_lat'), def('location_lng'));
                    var user_distance_from_def = Math.round(google.maps.geometry.spherical.computeDistanceBetween(user_latlng, def_latlng)/1000);
                    console.log('user distance from Default is: ' + user_distance_from_def.toString() + ' km');

                    if (user_distance_from_def < 50  ) {
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
        console.log("navigator.geolocation has an error: " + errors[error.code]);
        set_default_location('geolocation error: ' + error.code);
        locationCallback('User position not found, device geolocation failed. Searched location is the default');
    };

    getLocation = function() {

         if (navigator.geolocation) {
            console.log('calling navigator.geolocation....');
            var timeoutVal = 5000;  // setInterval????!
            navigator.geolocation.getCurrentPosition(
                findPosition,
                displayError,
                {enableHighAccuracy: false, timeout: timeoutVal, maximumAge: 0}
            );
        }
        else {
            console.log('Browser does not support geolocation');
            console.log('Populating the default location');
            set_default_location('Browser does not support geolocation');
            locationCallback('Device/browser does not support gelocation. Searched location is the default');
        }
     };
