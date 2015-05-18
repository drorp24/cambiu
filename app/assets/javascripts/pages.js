// Switch to a different pane according to href
// If href element also includes data-id then populate model data before switching panes

$(document).ready(function() {

    function populate(el, exchange) {

        if (el.data('id'))              el.attr('id', exchange.id);
        if (el.data('lat'))             el.attr('data-lat', exchange.latitude);
        if (el.data('lng'))             el.attr('data-lng', exchange.longitude);
        if (el.data('exchange-name'))   el.attr('data-exchange-name', exchange.name);

        if (el.data('field'))           el.html(exchange[el.data('field')]);

    }

    function unpopulate(el) {

        if (el.data('id'))              el.attr('id', '');
        if (el.data('lat'))             el.attr('data-lat', '');
        if (el.data('lng'))             el.attr('data-lng', '');
        if (el.data('exchange-name'))   el.attr('data-exchange-name', '');

        if (el.data('field'))           el.html('');

    }

    setPage = function(url) {

        var url_a       = url.split('/');
        var page        = url_a[0];
        var id          = url_a[1];
        var pane        = url_a[2];
        var exchangeid  = id;

        // update session
        sessionStorage.exchangeid   = exchangeid    ? exchangeid    : null;
        sessionStorage.page         = page  ? page  : null;
        sessionStorage.pane         = pane  ? pane  : null;
        sessionStorage.id           = id    ? id    : null;
        console.log(page, pane, id, exchangeid);


        // find exchange
        if (exchangeid) {

            //??
            $('[data-current-exchange]').attr('data-exchangeid', exchangeid);
            $('[data-field=exchange_id]').val(exchangeid)

            if (exchanges && exchanges.length > 0) {
                var results = $.grep(exchanges, function(e){ return e.id == exchangeid; });
                if (result[0]) {
                    console.log('exchange with that id found in exchanges array');
                    var exchange = results[0];
                } else {
                    console.log('exchange with this id not found in exchanges array');
                    // bring it from the server
                }
            } else {
                console.log('data-href contains id but exchanges is empty');
                // bring exchanges from the server
            }
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

        $('.active').hide();
        $('.active').removeClass('active');
        if (page) $('.page[data-page=' + page + ']').addClass('active');
        if (pane) $('.pane[data-pane=' + pane + ']').addClass('active');
        $('.active').show();


        // populate/empty exchange
        $('.active').each(function () {
            $(this).find('[data-model=exchange]').each(function () {
                if (exchange) {
                    populate($(this), exchange)
                } else {
                    unpopulate($(this))
                }
            })
        });

        history.pushState(url, 'cambiu', url);


    };

    $('body').on('click', '[data-href]', (function() {

        var $this =       $(this);
        var exchangeid =  $this.data('exchangeid');
        var href =        $this.data('href');
        var page =        $this.data('href-page');
        var pane =        $this.data('href-pane');
        var id =          $this.data('href-id');
        var url =         (page && pane && id) ? page + '/' + id + '/' + pane : href;

        setPage(url);

    }));




    window.addEventListener("popstate", function(e) {

        console.log('pop. e.state: ' + e.state)
        setPage(e.state);

    });






});
