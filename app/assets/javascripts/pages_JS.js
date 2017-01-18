//
// P A G E S
// service
//
//   -  replace active html, manipulate browser history (setPage),

setPage = function (arg) {   // for some absurd reason, it won't accept keys 'page', 'id' and 'pane'

//        console.log('setPage. url: ' + url + ' page: ' + page1 + ' id: ' + String(id1) + ' pane: ' + String(pane1) + ' hash: ' + hash + ' pushState: ' + pushState + ' populate: ' + populate);


    var url         = arg.url;
    var page1       = arg.page1;
    var id1         = arg.id1;
    var pane1       = arg.pane1;
    var hash        = arg.hash;
    var pushState   = arg.pushState;
    var populate    = arg.populate;
    if (typeof pushState === 'undefined') var pushState = true;
    if (typeof populate === 'undefined') var populate = true;

    // POP pane into view
    if (url) {
        var ppart = break_url(url);
        var page = ppart.page || 'homepage';
        var id = ppart.id;
        var pane = ppart.pane;
    } else {
        var page = page1;
        var id = id1;
        var pane = pane1;
    }

    $('body').addClass(page);

    $('.page').removeClass('active');
    var $page = $('.page[data-page=' + page + ']');
    $page.addClass('active');

    $('.pane').removeClass('active');
    if (pane) {
        var $pane = $('.pane[data-pane=' + pane + ']');
        $pane.addClass('active');
        refresh(pane);
    }

    if (hash) document.getElementsByName(hash)[0].scrollIntoView(true);


    // POPULATE (unless triggered by popstate event)
    if (populate && id) {
        var exchange = (id == 'curr') ? currentExchange() : findExchange(id);
        populateExchange(exchange, $pane);
        populatePlace(exchange, $pane);
    }


    // PUSH state (unless triggered by popstate or page reloads)
    if (pushState) {
        var id = (id == 'curr') ? currentExchange().id : id;
        var newState = url ? url : make_url(page, id, pane);
        history.pushState(newState, 'cambiu', newState);
    }

};

// Some parts, like map and swipers, need to be re-rendered once the pane is visible
refresh = function(pane) {
    if (!refreshed && pane == 'map' && map) {
        console.log('refresh');
        renderMap(); // Consider generating the map, if this still insists on locating me in Savyon
        if (swiperH) swiperH.update(false);
        refreshed = true // do once only
    }
};

$('body').on('click tap', '[data-href-pane]', (function (e) {

    // EXTREMELY IMPORTANT! Without it, every pushState will add another push with '#' and popState will be invoked. Pulling hair.
    e.preventDefault();
    e.stopPropagation();

    var el = $(this);
    var external    = el.data('exchange-delivery_tracking');    if (external && external != 'null') {window.location = external; return}
    var pane        = el.data('href-pane');                     if (pane == 'back')                 {window.history.back();return}
    var page        = el.data('href-page');
    var id          = el.data('href-id');
    var hash        = el.data('href-hash');

    setPage({page1: page, id1: id, pane1: pane, hash: hash});

}));

window.addEventListener("popstate", function (e) {

    console.log('pop. e.state: ' + e.state);
    if (e.state && e.state.length > 0) setPage({url: e.state, pushState: false, populate: false});

});


stopVideo = function() {

    if (desktop && !value_of('videoStopped'))  {
        replaceVideoWithBackground()
    }
};