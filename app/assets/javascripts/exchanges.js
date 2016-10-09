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

        console.log('addCard called. exchange id: ' + exchange.id);
        var $card = $('.card.template').clone().removeClass('template').attr('data-exchange_id', exchange.id).css('height', cardHeight);



        $card.appendTo($('#cards'));
        populatePlace(exchange);
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

$(document).ready(function() {
    $('body').on('click tap', '.card.swiper-slide-active', function () {
        id = $(this).closest('[data-exchange_id]').data('exchange_id');
        setPage('exchanges', id, 'offer')
    })
});

