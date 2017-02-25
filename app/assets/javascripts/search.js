//
// S E A R C H
//
// Search forms  UI
// Search forms ajax calls

$(document).ready(function() {

    bind_currency_to_autonumeric = function() {

        $('[data-autonumeric]').autoNumeric('init');

        $('[data-autonumeric]').each(function() {
            update_currency_symbol($(this));
        });

        $('.currency_select').change(function() {
            console.log('currency_select change event triggered');
            var $this   = $(this);
            var field   = $this.data('field');
            var value   = $this.val();
            var target  = $this.data('symboltarget');
            var symbol  = $this.find('option:selected').attr('data-symbol');

            set(field, value);

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

    $('.camera').on('click tap', (function() {
        $('#photo').click()
    }));



    // supress homepage submit button
    $('#homepage :submit').click(function(e) {
        e.preventDefault();
    });


    // Turn location fields into google searchBox's
    $('input[data-field=location]').each(function() {
        input = $(this).get(0);
        searchBox = new google.maps.places.SearchBox(input, {
            types: ['regions']
        });
        searchbox_addListener(searchBox);
    });

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

    other = function(field) {
        return field == 'pay_amount' ? 'buy_amount' : 'pay_amount'
    };

    clear = function($e) {
        var field = $e.data('field');
        console.log('clear ' + field + '. val():' + $e.val());
        if ($e.val()) set(field, '');
    };

    hasError = function($e) {
        return $e.closest('.form-group').hasClass('has-error');
    };

    clearError = function($e) {
        $e.closest('.form-group').removeClass('has-error');
    };

    brother = function($e) {
        return $('.form-group [data-model=search][data-field=' + other($e.data('field')) + ']');
    };

    $('#search_form [data-model=search][data-field]').on('click tap', function() {

        console.log('moving to a new field');
        if ($('#search_form .location').hasClass('is-focused')) console.log('focus!');
        var $this = $(this);
        var field = $this.data('field');
        if (amount(field)) clear($this);
    });

    $('#search_form [data-model=search][data-field]').keyup(function() {

        console.log('keying a character');
        var $this = $(this);
        var field = $this.data('field');
        var value = $this.val();

        set(field, value);
        if (amount(field) && value) {
            clear(brother($this));
            if (hasError($this)) {
                clearError($this);
                clearError(brother($this));
            }
        }
    });



    // User manual search: form validation & submit

    inputValid = function() {

        var amountValid = value_of('pay_amount') || value_of('buy_amount');

        if (!amountValid) {
            $('.form-group.pay_amount').addClass('has-error is-focused').find('.help-block').addClass('required');
            $('.form-group.buy_amount').addClass('has-error').find('.help-block').addClass('required');
        } else {
            $('.form-group.pay_amount').removeClass('has-error is-focused').find('.help-block').removeClass('required');
            $('.form-group.buy_amount').removeClass('has-error').find('.help-block').removeClass('required');
        }

        var locationValid = $('input#location').val() && !locationDirty;

        if (!locationValid) {
            $('.form-group.location').addClass('has-error is-focused').find('.help-block').addClass('required');
         } else {
            $('.form-group.location').removeClass('has-error is-focused').find('.help-block').removeClass('required');
        }

        var currencyValid = $('.form-group #pay_currency').val() != $('.form-group #buy_currency').val();

        if (!currencyValid) {
            $('.form-group.pay_currency').addClass('has-error is-focused').find('.help-block').addClass('required');
        }

        valid = amountValid && locationValid && currencyValid;
        return valid;
    };

    $('[data-ajax=searches]').click(function(e) {
        e.preventDefault();
        if (inputValid()) {
            setPage({page1: 'exchanges', pane1: 'map'});
            search_and_show(search.location);
        }
    });


    // fix a (desktop only) irritating bug where by focusing out with a tab from an empty amount field it gets it previous value and clear its brother
/*
    $('form [data-model=search][data-field]').focusout(function() {

        var $this = $(this);
        var field = $this.data('field');
        if (amount(field) && value_of(other(field))) clear(field);
    });
*/



    // programmatic search (e.g., once search location is determined)

    search = function(location) {

        var reason = location.reason ? location.reason : '';
        console.log('search invoked, reason: ' + reason);

        return new Promise(function(resolve, reject) {

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
                return fetch('/searches', {
                    method: 'post',
                    body: new URLSearchParams($( "#search_form input, #search_form select" ).serialize())
                })
            }

            function finish (data) {
                console.log('search completed succesfully');
                searchResult = data.exchanges;
                searchId = data.search;
                tagSession({search: searchId});
                exchanges = data.exchanges.features;
                resolve(exchanges);
            }

            function squil(error) {
                console.log('catch!');
                reject(error)
            }


            geocode(location)
            .then(fetchData)
            .then(checkStatus)
            .then(parseJson)
            .then(finish)
            .catch(squil);

        })

    };



    // Radius slider interaction

    function updateRadius ( values, handle, unencoded, tap, positions ) {
        // values: Current slider values;
        // handle: Handle that caused the event;
        // unencoded: Slider values without formatting;
        // tap: Event was caused by the user tapping the slider (boolean);
        // positions: Left offset of the handles in relation to the slider
        radius.value = unencoded[0].toFixed(3);
        set('radius', radius.value);
    }


    slider.noUiSlider.on('update', updateRadius);

    slider.noUiSlider.on('change', function ( values, handle, unencoded ) {
        if ( unencoded[0] < 0.1 ) {
            slider.noUiSlider.set(0.1);
        } else if ( unencoded[0] > 2 ) {
            slider.noUiSlider.set(2);
        }
    });


    $('#search_form .location .clear').click(function() {
        if (!$(this).parent().find('input#location').prop('disabled')) {
            set('location', '')
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
                getLocation().then(geocode);
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

    function unsupported(feature) {
        snack('Sorry, this feature is not supported yet', {
            button: '<i class="material-icons">help_outline</i>',
            link: {
                page: 'exchanges',
                pane: 'help',
                help: {
                    topic: 'Why do we enable unsuported features?',
                    content:
                        "<p>It's important for us to know how needed some features are - so we know when to provide them.</p>" +
                        "<p >This is done for a limited time only.</p>" +
                        "<p>Apologize for any inconvenience!</p>"
                }
            }
        });
        report('Feature', feature);
    }

    $(".search_section.pay input[type=checkbox]").change(function() {
        if(this.checked) {
            unsupported('Pay by credit');
        } else {
            snackHide()
        }
    });

    $(".search_section.get input[type=checkbox]").change(function() {
        if(this.checked) {
            unsupported('Delivery');
        } else{
            snackHide()
        }
     });


    // pointer-events important!
    showDialog = function(options) {
        if (pane == 'survey') return;
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
        $('#myModal').modal('hide');
        $('.modal').css('pointer-events', 'none');
    };


    $('body').on('click tap', function() {
        if ($('body').hasClass('modal-open')) {
            hideDialog();
        }
    });

    $('body').on('click tap', '.list-group-item', function() {
        console.log('click caught');
        $(this).find('.list-group-item-text').toggleClass('expand');
    })

});
