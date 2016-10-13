//
//  E X C H A N G E S
//
//  Uses the exchanges buffer returned by search form callback to update all markup



    addCards = function(sort) {

        console.log('addCards');

        var sort = sort ? sort : value_of('sort');
        exchanges = sort_by(sort);

        for (var i = 0; i < Math.min(initialSlides, exchanges.length); i++) {
            var exchange = exchanges[i].properties;
            addCard(exchange, i);
            if (i == 0) $('.swiper-container').css('display', 'block')
        }

        initSwipers();

     };


// TODO: Replace classes with data- attributes, do it in a loop over the data fields, so I dont need to change it whenever I add another field to fetch
    function addCard(exchange, index) {

        var $card = $('.card.template').clone().removeClass('template').attr('data-exchange_id', exchange.id).css('height', cardHeight);
        $card.appendTo($('#cards'));

        fetchPlace(exchange)
        .then(function(exchange) {
                populateExchange(exchange, $card);
        })
        .catch(function(error) {
                console.warn('addCard catch: fetchPlace returned an error: ' + error)
        });

        slidesAdded.push(index);
    }


      findExchange = function(id) {
        if (exchanges && exchanges.length > 0) {
            var results = $.grep(exchanges, function(e){ return e.properties.id == id; });
            if (results[0]) {
                return results[0].properties;
            } else {
                console.log('exchange ' + id + ' was not found in exchanges array');
                return null
            }
        } else {
            console.log('exchanges is empty');
            return null
        }
    };

    currExchange = function() {
        return $('#cards > .swiper-slide-active').data('exchange_id')
    };


    updateExchange = function(exchange_id, data) {
        $.ajax({
            type: 'PUT',
            url: '/exchanges/' + exchange_id,
            data: data,
            dataType: 'JSON',
            success: function (data) {
                console.log('Exchange successfully updated');
            },
            error: function (data) {
                console.log('There was an error updating the exchange');
            }
        });
    };

    getExchange = function(exchange_id, property) {
        $.ajax({
            type: 'GET',
            url: '/exchanges/' + exchange_id + '/get',
            data: 'property=' + property,
            dataType: 'JSON',
            success: function (data) {
                console.log('Exchange successfully returned value');
                console.log(data)
            },
            error: function (data) {
                console.log('There was an error getting value from the exchange');
            }
        });
    };

$(document).ready(function() {
    $('body').on('click tap', '.card.swiper-slide-active', function () {
        id = $(this).closest('[data-exchange_id]').data('exchange_id');
        setPage('exchanges', id, 'offer')
    })
});

