//
//  E X C H A N G E S
//
//  Uses the exchanges buffer returned by search form callback to update all markup



    clearPrevSearch = function() {
        $('#cards').empty();
        slidesAdded = [];
        swiperH.slideTo(0, 100, false);
    };

    addCards = function() {

        clearPrevSearch();

        if (within_radius.length == 0) {
            snack("No information in this area yet. <br> Click 'OK' to search elsewhere.", {button: 'ok', klass: 'oops', link: {page: 'exchanges', pane: 'search'}});
            return;
        }

        console.log('addCards');

        for (var i = 0; i < Math.min(initialSlides, within_radius.length); i++) {
            var exchange = within_radius[i].properties;
            addCard(exchange, i);
        }

    };


    function addCard(exchange, index) {

        var $card = $('.ecard.template').clone().removeClass('template');
        $card.appendTo($('#cards'));

        populateExchange(exchange, $card, index);

        fetchPlace(exchange)
            .then(exchange => {populatePlace(exchange, $card)})
            .catch(error => {console.warn(error)});

        findDuration(exchange)
            .then(exchange => {populateDuration(exchange, $card)})
            .catch(error => {console.warn(error)});

        slidesAdded.push(index);
    }

    revealCards = function() {
        if (exchanges.length == 0) {
            $('.swiper-container-h').css('display', 'none');
            return;
        }
        $('.swiper-container').css('display', 'block');
        setTimeout(function() {
            cardXoffset = String(($('.ecard').eq(0).position().left + $('#cards').position().left) * -1) + 'px';
        }, 1000)
    };


    $('body').on('click tap', '.ecard:not(.selected)', function(e) {

//        e.stopPropagation();
        var $this = $(this);
        $this.css('transform', 'translate(' + cardXoffset + ', 0px)');
        $this.addClass('selected');
        populateStreetview(currentExchange());
        report('Tap', 'Card');

    });

    $('body').on('click tap', '.ecard.selected .actions_line, .ecard.selected .nav_icon', function(e) {

//        e.stopPropagation();
        $('#best_offer').popover('hide');
        var $navBtn = $('.nav_icon_container');
        $navBtn.addClass('rotate');
        renderDirections(currentExchange());
        report('Tap', 'Directions');

        setTimeout(function(){

            currentCard().removeClass('selected');
            $navBtn.removeClass('rotate');

        }, 150);

    });

    $('body').on('click tap', '.nav_icon', function(e) {
//        e.stopPropagation();
        $('.nav_icon_container').addClass('rotate')
    });



    // Utility functions

    findExchange = function(id) {
        if (exchanges && exchanges.length > 0) {
            var results = $.grep(exchanges, function(e){ return e.properties.id == id; });
            if (results[0]) {
                return results[0].properties;
            } else {
                throw new Error('exchange ' + id + ' was not found in exchanges array');
            }
        } else {
            console.log('exchanges is empty');
            throw new Error('exchanges is empty');
        }
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

    rank = function() {

        return new Promise(function(resolve, reject) {

            if (exchanges.length == 0) resolve(exchanges);
            console.log('rank');

            within_radius = $.grep(exchanges, function (e) {
                return e.properties.distance < sessionStorage.radius /*&& e.properties.errors.length == 0*/;
            });
            if (within_radius.length > 0) {
                within_radius.sort(function (a, b) {
                    return compare(a.properties, b.properties)
                });
                within_radius[0].properties.best_at.push('best');
            }

            resolve(within_radius);

        })
    };


    compare = function(a, b, distance_factor = 1.5) {
        // a & b compete who gets the lower grade
        // the result returned is a_grade - b_grade
        // if this result is negative, a won, otherwise b won

        var a_grade, b_grade;

        if (value_of('buy_amount')) {
            a_grade = a.quote || 10000000;
            b_grade = b.quote || 10000000;
        } else {
            a_grade = a.quote * -1 || 0;
            b_grade = b.quote * -1 || 0;
        }

        a_grade += a.distance * distance_factor;
        b_grade += b.distance * distance_factor;

/*
        var diff = a_grade - b_grade;
        console.log(diff < 0 ? "A is better" : (diff == 0 ? "Both are equivalent" : "B is better"));
*/
        return a_grade - b_grade;
    };

    rankCheck = function() {

        exchanges.forEach((exchange) => {
            console.log('quote: ', exchange.properties.edited_quote, 'distance: ', exchange.properties.distance)
        })
    };


    currentExchange = function() {


        var exchanges = within_radius;
        var exchangesLength = exchanges.length;
        var currentIndex = currIndex();

        if (exchanges && exchangesLength > 0) {
            if (currentIndex < exchangesLength) {
                return exchanges[currentIndex].properties
            } else {
                throw new Error('index > exchanges length');
            }
        } else {
            return null
        }
    };



