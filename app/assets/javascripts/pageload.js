var media = window.matchMedia('(max-width: 767px)').matches ? 'mobile' : 'desktop';
var mobile = media == 'mobile';
var desktop = media == 'desktop';
var production = $('body').hasClass('production');
var params;
var pacContainerInitialized = false;


var display = function(term) {
    switch (term) {
        case 'quote':
            return 'best prices first:';
        case 'distance':
            return 'nearest first:';
    }
};        

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}


// Prefix input elements with the respective selected currency 
var bind_currency_to_autonumeric = function() {
  
    update_currency_symbol();

    $('.currency_select').change(function() {
        update_currency_symbol();
    });

    function update_currency_symbol() {
        $('[data-autonumeric]').autoNumeric('update', {aSign: $('.currency_select').find('option:selected').attr('data-symbol')}); 
    }

};

$(document).ready(function() {
    
    console.log('pageload');
    
//    mixpanel.track("Page view");
    

    // Parameters & Form
    // 
    // Retrieve parameters from form or url and put in params objects
    // If not in form then update form
    

    // Populate location and form decoding fields first
    getLocation();
    
    $('#actual_pay_amount').val($('#pay_amount_val').val());
    $('#pay_amount').change(function() {
        $('#actual_pay_amount').val($('#pay_amount_val').val());
    });
    
    $('#searched_location').val($('#location_search').val() || $('#geocoded_location').val() || 'this area');
    $('#geocoded_location').change(function() {
        $('#searched_location').val(searched_location);
    });
    if ($('#sort').val()) {var sort = $('#sort').val();} else {var sort = 'quote';}; // if sort added to home page. exchanges page has its own trigger.    
    $('#sort').val(sort);
    $('#sort_switch').bootstrapSwitch('state', sort == 'quote');
    $('#sort_switch').on('switchChange.bootstrapSwitch', function(event, state) {
        val = state ? 'quote' : 'distance';
        $('#sort').val(val);
    });
 
    var pay_amount =            $('#actual_pay_amount').val() ||    getParameterByName('actual_pay_amount');
    var edited_pay_amount =     $('#pay_amount').val().replace(/\s+/g, '') ||           getParameterByName('pay_amount').replace(/\s+/g, '');
    var pay_currency =          $('#pay_currency').val() ||         getParameterByName('pay_currency');
    var buy_currency =          $('#buy_currency').val() ||         getParameterByName('buy_currency');
    var latitude =              $('#latitude').val() ||             getParameterByName('latitude') || sessionStorage.latitude;
    var longitude =             $('#longitude').val() ||            getParameterByName('longitude') || sessionStorage.longitude;
    var geocoded_location =     $('#geocoded_location').val() ||    getParameterByName('geocoded_location') || sessionStorage.geocoded_location;
    var location_search =       $('#location_search').val() ||      getParameterByName('location_search');
    var searched_location =     $('#searched_location').val() ||    getParameterByName('searched_location');
    var distance =              $('distance').val() ||              getParameterByName('distance') || 'quote';
    var sort =                  $('#sort').val() ||                 getParameterByName('sort');      
    var landing =               $('#landing').val() ||              getParameterByName('landing');      
    
    

    params = {
        pay_amount:         pay_amount,
        edited_pay_amount:  edited_pay_amount,
        pay_currency:       pay_currency,
        buy_currency:       buy_currency,
        latitude:           latitude,
        longitude:          longitude,
        geocoded_location:  production ? geocoded_location : "London Soho",
        location_search:    location_search,
        searched_location:  location_search || geocoded_location || 'this area',
        distance:           distance,
        sort:               sort,
        landing:            landing,
        test_lat:           51.50169,
        test_lng:           -0.16030
        
    };

    // Form
    // Init values (first entry into page)
    
    if (!$('#pay_amount').val()) {
        $('#pay_amount').val(params.edited_pay_amount);
        $('#pay_amount_val').val(params.pay_amount);
        $('#actual_pay_amount').val(params.pay_amount);
        $('#pay_currency').val(params.pay_currency);
        $('#buy_currency').val(params.buy_currency);
        $('#latitude').val(params.latitude);
        $('#longitude').val(params.longitude);
        $('#geocoded_location').val(params.geocoded_location);
        $('#location_search').val(params.location_search);
        $('#searched_location').val(params.searched_location);
        $('#distance').val(params.distance);
        $('#sort').val(params.sort);
        $('#landing').val(params.landing);
    }
    
    // for tests only:
    
    $('#latitude').val(params.test_lat);
    $('#longitude').val(params.test_lng);

    bind_currency_to_autonumeric();
    
    // Fix google autocomplete z-index dynamically
    $('.location.search').keypress(function() {
        if (!pacContainerInitialized) {
        $('.pac-container').css('z-index', 
        '9999');
        pacContainerInitialized = true;
        }
    });
    
    // Initialize bootstrap-switch
    $('.make-switch').bootstrapSwitch();    


    // Google maps invoked from client so needs to read url params
    function getParameterByName(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }


    // hide address bar - not working
    window.addEventListener("load",function() {
    // Set a timeout...
    setTimeout(function(){
        // Hide the address bar!
        window.scrollTo(0, 1);
    }, 0);
    });


});