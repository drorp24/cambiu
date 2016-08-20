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

    // TODO: Remove when only one form exists!
    // when a form field changes in one form, it should change in other forms too
    bind_forms = function() {
        $('form [data-field]').keyup(function() {
            var $this = $(this);
            var field = $this.data('field');
            var value = $this.val();
            set(field, value);
        });
    };


    $('#exchanges').on('click','.open_search', function(e) {
        $('#exchange_params_change').collapse('toggle')
    });


    // Location - all handled at findlocation.js

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


    // UI



    // UI - Display proper symbol on amount fields based on respective currency fields

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

/*
    $('body').on('click tap', '[data-ajax=createOrder]', (function (e) {

        var exchange_id = $(this).attr('data-exchange-id');
        var search_id = value_of('search_id');
        var offer = findExchange(exchange_id);
        if (!exchange_id || !offer || !search_id) {
            console.log('Cannot create order: exchange_id, exchange offer or search_id are missing');
            return
        }

        $.ajax({
            type:       'POST',
            url:        '/orders',
            data:       {
                'order[exchange_id]':       exchange_id,
                'order[search_id]':         search_id,
                'order[pay]':               offer.pay_amount,
                'order[buy]':               offer.buy_amount,
                'order[user_location]':     offer.user_location,
                'order[base_currency]':     offer.rates['base_currency'],
                'order[rated_currency]':    offer.rates['rated_currency'],
                'order[buy_rate]':          offer.rates['buy'],
                'order[sell_rate]':         offer.rates['sell']
            },
            dataType:   'JSON',
            success:    function (data) {
                console.log('Order successfully created');
                populate('order', data)
                },
            error:      function (data) {
                console.log('There was an error creating the order');
                }
        });

    }));
*/

 /*   $('body').on('click tap', '[data-ajax=updateOrder]', (function (e) {

        var order_id        = value_of('order_id');
        var order_status    = $(this).data('order-status');
        if (!order_id || !order_status) {
            console.log('Cannot update order: order_id or order_status are missing');
            return
        }

        $.ajax({
            type:       'PUT',
            url:        '/orders/' + order_id,
            data:       {
                'order[status]':            order_status
             },
            dataType:   'JSON',
            success:    function (data) {
                console.log('Order successfully updated');
                if (order_status == 'ordered') {
                    /!*                   swal({
                     title: "Ordered!",
                     html: true,
                     text: "Your order is ready and waiting for you at </br><strong>" + value_of('exchange_name') + '</strong></br>' + value_of('exchange_address'),
                     type: 'success'
                     })
                     *!/
                     swal({
                     title: "Ordered",
                     html: true,
                     text: '<strong>' + value_of('exchange_name') + '</strong></br>' + value_of('exchange_address'),
                     type: "success",
                     showCancelButton: true,
                     confirmButtonColor: "#DD6B55",
                     confirmButtonText: "OK",
                     cancelButtonText: "Directions"
                     },
                     function(isConfirm){
                     if (isConfirm) {
                     setPage('exchanges', 'id', 'order');
                     } else {
                     setPage('exchanges', 'id', 'directions');
                     }
                     });
                 }
            },
            error:      function (data) {
                console.log('There was an error updating the order');
            }
        });

    }));


*/


    // Turn location fields into google searchBox's
    $('input[data-field=location]').each(function() {
        input = $(this).get(0);
        searchBox = new google.maps.places.SearchBox(input, {
            types: ['regions']
        });
        searchbox_addListener(searchBox);
    });

    // Widen location in #new_parameters when clicked
    $('body.desktop #new_parameters [data-field=location]').click(function() {
        $('.pac-container').css('transition',
            'all .5s ease');
        $('.pac-container').css('width',
            '300px');
    });

    // fix their z-index dynamically
    $('input[data-field=location]').click(function() {
        if (!pacContainerInitialized) {
            $('.pac-container').css('z-index',
                '9999');
            pacContainerInitialized = true;
        }
    });










    //
    // AJAX Callbacks
    //



    search = function(reason) {

        console.log('search invoked. Reason: ' + reason);

        return new Promise(function(resolve, reject) {

            function status(response) {
                if (response.ok) {
                    return Promise.resolve(response)
                } else {
                    return Promise.reject(response.statusText)
                }
            }

            function json(response) {
                return response.json()
            }

            fetch('/searches', {
                method: 'post',
                body: new FormData(document.getElementById('search_form'))
            })
                .then(status)
                .then(json)
                .then(function (data) {
                    console.log(':) search completed succesfully');
                    search = data;
                    exchanges = data.exchanges.features;
                    resolve(search)
                })
                .catch(function (error) {
                    reject(error)
            });

        })

    };





    // Before actions

    startLoader = function() {

      // will be required again if only the entire list is presented initially
        // currently, when only best list is initially displayed, the empty message has to be displayed on the best list part's '#fetch_more' div
        $('#empty_message').css('display', 'none');
        $('#result_message').css('display', 'none');

        $('#loader_message').css('display', 'block');
    };


    $('#search_form').on('ajax:before', function() {
        startLoader();
        clearList();
        $('input[type=hidden][id=pay_amount_val]').remove();
        $('input[type=hidden][id=buy_amount_val]').remove();
    });

    $('#search_form').on('ajax:success', function(event, data, status, xhr) {
        console.log('#search_form ajax:success. Starting to updateExchanges...');
        updateExchanges(data);
     });

    $('#search_form').on('ajax:error', function(event, xhr, status, error) {
        console.log('#search_form ajax:error. Error: ' + error);
        alert('We are unable to process your request at this time. Please try again in a few moments');
        updateResults(null);
    });


});