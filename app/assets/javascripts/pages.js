//
// P A G E S
//
// Include all logic required to handle data-href as if they were real links to the server
// and page re/loads as if they were getting relevant html (and not always getting home#index)
//
// Instead of calling server to fetch results from DB and return relevant, populated html, do:
//
//   -  replace active html, manipulate browser history (setPage),
//   -  populate pages from in-memory exchanges buffer  (populate, unpopulate) relevant for spa that has all exchanges in buffer; single-result searches use updatePage
//      Note: populate also will not work in page reload, since setPage is called before ajax:success returns. Such cases can be seen on the console as: 'exchanges is empty'.
//      updatePage will find the exchange record in buffer and update the page.
//
// Pages.js is also where the technical flow begins
// It is here that getLocation() is called (location.js), triggering a search (search.js) that in turn updatesPage (exchanges.js)

$(document).ready(function() {
    setPage = function (page, id, pane, hash) {

        var exchange_id = null;
        console.log('setPage');

        // Reveal requested page & pane, updating 'active' classes
        $('.page').removeClass('active');
        $('.pane').removeClass('active');

        page_el = $('.page[data-page=' + page + ']');
        page_el.addClass('active');
        if (!value_of('videoStopped') && page_el.data('page') !== 'homepage') {
            replaceVideoWithBackground()
        }
        $('body').addClass(page);

        pane_el = $('.pane[data-pane=' + pane + ']');
        pane_el.addClass('active');
        if (pane == 'map') google.maps.event.trigger(map, 'resize');
        if (pane == 'directions') drawDirectionsMap(value_of('location_lat'), value_of('location_lng'));

        if (hash) {
            if (hash[0] == '#') {
                hash = hash.slice(1)
            }
            document.getElementsByName(hash)[0].scrollIntoView(true);
        }

        // Populate exchange data
        if (id) {
            if (id == 'id') {
                exchange_id = value_of('exchange_id')
            } else {
                exchange_id = id
            }
        }

        if (exchange_id) {

            var exchange_populated = value_of('exchange_populated');

            if (exchange_populated && exchange_populated == exchange_id) {
                console.log('exchange ' + exchange_id + ' is populated already')

            } else {

                var exchange = findExchange(exchange_id);

                if (exchange) {
                    console.log('Populating exchange ' + exchange_id + ' from exchanges');
                    model_populate('exchange', exchange.properties);
                    sessionStorage.setItem('exchange_populated', exchange_id);
                } else {
                    console.log('Exchange is empty, i.e., page reload. pages will not populate, updatePage will soon')
                }
            }
        }

        // Clear SS of all 'exchange_' and 'order_' upon moving to a non exchange-specific page (e.g., /list)
        // value_of('exchange_id') indicates whether these fields needs clearing, or are clear already
        // Note: Currently not removing markup: all data- and form exchange-specific fields remain populated
        if (!exchange_id && value_of('exchange_id')) {
            console.log('Non exchange-specific page: clearing all exchange_ and order_ vars from ss');

            clear('exchange');
            clear('order');
        }

        // Push new state (unless invoked from popstate or page reloads)
        var new_state = make_url(page, exchange_id, pane);
        if (window.location.pathname != new_state) {
            history.pushState(new_state, 'cambiu', new_state);
            console.log('pushing state: ' + new_state);
        } else {
            console.log('current pathname matches the url; not pushing');
        }

        //Update SS with the new active page/pane
        sessionStorage.page = page;
        sessionStorage.pane = pane;

    };

    link = function (el) {

        var pane        = el.data('href-pane');  if (pane == 'back') {window.history.back();return}
        var page        = el.data('href-page');
        var exchange_id = el.data('href-id');
        var hash        = el.data('href-hash');

        console.log('data-href element clicked. page: ' + page + ' exchange-id: ' + exchange_id + ' pane: ' + pane + ' hash: ' + String(hash));
        setPage(page, exchange_id, pane, hash);
    };

    $('body').on('click tap', '[data-href-pane]', (function (e) {
        // if clicked element is part of a form, dont move page unless form is valid

        // Avoids getting into exchange page when 'getit' is clicked even if redirection takes place, probably due to validation
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

    // EXTREMELY IMPORTANT! Without it, every pushState will add another push with '#' and popState will be invoked. Pulling hair.
    $('a[data-href-page]').click(function (e) {
        e.preventDefault();
    });


    window.addEventListener("popstate", function (e) {

        console.log('pop. e.state: ' + e.state);
        if (e.state && e.state.length > 0) {

            var ppart = break_url(e.state);
            setPage(ppart['page'], ppart['id'], ppart['pane'], null);

        } else if (window.location.hash && window.location.pathname.length > 1) {
            console.log('... but a hash exists - settingPage according to path');
            // when user goes to hash it's not pushed to history hence e.state is null in this case
            // this case is identified by the popstate event and the hash in the location
            setPage(window.location.pathname.slice(1), window.location.hash.slice(1));
        }
    });


    // P A G E   R E / L O A D
    //
    // first entry, reloads, direct linking
    // This should be the only code doing something that's not event-driven


    // Upon re/load, search exchanges. Either triggered by getLocation if missing, or directly.

    if (!value_of('location')) {
        getLocation();
    } else {
        search_exchanges()
    }

    // setPage() to current path
    // replace '/' with 'homepage' or else pushState will get ''

    if (window.location.pathname == '/') {
        var reload_path = '/homepage'
    } else if (window.location.pathname == '/exchanges') {
        var reload_path = '/exchanges/list'
    }
    else {
        var reload_path = window.location.pathname
    }
    var hash = window.location.hash ? window.location.hash.slice(1) : null;
    console.log('re/load. settingPage to: ' + reload_path + ' hash: ' + hash);
    var ppart = break_url(reload_path);
    setPage(ppart['page'], ppart['id'], ppart['pane'], hash);
});

