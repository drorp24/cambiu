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

$(document).ready(function() {

    locationCallback = function() {
        search_exchanges()
    };

    // Find user location and set session/forms accordingly

     // findPosition is the callback after getLocation has returned
    // Only at this point can the form be submitted, since location is one of the search criteria

    findPosition = function(position) {

        console.log('at findPosition: user location found');
        var lat = position.coords.latitude;
        var lng = position.coords.longitude;

        var latlng = new google.maps.LatLng(lat, lng);
        geocoder = new google.maps.Geocoder();
        geocoder.geocode({'latLng': latlng}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                if (results[1]) {

                    var formatted_address = results[1].formatted_address;

                    set('user_location',    formatted_address);
                    set('user_lat',         lat);
                    set('user_lng',         lng);

                    var london_latlng = new google.maps.LatLng(51.5104890, -0.1300730);
                    var user_distance_from_london = Math.round(google.maps.geometry.spherical.computeDistanceBetween(latlng, london_latlng)/1000);
                    console.log('user distance from London is: ' + user_distance_from_london.toString() + ' km');

                    if (user_distance_from_london < 50) {
                        set('location',         formatted_address);
                        set('location_short',   results[1].address_components[1].short_name);
                        set('location_lat',     lat);
                        set('location_lng',     lng);
                        set('location_type',    'user');
                    } else {
                        set_default_location();
                    }

                    console.log('User position found and GeocoderStatus is OK. Session populated');
                    locationCallback();
                } else {
                    console.log('User position found and GeocoderStatus is OK, but no results were found');
                    set_default_location();
                    locationCallback();
                }
            } else {
                console.log('Geocoder failed due to: ' + status);
                set_default_location();
                locationCallback();
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
        set_default_location();
        locationCallback();
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
            set_default_location();
            locationCallback();
        }
        var t = setTimeout(function () {
            if (!value_of('location')) {
                console.log('Geocoder timeout, firefox bug: setting default location');
                set_default_location();
                locationCallback();
            }
        }, 3000);
    };







    // UI
    // Handle user location changes

    function searchbox_addListener(searchBox) {
        google.maps.event.addListener(searchBox, 'places_changed', function () {
            console.log('Location changed by user')
            var places = searchBox.getPlaces();
            if (places.length == 0) {
                set_default_location();
                return
            }
            place = places[0];
            set('location', place.formatted_address);
            set('location_short', place.name);
            set('location_lat', place.geometry.location.lat());
            set('location_lng', place.geometry.location.lng());
            set('location_type', 'selected');

            search_exchanges();
        });
    }

    // Turn location fields into google searchBox's
    $('input[data-field=location]').each(function() {
        input = $(this).get(0);
        searchBox = new google.maps.places.SearchBox(input, {
            types: ['regions']
        });
        searchbox_addListener(searchBox);
    });

    // fix their z-index dynamically
    $('[data-field=location]').keypress(function() {
        if (!pacContainerInitialized) {
            $('.pac-container').css('z-index',
                '9999');
            pacContainerInitialized = true;
        }
    });

    // clear input upon click, but do not set() anything yet
    $('input[data-field=location]').click(function() {
        var $this = $(this);
        $this.attr('placeholder', 'Search for offers in...');
        $this.val('');
    });



});