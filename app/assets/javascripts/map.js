
    drawMap = function (latitude, longitude) {

         console.log('drawMap');

         var mapOptions = {
             center: new google.maps.LatLng(latitude, longitude),
             zoom: map_initial_zoom,
             scaleControl: true
         };
         map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

         if (desktop) mapPan();

         addUserMarker(latitude, longitude);

         map.data.setStyle(function(feature) {

             var best_at = feature.getProperty('best_at');
             var icon;

             if (best_at.length == 0) {
                 icon = 'http://wwwcdn.cambiu.com/other1.png'
             } else if (best_at.indexOf('best') > -1) {
                 icon = 'http://wwwcdn.cambiu.com/logo_no_text.png'
             } else if (best_at.indexOf('highest') > -1 || best_at.indexOf('cheapest') > -1) {
                 icon = 'http://wwwcdn.cambiu.com/pricest.png'
             } else if (best_at.indexOf('nearest') > -1) {
                 icon = 'http://wwwcdn.cambiu.com/nearest.png'
             }

             return {
                icon: icon
             };
         });

        map.data.addListener('click', function(event) {

            var content = exchange_el(event.feature).det[0];
            var infowindow = new google.maps.InfoWindow({
                content: content
            });
            var anchor = new google.maps.MVCObject();
            anchor.set("position",event.latLng);
            infowindow.open(map, anchor);

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
            icon: 'http://wwwcdn.cambiu.com/cur_loc.png',
            draggable: true
        });

        location_marker.addListener('dragend', function(evt) {
            set('location_lat', evt.latLng.lat());
            set('location_lng', evt.latLng.lng());
            set('location_type', 'dragged');

            search_exchanges();
        });
    }


    drawDirectionsMap = function (latitude, longitude) {

        console.log('drawDirectionsMap');

        var mapOptions = {
            center: new google.maps.LatLng(latitude, longitude),
            zoom: map_initial_zoom,
            scaleControl: true
        };
        directionsMap = new google.maps.Map(document.getElementById('directions-map-canvas'), mapOptions);
        from =          new google.maps.LatLng(value_of('location_lat'), value_of('location_lng'));
        to =            new google.maps.LatLng(value_of('exchange_latitude'), value_of('exchange_longitude'));
        calcRoute(from, to);

    };


    function calcRoute(from, to) {

        var request = {
            origin: from,
            destination: to,
            travelMode: google.maps.TravelMode.WALKING,
            unitSystem: google.maps.UnitSystem.METRIC
        };

        directionsService = new google.maps.DirectionsService();
        directionsDisplay = new google.maps.DirectionsRenderer();
        zoom_changed_by_user = false;

        directionsDisplay.setMap(directionsMap);
        directionsDisplay.setPanel(document.getElementById("directionsPanel"));
        //       directionsDisplay.setPanel(document.getElementById('directions-panel'));

        directionsService.route(request, function (response, status) {
            console.log('directionsService.route returned with status: ' + status);
            if (status == google.maps.DirectionsStatus.OK) {
                map_center_changed = true;
    //                $('#directions-panel').css('display', 'block');
                directionsDisplay.setDirections(response);
                setTimeout(function(){ map.setZoom(15) }, 100);
                setTimeout(function(){ mapPan() }, 100);


            }
        });

    }

