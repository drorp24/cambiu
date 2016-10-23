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
    setPage = function ({url, page1, id1, pane1, hash, pushState = true}) {   // for some absurd reason, it won't accept keys 'page', 'id' and 'pane'

        if (url) {
            var ppart = break_url(url);
            var [page, id, pane] = [ppart.page, ppart.id, ppart.pane]
        } else {
            var [page, id, pane] = [page1, id1, pane1];
        }

//        console.log('setPage. url: ' + url + ' page: ' + page + ' id: ' + String(id) + ' pane: ' + String(pane) + ' hash: ' + hash + ' pushState: ' + pushState);

        // POP pane into view
        $('body').addClass(page);

        var $page = $('.page[data-page=' + page + ']');
        $('.page').removeClass('active');
        $page.addClass('active');

        var $pane = $('.pane[data-pane=' + pane + ']');
        $('.pane').removeClass('active');
        $pane.addClass('active');

        if (hash) document.getElementsByName(hash)[0].scrollIntoView(true);


        // POPULATE
         if (pushState && id) {
            var exchange = (id == 'id') ? currExchange() : findExchange(id);
            populateExchange(exchange, $pane);
            populatePlace(exchange, $pane);
        }


        // PUSH new state (unless invoked from popstate or page reloads)
        if (pushState) {
            var newState = url ? url : make_url(page, id, pane);
            history.pushState(newState, 'cambiu', newState);
        }

    };

    link = function (el) {

        var external    = el.data('exchange-delivery_tracking');    if (external && external != 'null') {window.location = external; return}
        var pane        = el.data('href-pane');                     if (pane == 'back')                 {window.history.back();return}
        var page        = el.data('href-page');
        var id          = el.data('href-id');
        var hash        = el.data('href-hash');

        setPage({page1: page, id1: id, pane1: pane, hash: hash});
    };

    $('body').on('click tap', '[data-href-pane]', (function (e) {
        // if clicked element is part of a form, dont move page unless form is valid

        // EXTREMELY IMPORTANT! Without it, every pushState will add another push with '#' and popState will be invoked. Pulling hair.
        e.preventDefault();
        // Avoids getting into exchange page when 'order' is clicked even if redirection takes place, probably due to validation
        e.stopPropagation();

        var $this = $(this);
        var invoked_form = $this.data('form') ? $($this.data('form')) : null;   // only case: getstarted_button click invokes #search_form form
        var form = invoked_form ? invoked_form : $this.closest('form');

        if (form.length > 0) {
            if (form.data('remote-validation')) {
                // jquery.validate remote doesn't wait for ajax to complete
                form.validate();
                form.on('ajax:complete', (function (evt, data, status, xhr) {
                    console.log('form remote validation completed. Status: ' + status);
                    if (form.valid()) {
                        link($this)
                    }
                }));
            } else {
                if (form.valid()) {
                    link($this)
                }
            }
        } else {
            link($this)
        }

    }));

    stopVideo = function() {

        if (desktop && !value_of('videoStopped'))  {
            replaceVideoWithBackground()
        }
    };

    window.addEventListener("popstate", function (e) {

//        console.log('pop. e.state: ' + e.state);
        if (e.state && e.state.length > 0) setPage({url: e.state, pushState: false});

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
    setPage({url: window.location.pathname});
});

