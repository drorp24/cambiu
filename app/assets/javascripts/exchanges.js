    // Global, session variables
    var map;
    var markers = [];
    var exchanges = [];
    var exchanges_array = [];
    var exchanges_by_quote = [];
    var exchanges_by_distance = []; 


$(document).ready(function() {

   // new ajax search
    $('#search_form').ajaxForm({ 
            dataType:   'json', 
        beforeSubmit:   beforeSubmit,
             success:   updatePage 
    });
    
    function beforeSubmit() {
        $('#empty_message').css('display', 'none');
        $('#result_message').css('display', 'none');
        $('#loader_message').css('display', 'block');
    } 


    // new page
    google.maps.event.addDomListener(window, 'load', initialize);        

    function initialize() {
        
        if (desktop) {
            draw_map(params().latitude, params().longitude);
        }
    
        $('#search_form').submit();     
    }
          
    function draw_map(latitude, longitude) {
        var mapOptions = {
            center: new google.maps.LatLng(null, null),
            zoom: 12
        };      
        map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);    
    }    

    function updatePage(exchanges) {
        if (desktop) {updateMarkers(exchanges);};
        updateExchanges(exchanges);
        updateResults(exchanges);
        updateParamsDisplay();
        exchanges_array = exchanges;
    }   
    
    function updateMarkers(exchanges) {
      clearMarkers();
      for (var i = 0; i < Math.min(exchanges.length, 30); i++) {
          addMarker(exchanges[i]);
      }
    }
    
    function addMarker(exchange) {
        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(exchange.latitude, exchange.longitude),
            title: exchange.name,
            map: map,
            icon: '/icon.png',
    //          animation: google.maps.Animation.DROP,
            zIndex: exchange.id // holds the exchange id 
        });
        
        if (exchange.quote) {
            var infowindow = new google.maps.InfoWindow({
                content: String(exchange.edited_quote)
            });
            infowindow.open(map,marker);
        }
        
        markers.push(marker);
        
        var id = "#exchange_det_" + String(exchange.id);    
        google.maps.event.addListener(marker, 'click', function() {
            $('.list-group-item[href="0"]'.replace("0", id)).addClass('active');
        });
    
    
    /*
            google.maps.event.addDomListener(document.querySelector('.list-group-item[href="0"]'.replace("0", id)), 'click', function() {
                var infowindow = new google.maps.InfoWindow({
                    content: String(exchange.name)
                });
                infowindow.open(map,marker);
            });
    */
    }
    
    function clearMarkers() {
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(null);
        }
        markers = [];
    }
    
    
    function addExchange(exchange, index) {
    
        var exchange_el =   $('.template').clone().removeClass('template');
        var exchange_sum =  exchange_el.find('.list-group-item');
        var exchange_det =  exchange_el.find('.collapse');
        var id = '#exchange_det_' + exchange.id;
    
        exchange_sum.attr('href', id);
        exchange_det.attr('id', id);
        
        exchange_sum.html(exchange.name + ' Distance: ' + String(exchange.distance) + ' Quote: ' + String(exchange.quote));
        exchange_det.find('.well').html(exchange.id);
        
        exchange_el.appendTo('#exchanges_list .list-group #exchanges_items');
        exchange_el.find('.list-group-item').unwrap();
        
    /*      
            exchange_el = $('.exchange_' + String(index));
            exchange_el.find('.badge').html(exchange.edited_quote);
            exchange_el.find('.name').html(exchange.name);
            exchange_el.find('.address').html(exchange.address);
            exchange_el.find('.open_today').html(exchange.open_today);
    //      place_photo(exchange);
            exchange_el.css('visibility', 'visible');
            exchange_el.show();
    */
    
    
    
    function place_photo(exchange) {
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
    
    }
    
    function clearExchanges() {
        $('#exchanges_list #exchanges_items').empty();
   }
    
    
    
    function updateExchanges(exchanges) {
        clearExchanges();
        for (var i = 0; i < exchanges.length; i++) {
            addExchange(exchanges[i], i);
        }
        
        $('.list-group-item').click(function() {
            $(this).next().toggleClass('in');
        });
    
    //      $('.collapse').collapse()       
    }
    


    function updateResults(exchanges) {
        results = exchanges.length;
        $('#loader_message').css('display', 'none');
        if (results > 0) {
            $('#empty_message').css('display', 'none');
            $('#result_message').css('display', 'block');
            $('#exchanges_count').html(results);
            $('#sort_order').html(display(params().sort));            
        } else {
            $('#result_message').css('display', 'none');
            $('#empty_message').css('display', 'block');
            location_search = params().location_search;
            location_search ? location_search : "this place";
            $('#empty_location').html(location_search);
        }
    }
    

    function updateParamsDisplay() {
        $('#pay_amount_display').html(params().edited_pay_amount);
        $('#buy_currency_display').html('to ' + params().buy_currency);
        $('#searched_location_display').html(params().searched_location == 'Nearby' ? 'Nearby' : ' in ' + params().searched_location);
    }
    

    // Update sort param and client-sort when changed   
    $('#sort_switch').on('switchChange.bootstrapSwitch', function(event, state) {
        val = state ? 'quote' : 'distance';
        $('#sort').val(val);
        $('#sort_order').html(display(val));
        sort_by(val);
    });
    
   function sort_by(order) {
       if (order == 'distance') {
         exchanges_array = 
         exchanges_by_distance.length > 0 ? exchanges_by_distance : exchanges_array.sort(function(a, b){return a.distance-b.distance;});  
        }
        else if (order == 'quote') {
         exchanges_array = 
         exchanges_by_quote.length > 0 ? exchanges_by_quote : exchanges_array.sort(function(a, b){return (a.quote ? a.quote : 10000000)-(b.quote ? b.quote : 10000000);});            
        }
        updateExchanges(exchanges_array); // TODO: replace with updatePage
    }    

 
    // pay_amount change
    $('#pay_amount').change(function() {
        $('#pay_amount_display').html($(this).val());
    });
 
    // pay_currency change
    $('#pay_currency').change(function() {
        $('#pay_amount_display').html($('#pay_amount').val());
        $('#pay_currency_display').html($(this).val());
    });
    
    // buy_currency change
    $('#buy_currency').change(function() {
        $('#buy_currency_display').html('to ' + $(this).val());
    });
    
    // location change
    $('.location').change(function() {
        var location_search = $('#location_search').val();
        var latitude = $('#latitude').val();
        var longitude = $('#longitude').val();
        var val = location_search ? location_search : ((latitude && longitude) ? "Nearest" : "London");
         $('#searched_location').val(val);
         $('#searched_location_display').html(val == 'Nearest' ? val : 'in ' + val);
    });

    
    // Google maps places autocomplete
    var input = document.getElementById('location_search');
    var searchBox = new google.maps.places.SearchBox(input, {
        types: ['regions']
    });
    
    // change map center according to searched location 
    google.maps.event.addListener(searchBox, 'places_changed', function() {
        
        var places = searchBox.getPlaces();
        if (places.length == 0) {return;}        
        place = places[0];       
        if (!place.geometry) {alert('no geometry'); return;}

        var mapOptions = {
            center: place.geometry.location,
            zoom: 12
        };      
        map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);    
    });
       
    
});