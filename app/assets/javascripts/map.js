
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

     };

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


    function addUserMarker(latitude, longitude) {

        var location_marker = new google.maps.Marker({
            position: new google.maps.LatLng(latitude, longitude),
            disableAutoPan: true,
            map: map,
            icon: '/cur_loc.png',
            draggable: true
        });

        location_marker.addListener('dragend', function(evt) {
            set('location_lat', evt.latLng.lat());
            set('location_lng', evt.latLng.lng());
            set('location_type', 'dragged');

            search_exchanges();
        });
    }



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




    //// EVENTS & LISTENERS



    /*
    var contentString = 'blah';

    var infowindow = new google.maps.InfoWindow({
        content: contentString
    });

    var marker = new google.maps.Marker({
        position: latlng,
        map: map
    });

    google.maps.event.addListener(marker, 'click', function() {
        infowindow.open(map,marker);
    });
    */

    // TODO: Consider using the api's geoJsonLoad

    // Open infowindows of markers that are within the map bounds. This is reactivated whenever user zooms out!
    // Comment if no infowindows should be opened by default, then use 'mouseover' event below to open them manually


    /*
    google.maps.event.addListener(map, 'bounds_changed', function () {

        if (!zoom_changed_by_user) return;

        var mapBounds = map.getBounds();
        for (var i = 0; i < markers.length; i++) {

            var marker_position = markers[i].getPosition();

            if (mapBounds.contains(marker_position)) {
                markers[i]['infowindow'].open(map, markers[i]);
            }
        }

    });
    */








    // This will fire when map has finished loading
    //google.maps.event.addListenerOnce(map, 'idle', function(){

        // NO OPEN MARKERS IN MOBILE
        // remove 'x's
        //$('.gm-style-iw').next().css('display', 'none');

        // TOO MUCH WORK
        // increase z-index of best markers
        //setTimeout(function(){ forwardBestMarkers() }, 100);

    //});

    /*
    forwardBestMarkers = function() {

        if (mobile) {
            return;
        }
        // find best exchanges' iw's and increase their z-index
        for (var i = 0; i < best_exchanges.length; i++) {
            var best_exchange = best_exchanges[i];
            var marker = findMarker(best_exchange.id);
            var iw = marker.infowindow;
            var el = iw.content;
            var $el = $(el);
            $el.parent().parent().parent().css('z-index', '900');
        }
    };
    */


    //TODO: Remove: not needed anymore, with the new directions pane
    /*
    if (desktop) {
        $('body').on('click', '.directions', (function () {
            var $this = $(this);
            var from = new google.maps.LatLng(sessionStorage.location_lat, sessionStorage.location_lng);
            var to = new google.maps.LatLng($(this).attr('data-lat'), $(this).attr('data-lng'));
            var id = $this.attr('data-id');
            unhighlight(id);
            big_marker(id);
            calcRoute(from, to);
        }));
    }
    */

