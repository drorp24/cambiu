$(document).ready(function() {
    
//if ($('body').hasClass('exchanges'))   {    


    var directionsService = new google.maps.DirectionsService();

    console.log('exchanges');


    function updatePage(data) {

        console.log('updatePage');
        exchanges = data;

        drawMap(sessionStorage.location, sessionStorage.user_lat, sessionStorage.user_lng, exchanges);
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
         var exchange_det =  exchange_el.find('.collapse');
        var id = '#exchange_det_' + exchange.id;
    
        exchange_sum.attr('href', id);
        exchange_det.attr('id', id);
        exchange_det.attr('data-id', exchange.id);
        
        exchange_el.find('.distance').html(String(exchange.distance));
        exchange_el.find('.name').html(exchange.name);
        exchange_el.find('.quote').html(exchange.pay_amount);
        if (exchange.quote > 0) {
            exchange_el.find('.comparison').css('display', 'block');
            exchange_el.find('.comparison-amount').html('€9.99');
        }
        exchange_el.find('.address').html(exchange.address);
        exchange_el.find('.open_today').html(exchange.open_today);
        exchange_el.find('.open_today').attr('href', exchange.website ? exchange.website : "#");
        exchange_el.find('.phone').attr('href', exchange.phone ? 'tel:+44' + exchange.phone.substring(1) : "#");
        exchange_el.find('.website').attr('href', exchange.website);
        exchange_el.find('.directions').attr('data-lat', exchange.latitude); 
        exchange_el.find('.directions').attr('data-lng', exchange.longitude);


        exchange_sum.find('[data-exchangeid]').attr('data-exchangeid', exchange.id);


        exchange_sum.appendTo('#exchanges_list .list-group #exchanges_items');
        exchange_det.appendTo('#exchanges_list .list-group #exchanges_items');        
    }
    

 
   function add_photo(exchange) {
        var request = {query: exchange.name + ' ' + exchange.address};
        
        var service = new google.maps.places.PlacesService(map);
        service.textSearch(request, gp_ts_callback);
        
        function gp_ts_callback(results, status) {
            console.log('gp_ts_callback');
            if (status == google.maps.places.PlacesServiceStatus.OK && results.length > 0) {
                          
                var place = results[0];
                var place_id = place.place_id;
                console.log("place_id: " + place_id);
                  
                var request = {placeId: place_id};
    //              service.getDetails(request, gp_pd_callback);
                  
                function gp_pd_callback(place, status) {
                    console.log('gp_pd_callback');
                    if (status == google.maps.places.PlacesServiceStatus.OK) {
                        if (place.photos.length > 0) {
                            photo_url = place.photos[0].getUrl();
                            console.log("photo_url: " + photo_url);
                            
                        }
                    }           
                }
            }
        }
    }
 
    
    clearExchanges = function() {
        console.log('clearExchanges');
        $('#exchanges_list #exchanges_items').empty();
    }
    

    function bindBehavior() {

        // TODO: move to any of the .js files, with delegate, to save re-binding every time search is made (ajax:success may not be delegatable)

         $('.directions').click(function() {
            var from =  production ? new google.maps.LatLng(sessionStorage.user_lat, sessionStorage.user_lng) : new google.maps.LatLng(sessionStorage.test_lat, sessionStorage.test_lng);
            var to =    new google.maps.LatLng($(this).attr('data-lat'), $(this).attr('data-lng'));
            calcRoute(from, to);
            return false;  
        });

        $('#exchanges').on('ajax:success', '#new_order', (function(evt, data, status, xhr) {
            order = data;
            // TODO: Change below to loop over '[data-model=order]'
            set('order_id', order.id)
            set('order_expiry', order.expiry)
       }))

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
    

 
 
    function updateMarkers(exchanges) {
        
        console.log('updateMarkers');


        if (mobile) {return;}
        
        clearMarkers();
        for (var i = 0; i < Math.min(exchanges.length, 30); i++) {
            addMarker(exchanges[i]);
        }
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
    
   
        // when any row is clicked, pan to respective infoWindow and show details
        if (exchange_window_el) {
            google.maps.event.addDomListener(document.querySelector('.list-group-item[href="0"]'.replace("0", id)), 'click', function() {
     
                $('.exchange_window_det').css('display', 'none');
                $('.exchange_window_sum').css('display', 'block');
                exchange_window_el.find('.exchange_window_sum').css('display', 'none');
                exchange_window_el.find('.exchange_window_det').css('display', 'block');
                exchange_window_el.find('.exchange_window_det').addClass('in');
                infowindow.setContent(exchange_window_el.html());
                infowindow.setZIndex(2000);
    //            $('.exchange_window_det.in').parent().parent().parent().parent().children().css('background', "yellow");
                
                map.panTo(new google.maps.LatLng(exchange.latitude, exchange.longitude));
     
             });            
        }    

    }
    
    function clearMarkers() {
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(null);
        }
        markers = [];
        infowindows = [];
    }
    


    // Events & impacts
    //
    

    
    // TODO: Try again to DRY the code...
    drawMap = function (place, latitude, longitude, exchanges) {
 
 
        console.log('drawMap');
        console.log('place: ' + place);
        console.log('latitude: ' + String(latitude));
        console.log('longitude: ' + String(longitude));
        
        if (mobile) {return;}

        console.log('before directionsDisplay')
        directionsDisplay = new google.maps.DirectionsRenderer();
        console.log('after directionsDisplay')
        
        if (place) {
           geocoder = new google.maps.Geocoder();
           geocoder.geocode( { 'address': place}, function(results, status) {
              if (status == google.maps.GeocoderStatus.OK) {

                center = results[0].geometry.location;
                console.log('going by place. center: ' + center);
                var mapOptions = {
                    center: center,
                    zoom: 12
                };                      
                map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions); 
                console.log('map is set now')
              if (exchanges && exchanges.length > 0) {
                  updateMarkers(exchanges);
              }
                directionsDisplay.setMap(map);   
 
               } else {
                alert("Geocode was not successful for the following reason: " + status);
              }
            }); 

        } else if (latitude && longitude) {

            center = new google.maps.LatLng(latitude, longitude);
            var mapOptions = {
                center: center,
                zoom: 12
            };                  
            map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
            if (exchanges && exchanges.length > 0) {
                updateMarkers(exchanges);
            }
            directionsDisplay.setMap(map);

        } else {
 
           geocoder = new google.maps.Geocoder();
           geocoder.geocode( { 'address': 'London, UK'}, function(results, status) {
              if (status == google.maps.GeocoderStatus.OK) {
                center = results[0].geometry.location;
                var mapOptions = {
                    center: center,
                    zoom: 12
                };                      
                map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
                  if (exchanges && exchanges.length > 0) {
                      updateMarkers(exchanges);
                  }
                  directionsDisplay.setMap(map);
             } else {
                alert("Geocode was not successful for the following reason: " + status);
              }
            });             
        }
 
    }
    
    function calcRoute(from, to) {

      var request = {
          origin: from,
          destination: to,
          travelMode: google.maps.TravelMode.WALKING,
          region: "uk"
      };

      directionsService.route(request, function(response, status) {
          console.log(status);
        if (status == google.maps.DirectionsStatus.OK) {
          directionsDisplay.setDirections(response);
        }
      });

    }
  
    
    

     // Before actions

    function startLoader() {
        $('#empty_message').css('display', 'none');
        $('#result_message').css('display', 'none');
        $('#loader_message').css('display', 'block');        
    }
    
    function triggerGtm() {         
        dataLayer.push({
            'event': 'gtm.formSubmit'
        });        
    }

    function beforeSubmit() {

        console.log('beforeSubmit');
        
        startLoader();
        triggerGtm();
        changePage('#homepage', '#exchanges');

    };
 
   // Search form
    $('#new_search').ajaxForm({
        dataType:       'json',
        beforeSubmit:   beforeSubmit,
        success:        updatePage
    });


    // only after this point can #new_search submits be triggered
    // ajax search if #exchanges pages is refreshed or search_button is clicked

    if(window.location.hash) {
         $('#new_search').submit();
    }

    $('#search_button').click(function() {
        if (mobile) {$('#exchange_params_change').collapse('toggle');}
        $('#new_search').submit();
        return false;
    });


    
});