
gaTiming = function(category, variable, value) {
    ga('send', 'timing', category,  variable, value);
};

(function onLoad() {
    var now = new Date().getTime();
    var page_load_time = now - performance.timing.navigationStart;
    console.log("User-perceived page load time: " + page_load_time);
    gaTiming('User-perceived', 'page load time', page_load_time);
})();


gaTiming = function(category, variable, value) {
    ga('send', 'timing', category,  variable, value);
};


tagSession = function(obj = {}) {

    var tagObj = Object.assign(obj, {utm_source: utm_source, locale: locale});
    console.log('tagSession', tagObj);

    ga('set', tagObj);
//    __insp.push(['tagSession',tagObj]);
};

// exchange is an obj that needs only include keys 'id' and 'name'
report = function(category, action, exchange = null, value = null) {

    console.log(`report category: ${category} action: ${action} exchange: ${exchange && exchange.id ? exchange.id : 'null'} value: ${value}`);
    let exchangeWorthy = (category) => category != 'Set';

    if (exchangeWorthy(category)) {
        var currExchange = exchange || currentExchange();
        var label = currExchange && currExchange.name ? currExchange.name : "";
        var id = currExchange && currExchange.id ? currExchange.id : "";
    } else  {
        var label = value;
        var id = null;
    }
    ga('send', 'event', category, action, label, {id: id});


};

$('body').on('click tap', '.phone_icon', function() {
    report('Tap', 'Phone');
});

$('body').on('click tap', '.cambiu_ranking', function() {
    report('Tap', 'Other offers');
});

$('body').on('click tap', 'a[data-action=showCards]', function() {
    report('Tap', 'Other offers');
});

$('.swiper-slide.a .getOffer').on('click tap', function() {
    report('Tap', 'Get an offer (1)')
});

$('.swiper-slide.d .getOffer').on('click tap', function() {
    report('Tap', 'Get an offer (4)')
});

$('.swiper-slide.b .slide_line .left').on('click tap', function() {
    report('Tap', 'Skip (2)')
});

$('.swiper-slide.c .slide_line .left').on('click tap', function() {
    report('Tap', 'Skip (3)')
});
$('body').on('click tap', '.help.icon', function() {
    report('Tap', 'Help');
});

$('body').on('click tap', '.reviews', function() {
    report('Tap', 'Reviews');
});

$('body').on('click tap', '.rating-container', function() {
    report('Tap', 'Reviews');
});

$('body').on('click tap', '.navbar_center', function() {
    report('Tap', 'Navbar Center');
});
$('body').on('click tap', '.navbar_left', function() {
    report('Tap', 'Navbar Left');
});
$('body').on('click tap', '.navbar_right', function() {
    report('Tap', 'Navbar Right');
});
$('body').on('click tap', "[onclick='orderThis()']", function() {
    report('Click', 'Confirm delivery', bestOffer(), null);
});
/* Doesn't work. Reported from revertDelivery
$('body').on('click tap', "[onclick='revertDelivery()']", function() {
    report('Click', 'Cancel delivery');
});
*/
