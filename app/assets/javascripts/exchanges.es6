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
                return /*e.properties.distance < sessionStorage.radius &&*/ e.properties.errors.length == 0;
            });

            if (offers.length > 0) {

                offers.sort(function (a, b) {
                    return grade(a) - grade(b);
                });

//              offers.map((offer, index) => {offer.properties.rank = index; return offer});
                for (let [index, offer] of offers.entries()) {exchangeHash[offer.id].rank = index + 1}
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
        resetPaging();
    };

    populateOffers = function() {

        clearPrevSearch();

        if (no(offers)) return;

        console.log('populateOffers');

        page = 1;
        populatePage(page);
        $('.pagination').addClass('active');

    };


    function addOffer(offer, index, page) {

        if (mode == 'mobile' || mode == 'both') {
            var $scope = $('.swiper-slide.ecard.template').clone().removeClass('template');
            $scope.appendTo($('#cards'));
            populate(offer, $scope, index, page);
            slidesAdded.push(index);
        }
        if (mode == 'desktop' || mode == 'both') {
            var $scope = $('.list-group-item.ecard.template').clone().removeClass('template');
            $scope.appendTo($('.exchanges_list'));
            populate(offer, $scope, index, page);
        }

    }


     // TODO: looks like 'offers' should be checked, not 'exchanges'
    revealCards = function() {
        $('.swiper-container-h').css('display', offers.length == 0 ? 'none' : 'block');
    };



    // Utility functions

    currentExchange = function() {

        var offersLength = offers.length;

        if (offers && offersLength > 0) {

            if ($('.active.pane').data('pane') == 'cards') {
                var currentIndex = currIndex();
                if (currentIndex < offersLength) {
                    return offers[currentIndex].properties
                }

            } else {

                var selected_exchange_id = $('.selected').length && $('.selected').data('exchange-id');
                if (selected_exchange_id) {
                    return exchangeHash[selected_exchange_id]
                } else {
                    return offers[0].properties
                }
            }

        }
    };

/*  Retired: exchangeHash replaces it
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
*/

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

    select = function($this) {

        $('.pagination').css('display', 'none');
        $('.swiper-container-h').css('bottom', '0px');
        $this.addClass('selected');
        $('.list-group-item.ecard:not(.selected)').hide();
        if ($('.active.pane').data('pane') == 'cards') $this.css('transform', 'translate(' + cardXoffset + ', 0px)');

        populateStreetview(currentExchange());
        report('Tap', 'Card');
        clearDirections();

    };

    unselect = function($this) {

        $('.selected.ecard').removeClass('selected');
        if ($('.active.pane').data('pane') == 'list') {
            $('.pagination').css('display', 'flex');
            $('.list-group-item.ecard[data-page=' + page + ']').show();
        }

    };

    listAddClass = function(klass, exchange_id) {
        $('.list-group-item.ecard:not(.selected)').removeClass(klass);
        $('.list-group-item.ecard:not(.selected)[data-exchange-id=' + exchange_id + ']').addClass(klass);

    };

    listRemoveClass = function(klass, exchange_id) {
        $('.list-group-item.ecard:not(.selected)[data-exchange-id=' + exchange_id + ']').removeClass(klass);

    };


//  EVENTS

$('body').on('click tap', '.ecard:not(.selected)', function(e) {
    select($(this));
});

$('body').on('click tap', '.ecard.selected .lessmore.icon', function(e) {
    unselect($(this));
});

$('body').on('mouseover', '.ecard:not(.selected)', function(e) {

    var currId = $(this).data('exchange-id');

    markerLayerAddClass(currId, 'current');

});


zoomIn2 = function() {
    var bounds = new google.maps.LatLngBounds();
    bounds.extend(new google.maps.LatLng(search.location.lat ,search.location.lng));
    for (offer of offers.slice(0, 1)) {bounds.extend(new google.maps.LatLng(offer.properties.latitude ,offer.properties.longitude))}
    map.fitBounds(bounds);
};


// LIST PAGING



function populatePagination (fromResult, toResult, prev, next) {

    if ($('.active.pane').data('pane') != 'list') return;

    $('[data-model=page][data-field=fromResult]').html(fromResult);
    $('[data-model=page][data-field=toResult]').html(toResult);
    if (prev) {
        $('.pagination .prev').addClass('active');
    } else {
        $('.pagination .prev').removeClass('active');
    }
    if (next) {
        $('.pagination .next').addClass('active');
    } else {
        $('.pagination .next').removeClass('active');
    }


}

function unpopulatePagination() {

    populatePagination('', '', false, false);
    $('.pagination').removeClass('active');

}

function showPage(page) {
    $('.list-group .ecard[data-page=' + page + ']').css('display', 'flex');
}

function hidePages() {
    $('.list-group .ecard[data-page]').css('display', 'none');
}



populatePage = function(page) {

    var offersLength  = offers.length;
    var fromResult    = (resultsPerPage * (page -1)) + 1;
    var toResult      = Math.min(resultsPerPage * page, offersLength);
    var prev          = fromResult > resultsPerPage;
    var next          = toResult < offersLength;

    if ($('.active.pane').data('pane') == 'list') {
        hidePages();
        if  (pagesAdded.includes(page)) {
            showPage(page);
            populatePagination(fromResult, toResult, prev, next);
            return
        }
    }


    for (var result = fromResult; result <= toResult; result++) {
        var offer = offers[result -1].properties;                       // results talks user languages so starts with 1, but the offers array starts with 0
        addOffer(offer, result -1, page);
    }

    populatePagination(fromResult, toResult, prev, next);
    showPage(page);
    pagesAdded.push(page);

};


nextPage = function() {

    if (offers.length > resultsPerPage * page) {
        page += 1;
        populatePage(page);
    } else {
        console.log('No more results to page')
    }

};

prevPage = function() {

    if (page > 1) {
        page -= 1;
        populatePage(page);
    } else {
        console.log('No previous page')
    }

};

resetPaging = function() {
    page = 0;
    pagesAdded = [];
    unpopulatePagination();
};



