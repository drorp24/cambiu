//
// Search params, search form fields and the impact of their changes
//
$(document).ready(function() {
    
    console.log('search');
    
    // Enble location search - Google maps places autocomplete
    // TODO: Same for the search_form on the search page
    var input = document.getElementById('search_location');
    searchBox = new google.maps.places.SearchBox(input, {
        types: ['regions']
    });


    // Populate search_form

    $('#search_location').attr('placeholder', sessionStorage.user_location);
    $('#search_user_location').val(sessionStorage.user_location);
    $('#search_user_lat').val(sessionStorage.user_lat);
    $('#search_user_lng').val(sessionStorage.user_lng);
    $('#search_page').val(window.location.host + window.location.pathname);



    // behavior

   $('#search_buy_amount').keyup(function() {
       $('#search_pay_amount').val("");
   }); 
   $('#search_pay_amount').keyup(function() {
       $('#search_buy_amount').val("");
   }); 
   
   $('#search_location').click(function() {
       $('#search_location').attr('placeholder', 'Look for deals in...');
   });

    // UI
    if ($('#sort').val()) {var sort = $('#sort').val();} else {var sort = 'quote';}; // if sort added to home page. exchanges page has its own trigger.    
    $('#sort').val(sort);
    $('#sort_switch').bootstrapSwitch('state', sort == 'quote');
    $('#sort_switch').on('switchChange.bootstrapSwitch', function(event, state) {
        val = state ? 'quote' : 'distance';
        $('#sort').val(val);
    });

    // Fix google autocomplete z-index dynamically
    $('#search_location').keypress(function() {
        if (!pacContainerInitialized) {
        $('.pac-container').css('z-index', 
        '9999');
        pacContainerInitialized = true;
        }
    });
    
    // Initialize bootstrap-switch
    $('.make-switch').bootstrapSwitch();    










// OLD CODE - SOME STILL NEEDED
/*

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


*/ 
 
     
}); 