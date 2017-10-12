//
// S E A R C H
//
// Search forms  UI
// Search forms ajax calls

$(document).ready(function() {

    update_currency_symbol = function(el, symbol) {
        if (symbol === undefined) {
            currency_select_el = $('#' + el.attr('data-symbolsource'));
            symbol = currency_select_el.find('option:selected').attr('data-symbol');
        }
        el.attr('data-a-sign', symbol);
        el.autoNumeric('update', {aSign: symbol});
    };

    matchWorstFieldsSymbolToCalculated = function() {
        var sign = formElement(calculated).attr('data-a-sign');
        $('input[data-model=local]').each(function() {
            update_currency_symbol($(this), sign);
        })
    };

    bind_currency_to_autonumeric = function() {

        $('[data-autonumeric]').autoNumeric('init');

        $('[data-autonumeric]').each(function() {
            update_currency_symbol($(this));
        });

        $('.currency_select.select-wrapper').change(function() {
            console.log('currency_select change event triggered');

            var $this   = $(this).find('[data-model=search][data-field]').addBack('[data-model=search][data-field]');
            var field   = $this.data('field');
            var value   = $this.val();
            var target  = $this.data('symboltarget');
            var symbol  = $this.find('option:selected').attr('data-symbol');

            if (!conveyed.localCurrency && value_of('payment_method') == 'credit' && field == 'pay_currency' && value != local.currency && positionFound()) {
                snack(t('localCurrency'), {klass: 'oops', timeout: 2000});
                conveyed.localCurrency = true;
            }

//            console.log(`changed currency from ${value_of(field)} to ${value}`);
            set_change(field, value_of(field), value);
            set(field, value, 'manual');

            populateTransaction();
            fetchAndPopulateLocaloffers();

            disable($('.md-form.select.' + other(field)), value);

            $('[data-autonumeric][data-field=' + target + ']').each(function() {
                update_currency_symbol($(this), symbol);
            });

            matchWorstFieldsSymbolToCalculated();

        });


        function disable($e, value) {
            $e.find('ul.dropdown-content li').each(function() {
                var $this = $(this);
                if ($this.find('span').html() == value) {
                    $this.addClass('disabled')
                } else {
                    $this.removeClass('disabled')
                }
            })
        }

    };

    $('.camera').on('click tap', (function() {
        $('#photo').click()
    }));



     // fix their z-index dynamically
    $('input[data-field=location]').click(function() {
        if (!pacContainerInitialized) {
            $('.pac-container').css('z-index',
                '9999');
            pacContainerInitialized = true;
        }
    });


    // amount fields

    amount = function(field) {
        return field.indexOf('amount') > -1
    };

    currency = function(field) {
        return field.indexOf('currency') > -1
    };

    other = function(field) {
        return field.includes('pay') ? 'buy' + field.split('pay')[1] : 'pay' + field.split('buy')[1]
    };

    twin = function(field) {
        var split = field.split('_');
        return split[1] == 'amount' ? split[0] + '_currency' : split[0] + '_amount';
    };

    formElement = function(field) {
      return $('form [data-model=search][data-field=' + field + ']')
    };

    clean = function(value) {
        return Number(String(value).replace(/[^0-9\.]+/g,""))
    };

    clear = function($e) {
        var field = $e.data('field');
        if ($e.val()) set(field, '');
    };

    hasError = function($e) {
        return $e.closest('.form-group').hasClass('has-error');
    };

    clearError = function($e) {
        $e.closest('.form-group').removeClass('has-error');
    };

    brother = function($e) {
        return $('form [data-model=search][data-field=' + other($e.data('field')) + ']');
    };

    determineTransaction = function() {
        if (!local.currency) return;
        let local_currency  = local.currency;
        let buy_currency    = value_of('buy_currency');
        let pay_currency    = value_of('pay_currency');
        return (pay_currency !== local_currency) && (buy_currency !== local_currency) ? 'mixed' : buy_currency === local.currency ? 'buy' : 'sell'
    };





    $('form [data-model=search][data-field]').on('click tap', function() {

        var $this = $(this);
        var field = $this.data('field');
        if (amount(field)) clear($this);
 //       $this.closest('.swiper-slide').addClass('missing');
    });

    $('form [data-model=search][data-field]').keyup(function() {

        var $this = $(this);
        var field = $this.data('field');
        var amount_field = amount(field);
        var currency_field = currency(field);

        if (!amount_field && !currency_field) return;
        console.log('keying a character');

        var value = $this.val();
        if (amount_field) {
            let $slide = $this.closest('.swiper-slide');
            if (clean(value) == 0) {
                $slide.addClass('missing');
                swiperI.lockSwipeToNext();
             } else {
                $slide.removeClass('missing');
                swiperI.unlockSwipeToNext();
            }
        }

        set(field, value);
        var prev_calculated = calculated;
        if (amount(field) && value) {
            clear(brother($this));
            set('calculated', calculated = other(field));
        }

        if (prev_calculated !== calculated) {
            console.log('calculated has just changed. Fetching local offers');
            set_change('calculated', prev_calculated, calculated);
            fetchAndPopulateLocaloffers();
        }

        var $field = formElement(field);
        if ($field.hasClass('calculated')) {
            $field.removeClass('calculated');
            formElement(calculated).addClass('calculated');
            $('.worst input').attr('data-symbolsource', twin(calculated));
            $('.worst input').each(function() {update_currency_symbol($(this))});
        }

        populateLocalOffers(local.rates);

    });



    // User manual search: form validation & submit

    inputValid = function() {

        $('.search .amount_fields').removeClass('invalid');

        var $buy_amount = $('#buy_amount');
        var buyAmountValid = clean($buy_amount.val());
        if (!buyAmountValid) error($buy_amount, calculated == 'buy_amount' ? 'No offer, sorry' : 'Cannot be blank');

        var $pay_amount = $('#pay_amount');
        var payAmountValid = clean($pay_amount.val());
        if (!payAmountValid) error($pay_amount, calculated == 'pay_amount' ? 'No offer, sorry' : 'Cannot be blank');


        var $location = $('#location');
        var locationValid = $location.val() && !locationDirty;
        if (!locationValid) error($location, 'Cannot be blank');

        var $pay_currency = $('#pay_currency');
        var $buy_currency = $('#buy_currency');
        var currencyValid = $pay_currency.val() != $buy_currency.val();
        if (!currencyValid) error($pay_currency, 'Choose different currencies');

        valid = !!(payAmountValid && buyAmountValid && locationValid && currencyValid);
        return valid;

        function error($e, msg) {
            $e.siblings('label').attr('data-error', msg);
            $e.addClass('invalid');
        }
    };

    $('[data-ajax=searches]').click(function(e) {
        let $this = $(this);
        e.preventDefault();
        if (!$this.is('[data-ajax=searches]')) return;   // absurd but required: button changed attributes but unneeded event still bound
        if (inputValid() || $this.is('[data-validate=false]')) {
            report('Click', $this.html(), bestOffer());
            search_and_show_and_render()
        }
    });



    search = function() {

        return new Promise(function(resolve, reject) {

            function startSearch() {
//                start_show();
            }

            function checkStatus(response) {
                if (response.status >= 200 && response.status < 300) {
                    return response
                } else {
                    var error = new Error(response.statusText);
                    error.response = response;
                    throw error
                }
            }

            function parseJson(response) {
                return response.json()
            }

            function fetchData() {
                return fetch('/searches?', {
                    method: 'post',
                    body: new URLSearchParams($( ".search_form input, .search_form select" ).serialize())
                })
            }

            function finishSearch (data) {
                if (data.error) {
                    console.error('search failed:', data.error)
                } else {
                    console.log('search completed succesfully');
                }
                searchData = data;
                set('search_id', searchId = data.search);
                $('[data-model=search][data-field=id]').val(searchId);
                tagSession({search: searchId});
                exchanges = data.exchanges.features;
                exchangeHash = {};
                for (var exchange of exchanges) {exchangeHash[exchange.properties.id] = exchange.properties}
                resolve(exchanges);
//                wait(750).then(stop_show);
            }

            function tell(error) {
                console.log('catch during search!');
                reject(error)
            }


            startSearch();
            fetchData()
            .then(checkStatus)
            .then(parseJson)
            .then(finishSearch)
            .catch(tell);

        })

    };

    fetchLocalRates = function() {

        console.log('fetchLocalRates...');

        return new Promise(function(resolve, reject) {

            function fetchRates() {
                return fetch('/searches/localRates?' + $( ".search_form input, .search_form select" ).serialize(), {
                    method: 'get'
                })
            }

            function tell(error) {
                console.log('catch during fetchLocalRates!');
                reject(error)
            }

            function returnResults(data) {
                Object.assign(local, {rates: data});
                resolve(data)
            }

            fetchRates()
                .then(checkStatus)
                .then(parseJson)
                .then(returnResults)
                .catch(tell);
        })

    };



    $('form .location .clear').click(function() {
        if (!$(this).parent().find('input#location').prop('disabled')) {
//            set('location', '')    only form gets cleared as we need to remember the location to report its previous value when location change is reported (location.js)
            $('[data-model=search][data-field=location]').val("");
        }
    });

    $(".search_section.where input[type=checkbox]").change(function() {
        var $locationInput = $('.search_section.where input#location');
        locationDirty = false;
        if(this.checked) {
            var user_location_name = (search.location.type == 'user' && search.location.name) ? search.location.name : null;
            var user_location_short = (search.location.type == 'user' && search.location.short) ? search.location.short : null;
            if (user.lat && user.lng) {
                set('location_lat',     search.location.lat = user.lat);
                set('location_lng',     search.location.lng = user.lng);
                set('location_type',    search.location.type = 'user');
                set('location_reason',  search.location.reason = "where i'm at");
                set('location',         search.location.name = user_location_name);
                set('location_short',  search.location.short = user_location_short);
                if (user_location_name) {
                    set('location',  user_location_name);
                } else {
                    geocode(search.location);
                }
            } else {
                getUserLocation().then(geocode);
            }
            $locationInput.prop("disabled", true);
            $locationInput.removeClass('active');
            $('.search_section.where').addClass('on');
        } else {
            $locationInput.prop("disabled", false);
            $locationInput.addClass('active');
            set('location', '');
            $('.search_section.where').removeClass('on');
        }
    });



    function supported(feature) {
//        return ['service_type', 'payment_method'].indexOf(feature) == -1;
        return true;
    }

    function unsupported(feature = null) {
        let featureName = feature == 'service_type' ? 'Delivery' : 'Card payment';
        snack(featureName + ' is coming soon!', {
            button: '<i class="material-icons">help_outline</i>',
            link: {
                page: 'exchanges',
                pane: 'help',
                help: {
                    topic: 'Why do we include unsuported features?',
                    content:
                        "<p>We are in the process of implemeting this feature.</p>" +
                        "<p >In order to make it the best we can, we already measure its responsiveness.</p>" +
                        "<p>You've just helped a great deal!"
                }
            },
            timeout: 3000
        });
    }

    // pointer-events important!
    showDialog = function(options) {
        var $modal = $('#myModal');
        $modal.find('.modal-title').html(options.title);
        $modal.find('.modal-body').html(options.body);
        $modal.find('.btn-default').html(options.default);
        $modal.find('.btn-primary').html(options.primary);
        if (options.pane) {
            $modal.find('.btn-primary').attr({'data-href-page': 'exchanges', 'data-href-pane': options.pane});
        }
        $('#myModal').modal('show');
        $('.modal').css('pointer-events', 'all');
    };

    hideDialog = function() {
//        $('#myModal').modal('hide');
        $('.modal').css('visibility', 'hidden');  // TODO: the above and this line are a patch. Handle eventually
        $('.modal').css('pointer-events', 'none');
    };


    $('body').on('click tap', function() {
        if ($('body').hasClass('modal-open')) {
            hideDialog();
        }
    });


    $('.swiper-slide.c .slide_line .left').on('click tap', function() {
        report('Tap', 'Skip (3)')
    });


/*
    $('form .service_type').change(function() {
        var $this = $(this);
        snackHide();
        var service_type = $this.is(':checked') ? 'delivery' : 'pickup';

        if (supported('service_type')) {
            setServiceTypeTo(service_type);
            if ($('body').attr('data-pane') == 'search') fetchAndPopulateLocaloffers();
            if ($('body').attr('data-pane') == 'update') {
                $(`.ecard[data-exchange-id=${urlId()}] .offer_line.delivery.charge`).css('visibility', value_of('service_type') == 'delivery' ? 'visible' : 'hidden');
            }
        } else {
            $('form.selection #delivery_ind').prop('checked', service_type == 'pickup');
            unsupported('service_type');
        }

        report('Set', 'Service type', null, service_type);
        set('values', 'user');

    });
 */

    setServiceTypeTo = function(service_type) {
        if (service_type == 'delivery') {

            $('form.selection').removeClass('pickup').addClass('delivery');
            $('body').removeClass('pickup').addClass('delivery');
            $('form.selection .inline_params_delivery').addClass('open');
            sessionStorage.service_type = 'delivery';
            $('[data-model=search][data-field=service_type]').val('delivery');

            $('form.selection #delivery_ind').prop('checked',true);
            $('#payment_method_credit').prop("checked", true);
            setPaymentMethodTo('credit');

            set('radius', radius.delivery);

        } else if (service_type == 'pickup') {

            $('form.selection').removeClass('delivery').addClass('pickup');
            $('body').removeClass('delivery').addClass('pickup');
            $('.inline_params_delivery').removeClass('open');
            sessionStorage.service_type = 'pickup';
            $('[data-model=search][data-field=service_type]').val('pickup');

            $('form.selection #delivery_ind').prop('checked',false);
            if (value_of('payment_method') == 'credit') setPaymentMethodTo('cash');
            if (value_of('radius') == radius.delivery) set('radius', radius.pickup.walk);    // if user changes from delivery to pickup, the radius would remain 100 if not for this line. A fetchAndPopulate is instantly triggered, before the user has the chance to define the radius.
        }

    };


    function otherPaymentMethod(method) {
        return method == 'cash' ? 'credit' : 'cash'
    }

/*
    $('form .payment_method').change(function() {
        snackHide();
        var new_payment_method = $('form.selection .payment_method:checked').val();

        if (supported('payment_method')) {
            if (new_payment_method == 'credit' && value_of('pay_currency') != local.currency) {
                snack(`To pay with credit, please change payment currency to ${local.currency}`, {klass: 'oops', timeout: 3000});
                setPaymentMethodTo('cash');
                return;
            }
            setPaymentMethodTo(new_payment_method);
            if ($('body').attr('data-pane') == 'search') fetchAndPopulateLocaloffers();
            if ($('body').attr('data-pane') == 'update') {
                $(`.ecard[data-exchange-id=${urlId()}] .offer_line.cc.charge`).css('visibility', value_of('payment_method') == 'credit' ? 'visible' : 'hidden');
            }
        } else {
            $(`form.selection .payment_method[value=${otherPaymentMethod(new_payment_method)}]`).prop('checked', true);
            unsupported('payment_method')
        }

        report('Set', 'Payment method', null, new_payment_method);
        set('values', 'user');
    });
*/

    setPaymentMethodTo = function(payment_method) {

        $(`form.selection .payment_method[value=${payment_method}]`).prop('checked', true);
        sessionStorage.payment_method = payment_method;
        $('[data-model=search][data-field=payment_method]').val(payment_method);
        if (payment_method == 'cash') setServiceTypeTo('pickup');
        $('form.selection').removeClass(otherPaymentMethod(payment_method)).addClass(payment_method);
        $('body').removeClass(otherPaymentMethod(payment_method)).addClass(payment_method);

    };

    revertToPickupCash = function() {
        setServiceTypeTo('pickup');
        setPaymentMethodTo('cash');
        set_change('service_type_payment_method', 'derlivery_credit', 'pickup_cash');
        fetchAndPopulateLocaloffers();
    };


/*
    $('[data-action=updateOrder]').click(function(e) {

        e.preventDefault();

        let exchange_id = urlId();
        if (!exchange_id) {console.error('updateOrder: no id in url'); return}

        for (let field of ['buy_currency', 'buy_amount', 'pay_currency', 'pay_amount']) {updateOrderWith(field)}
        $(`.ecard[data-exchange-id=${exchange_id}] [data-model=exchange][data-field=gain_amount]`).html($('form.update [data-field=worst_saving]').val());
        $(`.ecard[data-exchange-id=${exchange_id}] [data-model=exchange][data-field=edited_quote]`).html($(`form.update [data-field=${value_of('calculated')}]`).val());

        $(`.ecard[data-exchange-id=${exchange_id}] .offer_line.cc.charge`).css('visibility', value_of('payment_method') == 'credit' ? 'visible' : 'hidden');
        $(`.ecard[data-exchange-id=${exchange_id}] .offer_line.deliver.charge`).css('visibility', value_of('service_type') == 'delivery' ? 'visible' : 'hidden');


        function updateOrderWith(field) {
            $(`.ecard[data-exchange-id=${exchange_id}] [data-model=exchange][data-field=${field}]`).html($(`form.update [data-field=${field}]`).val());
        }
        $(`.ecard[data-exchange-id=${exchange_id}] [data-model=exchange][data-field=get_amount]`).html($('form.update [data-field=buy_amount]').val());   // yachh


    });
*/

    $('.language_select').on('click tap', function() {
        console.log('language select');
        let new_locale = $('body').attr('locale') == 'en' ? 'he' : 'en';
        window.location.href = "/exchanges/isearch?" + $.param({'locale': new_locale});
        report('Set', 'Language', null, new_locale);
    });

    $('.search_form .amount_fields [data-model]').change(function() {
        let $this = $(this);
        let field = $this.attr('data-field');
        let value = $this.val();
        report('Set', field, null, value);
    });


    // Update user form with updates made in isearch form

    $('[data-update=user]').change(function() {
        let $this = $(this);
        let id = $this.attr('id');
        let field = id.split('_')[1];
        let value = $this.val();
        $(`[data-model=user][data-field=${field}]`).val(value).siblings('label').addClass('active');
    });


});
