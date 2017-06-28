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
            snack("No offers for these criteria. <br> Click OK to change them.", {button: 'ok', klass: 'oops', link: {page: 'exchanges', pane: 'search'}});
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

        pageNum = 1;
        populatePage({page: pageNum, list: true, cards: true});
        $('.pagination').addClass('active');

        selectExchange($('.active.pane .best.ecard'), false);

    };


    function addOffer({offer, index, page, list, cards}) {

        var $card = null, $item = null;

        if (cards) {
            $card = $('.ecard.template').clone().removeClass('template').addClass('swiper-slide');
            $card.appendTo($('#cards'));
            slidesAdded.push(index);
        }
        if (list) {
            $item = $('.ecard.template').clone().removeClass('template').addClass('list-group-item');
            $item.appendTo($('.exchanges_list'));
        }

        populate(offer, [$card, $item], index, pageNum);

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

    selectExchange = function($exchange, manual = true) {

        $exchange.addClass('selected');
        if ($exchange.is('.ordered')) $exchange.addClass('order');

        $('.swiper-container-h').css('bottom', '0px');
        if ($('.active.pane').data('pane') == 'cards') $exchange.css('transform', 'translate(' + cardXoffset + ', 0px)');

        setPage({pane1: 'offer', id1: 'curr'});
        populateStreetview(currentExchange());
        clearDirections();

        if (manual) report('Select', 'Exchange');
    };

    unselectExchange = function() {

        $('.selected.ecard').removeClass('selected');

        if (isSafari2) $('.swiper-container-h').css('bottom', '60px');

    };

    // Left here but not needed - thought as long as any exchange is selected, no pane should supersede 'offers'/cards/list but that's not true
    exchangeIsSelected = function() {
        return !!value_of('selected');
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
    selectExchange($(this));
});

$('body').on('click tap', '.ecard.selected .lessmore.icon', function(e) {
    unselectExchange($(this));
});

$('body').on('mouseover', '.ecard:not(.selected)', function(e) {

    var currId = $(this).data('exchange-id');

    markerLayerAddClass(currId, 'current');

});


zoomIn2 = function() {
    console.log('zoomIn2');
    if (offers.length == 0) {
        map.setZoom(15);
        return
    }
    var bounds = new google.maps.LatLngBounds();
    bounds.extend(new google.maps.LatLng(search.location.lat ,search.location.lng));
    for (offer of offers.slice(0, 1)) {bounds.extend(new google.maps.LatLng(offer.properties.latitude ,offer.properties.longitude))}
    map.fitBounds(bounds);
    panMap(search.location); // important! fitBounds changes map's center and this re-centers map around serahc.location
    map.setZoom(map.getZoom() - 1); // since the panMap may cause the best exchange to be out of bounds
};


// LIST PAGING



function populatePagination (fromResult, toResult, prev, next) {

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

function showPage(pageNum) {
    $('.list-group .ecard[data-page=' + pageNum + ']').css('display', 'flex');
}

function hidePages() {
    $('.list-group .ecard[  data-page]').css('display', 'none');
}



// Always populate a list page, occasionally (upon start) populate the initial batch of cards as well.
// Options.pageNum will always have a value. Options.list will always be true, & options.cards indicate whether to populate cards as well.

populatePage = function(options) {

    if (no(offers)) return;

    var offersLength  = offers.length;
    var fromResult    = (resultsPerPage * (pageNum -1)) + 1;
    var toResult      = Math.min(resultsPerPage * pageNum, offersLength);
    var prev          = fromResult > resultsPerPage;
    var next          = toResult < offersLength;

    hidePages();
    if  (pagesAdded.includes(options.page)) {
        showPage(options.page);
        populatePagination(fromResult, toResult, prev, next);
        return
    }

    for (var result = fromResult; result <= toResult; result++) {
        var index = result - 1;                     // results talks user languages so starts with 1, but the offers array starts with 0
        var offer = offers[index].properties;
        addOffer({offer: offer, index: index, page: options.page, list: options.list, cards: options.cards});
    }

    populatePagination(fromResult, toResult, prev, next);
    showPage(options.page);
    pagesAdded.push(options.page);

};


nextPage = function() {

    if (offers.length > resultsPerPage * pageNum) {
        pageNum += 1;
        populatePage({page: pageNum, list: true, cards: false});
    } else {
        console.log('No more results to page')
    }

};

prevPage = function() {

    if (pageNum > 1) {
        pageNum -= 1;
        populatePage({page: pageNum, list: true, cards: false});
    } else {
        console.log('No previous page')
    }

};

resetPaging = function() {
    pageNum = 0;
    pagesAdded = [];
    unpopulatePagination();
};


//
// Order lifecycle
//


order = function($scope, exchange) {

    if (exchange.id == value_of('order_exchange_id')) return;

    $('.ecard[data-exchange-id=' + exchange.id + ']').addClass('ordered');

    fetch('/orders', {
        method: 'POST',
        headers: new Headers({
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify(
            {
                order: {
                    exchange_id: exchange.id,
                    search_id:   searchId  // TODO: add the order form
                }
            }
        )
    })
    .then(checkStatus)
    .then(response => response.json())
    .then((order) => {
        console.log('Order succesfully created:', order);
        populateOrder($scope, order);
        sessionStorage.order_exchange_id = exchange.id;
        sessionStorage.order_id = order.id;
        sessionStorage.order_status = order.status;
        if (order.service_type == 'pickup') snack('Exchange notified and waiting', {timeout: 3000, icon: 'notifications_active'});
    })
    .catch((error) => {console.log('Error creating order:', error)});

};

requestOrderConfirmation = function() {
    snack('Click <strong>CONFIRM</strong> when deal is done', {upEl: $('.swiper-container'), icon: 'assignment_turned_in', timeout: 7000});
};

orderConfirmationRequired = function() {
    var order_status = value_of('order_status');
    return order_status && order_status != 'confirmed';
};

orderConfirm = function() {
    $('.ordered.ecard').removeClass('ordered').addClass('confirmed');
    sessionStorage.order_status = 'confirmed';
    orderUpdate({status: 'confirmed'});
};

orderUpdate = function(update) {

    var order_id = value_of('order_id');
    if (!order_id) return;

    fetch('/orders/' + order_id, {
        method: 'PUT',
        headers: new Headers({
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify(
            {
                order: update
            }
        )
    })
    .then(checkStatus)
    .then(() => console.log('Order updated successfully'))
    .catch((error) => console.warn('Order update failed:', error))

};

unorder = function() {
    exchange_id = value_of('order_exchange_id');
    if (!exchange_id) return;
    $('.ecard [data-exchange-id=' + exchange_id + ']').removeClass('ordered');
    sessionStorage.removeItem('order_exchange_id')
};



