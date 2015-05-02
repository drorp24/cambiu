//
// Search params, search form fields and the impact of their changes
//


// Global functions

function set(field, value, excluded) {
    var elements = '[data-field=' + field + ']';

    sessionStorage.setItem(field, value);

    $(elements).each(function() {
        var $this = $(this);
        if (!$this.is(excluded)) {
            if ($this.is('select, input')) {
                $this.val(value);
            } else {
                $this.html(value);
            }
        }
    })
}

function bind(field, event) {
    var elements = '[data-field=' + field + ']';
    $(elements).on(event, function() {

        var changed_el = $(this);
        var value = $(this).val();

        set(field, value, changed_el)
    })
}


$(document).ready(function() {



    console.log('search');


    //Restore values from sessionStorage

    sessionStorage.pay_currency = sessionStorage.pay_currency || "GBP";
    sessionStorage.buy_currency = sessionStorage.buy_currency || "EUR";

    sessionStorage.page = window.location.hostname;
    sessionStorage.rest = window.location.hash;

    $('[data-field]').each(function() {

        var field = $(this).data('field');
        var value = sessionStorage.getItem(field);
        var $this = $(this);

        if ($this.is('input, select')) {
            $this.val(value);
        } else {
            $this.html(value);
        }
    });


    // Refresh user's current location

    $('input[data-field=user_location]').val(sessionStorage.user_location);
    $('span[data-field=user_location]').html(sessionStorage.user_location);
    $('[data-field=user_lat]').val(sessionStorage.user_lat);
    $('[data-field=user_lng]').val(sessionStorage.user_lng);

    $('[data-field=page]').val(sessionStorage.page);
    $('[data-field=rest]').val(sessionStorage.rest);



    // Binding


    $('#homepage form input').each(function() {
        var field = $(this).data('field');
        bind(field, 'keyup');
    });

    $('#homepage form select').each(function() {
        var field = $(this).data('field');
        bind(field, 'change');
    });



     // Behavior

    bind_currency_to_autonumeric();

    $('#search_buy_amount').click(function() {
        set('pay_amount', '', '')
    });
    $('#search_pay_amount').click(function() {
        set('buy_amount', '', '')
    });

    $('#search_location').click(function() {
        $('#search_location').attr('placeholder', 'Look for deals in...');
    });

    $('.open_search').click(function() {
        $('#exchange_params_change').collapse('show')
    });

    // Enble location search - Google maps places autocomplete
    // TODO: Same for the search_form on the search page
    var input = document.getElementById('search_location');
    searchBox = new google.maps.places.SearchBox(input, {
        types: ['regions']
    });



    // UI

    // open parameters collapsed form in desktops only
    var mq = window.matchMedia('(min-width: 768px)');
    if(mq.matches) {
        $('.parameters .collapse').addClass('in');
    } else {
        // the width of browser is less then 700px
    }


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