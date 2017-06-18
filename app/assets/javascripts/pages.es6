//
// P A G E S
// service
//
//   -  replace active html, manipulate browser history (setPage),

setPage = function ({url, page1, id1, pane1, hash, search, pushState = true, populate = true, help_topic = null, help_content = null}) {   // for some absurd reason, it won't accept keys 'page', 'id' and 'pane'

        console.log('setPage. url: ' + url + ' page: ' + page1 + ' id: ' + String(id1) + ' pane: ' + String(pane1) + ' hash: ' + hash + ' search: ' + search + ' pushState: ' + pushState + ' populate: ' + populate + ' help_topic: ' + help_topic);

    // POP pane into view
//    if (page1 = 'homepage') var url = 'homepage';
    if (url) {
        var ppart = break_url(url);
         [page, id, pane] = [ppart.page || 'homepage', ppart.id, ppart.pane]
    } else {
         [page, id, pane] = [page1, id1, pane1];
    }

//console.log('pane before: ', pane);
    if (pane == 'display') pane = value_of('display') || (mode == 'mobile' ? 'cards' : 'list');
    if (pane == 'list' || pane == 'cards') sessionStorage.display = pane;
//console.log('pane after: ', pane);

    // tag the session as soon as page is visited, with ref parameter or without it
    if (search) utm_source = new URLSearchParams(search).get('utm_source');
    tagSession();

    var $page = $('.page[data-page=' + page + ']');
    var $pane = $('.pane[data-pane=' + pane + ']');

    if (help_topic) {
        populateHelp({topic: help_topic, content: help_content}, $pane);
    }

    if (populate && pane == 'reviews') {
        var exchange = currentExchange();
        populateReviews(exchange, $pane);
    }


    $('body').addClass(page);

    $('.page').removeClass('active');
     $page.addClass('active');

    $('.pane').removeClass('active');
    if (pane) {
        $pane.addClass('active');
        $('body').attr('data-pane', pane);
        refresh(pane);
    }

    if (hash) document.getElementsByName(hash)[0].scrollIntoView(true);


    // POPULATE (unless triggered by popstate event)
    // TODO: probably needs some change when single-exchange panes are back and refreshed
     if (populate && id) {
        var exchange = (id == 'curr') ? currentExchange() : exchangeHash[id];
        populate(exchange, [$pane], null, null);
    }


    // PUSH state (unless triggered by popstate or page reloads)
    if (pushState) {
        var id = (id == 'curr') ? currentExchange().id : id;
        var newState = url ? url : make_url(page, id, pane);
        history.pushState(newState, 'cambiu', newState);
    }

    // Update ga of the new page url
    ga('set', {page: url || make_url(page, id, pane)});

};

// Some parts, like map and swipers, need to be re-rendered once the pane is visible
refresh = function(pane) {
    // perhaps no refresh of map is needed: since it's not part of a specific pane ('map') as it used to be, it now never disappears.
    /*
    if (!map_refreshed && pane == 'cards' && map) {
        console.log('Entering pane: map - re-render map & refresh swiperH');
        renderMap(); // Consider generating the map, if this still insists on locating me in Savyon
        if (swiperH) swiperH.update(false);
        map_refreshed = true; // do once only
    }
*/
    if (/*!cards_refreshed &&*/ pane == 'cards' && swiperH) {
        console.log('Entering pane: cards - refresh swiperH');
        swiperH.update(false);
        cards_refreshed = true; // do once only
    }

    if (!intro_refreshed && pane == 'intro' && swiperIntro) {
        console.log('Entering pane: intro - refresh swiperIntro');
        swiperIntro.update(false);
        intro_refreshed = true; // do once only
        $('.swiper-container-intro .swiper-pagination-bullet.swiper-pagination-bullet-active').removeClass('swiper-pagination-bullet-active');
        $('.swiper-container-intro .swiper-pagination-bullet:first-child').addClass('swiper-pagination-bullet-active');
    }
    if (!search_refreshed && pane == 'search' && swiperSearch) {
        console.log('Entering pane: search - refresh swiperSearch');
        swiperSearch.update(false);
        search_refreshed = true; // do once only
    }
    if (currentSnack) snackHide();
/*
    if (pane == 'cards') {
        $('.exchanges #exchanges').css('z-index', '2')
    } else {
        $('.exchanges #exchanges').css('z-index', '3')
    }
*/
};

 $('body').on('click tap', '[data-href-pane]', (function (e) {

       // EXTREMELY IMPORTANT! Without it, every pushState will add another push with '#' and popState will be invoked. Pulling hair.
     e.preventDefault();
     e.stopPropagation();

     var el = $(this);
     var external       = el.data('exchange-delivery_tracking');    if (external && external != 'null') {window.location = external; return}
     var pane           = el.data('href-pane');                     if (pane == 'back')                 {window.history.back();return}
     var page           = el.data('href-page');
     var id             = el.data('href-id');
     var hash           = el.data('href-hash');
     var help_topic     = el.data('help-topic');
     var help_content   = el.data('help-content');
     var populate       = el.data('populate');
     var should_wait    = el.data('href-wait');

     if (should_wait) {
        wait(500).then(hideMenus).then(wait).then(goOn)
     } else {
        goOn()
     }

     function hideMenus() {
         $('.context_menu').removeClass('active')
     }
     function goOn() {
         setPage({page1: page, id1: id, pane1: pane, hash: hash, help_topic: help_topic, help_content: help_content, populate: populate});
         hideDialog();
     }

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
