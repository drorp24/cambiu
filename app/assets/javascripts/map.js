    renderMap = function(exchange) {
        // TODO: Show selected exchange on map
        google.maps.event.trigger(map, 'resize');
    };

    drawMap = function (latitude, longitude) {

         console.log('drawMap');

         var mapOptions = {
             center: new google.maps.LatLng(latitude, longitude),
             zoom: map_initial_zoom,
             scaleControl: true
         };
         map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

         addUserMarker(latitude, longitude);

 /*        map.data.setStyle(function(feature) {

             var best_at = feature.getProperty('best_at');
             var icon;

             if (best_at.length == 0) {
                 icon = 'https://wwwcdn.cambiu.com/other1.png'
             } else if (best_at.indexOf('best') > -1) {
                 icon = 'https://wwwcdn.cambiu.com/logo_no_text.png'
             } else if (best_at.indexOf('highest') > -1 || best_at.indexOf('cheapest') > -1) {
                 icon = 'https://wwwcdn.cambiu.com/pricest.png'
             } else if (best_at.indexOf('nearest') > -1) {
                 icon = 'https://wwwcdn.cambiu.com/nearest.png'
             }

             return {
                icon: icon
             };
         });
*/
        map.data.addListener('click', function(event) {

            var content = exchange_el(event.feature).det[0];
            var infowindow = new google.maps.InfoWindow({
                content: content
            });
            var anchor = new google.maps.MVCObject();
            anchor.set("position",event.latLng);
            infowindow.open(map, anchor);

         });


        google.maps.event.addListenerOnce(map, 'idle', function(){
            // do something only the first time the map is loaded

            setTimeout(function() {
/*
                updateMap(search.exchanges);
                radarFade();
*/
            }, 13000);
        });

    };

    updateMap = function(data) {
        map.data.addGeoJson(data);
    };

    clearMap = function() {
        map.data.forEach(function(feature) {
            //filter...
            map.data.remove(feature);
        });
    };


    function addUserMarker(latitude, longitude) {

        var location_marker = new google.maps.Marker({
            position: new google.maps.LatLng(latitude, longitude),
            disableAutoPan: true,
            map: map,
//            icon: 'https://wwwcdn.cambiu.com/cur_loc.png',
            draggable: true
        });

        location_marker.addListener('dragend', function(evt) {
            set('location_lat', evt.latLng.lat());
            set('location_lng', evt.latLng.lng());
            set('location_type', 'dragged');

            search_exchanges('User dragged the user marker');
        });
    }


    renderDirections = function (exchange) {

        console.log('renderDirections');

        var mapOptions = {
            center: new google.maps.LatLng(exchange.latitude, exchange.longitude),
//            zoom: map_initial_zoom,
            scaleControl: true
        };
        directionsMap = new google.maps.Map(document.getElementById('directions-map-canvas'), mapOptions);
        from =          new google.maps.LatLng(value_of('location_lat'), value_of('location_lng'));
        to =            new google.maps.LatLng(exchange.latitude, exchange.longitude);
        calcRoute(from, to);

    };


    function calcRoute(from, to) {

        $('#directionsPanel').empty();

        var request = {
            origin: from,
            destination: to,
            travelMode: google.maps.TravelMode.WALKING,
            unitSystem: google.maps.UnitSystem.METRIC
        };

        console.log('calcRoute. Following is the request:');
        console.log(request);

        directionsService = new google.maps.DirectionsService();
        directionsDisplay = new google.maps.DirectionsRenderer();

        directionsDisplay.setMap(directionsMap);
        directionsDisplay.setPanel(document.getElementById("directionsPanel"));

        directionsService.route(request, function (response, status) {
            console.log('directionsService.route returned with status: ' + status);
            if (status == google.maps.DirectionsStatus.OK) {
                directionsDisplay.setDirections(response);
            }
        });

    }

/*
    fromLatLngToPoint = function(latLng, map) {
        var topRight = map.getProjection().fromLatLngToPoint(map.getBounds().getNorthEast());
        var bottomLeft = map.getProjection().fromLatLngToPoint(map.getBounds().getSouthWest());
        var scale = Math.pow(2, map.getZoom());
        var worldPoint = map.getProjection().fromLatLngToPoint(latLng);
        return new google.maps.Point((worldPoint.x - bottomLeft.x) * scale, (worldPoint.y - topRight.y) * scale);
    };
*/
