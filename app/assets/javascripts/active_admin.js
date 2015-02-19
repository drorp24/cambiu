//= require active_admin/base
//= require jquery
//= require best_in_place
//= require jquery-ui
//= require best_in_place.jquery-ui
//= require jquery.purr
//= require best_in_place.purr
$(document).ready(function() {
  /* Activating Best In Place */
  jQuery(".best_in_place").best_in_place();
  jQuery('.best_in_place').bind("ajax:success", function () {jQuery(this).closest('tr').effect('highlight'); });
  $(document).on('best_in_place:error', function(event, request, error) {
    // Display all error messages from server side validation
    response = $.parseJSON(request.responseText);
    $.each(response['errors'], function(index, value) {
      if(value.length > 0) {
        if( typeof(value) == "object") {value = index + " " + value.toString(); }
        var container = $("<span class='flash-error'></span>").html(value);
        container.purr();
      };
    });
  });
});