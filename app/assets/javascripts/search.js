//
// Search params, search form fields and the impact of their changes
//
// Prefix input elements with the respective selected currency

    set = function(field, value, excluded) {
        if (excluded === undefined) excluded = '';
        var elements = '[data-field=' + field + ']';
        var value_clean = value ? value.replace(/\D/g,'') : null;

        if (field =='buy_amount' || field == "pay_amount") {
            sessionStorage.setItem(field, value_clean);
            $('.simple_form ' + '#search_' + field + '_val').val(value_clean);   // Ugly hack for autocomplete sending _val values to server
        }  else {
            sessionStorage.setItem(field, value);
        }

        if (value === 'null' ) value = '';

        $(elements).each(function() {
            var $this = $(this);
            if (!$this.is(excluded)) {
                if ($this.is('input, select')) {
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

            var $this = $(this);
            if ($this.is('select')) return;
            var changed_el = $this;
            var value = $this.val();

            set(field, value, changed_el);
            if (field=='location') set('location_short', value, changed_el);
        })
    }


$(document).ready(function() {

    console.log('search');


    //Default and per-page values

    sessionStorage.page         = window.location.hostname;
    sessionStorage.rest         = window.location.hash;

    sessionStorage.pay_currency = sessionStorage.pay_currency || 'GBP';
    sessionStorage.buy_currency = sessionStorage.buy_currency || 'EUR';
    sessionStorage.sort         = sessionStorage.sort || 'quote';

    // Restore session state

    $('#homepage form [data-field]').each(function() {

        var field = $(this).data('field');
        var value = sessionStorage.getItem(field);

        set(field, value);

    });

    // Binding

    $('#homepage form input').each(function() {
        var field = $(this).data('field');
        bind(field, 'keyup');
    });


/*  // select changes (=currency changes) are handled by autonumeric below
    $('#homepage form select').each(function() {
        var field = $(this).data('field');
        bind(field, 'change');
    });
*/
    // Currencies: initial settings & change events
    var bind_currency_to_autonumeric = function() {

        $('[data-autonumeric]').autoNumeric('init');

        $('[data-autonumeric]').each(function() {
            update_currency_symbol($(this));
        });

        $('.currency_select').change(function() {
            var $this   = $(this);
            var field   = $this.data('field');
            var value   = $this.val();
            var target  = $this.data('symboltarget');
            var symbol  = $this.find('option:selected').attr('data-symbol');

            set(field, value, $this);

            $('[data-field=' + target + ']').each(function() {
                update_currency_symbol($(this), symbol);
            })
        });

        function update_currency_symbol(el, symbol) {
            if (symbol === undefined) {
                currency_select_el = $('#' + el.attr('data-symbolsource'));
                symbol = currency_select_el.find('option:selected').attr('data-symbol');
            }
            el.attr('data-a-sign', symbol);
            el.autoNumeric('update', {aSign: symbol});
        }

    };

    bind_currency_to_autonumeric();

    // fix autoNumeric placing "0.00" instead of null
    function fix(field) {
        if (sessionStorage.getItem(field) == '') {
            sessionStorage.setItem(field, null);
            set(field, null)
        }
    }
    fix('pay_amount');
    fix('buy_amount');


    $('#search_buy_amount').click(function() {
        set('pay_amount', null)
    });
    $('#search_pay_amount').click(function() {
        set('buy_amount', null)
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

            if (!$('body').hasClass('homepage')) $('#new_search').submit();

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

    $('input[data-field=location]').click(function() {
        $(this).val('');
    })




    // Sorting

   sort_ui = function(sort) {

        console.log('sort_ui');

        $('#sort_switch').bootstrapSwitch('state', sort == 'quote', true);
        $('.sorted_by').each(function() {
            $this = $(this);
            if ($this.data('sort')== sort) {$this.addClass('active')} else {$this.removeClass('active')}
        })
    };

    sort_by = function(sort) {

        console.log('sort_by ' + sort);

        sort_ui(sort);

        sessionStorage.sort = sort;

        if (exchanges.length == 0) return;

        if (sort == 'distance') {
            if (exchanges_by_distance.length > 0) {
                exchanges = exchanges_by_distance
            } else {
                exchanges_by_distance = exchanges.sort(function(a, b){return a.distance-b.distance;}).slice(0);
            }
        }
        else if (sort == 'quote') {
            if (exchanges_by_quote.length > 0) {
                exchanges = exchanges_by_quote
            } else {
                exchanges_by_quote = exchanges.sort(function(a, b){return (a.quote ? a.quote : 10000000)-(b.quote ? b.quote : 10000000)}).slice(0);
            }
        }
        clearExchanges();
        updateExchanges(exchanges);
    };


    $('.make-switch').bootstrapSwitch();

    $('#sort_switch').on('switchChange.bootstrapSwitch', function(event, state) {
        sort_by(state ? 'quote' : 'distance');
    });

    $('.sorted_by').click(function() {
         sort_by($(this).data('sort'));
    });

    sort_ui(sessionStorage.sort);


    // UI

    // open parameters collapsed form in desktops only
    var mq = window.matchMedia('(min-width: 768px)');
    if(mq.matches) {
        $('.parameters .collapse').addClass('in');
    } else {
        // the width of browser is less then 700px
    }

    // Fix google autocomplete z-index dynamically
    $('[data-field=location]').keypress(function() {
        if (!pacContainerInitialized) {
            $('.pac-container').css('z-index',
                '9999');
            pacContainerInitialized = true;
        }
    });



}); 