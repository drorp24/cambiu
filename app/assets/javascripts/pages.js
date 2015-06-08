// Switch to a different pane according to href
// If href element also includes data-id then populate model data before switching panes


$(document).ready(function() {


    // TODO: Make it a loop
    function populate(el, exchange) {

        if (el.is('[data-id]'))                 el.attr('data-id', exchange.id);
        if (el.is('[data-href-id]'))            {el.attr('data-href-id', exchange.id); console.log('el with data-href-id. value ater set: ' + el.attr('data-href-id'))}
        if (el.is('[data-lat]'))                el.attr('data-lat', exchange.latitude);
        if (el.is('[data-lng]'))                el.attr('data-lng', exchange.longitude);
        if (el.is('[data-exchange-name]'))      el.attr('data-exchange-name', exchange.name);

        if (el.data('field'))                   {
            var value = el.data('field') == 'distance' ? (exchange['distance'] * 1000).toFixed(0) : exchange[el.data('field')];
            el.html(value);
        }

        var voucher     = sessionStorage.order_voucher;
        var expiry_s    = sessionStorage.order_expiry_s;
        if (voucher && expiry_s) {
            var order = {voucher: voucher, expiry_s: expiry_s};
            model_populate('order', order)
        } else {
            // check if order form populated or populate it and submit it; the ajax:success will populate the order fields
            // required when user wants to access voucher directly, without clicking the Get it button
        }

    };


    // TODO: Unite, or do in one shot
    function unpopulate(el) {

        if (el.is('[data-id]'))                 el.attr('data-id', '');
        if (el.is('[data-href-id]'))            el.attr('data-href-id', '');
        if (el.is('[data-lat]'))                el.attr('data-lat', '');
        if (el.is('[data-lng]'))                el.attr('data-lng', '');
        if (el.is('[data-exchange-name]'))      el.attr('data-exchange-name', '');

        if (el.data('field'))                   el.html('');

        $('[data-model=order]').html("");

    }

    setPage = function(url, hash) {

        // Parse arguments

        console.log('url argument: ' + url);
        console.log('current_url: ' + current_url());

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
        } else {
            var page        = url_a[0];
            var pane        = url_a[1];
            var id          = null;
        }
        var exchangeid  = id;


        // update session
        sessionStorage.exchangeid   = exchangeid    ? exchangeid    : null;
        sessionStorage.page         = page  ? page  : null;
        sessionStorage.pane         = pane  ? pane  : null;
        sessionStorage.id           = id    ? id    : null;


        // find exchange
        if (id) {

            //??
            $('[data-current-exchange]').attr('data-exchangeid', exchangeid);
            $('[data-field=exchange_id]').val(exchangeid);

            var exchange = findExchange(id);

        } else {

            //??
            $('[data-current-exchange]').attr('data-exchangeid', '');
            $('[data-field=exchange_id]').val('')

        }


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


        // populate/empty exchange
        $('.pane.active').each(function () {
             $(this).find('[data-model=exchange]').each(function () {
                if (exchange) {
                    populate($(this), exchange)
                } else {
                    unpopulate($(this))
                }
            });
        });

        // don't push state if invoked from popstate or page reloads
        var new_state =  '/' + url;
        console.log('end of setPage: deciding whether to push state');
        console.log('new_state: ' + new_state);
        console.log('window.location.pathname: ' + window.location.pathname);
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
            directionsDisplay.set('directions', null);
            map.panTo(new google.maps.LatLng(sessionStorage.location_lat, sessionStorage.location_lng));
            map.setZoom(map_initial_zoom);
        }

        // if hash argument was included, go to it
        if (hash) {console.log('hash argument included: ' + hash + '. going there -') ; document.getElementsByName(hash)[0].scrollIntoView(true);}

    };


    link = function(el) {
        var exchangeid =  el.data('exchangeid');
        var href =        el.data('href');
        var page =        el.data('href-page');
        var pane =        el.data('href-pane');
        var id =          el.data('href-id');
        var url =         (page && pane && id) ? page + '/' + id + '/' + pane : href;
        var hash =        el.data('href-hash');

        console.log('data-href element clicked. href: ' + href + ' href-id: ' + id + ' hash: ' + String(hash));
        setPage(url, hash);
//        if (el.is('[data-reload')) location.reload();
    };

    $('body').on('click', '[data-href]', (function(e) {

        // if clicked element is part of a form, dont move page unless form is valid

        var $this           = $(this);
        var invoked_form    = $this.data('form') ? $($this.data('form')) : null;   // e.g., getstarted_button click invokes #new_search form
        var form            = invoked_form ? invoked_form : $this.closest('form');

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


    // setPage() to current path
    // replace '/' with 'homepage' or else pushState will get ''
    var reload_path = window.location.pathname == '/' ? 'homepage' : window.location.pathname.slice(1);
    var hash = window.location.hash ? window.location.hash.slice(1) : null;
    console.log('full page re/load. settingPage to: ' + reload_path + ' hash: ' + hash);
    setPage(reload_path, hash);

    // TODO: Moved here from search.js. Set at setPage. Remove?
/*
    sessionStorage.page         = window.location.hostname;
    sessionStorage.hash         = window.location.hash;
*/

});
