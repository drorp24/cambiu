//
// Search params, search form fields and the impact of their changes
//
// Prefix input elements with the respective selected currency

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

    // return the value of a sessionStorage variable
    set = function(field, value, excluded) {
        if (excluded === undefined) excluded = '';
        var elements = '[data-field=' + field + ']';

        if (field =='buy_amount' || field == "pay_amount") {
            var value_clean = value  ? String(value).replace(/[^0-9\.]+/g,"")  : null;
            sessionStorage.setItem(field, value_clean);
            $('.simple_form ' + '#search_' + field + '_val').val(value_clean);   // Ugly hack for autoNumeric sending _val values to server
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

/*
    // Sets 5 basic search variables only.
    set_defaults = function(use_session) {

        var session_pay_amount      = value_of('pay_amount');
        var session_pay_currency    = value_of('pay_currency');
        var session_buy_amount      = value_of('buy_amount');
        var session_buy_currency    = value_of('buy_currency');
        var session_sort            = value_of('sort');

        set('pay_amount',   use_session  ? session_pay_amount     || (session_buy_amount ? null : def_pay_amount)   : def_pay_amount);
        set('pay_currency', use_session  ? session_pay_currency   || def_pay_currency                               : def_pay_currency);
        set('buy_amount',   use_session  ? session_buy_amount     || (session_pay_amount ? null : def_buy_amount)   : def_buy_amount);
        set('buy_currency', use_session  ? session_buy_currency   || def_buy_currency                               : def_buy_currency);
        set('sort',         use_session  ? session_sort           || def_sort                                       : def_sort);

        bind_currency_to_autonumeric();

    };
*/

    // Sets all variables
    set_variables = function(use_session) {

        console.log('set_variables');
        variables_set = true;
        if (use_session === undefined) use_session = true;

        $('#homepage form [data-field]').each(function() {

            var field = $(this).data('field');
            var def_val = def(field);
            var value = use_session ? value_of(field) || def_val : def_val;

            if (field == 'pay_amount') {value = use_session ? value_of('pay_amount') || (value_of('buy_amount') ? null : def_val) : def_val}
            if (field == 'buy_amount') {value = use_session ? value_of('buy_amount') || (value_of('pay_amount') ? null : def_val) : def_val}

            set(field, value);

        });

        bind_currency_to_autonumeric();

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

    $('.open_search').click(function() {
        $('#exchange_params_change').collapse('show')
    });


    // Location - all handled at findlocation.js

    // Sorting

   sort_ui = function(sort) {

        $('#sort_switch').bootstrapSwitch('state', sort == 'quote', true);
        $('.sorted_by').each(function() {
            $this = $(this);
            if ($this.data('sort')== sort) {$this.addClass('active')} else {$this.removeClass('active')}
        })
    };

    sort_by = function(sort) {

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


    $('.getstarted_button').click(function(){
        if ($('#new_search').valid() && custom_validate($('#new_search'))) {
            $('#new_search').submit();
        } else {
            $('#homepage input[data-field=buy_amount]').focus()
        }
    });

    $('.exchanges_search_search_title').click(function(){
        if (sessionStorage.pay_amount != "null") {
            $('#search_form input[data-field=pay_amount]').focus()
        } else {
            $('#search_form input[data-field=buy_amount]').focus()
        }
    });

    // clicking on certain elements rests params to default values
    $('[data-set-default]').click(function() {
        var use_session = false;
        set_variables(use_session);
    });


    // #search_form submits the shadow form #new_search rather than itself

    $('#search_form #search_button').click(function(e) {
        e.preventDefault();
        if (mobile) {$('#exchange_params_change').collapse('hide');}
        if ($('#search_form').valid()) {$('#new_search').submit()};
     });

    // any click to change params returns to main search page

    $('#search_form input').click(function() {
        if (window.location.pathname != '/exchanges/list') setPage('exchanges/list')
    });



    //
    // AJAX Callbacks
    //

    // #new_search


    // Before actions

    startLoader = function() {
        $('#empty_message').css('display', 'none');
        $('#result_message').css('display', 'none');
        $('#loader_message').css('display', 'block');
    };

    beforeSubmit = function() {
        startLoader();
    };

    $('#new_search').on('ajax:before', function() {
        console.log('ajax:before: form is submitted');
        beforeSubmit()
    });

    $('#new_search').on('ajax:success', function(event, data, status, xhr) {
        console.log('#new_search ajax:success. Starting to updatePage...');
        updatePage(data);
        setPage(current_url());
     });

    // #new_order

    $('#exchanges').on('ajax:before', '#new_order', (function(evt, xhr, settings) {
        order_id = value_of('order_id');
        if (order_id) {
            $('.confirmation_form form').attr('action', '/orders/' + order_id);
            $('.confirmation_form #order_id').val(order_id);
          }
    }));

    $('#exchanges').on('ajax:success', '#new_order', (function(evt, data, status, xhr) {
         order = data;
         model_populate('order', order);
    }));




});