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
            disable($('.md-form.select.' + other(field)), value);

            $('[data-autonumeric][data-field=' + target + ']').each(function() {
                update_currency_symbol($(this), symbol);
            })
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
        return field.includes('pay') ? 'buy' + field.split('pay')[1] : 'pay' + field.split('buy')[1]
    };

    twin = function(field) {
        var split = field.split('_');
        return split[1] == 'amount' ? split[0] + '_currency' : split[0] + '_amount';
    };

    clean = function(value) {
        return Number(String(value).replace(/[^0-9\.]+/g,""))
    };

    clear = function($e) {
        var field = $e.data('field');
//        console.log('clear ' + field + '. val():' + $e.val(), $e[0]);
        if ($e.val()) set(field, '');
    };

    hasError = function($e) {
        return $e.closest('.form-group').hasClass('has-error');
    };

    clearError = function($e) {
        $e.closest('.form-group').removeClass('has-error');
    };

    brother = function($e) {
        return $('#search_form [data-model=search][data-field=' + other($e.data('field')) + ']');
    };

    $('#search_form [data-model=search][data-field]').on('click tap', function() {

//        console.log('moving to a new field');
//        if ($('#search_form .location').hasClass('is-focused')) console.log('focus!');
        var $this = $(this);
        var field = $this.data('field');
        if (amount(field)) clear($this);
    });

    $('#search_form [data-model=search][data-field]').keyup(function() {

//        console.log('keying a character');
        var $this = $(this);
        var field = $this.data('field');
        var value = $this.val();

        set(field, value);
        if (amount(field) && value) clear(brother($this));
    });



    // User manual search: form validation & submit

    inputValid = function() {

        var amountValid = value_of('pay_amount') || value_of('buy_amount');
        if (!amountValid) console.log('Invalid amount');

        var locationValid = $('input#location').val() && !locationDirty;
        if (!locationValid) console.log('Invalid location. input#location: ', $('input#location').val(), 'locationDirty:', locationDirty );

        var currencyValid = $('.form-group #pay_currency').val() != $('.form-group #buy_currency').val();
        if (!currencyValid) console.log('Invalid currency');

        valid = !!(amountValid && locationValid && currencyValid);
        return valid;
    };

    $('[data-ajax=searches]').click(function(e) {
        e.preventDefault();
        if (inputValid()) {
            setPage({page1: 'exchanges', pane1: 'offers'});
            search_and_show(search.location);
        }
    });



    search = function() {

        return new Promise(function(resolve, reject) {

            function startSearch() {
                start_show();
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
                    body: new URLSearchParams($( "#search_form input, #search_form select" ).serialize())
                })
            }

            function finishSearch (data) {
                console.log('search completed succesfully');
                searchResult = data.exchanges;
                set('search_id', searchId = data.search);
                tagSession({search: searchId});
                exchanges = data.exchanges.features;
                exchangeHash = {};
                for (var exchange of exchanges) {exchangeHash[exchange.properties.id] = exchange.properties}
                resolve(exchanges);
                wait(750).then(stop_show);
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

    fetchBest = function() {

        return new Promise(function(resolve, reject) {

            function fetchRates() {
                return fetch('/searches/bestRates?' + $( "#search_form input, #search_form select" ).serialize(), {
                    method: 'get'
                })
            }

            function tell(error) {
                console.log('catch during fetchBest!');
                reject(error)
            }

            function returnResults(data) {
                resolve(data)
            }

            fetchRates()
                .then(checkStatus)
                .then(parseJson)
                .then(returnResults)
                .catch(tell);
        })

    };



    // Radius slider interaction

/*
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

    slider.noUiSlider.on('end', function() {
        report('Tap', 'Radius');
    });

    slider.noUiSlider.on('change', function ( values, handle, unencoded ) {
        if ( unencoded[0] < 0.1 ) {
            slider.noUiSlider.set(0.1);
        } else if ( unencoded[0] > 5 ) {
            slider.noUiSlider.set(5);
        }
    });
*/


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


    $('.phone_icon').on('click tap', function() {
        report('Tap', 'Phone');
    });

    $('.swiper-slide.a .getOffer.btn').on('click tap', function() {
        report('Tap', 'Get an offer (1)')
    });

    $('.swiper-slide.d .getOffer.btn').on('click tap', function() {
        report('Tap', 'Get an offer (4)')
    });

    $('.swiper-slide.b .slide_line .left').on('click tap', function() {
        report('Tap', 'Skip (2)')
    });

    $('.swiper-slide.c .slide_line .left').on('click tap', function() {
        report('Tap', 'Skip (3)')
    });


});
