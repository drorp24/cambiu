//
// P A G E S
//
// Include all logic required to handle data-href as if they were real links to the server
// and page re/loads as if they were getting relevant html (and not always getting home#index)
//
// Instead of calling server to fetch results from DB and return relevant, populated html, do:
//
//   -  replace active html, manipulate browser history (setPage),
//   -  populate pages from in-memory exchanges buffer  (populate, unpopulate) relevant for spa that has all exchanges in buffer; single-result searches use updateExchanges
//      Note: populate also will not work in page reload, since setPage is called before ajax:success returns. Such cases can be seen on the console as: 'exchanges is empty'.
//      updateExchanges will find the exchange record in buffer and update the page.
//
// Pages.js is also where the technical flow begins
// It is here that getLocation() is called (location.js), triggering a search (search.js) that in turn updatesPage (exchanges.js)

$(document).ready(function() {
    setPage = function ({url, page1, id1, pane1, hash, pushState = true, populate = true}) {   // for some absurd reason, it won't accept keys 'page', 'id' and 'pane'

//        console.log('setPage. url: ' + url + ' page: ' + page1 + ' id: ' + String(id1) + ' pane: ' + String(pane1) + ' hash: ' + hash + ' pushState: ' + pushState + ' populate: ' + populate);

        // POP pane into view
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

    stopVideo = function() {

        if (desktop && !value_of('videoStopped'))  {
            replaceVideoWithBackground()
        }
    };

    window.addEventListener("popstate", function (e) {

        console.log('pop. e.state: ' + e.state);
        if (e.state && e.state.length > 0) setPage({url: e.state, pushState: false, populate: false});

    });


    // P A G E   R E / L O A D
    //
    // First entry, reloads, direct linking
    // This should be the only code doing something that's not event-driven


    // PARAMS - populate params from default values and/or ss (for page refreshes)
    populateParams();

    // LOCATION - locate user, search and draw map accordingly (geocode and update address too)
    getLocation();

    // ROUTING - setPage with initial values
    setPage({url: window.location.pathname, populate: false});
});

