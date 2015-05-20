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

    setPage = function(url) { // TODO: pass object here with the parts, and push and pop use such object too

        var url_a       = url.split('/');
        if (url_a.length == 4) {
            var page        = '/' + url_a[1];
            var id          = url_a[2];
            var pane        = url_a[3];
        } else {
            var page        = '/' + url_a[1];
            var pane        = url_a[2];
            var id          = null;
        }
        var exchangeid  = id;

        console.log('setPage. url: ' + url + ' page: ' + page + ' id: ' + id + ' pane: ' + pane);

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
        var new_page_id     = '#' + page.slice(1);
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
        console.log('after removing active class there are ' + $('.page.active').length + ' pages active and ' + $('.pane.active').length + ' panes active.');
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

        console.log('after adding active class to proper page and pane there are ' + $('.page.active').length + ' pages active and ' + $('.pane.active').length + ' panes active.');

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
            })
        });

        var new_state = url;
        history.pushState(new_state, 'cambiu', new_state);
        console.log('pushing state: ' + new_state);

    };

    $('body').on('click', '[data-href]', (function() {

        var $this =       $(this);
        var exchangeid =  $this.data('exchangeid');
        var href =        $this.data('href');
        var page =        $this.data('href-page');
        var pane =        $this.data('href-pane');
        var id =          $this.data('href-id');
        var url =         (page && pane && id) ? page + '/' + id + '/' + pane : href;

        console.log('data-href element clicked. href-id: ' + id);
        setPage(url);
        if ($this.is('[data-reload')) location.reload();

    }));




    window.addEventListener("popstate", function(e) {

        console.log('pop. e.state: ' + e.state);
/*
        var a = $('<a>', { href: e.state } )[0];
        var url = a.pathname.slice(1);
        console.log('settingPage: ' + url);
*/
        setPage(e.state);

    });


    var reload_path = window.location.pathname == '/' ? '/homepage' : window.location.pathname;
    console.log('at pageload. settingPage to: ' + reload_path);
    setPage(reload_path);
//    history.replaceState(null, null, reload_path); // use url...



    document.body.scrollTop = document.documentElement.scrollTop = 0;
    if (!sessionStorage.location) getLocation();

/*
    $('#email_form').on('ajax:before', function(event, data, status, xhr) {
        alert('email form ajax before. value of session id: ' + sessionStorage.id + ' data-href-id now: ' + $('#email_form .email_submit').data('href-id'))
    })


    window.addEventListener("storage", function(event) {
        var key = event.key;
        var newValue = event.newValue;
        var oldValue = event.oldValue;
        var url = event.url;
        var storageArea = event.storageArea;

        alert(key + ' was cahnged from ' + oldValue + ' to ' + newValue + ' in ' + url)

        // handle the event
    });
*/
});
