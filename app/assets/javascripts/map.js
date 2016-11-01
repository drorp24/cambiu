    renderMap = function(exchange) {

        // TODO: Show selected exchange on map

        google.maps.event.trigger(map, 'resize');

        // Added to fix absurd Savyon centering issue
        if (user_lat && user_lng) {
            map.setCenter({lat: user_lat, lng: user_lng});
        }
    };

    // render a map around given (lat,lng) set as center
    // to re-center the map use map.center rather than calling all of this
    drawMap = function (latitude, longitude) {

        return new Promise(function(resolve, reject) {

            console.log('drawMap');

            if (!latitude || !longitude) {
                reject(Error('seriously! no params given!'))
            }

            var mapOptions = {
                center: new google.maps.LatLng(latitude, longitude),
                zoom: map_initial_zoom,
                scaleControl: true,
                zoomControlOptions: {
                    position: google.maps.ControlPosition.RIGHT_CENTER
                },
                streetViewControlOptions: {
                    position: google.maps.ControlPosition.RIGHT_CENTER
                },
                mapTypeControl: false
            };
            map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

// TODO: Remove
             var location_marker = new google.maps.Marker({
             position: new google.maps.LatLng(latitude, longitude),
             map: map
             });

            map.data.addListener('click', function (event) {

// TODO: fix to show card instead of infoWindow - UNLESS I USE HOMEMADE MARKERS. anyway not use infoWindow.
                /*
                 var content = exchange_el(event.feature).det[0];
                 var infowindow = new google.maps.InfoWindow({
                 content: content
                 });
                 var anchor = new google.maps.MVCObject();
                 anchor.set("position",event.latLng);
                 infowindow.open(map, anchor);
                 */

            });


            google.maps.event.addListenerOnce(map, 'idle', function () {
                // do something only the first time the map is loaded

                console.log('map completed drawing');
                resolve();

            });


             google.maps.event.addListener(map, 'dragend', function () {

                  // irritating, but inevitable since i can't stick the user's blue dot to a place on the map (it's always on the screen's center)
                 // re-center map around user *cuurent* position if he drags the map around
                 setTimeout(function () {
                    showUserPosition(user_lat, user_lng)
                }, 1000);
            });


            google.maps.event.addListener(map, 'center_changed', function () {

                $('.marker').each(function () {
                    positionSoftMarker(null, $(this))
                });
            });

            google.maps.event.addListener(map, 'zoom_changed', function () {

                $('.marker').each(function () {
                    positionSoftMarker(null, $(this))
                });
            });



        })
    };

    placeGoogleMarkers = function() {
        console.log('placeGoogleMarkers');
        map.data.addGeoJson(search.exchanges);
    };

    clearGoogleMarkers = function() {
        map.data.forEach(function(feature) {
            map.data.remove(feature);
        });
    };

    placeSoftMarkers = function() {
        console.log('placeSoftMarkers');
        exchanges.forEach(placeSoftMarker);
    };

    placeSoftMarker = function(exchange) {

        var exchange = exchange.properties;
        var $marker = $('.marker.template').clone().removeClass('template').attr('data-exchange_id', exchange.id);

        var deg = Math.trunc(getBearing(numeric_value_of('location_lat'), numeric_value_of('location_lng'), exchange.latitude, exchange.longitude));

        $marker.attr({'data-lat': exchange.latitude, 'data-lng': exchange.longitude, 'data-atDeg': deg});
        $marker = positionSoftMarker(null, $marker);
        $marker.appendTo('#markers');
    };

    positionSoftMarker = function(index, $marker) {
        var data = $marker.data();
        var point = fromLatLngToPoint(data.lat, data.lng, map);
        var point_width = 32, point_height = 32;
        $marker.css({left: point.x - point_width / 2, top: point.y - point_height / 2});
        return $marker;
    };


    renderDirections = function (exchange) {

//        console.log('renderDirections');

        if (directionsRenderedFor == exchange.id) return;
        var directionsRenderedFor = exchange.id;
        var origin =            new google.maps.LatLng(user_lat, user_lng);
        var destination =       new google.maps.LatLng(exchange.latitude, exchange.longitude);
        calcRoute(origin, destination);

    };

    clearDirections = function() {
        if (directionsRenderedFor == null) return;
        directionsDisplay.setMap(null);
        directionsRenderedFor = null;
    };


    function calcRoute(origin, destination) {

        $('#directionsPanel').empty();

        var request = {
            origin:         origin,
            destination:    destination,
            travelMode:     google.maps.TravelMode.WALKING,
            unitSystem:     google.maps.UnitSystem.METRIC
        };

        directionsService = new google.maps.DirectionsService();
        directionsDisplay = new google.maps.DirectionsRenderer();

        directionsDisplay.setMap(map);
        directionsDisplay.setPanel(document.getElementById("directionsPanel"));

        directionsService.route(request, function (response, status) {
            console.log('directionsService.route returned with status: ' + status);
            if (status == google.maps.DirectionsStatus.OK) {
                directionsDisplay.setDirections(response);
            }
        });

    }

    findDuration = function(exchange) {

        return new Promise(function(resolve, reject) {

            var origin =            new google.maps.LatLng(user_lat, user_lng);
            var destination =       new google.maps.LatLng(exchange.latitude, exchange.longitude);
            var request = {
                origins: [origin],
                destinations: [destination],
                travelMode: google.maps.TravelMode.WALKING,
                unitSystem: google.maps.UnitSystem.METRIC
            };

            var service = new google.maps.DistanceMatrixService;
            service.getDistanceMatrix(request, function (response, status) {
                if (status !== 'OK') {
                    reject('google.maps.DistanceMatrixService error: ' + status);
                } else {
                    if (response && response.rows[0] && response.rows[0].elements[0] && response.rows[0].elements[0].duration) {
                        exchange.matrix.duration = response.rows[0].elements[0].duration.text;
                        exchange.matrix.distance = response.rows[0].elements[0].distance.text;
                        resolve(exchange);
                    } else {
                        reject('google.maps.DistanceMatrixService response includes no duration/distance')
                    }
                }
            })

        })
    }
;
    fromLatLngToPoint = function(lat, lng, map) {

        var latLng = new google.maps.LatLng(lat, lng);
        var topRight = map.getProjection().fromLatLngToPoint(map.getBounds().getNorthEast());
        var bottomLeft = map.getProjection().fromLatLngToPoint(map.getBounds().getSouthWest());
        var scale = Math.pow(2, map.getZoom());
        var worldPoint = map.getProjection().fromLatLngToPoint(latLng);
        return new google.maps.Point((worldPoint.x - bottomLeft.x) * scale, (worldPoint.y - topRight.y) * scale);
    };

