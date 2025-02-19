//
//  E X C H A N G E S
//
//  Responsible to reflect exchanges search results in View (updatePage)
//
//  Uses the exchanges buffer passed by the ajax callback, to:
//  -  Draw map and place dynamic markers, centering map by selected exchange or searched location (depending on the number of exchanges returned)
//  -  Render a list of exchange DIVs, or populate a single exchange info (depending on the number of exchanges returned),
//  -  Update results banner

$(document).ready(function() {

//if ($('body').hasClass('exchanges'))   {    


    updatePage = function(data) {

        console.log('updatePage');
        clearExchanges();
        best_exchanges = data['best'];
        exchanges = data['more'];

        if (exchangePage() && exchanges && exchanges.length > 0) {
            var mapCenterLat = exchanges[0].latitude;
            var mapCenterLng = exchanges[0].longitude;
        } else {
            var mapCenterLat = sessionStorage.location_lat;
            var mapCenterLng = sessionStorage.location_lng;
        }
        if (desktop) drawMap(mapCenterLat, mapCenterLng, exchanges);

        if (search() && exchanges && exchanges.length > 0) {
            updateExchanges();
        }

        if (exchanges && exchanges.length > 0) {

            if (search()) {
                var exchange_id = urlId();
                if (exchange_id) {   // Refresh of *specific exchange page* even in search requires model_populate like in exchange mode
                    var exchange = findExchange(exchange_id);
                    if (exchange) {
                        model_populate('exchange', exchange);
                        drawExchangeMap(exchange);
                    }
                }
            } else {
                model_populate('exchange', exchanges[0]);
            }

            if (desktop) bindBehavior();
        }

        updateResults(exchanges);

    };

    updateExchanges = function() {

        list = value_of('list');
        console.log('updateExchanges. list: ' + list);

        if (list == 'all') {

            updateBest();
            updateMore();

        } else if (list == 'more') {

            updateMore();
            set('list', 'all'); // Important! to only display entire list always, just comment this line

        } else {

            updateBest();
        }

    };

     updateBest = function() {
        $('#exchanges_search_results').css('display', 'none');

        best_append_point = '#exchanges_list .list-group #best_exchanges';

        for (var i = 0; i < best_exchanges.length; i++) {
            addExchange(best_exchanges[i], i, best_append_point);
        }

        $('#exchanges_list .more').css('display', 'block');
    };

    updateMore = function() {
        $('#exchanges_search_results').css('display', 'block');
        $('#exchanges_items').css('display', 'block');
        $('#exchanges_list .more').css('display', 'none');

        exchanges_append_point = '#exchanges_list .list-group #exchanges_items';

        for (var i = 0; i < exchanges.length; i++) {
            addExchange(exchanges[i], i, exchanges_append_point);
        }
    };

    removeMore = function() {
        $('#exchanges_search_results').css('display', 'none');
        $('#exchanges_items').css('display', 'none');
        $('#exchanges_list .more').css('display', 'block');
        set('list', 'best');
    };



        // TODO: Remove det, replace classes with data- attributes, do it in a loop over the data fields
    function addExchange(exchange, index, append_point) {

        if (exchange.errors.length > 0) return;
        exchange_list_count += 1;

        var exchange_el = $('.exchange_row.template').clone().removeClass('template');
        var exchange_sum = exchange_el.find('.list-group-item');

        exchange_sum.attr('data-id', exchange.id);
        exchange_sum.attr('data-exchangeid', exchange.id);
        exchange_sum.attr('data-href-id', exchange.id);
        exchange_sum.attr('data-exchange-name', exchange.name);
        /*
         exchange_sum.attr('lat', exchange.latitude);
         exchange_sum.attr('lng', exchange.longitude);
         */
        exchange_sum.attr('data-service-type', exchange.service_type);
        exchange_sum.addClass(exchange.service_type);
        if (exchange.service_type == 'delivery') {
            exchange_sum.attr('data-delivery-tracking', exchange.delivery_tracking);
            if (!mobile) exchange_sum.find('.delivery_ind').css('display', 'block');
        }


        exchange_el.find('.distance').html((exchange.distance * 1000).toFixed(0));
        exchange_el.find('.name').html(exchange.name_s);
        exchange_el.find('.quote').html(exchange.edited_quote);
        exchange_el.find('.quote_currency').html(exchange.quote_currency);
 /*       if (exchange.quote > 0) {
//            exchange_el.find('.comparison').css('display', 'block');
            exchange_el.find('[data-field=gain_amount]').html(exchange.gain_amount);
        }
*/
        exchange_el.find('.gain_amount').html(exchange.gain_amount);
        exchange_el.find('.gain_type').addClass(exchange.gain_type);
        exchange_el.find('.address').html(exchange.address);
        exchange_el.find('.open_today').html(exchange.open_today);
        exchange_el.find('.open_today').attr('href', exchange.website ? exchange.website : "#");
        exchange_el.find('.phone').attr('href', exchange.phone ? 'tel:+44' + exchange.phone.substring(1) : "#");
        exchange_el.find('.website').attr('href', exchange.website);
        exchange_el.find('.directions').attr('data-lat', exchange.latitude);
        exchange_el.find('.directions').attr('data-lng', exchange.longitude);
        exchange_el.find('.best_at').html(' ');
        exchange_el.find('.best_at').addClass(exchange.best_at);
        if (exchange.best_at == 'best') exchange_el.find('.exchange_icon').css('display', 'block');

        exchange_el.find('.base_rate').html(exchange.base_rate);
        exchange_sum.attr('data-best-at', exchange.best_at);

        /*
         exchange_sum.find('[data-exchangeid]').attr('data-exchangeid', exchange.id);
         exchange_sum.find('[data-href-id]').attr('data-href-id', exchange.id);
         exchange_sum.find('[data-exchange-name]').attr('data-exchange-name', exchange.name);
         */
        exchange_sum.find('.subject_to_change').html(exchange.real_rates ? '' : 'This rate is subject to change and is regularly updated by our staff');
        /*
         var delivery_icon = exchange_sum.find('.service_type_icon.delivery');
         exchange.delivery_tracking ? delivery_icon.show() : delivery_icon.hide();
         */
        exchange_sum.find('.service_type').html(exchange.service_type);

//        exchange_sum.find('.you').html(exchange.pay_amount == exchange.edited_quote ? 'you pay' : 'you get');

        exchange_sum.appendTo(append_point);

    }


    clearExchanges = function () {
        console.log('clearExchanges');
        exchange_list_count = 0;
        list = value_of('list');
        if (list != 'more') $('#exchanges_list #best_exchanges').empty();
        $('#exchanges_list #exchanges_items').empty();
    };

    closeInfowindows = function () {
        for (var i = 0; i < markers.length; i++) {
            markers[i]['infowindow'].close();
        }
    };


    big_marker = function (id) {
        console.log('big_marker');
        if (!id) return;
        var exchange = findExchange(id);
        if (exchange.errors.length > 0) return;
        var exchange_html = exchange_el(exchange).det;
        var marker = findMarker(id);

        closeInfowindows();
        marker['infowindow'].setContent(exchange_html[0]);
        marker['infowindow'].open(map, marker);
        zoom_changed_by_user = false;
        map_center_changed = true;
        marker_highlighted = true;
    };

    function bindBehavior() {

        console.log('bindBehavior');

        // TODO: move to any of the .js files, with delegate, so no re-binding over again

/*
        $('body').on('click', '.directions', (function () {
            var $this = $(this);
            if ($this.data('delivery-tracking')) return;
            var from = new google.maps.LatLng(sessionStorage.location_lat, sessionStorage.location_lng);
            var to = new google.maps.LatLng($(this).attr('data-lat'), $(this).attr('data-lng'));
            var id = $this.attr('data-id');
            unhighlight(id);
            big_marker(id);
//            setTimeout(function(){ calcRoute(from, to) }, 500)
//            calcRoute(from, to);
        }));
*/


        // Open infowindows of markers that are within the map bounds. This is reactivated whenever user zooms out!
        // Comment if no infowindows should be opened by default, then use 'mouseover' event below to open them manually
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


        // TODO: Remove!
/*
        $('body').on('click', '.list-group-item [data-href-id]', (function () {
            alert('I am being used!')

            var $this = $(this);
            var delivery_tracking = $this.attr('data-delivery-tracking');
            if (delivery_tracking && delivery_tracking != 'null') return;

            var id = $this.attr('data-href-id');
            var exchange = findExchange(id);

            big_marker(id);
            map.panTo(new google.maps.LatLng(exchange.latitude, exchange.longitude));
//            map.panBy(-216,-90);

        }));
*/


        // This will fire when map has finished loading
        google.maps.event.addListenerOnce(map, 'idle', function(){

            // remove 'x's
            $('.gm-style-iw').next().css('display', 'none');

            // increase z-index of best markers
            setTimeout(function(){ forwardBestMarkers() }, 100);

        });

    }


    updateResults = function (exchanges) {

        console.log('updateResults');

        $('#loader_message').css('display', 'none');
        $('#exchange_params_change').collapse('hide');

        if (exchanges && exchanges.length) {

            var list = value_of('list');
            if (list && list != 'best' ) $('#exchanges_search_results').css('display', 'block');
            $('#exchanges_search_params span').css('display', 'inline');
            $('#exchanges_search_params span.change_link').html('change');
            $('#fetch_more').html('<a href=#>Show more</a>');

        } else {

            $('#exchanges_search_results').css('display', 'none');
            $('#exchanges_search_params span:not(.change_link').css('display', 'none');
            $('#exchanges_search_params span.change_link').html('change your search');
            $('#exchanges_list .more').css('display', 'block');
            $('#fetch_more').html('No results found in that area.');
        }

/*
        if (desktop) {
            var line = Math.min(exchanges.length, 4);
            var middleline = $('#exchanges_items .list-group-item:nth-child(' + line + ')');
            middleline.popover('show');
            setTimeout(function() {middleline.popover('hide')}, 5000);
        }
*/

/*
        $('#exchanges_search_params')[0].scrollIntoView();
        var myScroll = new IScroll('#exchanges_list');
        if (mobile) myScroll.scrollTo(0,70);
*/

    };


    // TODO: Update markers within the map boundaries only!
    updateMarkers = function (exchanges) {

        if (mobile) {
            return;
        }
        console.log('updateMarkers');

        clearMarkers();
        var length = exchanges.length;
        for (var i = 0; i < length; i++) {
            addMarker(exchanges[i]);
        }
        if (length == 1) {
            big_marker(exchanges[0].id)
        }

      };

    forwardBestMarkers = function() {

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

    addUserMarker = function(mappa) {
        if (mappa === undefined) mappa = map;
        var lat = value_of('location_lat') || value_of('user_lat');
        var lng = value_of('location_lng') || value_of('user_lng');
        if (!lat || !lng) return;

        var location_marker = new google.maps.Marker({
            position: new google.maps.LatLng(lat, lng),
            disableAutoPan: true,
            map: mappa,
            icon: '/pin.gif',
            draggable: true
        });

        location_marker.addListener('dragend', function(evt) {
            set('location_lat', evt.latLng.lat());
            set('location_lng', evt.latLng.lng());
            set('location_type', 'selected');

            search_exchanges();
        });
    }

    addMarker = function(exchange, mappa) {

        if (mappa === undefined) mappa = map;
        if (exchange.errors.length > 0) return;

         if (exchange.best_at == 'highest' || exchange.best_at == 'cheapest') {
             var icon = '/pricest.png'
         } else if (exchange.best_at == 'nearest') {
             var icon = '/nearest.png'
         } else if (exchange.best_at == 'best') {
             var icon = '/logo_no_text.png'
        } else {
            var icon = '/other1.png'
        }

        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(exchange.latitude, exchange.longitude),
            title: exchange.name,
            map: mappa,
            icon: icon,
            exchange_id: exchange.id,
            best_at: exchange.best_at
        });


        // associate the marker's infowindow by storing the infowindow object as a property of the marker

        var exchange_html = exchange_el(exchange);
        var exchange_window_sum = exchange_html.sum;
        var exchange_window_det = exchange_html.det;


        marker['infowindow'] = new google.maps.InfoWindow({
            content: exchange_window_sum[0],
            disableAutoPan: true
        });

        /*      // Uncomment if no infowindows should be opened by default, then this will open them manually
         google.maps.event.addListener(marker, 'mouseover', function() {
         this['infowindow'].setContent(exchange_window_sum[0]);
         this['infowindow'].open(map, this);
         });

         */
/*
        google.maps.event.addListener(marker, 'click', function () {
            closeInfowindows();
            this['infowindow'].setContent(exchange_window_det[0]);
            this['infowindow'].open(map, this);
            setPage('exchanges/' + exchange.id + '/deal');
        });
*/


        markers.push(marker);


    };

    function clearMarkers() {
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(null);
        }
        markers = [];
    }


    drawMap = function (latitude, longitude, exchanges) {

        console.log('drawMap');

        center = new google.maps.LatLng(latitude, longitude);
        var mapOptions = {
            center: center,
            zoom: map_initial_zoom,
            scaleControl: true

        };
        map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
        mapPan();
        addUserMarker();
        if (exchanges && exchanges.length > 0) {
            updateMarkers(exchanges);
        }
    };

    drawExchangeMap = function (exchange) {

        console.log('drawExchangeMap');

        center = new google.maps.LatLng(exchange.latitude, exchange.longitude);
        var mapOptions = {
            center: center,
            zoom: Number(map_initial_zoom) -2,
            scaleControl: true

        };
        exchangeMap = new google.maps.Map(document.getElementById('exchange_map'), mapOptions);
        addMarker(exchange, exchangeMap);
        google.maps.event.addListenerOnce(exchangeMap, 'idle', function(){
            var from = new google.maps.LatLng(sessionStorage.location_lat, sessionStorage.location_lng);
            var to = new google.maps.LatLng(exchange.latitude, exchange.longitude);
            calcRoute(from, to, exchangeMap);
        });
        $('#exchange_directions a').attr('href', directionsLink(exchange));
     };

    calcRoute = function(from, to, mappa) {

        if (mappa === undefined) mappa = map;
        console.log('mappa:')
        console.log(mappa)
        var request = {
            origin: from,
            destination: to,
            travelMode: google.maps.TravelMode.TRANSIT,
            unitSystem: google.maps.UnitSystem.METRIC
        };

        directionsService = new google.maps.DirectionsService();
        directionsDisplay = new google.maps.DirectionsRenderer();
        zoom_changed_by_user = false;

        directionsDisplay.setMap(mappa);
 //       directionsDisplay.setPanel(document.getElementById('directions-panel'));

        directionsService.route(request, function (response, status) {
            console.log('directionsService.route returned with status: ' + status);
            if (status == google.maps.DirectionsStatus.OK) {
                map_center_changed = true;
//                $('#directions-panel').css('display', 'block');
                directionsDisplay.setDirections(response);
                setTimeout(function(){ mappa.setZoom(15) }, 100);
                setTimeout(function(){ mapPan() }, 100);


            }
         });

    };

    $(document)
        .on('mouseenter', '.list-group-item', function () {
            var $this = $(this);
            highlight($this.attr('data-id'));
            $this.find('.list_icon').addClass('pulse');
        })
        .on('mouseleave', '.list-group-item', function () {
            var $this = $(this);
            unhighlight($this.attr('data-id'));
            $this.find('.list_icon').removeClass('pulse');
        })

});