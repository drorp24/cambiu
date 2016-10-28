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



    $('.getstarted_button').click(function(){
        if ($('#search_form').valid()) {
            console.log('getstarted button clicked: submitting search form')
            $('#search_form').submit();
        } else {
            $('#homepage input[data-field=buy_amount]').focus()
        }
    });



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



    $('form [data-model=search][data-field]').keyup(function() {

        var $this = $(this);
        var field = $this.data('field');
        var value = $this.val();
        set(field, value);

    });

    $('form [data-model=search][data-field]').click(function() {

        var $this = $(this);
        var field = $this.data('field');
        if (field.indexOf('amount') > -1) $this.val("");
    });

    search = function(reason) {

        console.log('search invoked. Reason: ' + reason);

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
                    console.log(':) search completed succesfully');
                    searchResult = data;
                    exchanges = data.exchanges.features;
                    resolve(searchResult)
                })
                .catch(function (error) {
                    console.log('catch!')
                    reject(error)
            });

        })

    };


    $('[data-ajax=searches]').click(function(e) {
        e.preventDefault();
        search('form clicked')
            .then(addCards)
            .catch(alertError);
    });




});