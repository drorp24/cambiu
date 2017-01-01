//
// P A G E S
// service
//
//   -  replace active html, manipulate browser history (setPage),

setPage = function ({url, page1, id1, pane1, hash, pushState = true, populate = true}) {   // for some absurd reason, it won't accept keys 'page', 'id' and 'pane'

        console.log('setPage. url: ' + url + ' page: ' + page1 + ' id: ' + String(id1) + ' pane: ' + String(pane1) + ' hash: ' + hash + ' pushState: ' + pushState + ' populate: ' + populate);

    // POP pane into view
//    if (page1 = 'homepage') var url = 'homepage';
    if (url) {
        var ppart = break_url(url);
        var [page, id, pane] = [ppart.page || 'homepage', ppart.id, ppart.pane]
    } else {
        var [page, id, pane] = [page1, id1, pane1];
    }

    $('body').addClass(page);

    $('.page').removeClass('active');
    var $page = $('.page[data-page=' + page + ']');
     $page.addClass('active');

    $('.pane').removeClass('active');
    if (pane) {
        var $pane = $('.pane[data-pane=' + pane + ']');
        $pane.addClass('active');
        $('body').attr('data-pane', pane);
        refresh(pane);
    }

    if (hash) document.getElementsByName(hash)[0].scrollIntoView(true);


    // POPULATE (unless triggered by popstate event)
     if (populate && id) {
        var exchange = (id == 'curr') ? currExchange() : findExchange(id);
        populateExchange(exchange, $pane);
        populatePlace(exchange, $pane);
    }


    // PUSH state (unless triggered by popstate or page reloads)
    if (pushState) {
        var id = (id == 'curr') ? currExchange().id : id;
        var newState = url ? url : make_url(page, id, pane);
        history.pushState(newState, 'cambiu', newState);
    }

};

// Some parts, like map and swipers, need to be re-rendered once the pane is visible
refresh = function(pane) {
    if (!map_refreshed && pane == 'map' && map) {
        console.log('Entering pane: map - re-render map & refresh swiperH');
        renderMap(); // Consider generating the map, if this still insists on locating me in Savyon
        if (swiperH) swiperH.update(false);
        map_refreshed = true; // do once only
    }
    if (!help_refreshed && pane == 'help' && swiperIntro) {
        console.log('Entering pane: help - refresh swiperIntro');
         swiperIntro.update(false);
        help_refreshed = true; // do once only
    }
    if (pane == map) {
        $('.exchanges #exchanges').css('z-index', '2')
    } else {
        $('.exchanges #exchanges').css('z-index', '3')
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

