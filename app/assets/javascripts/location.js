// Handle location
// 1 - find user's location thru browser                                                          navigator.geolocation.getCurrentPosition
// 2 - upon callback: populate session/forms with user location using google.maps.Geocoder        findPosition
// 3 - UI & location change event handling

location_settings = function() {


    // TODO: Remove
    sessionStorage.test_lat = 51.5144;
    sessionStorage.test_lng = -0.1354;


    function refresh_map() {
        var homepage = $('body').hasClass('homepage');
        if (!homepage) $('#new_search').submit();
    }






    // Find user location and set session/forms accordingly

    set_default_location = function(excluded) {
        set('location',         'London, UK');
        set('location_short',   'London');
        set('location_lat',     '51.5073509');
        set('location_lng',     '-0.12775829999998223');
        set('location_type',    'default');
    };


    function findPosition(position) {
        var lat = position.coords.latitude;
        var lng = position.coords.longitude;

        var latlng = new google.maps.LatLng(lat, lng);
        geocoder = new google.maps.Geocoder();
        geocoder.geocode({'latLng': latlng}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                if (results[1]) {

                    set('user_location',    results[1].formatted_address);
                    set('user_lat',         lat);
                    set('user_lng',         lng);

                    set('location',         results[1].formatted_address);
                    set('location_short',   results[1].address_components[1].short_name);
                    set('location_lat',     lat);
                    set('location_lng',     lng);
                    set('location_type',    'user');

                    console.log('User position found and GeocoderStatus is OK. Session populated');
                } else {
                    console.log('User position found and GeocoderStatus is OK, but no results were found');
                    set_default_location();
                }
            } else {
                console.log('Geocoder failed due to: ' + status);
                console.log('Populating the default location');
                set_default_location();
            }
        });
    }

    function displayError(error) {
        var errors = {
            1: 'Permission denied',
            2: 'Position unavailable',
            3: 'Request timeout'
        };
        console.log("navigator.geolocation has an error: " + errors[error.code]);
        console.log('Populating the default location');
        set_default_location();
    }

    function getLocation() {

        if (navigator.geolocation) {
            console.log('calling navigator.geolocation');
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
        }
    }


    if (!value_of(location)) getLocation();





    // UI


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



    // Handle user location changes

    function searchbox_addListener(searchBox) {
        google.maps.event.addListener(searchBox, 'places_changed', function () {
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
            // homepage anyway requires clicking button to get the search page, which in turn submits the form. This avoids calling submit twice.
            if (!$('body').hasClass('homepage')) $('#new_search').submit();
        });
    }



}