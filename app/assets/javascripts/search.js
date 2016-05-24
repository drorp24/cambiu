//
// S E A R C H
//
// Maintain 2-way sync b/w sessionStorage and search form variable values (incl. initialization upon re/load and event handlers)
// Handle ajax calls
// Forms  UI

// Currencies: initial settings & change events
    bind_currency_to_autonumeric = function() {

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

            $('[data-autonumeric][data-field=' + target + ']').each(function() {
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

// TODO! If there's one single search form (and no order form), this is not needed
// TODO Even if there are 2 (one in homepage the other in the search pane) upon entry to search pane, the form there should be populated from the ss
// TODO Make 'set' only set the sessionStorage. It is called many times!
// populate a field's value in all relevant html tags and in sessionStorage
    set = function(field, value, excluded) {
        if (excluded === undefined) excluded = '';
        var elements = '[data-field=' + field + ']';

        if (field =='buy_amount' || field == "pay_amount") {
            var value_clean = value  ? String(value).replace(/[^0-9\.]+/g,"")  : null;
            sessionStorage.setItem(field, value_clean);
            $('#search_form ' + '#' + field + '_val').val(value_clean);   // Ugly hack for autoNumeric sending _val values to server
        }  else {
            sessionStorage.setItem(field, value);
        }


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
    };

// TODO: Remove!
    // bind an event handler to a field's all relevant html tags so that when either of them change, all the other tags change to match
    bind = function(field, event) {
        var elements = '[data-field=' + field + ']';
        $(elements).on(event, function() {

            var $this = $(this);
            if ($this.is('select')) return;
            var changed_el = $this;
            var value = $this.val();

            set(field, value, changed_el);
            if (field=='location') set('location_short', value, changed_el);
        })
    };

    // Sets all variables
// TODO: Restore session values from ss. That's its role. Not from the form
// TODO: Just go over the def values and use ss value if exists otherwise the def
// TODO: For instace, sort is no longer in the form (since FE sorts) so it never gets initialized here!
    set_variables = function(use_session) {

        console.log('set_variables');
        variables_set = true;
        if (use_session === undefined) use_session = true;

        $('.homesearch #search_form [data-field]').each(function() {

            var $this = $(this);
            var model = $this.data('model');
            var field = /*model ? model + '_' + $this.data('field') :*/ $this.data('field');

            var url_val = urlParameter(field);
            if (url_val) {
                var value = url_val;
             } else {
                var def_val = def(field);
                var value = (use_session ? value_of(field) || def_val : def_val);
                if (field == 'pay_amount') {value = use_session ? value_of('pay_amount') || (value_of('buy_amount') ? null : def_val) : def_val}
                if (field == 'buy_amount') {value = use_session ? value_of('buy_amount') || (value_of('pay_amount') ? null : def_val) : def_val}
            }

            set(field, value, '#order_id');

        });

       bind_currency_to_autonumeric();

        var value_of_sort = value_of('sort');
        var sort = value_of_sort ? value_of_sort : def('sort')
        set('sort', sort) // Templrary!!

    };

    set_default_location = function(excluded) {
        console.log('Since user location could not be found: setting the default location');
        set('location',         'London, UK');
        set('location_short',   'London');
        set('location_lat',     '51.51574678520366');
        set('location_lng',     '-0.16346305847173426');
        set('location_type',    'default');
    };



    search_exchanges = function() {
        console.log('After location found, set to default, changed by user, or page was reloaded:');
         if (!homepage()) {
            console.log('Not homepage: submitting form');
            $('#search_form').submit();
        } else {
            console.log('Homepage: not submitting form');
        }
    };




$(document).ready(function() {


    set_variables();

    // Binding

    $('#homepage form input').each(function() {
        var field = $(this).data('field');
        bind(field, 'keyup');
    });



    // fix autoNumeric placing "0.00" instead of null
    function fix(field) {
        if (sessionStorage.getItem(field) == '') {
            sessionStorage.setItem(field, null);
            set(field, null)
        }
    }
    fix('pay_amount');
    fix('buy_amount');

    $('#exchanges').on('click','.open_search', function(e) {
        $('#exchange_params_change').collapse('toggle')
    });


    // Location - all handled at findlocation.js

    // Sorting

    sort_by = function(sort) {

        console.log('sort by ' + sort);

        if (exchanges.length == 0) return;

        if (sort == 'distance') {
            exchanges.sort(function(a, b){return a.properties.distance-b.properties.distance;});
        }
        else if (sort == 'price') {
            exchanges.sort(function(a, b){return (a.properties.quote ? a.properties.quote : 10000000)-(b.properties.quote ? b.properties.quote : 10000000)});
            if (value_of('pay_amount') > 0) { exchanges.reverse()}
        }

        $('[data-sort]').removeClass('active');
        $('[data-sort=' + sort + ']').addClass('active');

        set('sort', sort);

        return exchanges;
     };

    $('[data-sort]').click(function() {

        var sort = $(this).data('sort');
        if (sort == value_of('sort')) {console.log('already sorted by ' + sort); return;}

        updateList(exchanges, 'more', sort);

    });


    // UI


    $('.camera').on('click tap', (function() {
        $('#photo').click()
    }));



    $('.getstarted_button').click(function(){
        if ($('#search_form').valid()) {
            console.log('getstarted button clicked: submitting search form')
            $('#search_form').submit();
        } else {
            $('#homepage input[data-field=buy_amount]').focus()
        }
    });



    $('[data-ajax=searches]').click(function(e) {
        e.preventDefault();
        if (mobile) $('#open_params').toggleClass('open');
        if ($('#search_form').valid()) {
            $('#search_form').submit();
            $('body.mobile.exchanges #new_parameters').collapse('hide');
        }
    });

    $('.open_params').click(function() {
        $(this).toggleClass('open')
    });
    $('#mobile_search [data-ajax]').click(function() {
        $('.open_params').addClass('open')
    });

     $('#exchanges_list #fetch_more').click(function(e) {
        updateList(exchanges, 'more');
    });

    $('#exchanges_list .remove_more').click(function(e) {
        removeMore();
    });


    //
    // AJAX Callbacks
    //


    // Before actions

    startLoader = function() {

      // will be required again if only the entire list is presented initially
        // currently, when only best list is initially displayed, the empty message has to be displayed on the best list part's '#fetch_more' div
        $('#empty_message').css('display', 'none');
        $('#result_message').css('display', 'none');

        $('#loader_message').css('display', 'block');
    };


    $('#search_form').on('ajax:before', function() {
        console.log('#search_form ajax:before. Invoking drawMap');
        drawMap(value_of('location_lat'), value_of('location_lng'));
        startLoader();
        clearList();
    });

    $('#search_form').on('ajax:success', function(event, data, status, xhr) {
        console.log('#search_form ajax:success. Starting to updatePage...');
        updatePage(data);
     });

    $('#search_form').on('ajax:error', function(event, xhr, status, error) {
        console.log('#search_form ajax:error. Error: ' + error);
        alert('We are unable to process your request at this time. Please try again in a few moments');
        updateResults(null);
    });


});