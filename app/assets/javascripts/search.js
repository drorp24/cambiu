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

    // Sets all variables
    set_variables = function(use_session) {

        console.log('set_variables');
        variables_set = true;
        if (use_session === undefined) use_session = true;

        $('#new_search [data-field]').each(function() {

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

    };

    set_default_location = function(excluded) {
        console.log('Since user location could not be found: setting the default location');
        set('location',         'London, UK');
        set('location_short',   'London');
        set('location_lat',     '51.5073509');
        set('location_lng',     '-0.12775829999998223');
        set('location_type',    'default');
    };



    search_exchanges = function() {
        console.log('After location found, set to default, changed by user, or page was reloaded:');
         if (!homepage()) {
            console.log('Not homepage: submitting form');
            $('#new_search').submit();
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

    // service_type button
    service_type_ui = function(service_type) {
        if (service_type == 'collection') {
            $('button[data-service-type=delivery]').removeClass('active');
            $('button[data-service-type=collection]').addClass('active');
            $('#order_phone').removeAttr('required');
            $('#order_phone').attr('placeholder', 'Leave phone if you need help');
            $('.fees').html('');
         } else
        if (service_type == 'delivery') {
            $('button[data-service-type=collection]').removeClass('active');
            $('button[data-service-type=delivery]').addClass('active');
            $('#order_phone').attr('required', 'true');
            $('#order_phone').attr('placeholder', 'Leave phone for delivery');
            $('.fees').html('Add &pound;20 for delivery');
        }
    };
    if (sessionStorage.service_type == 'collection') {
        service_type_ui('collection')
    } else
    if (sessionStorage.service_type == 'delivery') {
        service_type_ui('delivery')
    }

    $('button[data-service-type=collection]').click(function() {
        service_type_ui('collection');
        set('service_type', 'collection');
    });

    $('button[data-service-type=delivery]').click(function() {
         service_type_ui('delivery');
         set('service_type', 'delivery');
    });


    // open parameters collapsed form in desktops only
    var mq = window.matchMedia('(min-width: 768px)');
    if(mq.matches) {
        $('.parameters .collapse').addClass('in');
    } else {
        // the width of browser is less then 700px
    }


    $('.getstarted_button').click(function(){
        if ($('#new_search').valid() && custom_validate($('#new_search'))) {
            console.log('getstarted button clicked: submitting search form')
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
//        setPage(current_url());
     });

    $('#new_search').on('ajax:error', function(event, xhr, status, error) {
        console.log('#new_search ajax:error. Error: ' + error);
        alert('We are unable to process your request at this time. Please try again in a few moments');
        updateResults(null);
    });


    // #new_order

/*
    $('#exchanges').on('ajax:before', 'form.new_order', (function(evt, xhr, settings) {
        order_id = value_of('order_id');
        if (order_id) {
            $('#new_order').attr('action', '/orders/' + order_id);
            $('#new_order #order_id').val(order_id);
          }
    }));
*/

    $('#exchanges').on('ajax:success', 'form.new_order', (function(evt, data, status, xhr) {
        console.log('#new_order ajax:success');
        order = data;
        if (xhr.status == 201) {
            console.log('#new_order status is 201: populating order attributes');
            $('form.new_order').attr('action', '/orders/' + order.id);
            $('form.new_order').attr('method', 'put');
            model_populate('order', order);
        }
    }));


    // Real-time exchange quotes

    $('#exchange_search form input, #exchange_search form select').on('keyup click', function() {

        var $this = $(this);
        var exchange_id = value_of('exchange_id');  if (!exchange_id) return;
        var url = '/exchanges/' + exchange_id + '/quote';
        var field = $this.data('field');
        var params = {
            pay_amount:     $('#exchange_search #pay_amount').val(),
            pay_currency:   $('#exchange_search #pay_currency').val(),
            get_amount:     $('#exchange_search #buy_amount').val(),
            get_currency:   $('#exchange_search #buy_currency').val(),
            field:          field
        };

        $.getJSON(url, params, function(data, status) {
            var result = data;
            var marker = markers[0];
            var marker_content = marker['infowindow'].getContent();
            $(marker_content).find('.exchange_window_quote').html(result.edited_quote_rounded);
            set('buy_amount', result.get_amount, $this);
            set('pay_amount', result.pay_amount, $this);
            set('get_rounded', result.get_rounded, $this);
            set('pay_rounded', result.pay_rounded, $this);
//            set('gain_amount', result.gain_amount);
        }).done(function(data) {
            var errors = data.errors;
            if (errors.length > 0) {
                var text = '';
                for (var i = 0; i < errors.length; i++) {
                    text += '<p class=error_class>' + errors[i] + '</p>'
                }
                $('.exchange_search_form_error').html(text);
            } else {
                $('.exchange_search_form_error').empty();
                if (data.rounded) {
                    text = '<p class=info_class>You may pay ' + data.pay_rounded + ' and get ' + data.get_rounded + ' to round</p>'
                    $('.exchange_search_form_error').html(text);
                }
            }
        })
    });


});