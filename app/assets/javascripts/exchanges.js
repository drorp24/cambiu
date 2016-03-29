//
//  E X C H A N G E S
//
//  Uses the exchanges buffer returned by search form callback to update all markup



    updatePage = function(data) {

        console.log('updatePage');

        best_exchanges = data['best'];
        exchanges = data['more'];

        if (exchanges && exchanges.length > 0) {

            updateExchanges();
            updateMarkers(exchanges);

            var exchange_id = urlId();
            if (exchange_id) {   // Refresh of *specific exchange page* even in search requires model_populate like in exchange mode
                var exchange = findExchange(exchange_id);
                if (exchange) model_populate('exchange', exchange);
            }

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

        exchange_sum.attr('data-exchange-id', exchange.id);
        exchange_sum.attr('data-exchange-name', exchange.name);
        exchange_sum.attr('data-service-type', exchange.service_type);

        exchange_el.find('.distance').html((exchange.distance * 1000).toFixed(0));
        exchange_el.find('.name').html(exchange.name_s);
        exchange_el.find('.quote').html(exchange.edited_quote);
        exchange_el.find('.quote_currency').html(exchange.quote_currency);
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

        exchange_sum.find('.subject_to_change').html(exchange.real_rates ? '' : 'This rate is subject to change and is regularly updated by our staff');
        exchange_sum.find('.service_type').html(exchange.service_type);

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

        setTimeout(function() {
            if(window.pageYOffset !== 0) return;
            window.scrollTo(0, window.pageYOffset + 1);

        }, 1000);


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



    function addMarker(exchange) {

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
            map: map,
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


    }

    function clearMarkers() {
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(null);
        }
        markers = [];
    }

