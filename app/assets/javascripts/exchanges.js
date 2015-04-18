$(document).ready(function() {
    
//if ($('body').hasClass('exchanges'))   {    

    // TODO: these global var won't survive the next page. Move to sessionStore.
    var map;
    var center;
    var geocoder;
    var directionsDisplay;
    var directionsService = new google.maps.DirectionsService();
    var markers = [];
    var exchanges = [];
    var exchanges_array = [];
    var exchanges_by_quote = [];
    var exchanges_by_distance = []; 


    console.log('exchanges');
        
    
    function beforeSubmit() {
        $('#empty_message').css('display', 'none');
        $('#result_message').css('display', 'none');
        $('#loader_message').css('display', 'block');
    } 

    function updatePage(exchanges) {
 
        clearExchanges();

        if (exchanges && exchanges.length > 0) {

            updateExchanges(exchanges);
            bindBehavior();
            updateMarkers(exchanges);
            exchanges_array = exchanges;           
        }
        updateResults(exchanges);
        updateParamsDisplay();
    }   
    

    // On page load only
    function initialize() {
        
        draw_map(params.location_search, params.latitude, params.longitude);
    
        $('#search_form').submit();     
    }
          


    // on search (triggered by formSubmit, whether programmatically at load time or by user)
    //
    // exchanges dynamic markup
 
    function updateExchanges(exchanges) {
         for (var i = 0; i < exchanges.length; i++) {
            addExchange(exchanges[i], i);
        }
        
        $('.list-group-item').click(function() {
            $(this).next().toggleClass('in');
        });    
    }
    

    //
    // Add Exchange
    // 
 
    function addExchange(exchange, index) {
    
        var exchange_el =   $('.exchange_row.template').clone().removeClass('template');
        var exchange_sum =  exchange_el.find('.list-group-item');
        var exchange_det =  exchange_el.find('.collapse');
        var id = '#exchange_det_' + exchange.id;
    
        exchange_sum.attr('href', id);
        exchange_det.attr('id', id);
        exchange_sum.attr('data-id', exchange.id);
        exchange_det.attr('data-id', exchange.id);
        
        exchange_el.find('.distance').html(String(exchange.distance.toFixed(2)));
        exchange_el.find('.name').html(exchange.name);
        exchange_el.find('.quote').html(exchange.edited_quote);
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
        

        exchange_sum.appendTo('#exchanges_list .list-group #exchanges_items');
        exchange_det.appendTo('#exchanges_list .list-group #exchanges_items');        
    }
    
    //
    // Add Exchange
    //   
 
 
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
 
    
    function clearExchanges() {
        $('#exchanges_list #exchanges_items').empty();
    }
    

    function bindBehavior() {
                
    // collapse
    //      $('.collapse').collapse()       
    
 
    // user save, email form submit - can happen only once in a session
        $('.email_submit').click(function() {
            $('#user_pay_amount').val(params.pay_amount);
            $('#user_pay_currency').val(params.pay_currency);
            $('#user_buy_currency').val(params.buy_currency);
            $('#user_latitude').val(params.latitude);
            $('#user_longitude').val(params.longitude);
            $('#user_location_search').val(params.location_search);
            $('#user_geocoded_location').val(params.geocoded_location);
            $('#new_user').submit();
            $('.email_request').css('display', 'none');
            $('.exchange_details').css('display', 'block');
        });
        
        $('.directions').click(function() {
            var from =  production ? new google.maps.LatLng(params.latitude, params.longitude) : new google.maps.LatLng(params.test_lat, params.test_lng);
            var to =    new google.maps.LatLng($(this).attr('data-lat'), $(this).attr('data-lng'));
            calcRoute(from, to);
            return false;  
        });        

    }
    

    function updateResults(exchanges) {
        $('#loader_message').css('display', 'none');
         if (exchanges && exchanges.length) {
            $('#empty_message').css('display', 'none');
            $('#result_message').css('display', 'block');
            $('#exchanges_count').html(exchanges.length);
            $('#sort_order').html(display(params.sort));            
        } else {
            $('#result_message').css('display', 'none');
            $('#empty_message').css('display', 'block');
            $('#empty_location').html(params.searched_location);
        }
    }
    

    function updateParamsDisplay() {
        $('#pay_amount_display').html(params.edited_pay_amount);
        $('#buy_currency_display').html('to ' + params.buy_currency);
        $('#searched_location_display').html('in ' + params.searched_location);
    }
    

 
 
    // Map markers & infowindows
    //
    function updateMarkers(exchanges) {
        
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
            icon: '/icon.png',
    //          animation: google.maps.Animation.DROP,
    //        zIndex: exchange.id // holds the exchange id 
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
    }
    


    // Events & impacts
    //
    
    // Update sort param and client-sort when changed   
    $('#sort_switch').on('switchChange.bootstrapSwitch', function(event, state) {
        val = state ? 'quote' : 'distance';
        $('#sort').val(val);
        $('#sort_order').html(display(val));
        params.sort = val;
        sort_by(val);
    });
    
    function sort_by(order) {
        if (order == 'distance') {
            if (exchanges_by_distance.length > 0) {
                exchanges_array = exchanges_by_distance
             } else {
                exchanges_by_distance = exchanges_array.sort(function(a, b){return a.distance-b.distance;});  
             }
        }
        else if (order == 'quote') {
            if (exchanges_by_quote.length > 0) {
                exchanges_array = exchanges_by_quote
             } else {
                exchanges_by_quote = exchanges_array.sort(function(a, b){return (a.quote ? a.quote : 10000000)-(b.quote ? b.quote : 10000000)});  
             }
        }
        clearExchanges();
        updateExchanges(exchanges_array); // TODO: replace with updatePage. TODO: store the div's as well and replace as needed.
    }    

 
    
    // Enble location search - Google maps places autocomplete
    var input = document.getElementById('location_search');
    var searchBox = new google.maps.places.SearchBox(input, {
        types: ['regions']
    });

    // change map center according to searched location 
    google.maps.event.addListener(searchBox, 'places_changed', function() {
        
        var places = searchBox.getPlaces();
        if (places.length == 0) {return;}        
        place = places[0]; 
        
//        clearExchanges();
      
        name = $('#location_search').val();
        if (name == null) {alert('null')} 
        if (name == "") {alert('spaces')}
        $('#searched_location').val(name);
        $('#searched_location_display').html(name);
        params.location_search = name;
        params.searched_location = name;

        if (!place.geometry) {alert('We have an issue with this location. Please try a different one'); return;}
        place = place.geometry.location;
        draw_map(null, place.lat(), place.lng());
        
    });
    
    $('#location_search').change(function() {
        if ($('#location_search').val == null) {
            alert('so this is null')
        }
    });
    
    
    // TODO: Try again to DRY the code...
    function draw_map(place, latitude, longitude) {
 
        if (mobile) {return;}
        console.log('drawing map...');        
        directionsDisplay = new google.maps.DirectionsRenderer();
        
        if (place) {
           geocoder = new google.maps.Geocoder();
           geocoder.geocode( { 'address': place}, function(results, status) {
              if (status == google.maps.GeocoderStatus.OK) {

                center = results[0].geometry.location;
                var mapOptions = {
                    center: center,
                    zoom: 12
                };                      
                map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions); 
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
  
    
    
        // new page
    google.maps.event.addDomListener(window, 'load', initialize);        


 
   // new ajax search
    $('#exchange_params_wrapper #search_form').ajaxForm({ 
            dataType:   'json', 
        beforeSubmit:   beforeSubmit,
             success:   updatePage 
    });


//}
    
});