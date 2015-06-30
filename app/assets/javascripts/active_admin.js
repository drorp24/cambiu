//= require active_admin/base
//= require jquery
//= require best_in_place
//= require jquery-ui
//= require best_in_place.jquery-ui
//= require jquery.purr.js
//= require best_in_place.purr
$(document).ready(function() {
    jQuery.browser = {};
    (function () {
        jQuery.browser.msie = false;
        jQuery.browser.version = 0;
        if (navigator.userAgent.match(/MSIE ([0-9]+)\./)) {
            jQuery.browser.msie = true;
            jQuery.browser.version = RegExp.$1;
        }
    })();
    function add_rate() {
    var top_tr = $('#index_table_rates tbody').find('tr').first();
    top_tr.prepend(top_tr.clone());
    };

  /* Activating Best In Place */
  jQuery(".best_in_place").best_in_place();
  jQuery('.best_in_place').bind("ajax:success", function (evt, data, status, xhr) {
      var $this = $(this);
      var tr =  $this.closest('tr');
//      var response = $.parseJSON(xhr.responseText);
      var rate = $.parseJSON(data);
        tr.effect('highlight');
      tr.find('.col-updated_at').html(rate.updated_at);
      tr.find('.col-by').html(rate.admin_user_s);
      $('.flashes').empty();
  });
  jQuery('.best_in_place').on("ajax:error", function (event, xhr, status, error) {
      var $this = $(this);
      var response = $.parseJSON(xhr.responseText);
      var message = "";
      $.each(response, function(index, value) {
          message += value + '  ';
      });
      $this.closest('td').effect('highlight');
      $('.flashes').html('<div class=purr>' +  message +'</div>');
  });
 /*     $(document).on('best_in_place:error', function(event, request, error) {
        // Display all error messages from server side validation
        response = $.parseJSON(request.responseText);
        $.each(response['errors'], function(index, value) {
          if(value.length > 0) {
            if( typeof(value) == "object") {value = index + " " + value.toString(); }
            var container = $("<span class='flash-error'></span>").html(value);
            container.purr();
          }
        });
      });
*/


});