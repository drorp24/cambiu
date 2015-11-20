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

    // populate a field's value in all relevant html tags and in sessionStorage
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
        set('location_lat',     '51.51574678520366');
        set('location_lng',     '-0.16346305847173426');
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

    $('#exchanges').on('click','.open_search', function(e) {
        $('#exchange_params_change').collapse('toggle')
    });


    // Location - all handled at findlocation.js

    // Sorting

    sort_ui = function(sort) {
        $('#exchanges_search_results .sort_btn_group button').removeClass('active');
        $('#exchanges_search_results .sort_btn_group button.' + sort).addClass('active');
    };

    sort_by = function(sort) {

        if (exchanges.length == 0) return;

        if (sort == 'distance') {
            exchanges.sort(function(a, b){return a.distance-b.distance;});
        }
        else if (sort == 'price') {
            exchanges.sort(function(a, b){return (a.quote ? a.quote : 10000000)-(b.quote ? b.quote : 10000000)});
            if (value_of('pay_amount') > 0) { exchanges.reverse()}
        }
        set('list', 'more');
        clearExchanges();
        updateExchanges();
    };


    $('#exchanges_search_results .sort_btn_group button').click(function() {
        $('#exchanges_search_results .sort_btn_group button').toggleClass('active');
        sort = $('#exchanges_search_results .sort_btn_group button.distance').hasClass('active') ? 'distance' : 'price';
        sort_by(sort);
    });

    sort_ui(sessionStorage.sort);


    // UI

     // service_type button
    service_type_ui = function(service_type) {
        if (service_type == 'collection') {
            $('button[data-service-type=delivery]').removeClass('active');
            $('button[data-service-type=collection]').addClass('active');
            $('#exchange_summary #order_email').attr('placeholder', '  Enter email to guarantee deal');
            $('#exchange_summary #order_email').attr('required', 'required');
/*
            $('#order_phone').removeAttr('required');
            $('#order_phone').css('display', 'none');
*/
            $('.fees').html('');
         } else
        if (service_type == 'delivery') {
            $('.validation_errors').empty();
            $('.exchange_search_form_error').empty();
            $('button[data-service-type=collection]').removeClass('active');
            $('button[data-service-type=delivery]').addClass('active');
            $('#exchange_summary #order_email').attr('placeholder', '  Leave us your email if you wish');
            $('#exchange_summary #order_email').removeAttr('required');
            $('#exchange_summary #order_email').removeAttr('aria-required');
            $('#exchange_summary #order_email').removeClass('required');

/*
            $('#order_phone').css('display', 'block');
            $('#order_phone').attr('required', 'true');
            $('#order_phone').attr('placeholder', 'Leave phone for delivery');
            $('.fees').html('Add &pound;20 for delivery');
*/
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

/*
    $('#search_form #search_button').click(function(e) {
        if ($('#search_form').valid()) {
            $('#new_search').submit()
        }
     });
*/

    $('[data-ajax=searches]').click(function() {
        if (mobile) $('#open_params').toggleClass('open');
        if ($('#search_form').valid()) {
            $('#new_search').submit();
            $('#new_parameters').collapse('hide');
        }
    });

    $('.open_params').click(function() {
        $(this).toggleClass('open')
    });
    $('#mobile_search [data-ajax]').click(function() {
        $('.open_params').addClass('open')
    });

     $('#exchanges_list #fetch_more').click(function(e) {
        set('list', 'more');
        updateExchanges();
    });

    $('#exchanges_list .remove_more').click(function(e) {
        removeMore();
    });


    // any click to change params returns to main search page

    $('body.exchanges #search_form input').click(function() {
        if (window.location.pathname != '/exchanges/list') setPage('exchanges/list')
    });


    var current_distance = value_of('distance')*1000;
    $('#distance_slider').val(current_distance);
    $('#distance_output').html(current_distance);

    $('#distance_slider').on('input', function() {
        var $this = $(this);
        var value = $this.val();
        $('#distance_output').html(value);
        set('distance', value/1000, $this);
    });



    //
    // AJAX Callbacks
    //

    // #new_search


    // Before actions

    startLoader = function() {

      // will be required again if only the entire list is presented initially
        // currently, when only best list is initially displayed, the empty message has to be displayed on the best list part's '#fetch_more' div
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

    // Rails doesn't return the object back after PUT. Instead, it sends 204 No Content with an empty json
    // That means that, in search mode, when the getit_button is the one creating the order, by the time email is user populated, nothing would be returned (email included)
    // the email of the current_user is therefore not populated from the returned json (as no json is returned in search mode)
    // Instead, it is populated as pay_*/buy_* fields are: as the user keys them anywhere, with keyup/change event handler

    // The code below is used after create: it will populate the returned order_id of the newly created order, and will also replace the POST with PUT

    $('#exchanges').on('ajax:success', 'form.new_order', (function(evt, data, status, xhr) {
        console.log('#new_order ajax:success');
        order = data;
        if (xhr.status == 201) {
            var title = 'Order is ready and waiting for you!';
            var text = 'Voucher ' + order.voucher + ' was sent to you by email. <br>Present it by ' + order.expiry_s + ' to secure this rate.';
            inform(title, text, true);
            console.log('order ajax returned and status is 201: populating order attributes');
            model_populate('order', order);
            $('form.new_order').attr('action', '/orders/' + order.id);
            $('form.new_order').attr('method', 'put');
        }
     }));

    // The code below will see that any change in the order's email field will propagate to the other forms and recorded in sessionStorage
    // For instance, it will populate the email on the 'thank you' ('used' status form), so email could be sent
    // It will also populate the email of the other 'getit' buttons, so no need to ask the user to populate his email again during the session

    $('[data-model=order][data-field=order_email]').keyup(function() {
        var $this = $(this);
        var value = $this.val();
        set('order_email', value, $this);
    });


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
            set('buy_amount', result.get_amount, $this);
            set('pay_amount', result.pay_amount, $this);
            set('get_rounded', result.get_rounded, $this);
            set('pay_rounded', result.pay_rounded, $this);

            console.log('looking for marker for exchange_id: ' + exchange_id)
            var marker = findMarker(exchange_id);
            if (marker && marker['infowindow']) {
                var marker_content = marker['infowindow'].getContent();
                $(marker_content).find('.exchange_window_quote').html(result.edited_quote);
            }
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