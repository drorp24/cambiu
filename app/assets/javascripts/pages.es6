//
// P A G E S
// service
//
//   -  replace active html, manipulate browser history (setPage),

setPage = function ({url, page1 = 'exchanges', id1, pane1, hash, search, pushState = true, populating = false, help_topic = null, help_content = null}) {   // for some absurd reason, it won't accept keys 'page', 'id' and 'pane'

        console.log('setPage. url: ' + url + ' page: ' + page1 + ' id: ' + String(id1) + ' pane: ' + String(pane1) + ' hash: ' + hash + ' search: ' + search + ' pushState: ' + pushState + ' populating: ' + populating + ' help_topic: ' + help_topic);

    // Parse parameters
    if (url) {
        var ppart = break_url(url);
         [page, id, pane] = [ppart.page || 'homepage', ppart.id, ppart.pane]
    } else {
         [page, id, pane] = [page1, id1, pane1];
    }

    id = determineId(id);
    var exchange = exchangeHash && exchangeHash[id] ? exchangeHash[id] : currentExchange();
    pane = determinePane(pane, exchange);

    // Declare a new page to GA and report a pageview
    ga('set', 'page', url || make_url(page, id, pane));
    ga('send', 'pageview');

    var $page = $('.page[data-page=' + page + ']');
    var $pane = $('.pane[data-pane=' + active(pane) + ']');

    if (help_topic) {
        populateHelp({topic: help_topic, content: help_content}, $pane);
    }


    if (populating && pane == 'reviews') {
        populateReviews(exchange, $pane);
    }


    $('body').addClass(page);

    $('.page').removeClass('active');
    $page.addClass('active');

    if (different(pane)) $('.pane').removeClass('active');
    if (pane) {
        $pane.addClass('active');
        $('body').attr('data-pane', pane);
        refresh(pane, $pane, exchange);
    }

    if (hash) document.getElementsByName(hash)[0].scrollIntoView(true);


    // POPULATE (unless triggered by popstate event)
    // TODO: populate only the active pane. Should look like the 'review' population above; specific to the pane we're moving into
/*
     if (populating && id) {
        var exchange = (id == 'curr') ? currentExchange() : exchangeHash[id];
        populate(exchange, [$pane], null, null);
    }
*/
    if ((pane == 'cards' || pane == 'list') && id) {
        console.log('pane is list or cards and id exists: showing card');
        $(`.ecard[data-exchange-id=${id}]`).css('visibility', 'visible');
//        enableSwiping();
        swiperH.slideTo(exchangeHash[id].rank - 1);
    }


    // PUSH state (unless triggered by popstate or page reloads)
    if (pushState) {
        var newState = url ? url : make_url(page, id, pane);
        history.pushState(newState, 'cambiu', newState);
    }

    // Update ga of the new page url
    ga('set', {page: url || make_url(page, id, pane)});

    function determinePane(pane, exchange) {

        if (pane == 'list' || pane == 'cards') sessionStorage.recent_set = pane;
        if (pane == 'offers') {
            pane = value_of('recent_set') || default_set;
            sessionStorage.recent_set = pane;
        }
        if (pane == 'order' && !orderExists() && $('body').hasClass('delivery')) {
            pane = 'register'
        }


        return pane;

    }

    function determineId(id) {
       return (id == 'curr') ? currentExchange().id : id;
    }

};

