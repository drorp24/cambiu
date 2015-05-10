// Switch to a different pane according to href
// If href element also includes data-id then populate model data before switching panes

$(document).ready(function() {

    function populate(el, exchange) {

        var field = el.data('field');
        var value = exchange[field];
    console.log('populate ' + field + ' with ' + value)

        el.html(value);
    }

    function clearExchangeContext() {
        sessionStorage.exchange_id  = null;
        sessionStorage.order_id     = null;
        // TODO: reverse the populate too
    }

    // consider css transition (take it from collapse css transition)
    // also change hash and push to history
    function pageSwitch(old_page, new_page) {
        old_page.removeClass('active');
        old_page.hide();
        new_page.addClass('active');
        new_page.show();
    }

    $('#exchanges').on('click', '[data-href]', (function() {

        var $this = $(this);
        var old_page = $('.active.page');
        var new_page = $($this.data('href'));

        if ($this.attr('data-exchangeid')) {
console.log('this id: ' + $this.attr('id'))
            var exchange_id = $this.data('exchangeid');
            var results = $.grep(exchanges, function(e){ return e.id == exchange_id; });
            var exchange = results[0];

  console.log('new_page id: ' + new_page.attr('id'))
  console.log('exchange_id: ' + exchange_id)
            new_page.find('[data-model=exchange]').each(function() {
                populate($(this), exchange)
            });

            sessionStorage.exchange_id = exchange_id;
            $('[data-current-exchange]').attr('data-exchangeid', exchange_id);
            $('[data-field=exchange_id]').val(exchange_id)
        }

        if (new_page.data('search-home')) {
            clearExchangeContext();
        }

        if ($this.data('reload')) {         // TODO: Check if reload is still needed
            location.reload()
        } else {
            pageSwitch(old_page, new_page);
        }

    }))

});
