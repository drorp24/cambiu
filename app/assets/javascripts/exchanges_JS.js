//
//  E X C H A N G E S
//
//  Uses the exchanges buffer returned by search form callback to update all markup



addCards = function(exchanges) {

    console.log('addCards');

    $('#cards').empty();
    for (var i = 0; i < Math.min(initialSlides, exchanges.length); i++) {
        var exchange = exchanges[i].properties;
        addCard(exchange, i);
    }

    highlightCurrentMarker();

    var ppart = break_url(window.location.pathname);
    var id = ppart.id;
    if (id) {
        var exchange = findExchange(id);
        var pane = ppart.pane;
        var $pane = $('.pane[data-pane=' + pane + ']');
        populateExchange(exchange, $pane)
    }

};


function addCard(exchange, index) {

    var $card = $('.ecard.template').clone().removeClass('template');
    $card.appendTo($('#cards'));

    populateExchange(exchange, $card, index);

    fetchPlace(exchange)
        .then(function(exchange)  {populatePlace(exchange, $card)})
        .catch(function(error)  {console.warn(error)});

    findDuration(exchange)
        .then(function(exchange)  {populateDuration(exchange, $card)})
        .catch(function(error)  {console.warn(error)});

    slidesAdded.push(index);
}

revealCards = function() {
    $('.swiper-container').css('display', 'block');
    setTimeout(function() {
        cardXoffset = String(($('.ecard').eq(0).position().left + $('#cards').position().left) * -1) + 'px';
    }, 1000)
};


$('body').on('click tap', '.ecard:not(.selected)', function(e) {
    e.stopPropagation();
    var $this = $(this);
    $('.progress').css('display', 'none');
    $this.css('transform', 'translate(' + cardXoffset + ', 10px)');
    $this.addClass('selected');
});

$('body').on('click tap', '.ecard.selected .actions_line, .ecard.selected .nav_icon', function(e) {

    e.stopPropagation();
    var $navBtn = $('.nav_icon_container');
    $navBtn.addClass('rotate');
    renderDirections(currExchange());

    setTimeout(function(){

        currCard().removeClass('selected')
        $navBtn.removeClass('rotate');

    }, 500);

});

$('body').on('click tap', '.nav_icon', function(e) {
    e.stopPropagation();
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

sortExchanges = function(sortkey) {

    if (typeof sortkey === 'undefined' || !sortkey) var sortkey = 'price';

    console.log('sortExchanges. sortkey == ' + sortkey);
    if (exchanges.length == 0) return exchanges;

    if (sortkey == 'distance') {
        exchanges.sort(function(a, b){return a.properties.distance - b.properties.distance});
    }
    else if (sortkey == 'price') {
        if (value_of('buy_amount')) {
            exchanges.sort(function(a, b){return (a.properties.quote ? a.properties.quote : 10000000) - (b.properties.quote ? b.properties.quote : 10000000)});
        } else {
            exchanges.sort(function(a, b){return (b.properties.quote ? b.properties.quote : 0) - (a.properties.quote ? a.properties.quote : 0)});
        }
    }

    return exchanges;
};