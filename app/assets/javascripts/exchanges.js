$(document).ready(function() {
    
//if ($('body').hasClass('exchanges'))   {    


    updatePage = function(data) {

        console.log('updatePage');
        exchanges = data;

        drawMap(value_of('location_lat') || value_of('user_lat'), value_of('location_lng') || value_of('user_lng'), exchanges);

        clearExchanges();

        if (exchanges && exchanges.length > 0) {

            updateExchanges(exchanges);
            bindBehavior();
         }
        updateResults(exchanges);
        updateParamsDisplay();
        document.body.scrollTop = document.documentElement.scrollTop = 0;

    };
    


    updateExchanges = function(exchanges) {

        console.log('updateExchanges');

         for (var i = 0; i < exchanges.length; i++) {
            addExchange(exchanges[i], i);
        }
        
        $('.list-group-item').click(function() {
            $(this).next().toggleClass('in');
        });    
    }
    


    // TODO: Remove det, replace classes with data- attributes, do it in a loop over the data fields
    function addExchange(exchange, index) {
    
        var exchange_el =   $('.exchange_row.template').clone().removeClass('template');
        var exchange_sum =  exchange_el.find('.list-group-item');
        //var exchange_det =  exchange_el.find('.collapse');
        //var id = '#exchange_det_' + exchange.id;

        exchange_sum.attr('data-id', exchange.id);
        //exchange_det.attr('id', id);
        //exchange_det.attr('data-id', exchange.id);

        exchange_el.find('.distance').html(String(exchange.distance));
        exchange_el.find('.name').html(exchange.name);
        exchange_el.find('.quote').html(exchange.edited_quote);
        if (exchange.quote > 0) {
            exchange_el.find('.comparison').css('display', 'block');
            exchange_el.find('[data-field=gain_amount]').html(exchange.gain_amount);
        }
        exchange_el.find('.address').html(exchange.address);
        exchange_el.find('.open_today').html(exchange.open_today);
        exchange_el.find('.open_today').attr('href', exchange.website ? exchange.website : "#");
        exchange_el.find('.phone').attr('href', exchange.phone ? 'tel:+44' + exchange.phone.substring(1) : "#");
        exchange_el.find('.website').attr('href', exchange.website);
        exchange_el.find('.directions').attr('data-lat', exchange.latitude); 
        exchange_el.find('.directions').attr('data-lng', exchange.longitude);


        exchange_sum.find('[data-exchangeid]').attr('data-exchangeid', exchange.id);
        exchange_sum.find('[data-href-id]').attr('data-href-id', exchange.id);
        exchange_sum.find('[data-exchange-name]').attr('data-exchange-name', exchange.name);


        exchange_sum.appendTo('#exchanges_list .list-group #exchanges_items');
        //exchange_det.appendTo('#exchanges_list .list-group #exchanges_items');
    }
    

    
    clearExchanges = function() {
        console.log('clearExchanges');
        $('#exchanges_list #exchanges_items').empty();
    };
    

    // TODO: Delegate, don't call after each ajax return
    function bindBehavior() {

        // TODO: move to any of the .js files, with delegate, so no re-binding over again

         $('.directions').click(function() {
            var from    =  new google.maps.LatLng(sessionStorage.location_lat, sessionStorage.location_lng);
            var to      =  new google.maps.LatLng($(this).attr('data-lat'), $(this).attr('data-lng'));
            calcRoute(from, to);
            return false;
        });
    }
    

    function updateResults(exchanges) {

        console.log('updateResults');

        $('#loader_message').css('display', 'none');
         if (exchanges && exchanges.length) {
            $('#empty_message').css('display', 'none');
            $('#result_message').css('display', 'block');
            $('#exchanges_count').html(exchanges.length);
            $('#sort_order').html(display(sessionStorage.sort));
        } else {
            $('#result_message').css('display', 'none');
            $('#empty_message').css('display', 'block');
            $('#empty_location').html(sessionStorage.location);
        }
    }
    

    function updateParamsDisplay() {

        console.log('updateParamsDisplay');

        $('#buy_amount_display').html(sessionStorage.edited_buy_amount);
        $('#searched_location_display').html('in ' + sessionStorage.location);
    }
    

 
 
    // TODO: Update markers within the map boundaries only!
    function updateMarkers(exchanges) {
        
        console.log('updateMarkers');


        if (mobile) {return;}
        
        clearMarkers();
        for (var i = 0; i < Math.min(exchanges.length, 30); i++) {
            addMarker(exchanges[i]);
        }
    }

    function addUserMarker() {
        var lat = value_of('location_lat') || value_of('user_lat');
        var lng = value_of('location_lng') || value_of('user_lng');
        if (!lat || !lng) return;

        var location_marker = new google.maps.Marker({
            position: new google.maps.LatLng(lat, lng),
            disableAutoPan: true,
            map: map,
            icon: '/male.png',
            draggable:true
        });
    }

    function addMarker(exchange) {

        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(exchange.latitude, exchange.longitude),
            disableAutoPan: true,
            title: exchange.name,
            map: map,
            icon: '/logo32.png'
        });
        
        var infowindow;
        var exchange_window_el;
        
        if (exchange.edited_quote) {
            exchange_window_el =   $('.exchange_window.template').clone().removeClass('template');
            exchange_window_el.find('.exchange_window_quote').html(exchange.edited_quote);
            exchange_window_el.find('.exchange_window_name').html(exchange.name);
            exchange_window_el.find('.exchange_window_address').html(exchange.address);
            exchange_window_el.find('.exchange_window_open').html(exchange.todays_hours);
            exchange_window_el.attr('id', 'exchange_window_' + exchange.id);
            
            infowindow = new google.maps.InfoWindow({
                content: exchange_window_el.html() 
            });
            infowindow.open(map,marker);
        }
        
        markers.push(marker);
        infowindows.push(infowindow);
        
        // when any infoWindow is clicked, make the respective row active
        var id = "#exchange_det_" + String(exchange.id);    
        google.maps.event.addListener(marker, 'click', function() {
           $('.list-group-item[href="0"]'.replace("0", id)).toggleClass('active');
        });
    


        // TODO: Delegate, don't call for each marker
        // TODO: To find the marker, search the markers array using the data-id
        // when any row is clicked, pan to respective infoWindow and show details
        console.log($('.list-group-item[data-id=' + exchange.id + ']'));
/*
        if (exchange_window_el) {
        google.maps.event.addDomListener($('.list-group-item[data-id=' + exchange.id + ']')[0], 'click', function() {

                $('.exchange_window_det').css('display', 'none');
                $('.exchange_window_sum').css('display', 'block');
                exchange_window_el.find('.exchange_window_sum').css('display', 'none');
                //exchange_window_el.find('.exchange_window_det').css('display', 'block');
                //exchange_window_el.find('.exchange_window_det').addClass('in');
                infowindow.setContent(exchange_window_el.html());
                infowindow.setZIndex(2000);
    //            $('.exchange_window_det.in').parent().parent().parent().parent().children().css('background', "yellow");

                map.panTo(new google.maps.LatLng(exchange.latitude, exchange.longitude));

             });
       }
*/
    }
    
    function clearMarkers() {
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(null);
        }
        markers = [];
        infowindows = [];
    }
    


    drawMap = function (latitude, longitude, exchanges) {

        if (mobile) {return;}
        console.log('drawMap');

        center = new google.maps.LatLng(latitude, longitude);
        var mapOptions = {
            center: center,
            zoom: 17
        };
        map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
        addUserMarker();
        if (exchanges && exchanges.length > 0) {
            updateMarkers(exchanges);
        }

    };
    
    function calcRoute(from, to) {

      var request = {
          origin: from,
          destination: to,
          travelMode: google.maps.TravelMode.WALKING,
          unitSystem: google.maps.UnitSystem.METRIC
      };

      var directionsService = new google.maps.DirectionsService();
      var directionsDisplay = new google.maps.DirectionsRenderer();

      directionsDisplay.setMap(map);

      directionsService.route(request, function(response, status) {
        console.log('directionsService.route returned with status: ' + status);
        if (status == google.maps.DirectionsStatus.OK) {
          directionsDisplay.setDirections(response);
        }
      });

    }
  

     // Before actions

    startLoader = function() {
        $('#empty_message').css('display', 'none');
        $('#result_message').css('display', 'none');
        $('#loader_message').css('display', 'block');        
    };
    
    beforeSubmit = function() {

        startLoader();
    };


    
});