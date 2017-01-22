     // render a map around given (lat,lng) set as center
    // if map exists already then it will only pan to given location
    showMap = function (location) {

        var latitude = location.lat,
            longitude = location.lng;

        return new Promise(function(resolve, reject) {

            console.log('showMap');

            if (!latitude || !longitude) {
                reject(Error('showMap: no params given!'))
            }

            if (map) {

                console.log('map exists already. Panning');

                map.setZoom(map_initial_zoom);
                map.panTo(location);

                google.maps.event.addListenerOnce(map, 'bounds_changed', function () {
                    console.log('map is panned');
                    resolve();
                });

                return;
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


            map.data.addListener('click', function (event) {

            });


            google.maps.event.addListenerOnce(map, 'idle', function () {
                // do something only the first time the map is loaded
            });

            google.maps.event.addListenerOnce(map, 'tilesloaded', function() {
                console.log('Map is drawn');
                resolve();
            });


            google.maps.event.addListener(map, 'dragstart', function () {
            });

            google.maps.event.addListener(map, 'click', function () {
            });

            google.maps.event.addListener(map, 'dragend', function () {

                  // irritating, but inevitable since i can't stick the user's blue dot to a place on the map (it's always on the screen's center)
                 // re-center map around user *cuurent* position if he drags the map around
                console.log('dragend event');

                 setTimeout(function () {
                    showUserPosition(user.lat, user.lng)
                }, 1000);
            });


            google.maps.event.addListener(map, 'center_changed', function () {

            });

            google.maps.event.addListener(map, 'zoom_changed', function () {

            });

        })
    };

    panMap = function (location) {

        var latitude = location.lat,
            longitude = location.lng;

        return new Promise(function(resolve, reject) {

            console.log('panMap');

            if (!latitude || !longitude) {
                reject(Error('panMap: no params given!'))
            }

            map.panTo(location);

            google.maps.event.addListener(map, 'bounds_changed', function () {
                console.log('map is panned');
                resolve();
            });

        })
    };

     renderMap = function(exchange) {

         // TODO: Show selected exchange on map

         google.maps.event.trigger(map, 'resize');

         // Added to fix absurd Savyon centering issue
         if (user.lat && user.lng) {
             map.setCenter({lat: user.lat, lng: user.lng});
         }
     };


     placeGoogleMarkers = function() {
        idMarkerLayer();
        map.data.setStyle(function(feature) {
            return {
                icon: '/new_logo_31_43.png',
                optimized: false,
                zIndex: feature.getProperty('id')
            }
        });
        map.data.addGeoJson(searchResult);
    };

    clearGoogleMarkers = function() {
        map.data.forEach(function(feature) {
            map.data.remove(feature);
        });
    };

    highlightCurrentMarker = function() {

        var id = currentExchange().id;
        var style = 'z-index: ' + String(id);
        var div = 'div[style*="' + style + '"]';

        map.data.overrideStyle(map.data.getFeatureById(id), {icon: '/pricest.png'});
        $('#markerLayer ' + div).addClass('bounce');

    };

    addGoogleMarkers = function() {

        console.log('addGoogleMarkers');

        idMarkerLayer();

        return new Promise(function(resolve, reject) {

            (function loop(i) {

                var timeout = 200;
                var exchange = exchanges[i].properties;
                setTimeout(function () {

                    var marker = new google.maps.Marker({
                        map: map,
                        animation: google.maps.Animation.DROP,
                        optimized: false,
                        icon: '/rsz_logo_no_text.png',
                        position: {lat: exchange.latitude, lng: exchange.longitude}
                    });

                    if (--i >= 0) {
                        loop(i)
                    } else {
                        setTimeout(resolve, timeout);
                    }

                }, timeout);

            })(exchanges.length - 1);

        })

     };

    // define a markers layer and id it so google markers can be styled in css (as '#markerLayer img')
    // if not needed, then 'optimized: false' should be removed from marker creation
    idMarkerLayer = function() {
        console.log('idMarkerLayer');
        var myoverlay = new google.maps.OverlayView();
        myoverlay.draw = function () {
            this.getPanes().markerLayer.id='markerLayer';
        };
        myoverlay.setMap(map);
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
        directionsRenderedFor = exchange.id;

        var origin =            new google.maps.LatLng(user.lat, user.lng);
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
                setTimeout(function() {showUserPosition(user.lat, user.lng)}, 1000);
            }
        });

    }

    findDuration = function(exchange) {

        return new Promise(function(resolve, reject) {

            var origin =            new google.maps.LatLng(user.lat, user.lng);
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
                        console.log(response)
                        reject(new Error('google.maps.DistanceMatrixService response includes no duration/distance'))
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

    // the smooth zoom function
    function smoothZoom (map, max, cnt) {
        console.log('smoothZoom', max, cnt);

        return new Promise(function(resolve, reject) {

        increaseZoom(cnt);

        function increaseZoom(cnt) {

            console.log('Increase zoom to: ' + cnt);
            if (cnt >= max) {
                resolve();
                return;
            }
            else {
                z = google.maps.event.addListenerOnce(map, 'zoom_changed', function(event){
//                    google.maps.event.removeListener(z);
                    increaseZoom(cnt + 1);
                });
                setTimeout(function(){map.setZoom(cnt)}, 700);
            }

        }

        })

    }

    zoomIn = function() {
        console.log('zoomIn');
        if (exchanges.length == 0) {
            return;
        }
        return smoothZoom(map, map_final_zoom, map.getZoom())
    };



