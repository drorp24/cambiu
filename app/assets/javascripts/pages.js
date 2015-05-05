$(document).ready(function() {

    $('#exchanges').on('click', '[data-href]', (function() {
        var $this = $(this);
        var old_page = $('.active.page');
        var new_page = $($this.data('href'));

        // exchanges.js - record the exchange id on the '#getit_button' (the one with the href, triggering this event)
        // id = $this.data('id');
        // var results = $.grep(exchanges_array, function(e){ return e.id == id; });
        // var exchange = results[0]
        // now populate everything in the summary page and the voucher page taking values from exchange, e.g., exchange.address
        // then continue below: hiding the old page and showing the new page.


        old_page.removeClass('active');
        old_page.hide();
        new_page.addClass('active');
        new_page.show();    // consider css transition (take it from collapse css transition)

        // also change hash and push to history

    }))


});
