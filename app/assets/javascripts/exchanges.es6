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

                offers.sort((a, b) => a.properties.grade - b.properties.grade);

                for (let [index, offer] of offers.entries()) {exchangeHash[offer.id].rank = index + 1}
                offers[0].properties.best_at.push('best');
            }

            resolve(offers);

        })
    };

    function no(offers) {
        if (offers.length == 0) {
            var secret_error_ind = searchData.error ? "data" : "offer";
//            snack(`No ${secret_error_ind} for these parameters. <br> Click OK to change them`, {button: 'ok', klass: 'oops', link: {page: 'exchanges', pane: 'search'}});
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
        restoreOrder();
        $('.pagination').addClass('active');

    };

    renderProperPage = function() {
        console.log('renderProperPage');
        if (no(offers)) {console.warn('no offers'); return;}
/*
        if (value_of('order_id')) {
            restoreOrder();
            setPage({pane1: 'order', id1: value_of('order_exchange_id')})
        } else {
*/
        // Show the offer already shown in the search page even if different than the 1st one in the offers array
        // They can be different if their grades turned out equal and best, but their amounts may still be different
            let best_offer = bestOffer();
            if (best_offer.id) {
                var best_offer_id = best_offer.id;
                if (best_offer_id !== offers[0].id) console.warn(`Using best_offer_id: ${best_offer_id} instead of offers[0].id: ${offers[0].id}`);
            } else {
                var best_offer_id = offers[0].id;
            }
            setPage({pane1: 'offer', id1: best_offer_id});
 //       }
        return true;
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

    grade = function(exchange, distance_factor = 0) {

        if (value_of('calculated') == 'pay_amount') {
            result = Number(exchange.properties.quote) || 10000000;
        } else {
            result = Number(exchange.properties.quote) * -1 || 0;
        }
        result += exchange.properties.distance * distance_factor;
        exchange.grade = result;
        return result;

    };

    rankCheck = function(whatIf = {}) {

        let offersArr = [];

        offers.forEach((offer) => {

            let grade = whatIf.distance_factor ? Number((offer.properties.gain + Number(offer.properties.credit_charge_raw) + Number(offer.properties.delivery_charge_raw)) * -1 + offer.properties.distance * whatIf.distance_factor).toFixed(2) : Number(offer.properties.grade).toFixed(2);

            offerObj = {
                id:                 offer.properties.id,
                source:             offer.properties.rates.source,
                rate:               offer.properties.base_rate,
                bad:                offer.properties.bad_amount,
                quote:              offer.properties.edited_quote,
                gain:               offer.properties.gain_amount,
                credit_charge:      offer.properties.credit_charge,
                delivery_charge:    offer.properties.delivery_charge,
                distance:           Number(offer.properties.distance).toFixed(2),
                grade:              grade,
                name:               offer.properties.name
            };
            offersArr.push(offerObj);

        });

        if (Object.keys(whatIf).length) offersArr.sort((a, b) => a.grade - b.grade);
        console.table(offersArr);
        console.log(offersArr);
    };

exchangeErrors = function(exclude = {}) {

    let exchangesArr = [];
    let exclude_error = !!Object.keys(exclude).length && exclude.no;

    exchanges.forEach((exchange) => {

        let errors = exchange.properties.errors;
        let count = errors.length;
        let rec = exchange.properties;
        if (count == 0 || exclude_error && errors[0] == exclude_error) return;

        exchangeObj = {
            id:         rec.id,
            name:       rec.name,
            errors:     count,
            error:      errors[0],
            rates_update: rec.rates.updated.substring(0, 10),
            rates_source: rec.rates.source,
            gain:       Number(rec.gain).toFixed(2),
            distance:   Number(rec.distance).toFixed(2)
        };
        exchangesArr.push(exchangeObj);

    });

    console.table(exchangesArr);
};


selectExchange = function($exchange, manual = true) {

        console.log('selectExchange');
        $exchange.addClass('selected');
        if ($exchange.is('.ordered')) $exchange.addClass('order');

        populateStreetview(currentExchange());
        clearDirections();

        if (manual) report('Select', 'Exchange');

    };

    unselectExchange = function() {
        $('.selected.ecard').removeClass('selected');
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
    let $this = $(this);
    let pane = $this.is('.ordered') ? 'order' : 'offer';
    setPage({pane1: pane, id1: $this.data('exchange-id')})
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



hideCards = function(exchange_id = null) {
    if (value_of('service_type') == 'delivery') return;
    let $hide = exchange_id ? $(`.ecard:not([data-exchange-id=${exchange_id}])`) : $('.ecard:not(.best)');
    $hide.css('visibility', 'hidden');
};

showCards = function() {
    $('.ecard').css('visibility', 'visible');
};

$('body').on('click tap', '[data-action=showCards]', (e) => {
    showCards();
    enableSwiping();
});


// Use *before* the search, when only info is the best obj
bestOffer = () => {

    let result = {
        id: null,
        name: null
    };
    let transaction = value_of('transaction');
    if (!transaction) return result;
    if (!local || objEmpty(local) || !local.rates || !local.rates.best || !local.rates.best[transaction]) return result;
    let best = local.rates.best[transaction];
    return {
        id: best.exchange_id,
        name: best.name
    }

};


const objEmpty = obj => Object.keys(obj).every(key => obj[key] === undefined);

