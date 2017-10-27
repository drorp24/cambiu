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
        el.autoNumeric('set', clean(value_of(el.data('field'))));

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

            $('[data-autonumeric][data-field=' + target + ']').each(function() {
                update_currency_symbol($(this), symbol);
            });

            matchWorstFieldsSymbolToCalculated();

            if (!conveyed.localCurrency && value_of('payment_method') == 'credit' && field == 'pay_currency' && value != local.currency && positionFound()) {
                snack(t('localCurrency'), {klass: 'oops', timeout: 2000});
                conveyed.localCurrency = true;
            }

//            console.log(`changed currency from ${value_of(field)} to ${value}`);
            set_change(field, value_of(field), value);
            set(field, value, 'manual');

            populateTransaction();
            fetchAndPopulateLocaloffers();

            unblock(other(field));
            block(other(field), value);


        });

    };


    block = (currency_field, value) => {
      $(`.${currency_field} .select-wrapper.currency_select ul.dropdown-content li:contains('${value}')`).addClass('disabled')
    };

    unblock = (currency_field) => {
        $(`.${currency_field} .select-wrapper.currency_select ul.dropdown-content li`).removeClass('disabled')
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
//        return field.includes('pay') ? 'buy' + field.split('pay')[1] : 'pay' + field.split('buy')[1]
        switch(field) {
            case 'pay_amount':
                return 'buy_amount';
            case 'buy_amount':
                return 'pay_amount';
            case 'pay_currency':
                return 'buy_currency';
            case 'buy_currency':
                return 'pay_currency';
            case 'delivery':
                return 'pickup';
            case 'pickup':
                return 'delivery';
            case 'cash':
                return 'credit';
            case 'credit':
                return 'cash'
        }
    };

    twin = function(field) {
        var split = field.split('_');
        return split[1] == 'amount' ? split[0] + '_currency' : split[0] + '_amount';
    };

    formElement = function(field) {
      return $('form [data-model=search][data-field=' + field + ']')
    };

    clean = function(value) {
        let result =  Number(String(value).replace(/[^0-9\.]+/g,""));
        return result == 0 ? "" : result;
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





    $('form [data-field]').on('click tap', function() {

        let $this = $(this);
        let field = $this.data('field');
        let $slide = $this.closest('.swiper-slide');
        if ($slide.hasClass('missing')) return;
        if (amount(field)) clear($this);

        $slide.addClass('missing');
        $this.addClass('empty');
        swiperI.lockSwipeToNext();
        invalid($this);
        mdbBlock(twin(field), true);

    });

    $('form [data-field]').keyup(function() {

        let $this = $(this);
        let field = $this.data('field');
        if (field == 'location') return; // handled separately in the clear button and in the change location
        let amount_field = amount(field);
        let value = amount_field ? clean($this.val()) : $this.val();
        let $slide = $this.closest('.swiper-slide');

        if (!value) {
            $this.addClass('empty');
            invalid($this);
            $slide.addClass('missing');
            swiperI.lockSwipeToNext();
            if (amount_field) mdbBlock(twin(field), true);
         } else {
            $this.removeClass('empty');
            valid($this);
            if (!$slide.find('.invalid').length && !$slide.find('.empty').length) $slide.removeClass('missing');
            swiperI.unlockSwipeToNext();
            if (amount_field) mdbBlock(twin(field), false);
        }

        set(field, value);
        let prev_calculated = calculated;
        if (amount_field && value) {
            clear(brother($this));
            set('calculated', calculated = other(field));
        }

        if (prev_calculated !== calculated) {
            console.log('calculated has just changed. Fetching local offers');
            set_change('calculated', prev_calculated, calculated);
            $('body').attr('data-calculated', calculated);
            fetchAndPopulateLocaloffers();
        }

        let $field = formElement(field);
        if ($field.hasClass('calculated')) {
            $field.removeClass('calculated');
            formElement(calculated).addClass('calculated');
            $('.worst input').attr('data-symbolsource', twin(calculated));
            $('.worst input').each(() => {update_currency_symbol($(this))});
        }

        populateLocalOffers(local.rates);

    });




    fetchLocalRates = function() {

        console.log('fetchLocalRates...');
        recordTime('offer', 'fetch');

        return new Promise(function(resolve, reject) {

            function checkLocation() {
                return new Promise((resolve, reject) =>
                    value_of('bias') == 'default' ? resolve() : findLocation.then(resolve)
                )}

            function fetchRates() {
                return fetch('/searches/localRates?' + $( ".search_form input[data-model=search], .search_form select[data-model=search]" ).serialize(), {
                    method: 'get'
                })
            }

            function tell(error) {
                console.log('catch during fetchLocalRates!');
                reject(error)
            }

            function returnResults(data) {
                Object.assign(local, {rates: data});
                if (data.error) {
                    recordTime('offer', 'error', 'fetch');
                    reject(data.error)
                } else {
                    if (data.search) set('id', data.search.id);
                    recordTime('offer', 'result', 'fetch');
                    resolve(data)
                }
            }

            checkLocation()
                .then(fetchRates)
                .then(checkStatus)
                .then(parseJson)
                .then(returnResults)
                .catch(tell);
        })

    };



    $('form .location .clear').click(function() {
        $('input[data-field=location]').closest('.swiper-slide').addClass('missing');
        if (!$(this).parent().find('input#location').prop('disabled')) {
//            set('location', '')    only form gets cleared as we need to remember the location to report its previous value when location change is reported (location.js)
            $('[data-model=search][data-field=location]').val("").addClass('invalid');
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
//            if (value_of('payment_method') == 'credit') setPaymentMethodTo('cash');

             if (value_of('radius') == radius.delivery) set('radius', radius.pickup.default); // if it's not delivery then don't change it: it means the user has set his preference some time ago
        }

    };


    setPaymentMethodTo = function(payment_method) {

        sessionStorage.payment_method = payment_method;
        $('[data-model=search][data-field=payment_method]').val(payment_method);
        $('body').removeClass(other(payment_method)).addClass(payment_method);
        if (payment_method == 'cash') setServiceTypeTo('pickup');

    };


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


    $('body').keydown(function(e) {
        var code = e.keyCode || e.which;
        if (code == '9') {
            e.preventDefault();
        }
    });

    mdbBlock = (field, blocked) => {
        $(`.md-form.${field}.select.currency_fields .select-wrapper > input`).prop('disabled', blocked);
    };

    noOffer = () => !local.rates.best;



});