// Some parts, like map and swipers, need to be re-rendered once the pane is visible
refresh = function(pane, $pane, exchange) {
    // perhaps no refresh of map is needed: since it's not part of a specific pane ('map') as it used to be, it now never disappears.
    /*
    if (!map_refreshed && pane == 'cards' && map) {
        console.log('Entering pane: map - re-render map & refresh swiperH');
        renderMap(); // Consider generating the map, if this still insists on locating me in Savyon
        if (swiperH) swiperH.update(false);
        map_refreshed = true; // do once only
    }
*/
    if (pendingSnack.message && pendingSnack.options) {
        delete pendingSnack.options.timing;
        snack(pendingSnack.message, pendingSnack.options);
        pendingSnack = {};
    }

    if (/*!cards_refreshed &&*/ pane == 'cards' && swiperH) {
        console.log('Entering pane: cards - refresh swiperH');
        swiperH.update(false);
        cards_refreshed = true; // do once only
    }

    if (pane == 'isearch') {
        swiperI.update(false);
    }


    if (pane == 'offer') {
        selectExchange($(`.pane[data-pane=${value_of('recent_set') || default_set}] .ecard[data-exchange-id=${exchange.id}]`), false);
    }

    if (pane == 'order') {
        selectExchange($(`.pane[data-pane=${value_of('recent_set') || default_set}] .ecard[data-exchange-id=${exchange.id}]`), false);
        $pane.find('.selected.ecard').addClass('order');
    } else {
        $pane.find('.selected.ecard').removeClass('order');
        $pane.find('.ordered.ecard').removeClass('order');
    }

    if (['list', 'cards', 'offers'].includes(pane)) unselectExchange();

    if (!intro_refreshed && pane == 'intro' && swiperIntro) {
        console.log('Entering pane: intro - refresh swiperIntro');
        swiperIntro.update(false);
        intro_refreshed = true; // do once only
        $('.swiper-container-intro .swiper-pagination-bullet.swiper-pagination-bullet-active').removeClass('swiper-pagination-bullet-active');
        $('.swiper-container-intro .swiper-pagination-bullet:first-child').addClass('swiper-pagination-bullet-active');
    }
/*
    if (!search_refreshed && pane == 'search' && swiperSearch) {
        console.log('Entering pane: search - refresh swiperSearch');
        swiperSearch.update(false);
        search_refreshed = true; // do once only
    }
*/
    if (currentSnack()) snackHide();
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
//     e.stopPropagation();

     var el = $(this);
     var external       = el.data('exchange-delivery_tracking');    if (external && external != 'null') {window.location = external; return}
     var pane           = el.data('href-pane');                     if (pane == 'back')                 {window.history.back();return}
     var page           = el.data('href-page');
     var id             = el.data('href-id');
     var hash           = el.data('href-hash');
     var help_topic     = el.data('help-topic');
     var help_content   = el.data('help-content');
     var populate       = el.data('populate');
     var delay          = el.data('href-delay');
     var validate       = el.data('validate');

     if (delay) {
        wait(500).then(hideMenus).then(wait).then(goOn)
     } else {
        goOn()
     }

     function hideMenus() {
         $('.context_menu').removeClass('active')
     }
     function goOn() {
 //        if (validate && !window[validate]())  {console.log('validate returns false - not turning page'); return;}
         setPage({page1: page, id1: id, pane1: pane, hash: hash, help_topic: help_topic, help_content: help_content, populating: populate});
         hideDialog();
     }

     function back(delay) {

         delay ? wait(500).then(backOn) : backOn();

         function backOn() {
             var recentSet = value_of('recent_set');
             if (recentSet && $('body').attr('data-pane') == 'order') {
                 setPage({pane1: recentSet})
             } else {
                 window.history.back();
             }
         }
     }

}));

window.addEventListener("popstate", function (e) {

    console.log('pop. e.state: ' + e.state);
    if (e.state && e.state.length > 0) setPage({url: e.state, pushState: false});

});


stopVideo = function() {

    if (desktop && !value_of('videoStopped'))  {
        replaceVideoWithBackground()
    }
};


function actual(pane) {
    return (['offer', 'order','offers', 'list', 'cards'].includes(pane)) ? 'offers' : pane;
}

function group(pane) {
    return ['offer', 'order'].includes(pane) ? 'children' : (['offers', 'list', 'cards'].includes(pane) ? 'parents' : 'neither')
}

function same_pane(paneA, paneB) {
    return group(paneA) == 'children' && group(paneB) == 'parents' || group(paneA) == 'parents' && group(paneB) == 'children'
}

function different(pane) {
    var activePane = $('.active.pane').data('pane');
    return !same_pane(activePane, pane);
}

/*
function active(pane) {
    var recentSet = value_of('recent_set');
    return (['offer', 'order'].includes(pane) && actual(recentSet) == 'offers') ? recentSet : pane;
}
*/
function active(pane) {
    return ['offer', 'order'].includes(pane) ? value_of('recent_set') || default_set : pane;
}
