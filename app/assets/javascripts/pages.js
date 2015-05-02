$(document).ready(function() {

    $('#exchanges').on('click', '[data-href]', (function() {
        var $this = $(this);
        var old_page = $('.active.page');
        var new_page = $($this.data('href'));

        old_page.removeClass('active');
        old_page.hide();
        new_page.addClass('active');
        new_page.show();
    }))

    
});
