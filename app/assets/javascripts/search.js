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


    // Sorting

    sort_by = function(sort) {

        console.log('sort by ' + sort);
        if (exchanges.length == 0) return exchanges;

        if (sort == 'distance') {
             if ($('[data-sort=distance]').data('order') == 'asc') {
                exchanges.sort(function(a, b){return a.properties.distance - b.properties.distance});
            } else {
                exchanges.sort(function(a, b){return b.properties.distance - a.properties.distance});
            }
        }
        else
        if (sort == 'price') {
            if ($('[data-sort=price]').data('order') == 'asc') {
                exchanges.sort(function(a, b){return (a.properties.quote ? a.properties.quote : 10000000) - (b.properties.quote ? b.properties.quote : 10000000)});
             } else {
                exchanges.sort(function(a, b){return (b.properties.quote ? b.properties.quote : 10000000) - (a.properties.quote ? a.properties.quote : 10000000)});
            }
        } else
        if (sort == 'reverse') {
            exchanges.reverse();
            toggleOrder($('[data-sort].active'));
        }

/*
        if (sort != 'reverse') {
            set('sort', sort);
            if (!$('[data-sort=' + sort + ']').hasClass('active')) { //if sorted programmatically (otherwise ui already changed that upon user click)
                $('[data-sort]').removeClass('active');
                $('[data-sort=' + sort + ']').addClass('active');
            }
        }
*/

        return exchanges;
     };

    $('[data-sort]').click(function() {

        var $this = $(this);
        var sort = $this.hasClass('active') ? 'reverse' : $this.data('sort');

        if (sort != 'reverse') {
            $('[data-sort]').removeClass('active');
            $('[data-sort=' + sort + ']').addClass('active');
        }

        updateList(exchanges, 'more', sort);

    });


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

    $('form [data-model=search][data-field]').on('click tap', function() {

        console.log('moving to a new field');
        var $this = $(this);
        var field = $this.data('field');
        if (amount(field)) clear($this);
    });

    $('form [data-model=search][data-field]').keyup(function() {

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
        var valid = value_of('pay_amount') || value_of('buy_amount');
        if (!valid) {
            $('.form-group.pay_amount').addClass('has-error is-focused').find('.help-block').addClass('required');
            $('.form-group.buy_amount').addClass('has-error').find('.help-block').addClass('required');
        } else {
            $('.form-group.pay_amount').removeClass('has-error is-focused').find('.help-block').removeClass('required');
            $('.form-group.buy_amount').removeClass('has-error').find('.help-block').removeClass('required');
        }
        return valid;
    };

    $('[data-ajax=searches]').click(function(e) {
        e.preventDefault();
        if (inputValid()) {
            set('location_reason', 'user search');
            search(search.location)
                .then(addCards)
                .catch(alertError);
            window.history.back();
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

        progress('start');
        var reason = location.reason ? location.reason : '';
        console.log('search invoked. ' + reason);

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


            fetch('/searches', {
                method: 'post',
                body: new FormData(document.getElementById('search_form'))
            })
                .then(checkStatus)
                .then(parseJson)
                .then(function (data) {
                    console.log('search completed succesfully');
                    searchResult = data.exchanges;
                    exchanges = data.exchanges.features;
                    resolve(searchResult);
                    if (!openning_scene) setTimeout(function(){progress('end')}, 3500);
                })
                .catch(function (error) {
                    console.log('catch!');
                    reject(error)
            });

        })

    };


    // Card interaction

    $('body').on('click tap', '.ecard:not(.selected)', function(e) {
        e.stopPropagation();
        var $this = $(this);
        $('.progress').css('display', 'none');
        $this.css('transform', 'translate(' + cardXoffset + ', 10px)');
        $this.addClass('selected');
    });

    $('body').on('click tap', '.ecard.selected .actions_line', function(e) {
        e.stopPropagation();
        var $currCard = $('.swiper-slide-active');
        var cardWasSelected = $currCard.hasClass('selected');
        $currCard.toggleClass('selected');   // toggleClass performed before renderDirection to prevent ui ticks
        if (cardWasSelected) {
            renderDirections(currExchange())
        } else {
            $currCard.css('transform', 'translate(' + cardXoffset + ', 10px)');
        }
    });

    $('body').on('click tap', '.nav_icon', function(e) {
        e.stopPropagation();
        renderDirections(currExchange());
        $('.swiper-slide-active').removeClass('selected');
    });



    // Radius slider interaction

    function updateRadius ( values, handle, unencoded, tap, positions ) {
        // values: Current slider values;
        // handle: Handle that caused the event;
        // unencoded: Slider values without formatting;
        // tap: Event was caused by the user tapping the slider (boolean);
        // positions: Left offset of the handles in relation to the slider
        radius.value = unencoded[0].toFixed();
    }


    slider.noUiSlider.on('update', updateRadius);

    slider.noUiSlider.on('change', function ( values, handle, unencoded ) {
        if ( unencoded[0] < 20 ) {
            slider.noUiSlider.set(20);
        } else if ( unencoded[0] > 80 ) {
            slider.noUiSlider.set(80);
        }
    });

    // Radar & Progress bar


    animation = function($e, verb) {
        if (verb == 'start') {
            $e.removeClass('fadeOut').css('display', 'block')
        } else {
            $e.addClass('fadeOut')
        }
    };

    radar = function(verb) {
        animation($('#newradar'), verb)
    };

    progress = function(verb) {
        animation($('.progress'), verb)
    }




});