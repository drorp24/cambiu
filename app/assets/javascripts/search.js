//
// Search params, search form fields and the impact of their changes
//

    function set(field, value, excluded) {
        if (excluded === undefined) excluded = '';
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

            set(field, value, changed_el);
            if (field=='location') set('location_short', value, changed_el);
        })
    }


$(document).ready(function() {

    console.log('search');


    //Default and per-page values

    sessionStorage.pay_currency = sessionStorage.pay_currency || "GBP";
    sessionStorage.buy_currency = sessionStorage.buy_currency || "EUR";
    sessionStorage.page = window.location.hostname;
    sessionStorage.rest = window.location.hash;


    // Restore session state

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


    // Binding

    $('#homepage form input').each(function() {
        var field = $(this).data('field');
        bind(field, 'keyup');
    });

    $('#homepage form select').each(function() {
        var field = $(this).data('field');
        bind(field, 'change');
    });

    bind_currency_to_autonumeric();

    $('#search_buy_amount').click(function() {
        set('pay_amount', '')
    });
    $('#search_pay_amount').click(function() {
        set('buy_amount', '')
    });

    $('#search_location').click(function() {
        $('#search_location').attr('placeholder', 'Look for deals in...');
    });

    $('.open_search').click(function() {
        $('#exchange_params_change').collapse('show')
    });

    // Enable location search - Google maps places autocomplete

    function searchbox_addListener(searchBox) {
        google.maps.event.addListener(searchBox, 'places_changed', function () {
            var places = searchBox.getPlaces();
            if (places.length == 0) {return;}
            place = places[0];
            set('location', place.formatted_address);
            set('location_short', place.name);

            $('#new_search').submit()

/*          TODO: Remove.
            if (window.location.hash == '#exchanges') {
                if (!place.geometry) {
                    alert('We have an issue with this location. Please try a different one');
                    return;
                }
                place = place.geometry.location;
                drawMap(null, place.lat(), place.lng());
            }
*/
        });
    }

    $('input[data-field=location]').each(function() {
        input = $(this).get(0);
        searchBox = new google.maps.places.SearchBox(input, {
            types: ['regions']
        });
        searchbox_addListener(searchBox);
    });

    // UI

    // open parameters collapsed form in desktops only
    var mq = window.matchMedia('(min-width: 768px)');
    if(mq.matches) {
        $('.parameters .collapse').addClass('in');
    } else {
        // the width of browser is less then 700px
    }


    // sort bootstrapSwitch and results banner
    var sort = sessionStorage.sort
    $('#sort_switch').bootstrapSwitch('state', sort == 'quote');
    el = sort == 'quote' ? '.sorted_by.bestprice' : '.sorted_by.nearest';
    $(el).addClass('active');


    // Fix google autocomplete z-index dynamically
    $('[data-field=location]').keypress(function() {
        if (!pacContainerInitialized) {
        $('.pac-container').css('z-index', 
        '9999');
        pacContainerInitialized = true;
        }
    });

    // Initialize bootstrap-switch
    $('.make-switch').bootstrapSwitch();    



     
}); 