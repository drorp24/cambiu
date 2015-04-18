//
// Search params, search form fields and the impact of their changes
//
$(document).ready(function() {
    
    console.log('search');

    $('#actual_pay_amount').val($('#pay_amount_val').val());
    $('#pay_amount').change(function() {
        $('#actual_pay_amount').val($('#pay_amount_val').val());
        $('#pay_amount_display').html($(this).val());
        params.edited_pay_amount = $(this).val;
        params.pay_amount = $('#pay_amount_val').val();
    });
    

    // pay_currency change
    $('#pay_currency').change(function() {
        $('#pay_amount_display').html($('#pay_amount').val());
        $('#pay_currency_display').html($(this).val());
        params.pay_currency = $(this).val();
    });
    
    // buy_currency change
    $('#buy_currency').change(function() {
        $('#buy_currency_display').html('to ' + $(this).val());
        params.buy_currency = $(this).val();
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
        latitude:           production ? latitude : 51.50169, 
        longitude:          production ? longitude : -0.16030,
        geocoded_location:  production ? geocoded_location : "London Soho",
        location_search:    location_search,
        searched_location:  location_search || geocoded_location || 'this area',
        distance:           distance,
        sort:               sort,
        landing:            landing,
        
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
    

    // UI

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

 
 
     function beforeSubmit() {
        $('#empty_message').css('display', 'none');
        $('#result_message').css('display', 'none');
        $('#loader_message').css('display', 'block');
    } 
 
    function reveal_exchanges() {
        $('#homepage').css('display', 'none');
        $('nav.navbar').removeClass('home');
        $('nav.navbar').addClass('exchanges');
        $('#exchanges').css('display', 'block');
        $('body').removeClass('home');
        $('body').addClass('exchanges');
        // push to html5 history;
    }

   // new ajax search
    $('#new_search').ajaxForm({ 
            dataType:   'json', 
        beforeSubmit:   beforeSubmit,
             success:   reveal_exchanges 
    });
  

     
}); 