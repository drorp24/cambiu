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

        if (el.data('field'))                   el.html(exchange[el.data('field')]);

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

        console.log('setPage entered');
        console.log('url argument: ' + url);
        console.log('hash argument: ' + String(hash));
        console.log('current_url: ' + current_url());
        console.log('current_hash: ' + String(current_hash()));

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

        console.log('setPage parsing:. url: ' + url + ' page: ' + page + ' id: ' + id + ' pane: ' + pane + ' hash: ' + hash);


        // update session
        sessionStorage.exchangeid   = exchangeid    ? exchangeid    : null;
        sessionStorage.page         = page  ? page  : null;
        sessionStorage.pane         = pane  ? pane  : null;
        sessionStorage.id           = id    ? id    : null;


        // find exchange
        if (id) {

            //??
            $('[data-current-exchange]').attr('data-exchangeid', exchangeid);
            $('[data-field=exchange_id]').val(exchangeid)

            if (exchanges && exchanges.length > 0) {
                var results = $.grep(exchanges, function(e){ return e.id == exchangeid; });
                if (results[0]) {
                    console.log('exchange with that id found in exchanges array');
                    var exchange = results[0];
                } else {
                    console.log('exchange with this id was not found in exchanges array');
                    // bring it from the server
                }
            } else {
                console.log('exchanges is empty');
            }
        } else {

            console.log('no id in url');
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
            console.log('revealing page: ' + page);
            page_el = $('.page[data-page=' + page + ']');
            console.log('page_el id: ' + page_el.attr('id'))
            page_el.addClass('active');
            page_el.show();
        }
        if (pane) {
            console.log('revealing pane: ' + pane);
            pane_el = $('.pane[data-pane=' + pane + ']');
            console.log('pane_el id: ' + pane_el.attr('id'))
            pane_el.addClass('active');
            pane_el.show();
        }


        // populate/empty exchange
        $('.pane.active').each(function () {
             $(this).find('[data-model=exchange]').each(function () {
                if (exchange) {
                    console.log('populating ' + $(this).attr('id') + ' with exchange id: ' + exchange.id);
                    populate($(this), exchange)
                } else {
                    console.log('unpopulating ' + $(this).attr('id'));
                    unpopulate($(this))
                }
            });
        });

        // don't push state if invoked from popstate or page reloads
        var new_state =  '/' + url;
        if (window.location.pathname != new_state) {
            history.pushState(new_state, 'cambiu', new_state);
            console.log('>>>>>>>>>>>>>>>>>> pushing state: ' + new_state);
        } else {
            console.log('>>>>>>>>>>>>>>>>>> current pathname matches the url; not pushing');
        }

        // if hash argument was included, go to it
        if (hash) {console.log('hash argument included: ' + hash + '. going there -') ; document.getElementsByName(hash)[0].scrollIntoView(true);}

    };

    $('body').on('click', '[data-href]', (function() {

        var $this =       $(this);
        var exchangeid =  $this.data('exchangeid');
        var href =        $this.data('href');
        var page =        $this.data('href-page');
        var pane =        $this.data('href-pane');
        var id =          $this.data('href-id');
        var url =         (page && pane && id) ? page + '/' + id + '/' + pane : href;
        var hash =        $this.data('href-hash');

        console.log('data-href element clicked. href: ' + href + ' href-id: ' + id + ' hash: ' + String(hash));
        setPage(url, hash);
//        if ($this.is('[data-reload')) location.reload();

    }));

    $('a[data-href]').click(function(e) {
        e.preventDefault();
    });


    window.addEventListener("popstate", function(e) {

        console.log('>>>>>>>>>>>>>> pop. e.state: ' + e.state);
        if (e.state && e.state.length > 0) {
            setPage(e.state.slice(1));
        } else
        if (window.location.hash && window.location.pathname.length > 1) {
            console.log('>>>>>>>>>>>>>> ... but a hash exists - settingPage according to path');
            // when user goes to hash it's not pushed to history hence e.state is null in this case
            // this case is identified by the popstate event and the hash in the location
            setPage(window.location.pathname.slice(1),window.location.hash.slice(1));
        }
    });


    // first entry, reloads, direct linking
    var reload_path = window.location.pathname == '/' ? 'homepage' : window.location.pathname.slice(1);
    var hash = window.location.hash ? window.location.hash.slice(1) : null;
    console.log('full page re/load. settingPage to: ' + reload_path + ' hash: ' + hash);
    setPage(reload_path, hash);


});
