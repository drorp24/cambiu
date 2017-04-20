//
//  E X C H A N G E S
//
// Responsible for displaying offers to the user
//
// - selecting which of the returned exchanges is fit to display as offer
// - ranking the offers algorithmically
// - displaying them to fit either mobile or desktop layouts by invoking populate.js and defining its $scope


    // return 'offers' = 'exchanges' worth displaying, ranked
     selectOffers = function() {

        return new Promise(function(resolve, reject) {

            console.log('selectOffers');

            offers = [];
            if (exchanges.length == 0) resolve(exchanges);

            offers = $.grep(exchanges, function (e) {
                return e.properties.distance < sessionStorage.radius && e.properties.errors.length == 0;
            });

            if (offers.length > 0) {

                offers.sort(function (a, b) {
                    return grade(a) - grade(b);
                });

                offers[0].properties.best_at.push('best');

            }

            resolve(offers);

        })
    };

    function no(offers) {
        if (offers.length == 0) {
            snack("No offer for these parameters. <br> Click OK to change them", {button: 'ok', klass: 'oops', link: {page: 'exchanges', pane: 'search'}});
            return true;
        }
    }

    clearPrevSearch = function() {
        if (mode == 'mobile' || mode == 'both') {
            $('#cards').empty();
            slidesAdded = [];
            swiperH.slideTo(0, 100, false);
        }
        if (mode == 'desktop' || mode == 'both') {
            $('.exchanges_list').empty();
        }
        if (directionsDisplay) clearDirections();
    };

    displayOffers = function() {

        clearPrevSearch();

        if (no(offers)) return;

        console.log('displayOffers');

        for (var i = 0; i < Math.min(initialSlides, offers.length); i++) {
            var offer = offers[i].properties;
            addOffer(offer, i);
        }

    };


    function addOffer(offer, index) {

        if (mode == 'mobile' || mode == 'both') {
            var $scope = $('.ecard.template').clone().removeClass('template');
            $scope.appendTo($('#cards'));
            populate(offer, $scope, index);
            slidesAdded.push(index);
        }
        if (mode == 'desktop' || mode == 'both') {
            var $scope = $('.listItem.template').clone().removeClass('template');
            $scope.appendTo($('.exchanges_list'));
            populate(offer, $scope, index);
        }

    }


     // TODO: looks like 'offers' should be checked, not 'exchanges'
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
        if ($(this).is('.actions_line')) {
            report('Tap', 'Directions');
        } else {
            report('Tap', 'DirectionsBtn');
        }

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

    currentExchange = function() {

        var exchanges = offers;
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

    grade = function(exchange, distance_factor = 1.5) {

        if (value_of('buy_amount')) {
            result = Number(exchange.properties.quote) || 10000000;
        } else {
            result = Number(exchange.properties.quote) * -1 || 0;
        }
        result += exchange.properties.distance * distance_factor;
        exchange.grade = result;
        return result;

    };

    rankCheck = function() {

        offers.forEach((exchange) => {
            console.log('quote: ', exchange.properties.quote, 'distance: ', exchange.properties.distance, 'grade: ', exchange.grade)
        })
    };


