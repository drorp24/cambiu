    renderMap = function(exchange) {
        // TODO: Show selected exchange on map
        google.maps.event.trigger(map, 'resize');
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

                console.log(':) map completed drawing');
                resolve();

                setTimeout(function () {
                    /*
                     updateMap(search.exchanges);
                     radarFade();
                     */
                }, 13000);
            });


            // irritating, but inevitable since i can't stick the user's blue dot to a place on the map (it's always on the screen's center)
            // re-center map around user *cuurent* position if he drags the map around
            google.maps.event.addListener(map, 'dragend', function () {

                setTimeout(function () {
                    showUserPosition(user_lat, user_lng)
                }, 1000);
            });


        })
    };

    updateMap = function() {
        console.log('updateMap');
        map.data.addGeoJson(search.exchanges);
    };

    clearMap = function() {
        map.data.forEach(function(feature) {
            //filter...
            map.data.remove(feature);
        });
    };


    renderDirections = function (exchange) {

        console.log('renderDirections');

        origin =            new google.maps.LatLng(user_lat, user_lng);
        destination =       new google.maps.LatLng(exchange.latitude, exchange.longitude);
        calcRoute(origin, destination);

    };


    function calcRoute(origin, destination) {

        $('#directionsPanel').empty();

        var request = {
            origin:         origin,
            destination:    destination,
            travelMode:     google.maps.TravelMode.WALKING,
            unitSystem:     google.maps.UnitSystem.METRIC
        };

        console.log('calcRoute. Following is the request:');
        console.log(request);

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

    fromLatLngToPoint = function(lat, lng, map) {

        var latLng = new google.maps.LatLng(lat, lng);
        var topRight = map.getProjection().fromLatLngToPoint(map.getBounds().getNorthEast());
        var bottomLeft = map.getProjection().fromLatLngToPoint(map.getBounds().getSouthWest());
        var scale = Math.pow(2, map.getZoom());
        var worldPoint = map.getProjection().fromLatLngToPoint(latLng);
        return new google.maps.Point((worldPoint.x - bottomLeft.x) * scale, (worldPoint.y - topRight.y) * scale);
    };

$(document).ready(function() {
    $('body').on('click tap', '.nav_icon', function() {
        renderDirections(findExchange(currExchange()))
    });
});
