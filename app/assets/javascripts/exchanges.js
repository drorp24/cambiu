//
//  E X C H A N G E S
//
//  Uses the exchanges buffer returned by search form callback to update all markup



    updateExchanges = function(data) {

        if (data == null) {
            alert('Unfortunately we cannot serve you at this time. Please try again in a few moments');
            return;
        }
        console.log('updateExchanges');
        set('search_id', data.search);
        search = data;
        exchanges = search.exchanges.features;

        updateMap(search.exchanges);
// TODO: only updatCards if there are exchanges returned
        updateCards(exchanges);
    };



    updateCards = function(exchanges, sort) {

        var sort = sort ? sort : value_of('sort');
        exchanges = sort_by(sort);

        for (var i = 0; i < Math.min(initialSlides, exchanges.length); i++) {
            addCard(exchanges, i);
        }

        initSwipers();

     };


// TODO: Replace classes with data- attributes, do it in a loop over the data fields, so I dont need to change it whenever I add another field to fetch
    function addCard(exchanges, index) {

        var exchange = exchanges[index].properties;
        if (exchange.errors.length > 0) return;
        console.log('addCard called. exchange id: ' + exchange.id);
        var exchange_el = $('.card.template').clone().removeClass('template').attr('data-exchange_id', exchange.id);

/*
        exchange_el.attr('data-href-id', exchange.id);
        exchange_el.attr('data-exchange-id', exchange.id);

        exchange_el.find('.best_at').html(' ');
        if (exchange.best_at[0]) exchange_el.find('.best_at').addClass(exchange.best_at[0]);
        exchange_el.find('.name').html(exchange.name_s);
        exchange_el.find('.address').html(exchange.address);
        exchange_el.find('.open_today').html(exchange.open_today);
        exchange_el.find('.phone').attr('href', exchange.phone ? 'tel:+44' + exchange.phone.substring(1) : "#");
        exchange_el.find('.distance').html((exchange.distance * 1000).toFixed(0));
        exchange_el.find('.quote').html(exchange.edited_quote);
        exchange_el.find('.quote_currency').html(exchange.quote_currency);
        exchange_el.find('.base_rate').html(exchange.base_rate);
        exchange_el.find('.gain_amount').html(exchange.gain_amount);
        exchange_el.find('.gain_type').addClass(exchange.gain_type);
*/

        exchange_el.appendTo($('#cards'));
        initSwiperV();
        populatePlace(exchange);
        slidesAdded.push(index);
    }


    clearList = function () {
        list = value_of('list');
        if (list == 'best') $('#exchanges_list #best_exchanges').empty();
        $('#exchanges_list #exchanges_items').empty();
    };


    updateResults = function (data) {

        console.log('updateResults');

        $('#loader_message').css('display', 'none');
        $('#exchange_params_change').collapse('hide');

        if (exchanges && exchanges.length) {

            var list = value_of('list');
            if (list && list != 'best' ) $('#exchanges_search_results').css('display', 'block');
            $('#exchanges_search_params span').css('display', 'inline');
            $('#exchanges_search_params span.change_link').html('change');
            $('#fetch_more').html('<a href=#>Show more</a>');

        } else {

            $('#exchanges_search_results').css('display', 'none');
            $('#exchanges_search_params span:not(.change_link').css('display', 'none');
            $('#exchanges_search_params span.change_link').html('change your search');
            $('#exchanges_list .more').css('display', 'block');
            $('#fetch_more').html('No results found in that area.');
        }

    };

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

