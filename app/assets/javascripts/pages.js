//
// P A G E S
//
// Include all logic required to handle data-href as if they were real links to the server
// and page re/loads as if they were getting relevant html (and not always getting home#index)
//
// Instead of calling server to fetch results from DB and return relevant, populated html, do:
//   -  Parse url                                       (link),
//   -  replace active html, manipulate browser history (setPage),
//   -  populate pages from in-memory exchanges buffer  (populate, unpopulate) relevant for spa that has all exchanges in buffer; single-result searches use updatePage
//      Note: populate also will not work in page reload, since setPage is called before ajax:success returns. Such cases can be seen on the console as: 'exchanges is empty'.
//      updatePage will find the exchange record in buffer and update the page.
//
// Pages.js is also where the technical flow begins
// It is here that getLocation() is called (location.js), triggering a search (search.js) that in turn updatesPage (exchanges.js)

$(document).ready(function() {


     // TODO: Replace with model_populate!
     // TODO: model_populate iterates over the returned exchange json, populating for each variable all relevant fields at once. This one goes over the html tags instead
     // TODO: This means that if there is no html tag for a variable, sessionStorage won't be populated
     // TODO: This prevents every variable to propage to sessionStorag, plus In the case of something like delivery_tracking, that doesn't need to sit anywhere in the html, this is a problem
    function populate(el, exchange) {

        if (el.is('[data-id]'))                                                 el.attr('data-id', exchange.id);
        if (el.is('[data-href-id]:not([data-exchange-selection])'))             el.attr('data-href-id', exchange.id);
        if (el.is('[data-lat]'))                                                el.attr('data-lat', exchange.latitude);
        if (el.is('[data-lng]'))                                                el.attr('data-lng', exchange.longitude);
        if (el.is('[data-exchange-name]'))                                      el.attr('data-exchange-name', exchange.name);

        var field = el.data('field');
        if (field == 'exchange_id') {field = 'id'}
        var value = field == 'distance' ? (exchange['distance'] * 1000).toFixed(0) : exchange[field];
        if (field)  {
            if (el.is('input, select')) {
                el.val(value);
            } else
            if (el.is('img')) {
                if (value) {
                    el.attr('src', value);
                    el.css('display', 'block');
                } else {
                     el.attr('src', value);
                    el.css('display', 'none');
                }
            } else {
                el.html(value);
            }
            sessionStorage.setItem('exchange_' + field, value);
        }

/*
        var voucher     = sessionStorage.order_voucher;
        var expiry_s    = sessionStorage.order_expiry_s;
        if (voucher && expiry_s) {
            var order = {voucher: voucher, expiry_s: expiry_s};
            model_populate('order', order)
        } else {
            // check if order form populated or populate it and submit it; the ajax:success will populate the order fields
            // required when user wants to access voucher directly, without clicking the Get it button
        }
*/

    };


    // TODO: Unite, or do in one shot
    function unpopulate(el) {

        if (el.is('[data-id]'))                 el.attr('data-id', '');
        if (el.is('[data-href-id]'))            el.attr('data-href-id', '');
        if (el.is('[data-lat]'))                el.attr('data-lat', '');
        if (el.is('[data-lng]'))                el.attr('data-lng', '');
        if (el.is('[data-exchange-name]'))      el.attr('data-exchange-name', '');

        if (el.data('field'))                   el.html('');

    }

    setPage = function(url, hash) {

        // Parse arguments

        console.log('url argument: ' + url);

        // TODO: Remove: prevents form data from populating if in the same page
 /*     if (url == current_url() && hash == current_hash() ) {
            if (hash) {console.log('hash argument included: ' + hash + '. going there -') ; document.getElementsByName(hash)[0].scrollIntoView(true)}
            console.log('already on that page. Existing'); return}
*/
        if (hash === undefined) {
            hash = null;
        } else if (hash && hash[0] == '#') {
            hash = hash.slice(1)
        }

        var url_a       = url.split('/');
        if (url_a.length == 3) {
            var page        = url_a[0];
            var id          = url_a[1];
            var pane        = url_a[2];
        } else if (url_a.length == 2 && (url_a[1] == 'list')) {
            var page        = url_a[0];
            var pane        = url_a[1];
            var id          = null;
        } else if (url_a.length == 2 && (url_a[1] != 'list')) {
            var page        = url_a[0];
            var pane        = 'summary';
            var id          = url_a[1];
        } else if (url_a.length == 1) {
            var page        = url_a[0]
        }
        var exchangeid  = id;

        console.log('pages.js, result of url parsing: page: ' + page + ' id: ' + String(id) + ' pane: ' + String(pane));


        // update session
        sessionStorage.exchangeid   = exchangeid    ? exchangeid    : value_of('exchangeid');
        sessionStorage.page         = page  ? page  : null;
        sessionStorage.pane         = pane  ? pane  : null;
        sessionStorage.id           = id    ? id    : value_of('id');



        // Order is important below this point

        // replace page indication on body and navbar
        var old_page        = $('.page.active').attr('id');
        var old_page_id     = '#' + old_page;
        var old_page_el     = $(old_page_id);
        var new_page_id     = '#' + page;
        var new_page_el     = $(new_page_id);

        $('body').removeClass(old_page);
        $('body').addClass(page);
        $('nav.navbar').removeClass(old_page);
        $('nav.navbar').addClass(page);


        // activate/hide components

        // TODO: function
        $('.page.active').hide();
        $('.pane.active').hide();
        $('.page.active').removeClass('active');
        $('.pane.active').removeClass('active');
        if (page) {
             page_el = $('.page[data-page=' + page + ']');
            page_el.addClass('active');
            page_el.show();
        }
        if (pane) {
            pane_el = $('.pane[data-pane=' + pane + ']');
            pane_el.addClass('active');
            pane_el.show();
        }

        // populate exchange data in exchange pages (spa only, at page transition)
        if (id && spa()) {

            console.log('pages.js: spa mode and page contains id: populate?');
            // collapse params bar if moving to an exchange-specific page
            $('#exchange_params_change').collapse('hide');
            var exchange = findExchange(id);

            if (exchange) {
                console.log('Exchange has values, i.e., someone clicked href button in spa mode');
                $('[data-model=exchange]').each(function () {
                    populate($(this), exchange);        // TODO: Replace pages 'populate' with 'model_populate'
                });
                 // One extra update is required for exchange foreign keys which exist in other models
                $('[data-field=exchange_id]').val(exchange.id);
                // another extra assignment for delivery_tracking, that has no html tag
                sessionStorage.setItem('exchange_delivery_tracking', exchange.delivery_tracking);
                $('[data-delivery-tracking]').attr('data-delivery-tracking', String(exchange.delivery_tracking));
                if (!value_of('exchange_delivery_tracking')) {
                    $('button[data-service-type=delivery]').attr('disabled', 'disabled');
//                    $('.delivery_method.delivery').attr('data-content', 'Sorry, no delivery');
                } else {
                    $('button[data-service-type=delivery]').removeAttr('disabled');
//                    $('.delivery_method.delivery').removeAttr('data-content');
                }
                // another setting for rounded results, that no explicit html tag either
                if (exchange.rounded) {
                    text = '<p class=info_class>You may pay ' + exchange.pay_rounded + ' and get ' + exchange.get_rounded + ' to round</p>'
                    $('.exchange_search_form_error').html(text);
               }
            } else {
                console.log('Exchange is empty, i.e., page reload. pages will not populate, updatePage will soon')
            }

         }

        // reset all 'exchange_' and '_order' sessionStorage vars if moving to a non exchange-specific page (e.g., /list)
/*
        if (!id) {
             console.log('moving to a non exchange-specific page: clearing all exchange-specific html fields and session vars');
             $('[data-model=exchange][data-field]').each(function() {
                var $this = $(this);
                if ($this.is('input, select')) {
                    $this.val('');
                } else {
                    $this.html('');
                }
            });
            $('[data-model=order][data-field]').not('[data-field=status]').not('[data-field=service_type]').not('[data-field=order_email]').each(function() {
                var $this = $(this);
                if ($this.is('input, select')) {
                    $this.val('');
                } else {
                    $this.html('');
                }
            });
             for (var i=0, len = sessionStorage.length; i  <  len; i++){
                var key = sessionStorage.key(i);
                var value = sessionStorage.getItem(key);
                 if (key) {
                    if  (((key.indexOf('exchange_') > -1) || (key.indexOf('order_') > -1)) &&
                         ((key.indexOf('status') == -1) && (key.indexOf('service_type') == -1) && (key.indexOf('order_email') == -1)))  {
                         sessionStorage.setItem(key, null)
                    } else
                    if ((key == 'exchangeid') || (key == 'id')) {
                        sessionStorage.setItem(key, null)
                    } else {
                    }
                }
            }
            $('form.new_order').attr('action', '/orders');
            $('form.new_order').attr('method', 'post');
        }
*/
        // don't push state if invoked from popstate or page reloads
        var new_state =  '/' + url;
        if (window.location.pathname != new_state) {
            history.pushState(new_state, 'cambiu', new_state);
            console.log('pushing state: ' + new_state);
        } else {
            console.log('current pathname matches the url; not pushing');
        }

        if (url == 'exchanges/list' && map_center_changed) {
            console.log('Moved to exchanges/list and map center has been changed: resetting map center & zoom to original');
            map_center_changed = false;
            zoom_changed_by_user = true; // retain infowindows too
            if (directionsDisplay) directionsDisplay.set('directions', null);
            map.panTo(new google.maps.LatLng(sessionStorage.location_lat, sessionStorage.location_lng));
            map.setZoom(map_initial_zoom);
            if (marker_highlighted && exchanges && exchanges.length > 0) {
                updateMarkers(exchanges);
            }

        }

        // if hash argument was included, go to it
        if (hash) {console.log('hash argument included: ' + hash + '. going there -') ; document.getElementsByName(hash)[0].scrollIntoView(true);}

    };


    link = function(el) {

        if (el.is('[data-delivery-tracking]')) {
            if ((el.attr('data-delivery-redirect-if-selected') == 'true' && value_of('service_type') == 'delivery') || el.attr('data-delivery-redirect-if-selected') == 'null') {
                var delivery_tracking = el.attr('data-delivery-tracking');
                if (delivery_tracking && delivery_tracking != 'null') {

                    var id = el.attr('data-href-id');
                    var exchange = findExchange(id);
                    $('[data-model=exchange]').each(function () {
                        populate($(this), exchange);        // TODO: Replace pages 'populate' with 'model_populate'
                    });

                    $("#freeow").freeow("Preparing to take your order", "Please hold on for a few moments", {classes: ["smokey"], autoHide: false});
                    window.location = delivery_tracking;
                    return false
                }
            }
        }

        var exchangeid =  el.attr('data-exchangeid');
        var href =        el.attr('data-href');
        var page =        el.attr('data-href-page');
        var pane =        el.attr('data-href-pane');
        var id =          el.attr('data-href-id');
        var url =         (page && pane && id) ? page + '/' + id + '/' + pane : href;
        var hash =        el.attr('data-href-hash');

        console.log('data-href element clicked. href: ' + href + ' href-id: ' + id + ' hash: ' + String(hash));
        setPage(url, hash);
//        if (el.is('[data-reload')) location.reload();
    };

    $('body').on('click', '[data-href]', (function(e) {
        // if clicked element is part of a form, dont move page unless form is valid

        // Avoids getting into exchange page when 'getit' is clicked even if redirection takes place, probably due to validation
        e.stopPropagation();

        var $this           = $(this);
        var invoked_form    = $this.data('form') ? $($this.data('form')) : null;   // e.g., getstarted_button click invokes #new_search form
        var form            = invoked_form ? invoked_form : $this.closest('form');

        if (form.length > 0) {
            if (form.data('remote-validation')) {
                // jquery.validate remote doesn't wait for ajax to complete
                form.validate();
                form.on('ajax:complete', (function (evt, data, status, xhr) {
                    console.log('form remote validation completed. Status: ' + status);
                    if (form.valid() && custom_validate(form)) {
                        link($this)
                    }
                }));
            } else {
                if (form.valid() && custom_validate(form)) {
                    link($this)
                }
            }
        } else {
            link($this)
        }

    }));

    $('a[data-href]').click(function(e) {
        e.preventDefault();
    });


    window.addEventListener("popstate", function(e) {

        console.log('pop. e.state: ' + e.state);
        if (e.state && e.state.length > 0) {
            setPage(e.state.slice(1));
        } else
        if (window.location.hash && window.location.pathname.length > 1) {
            console.log('... but a hash exists - settingPage according to path');
            // when user goes to hash it's not pushed to history hence e.state is null in this case
            // this case is identified by the popstate event and the hash in the location
            setPage(window.location.pathname.slice(1),window.location.hash.slice(1));
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
        var reload_path = 'homepage'
    } else
    if (window.location.pathname == '/exchanges') {
        var reload_path = 'exchanges/list'
    }
    else {
        var reload_path = window.location.pathname.slice(1)
    }
    var hash = window.location.hash ? window.location.hash.slice(1) : null;
     if (spa()) {
        console.log('spa re/load. settingPage to: ' + reload_path + ' hash: ' + hash);
        setPage(reload_path, hash);
    } else {
         var new_state = window.location.pathname + window.location.search;
         console.log('Not spa. Just pushingState ' + new_state);
         history.pushState(new_state, 'cambiu', new_state);
     }


});
