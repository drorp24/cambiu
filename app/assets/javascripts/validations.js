$(document).ready(function() {

    console.log('validations');

 /*   function isValidEmailAddress(emailAddress) {
        var pattern = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
        return pattern.test(emailAddress);
    };
*/

    $("#email_form").validate({
        debug: true,
        rules: {
            'search[email]': {
                required: true,
                email: true,
                remote: '/searches/unique'
            }
        },
        messages: {
            'search[email]': {
                remote: "   This email is already taken. Try a different one"
            }
        },
        errorElement: 'span',
        errorClass: 'error_class',
//        errorContainer: '.validation_errors',
//        errorLabelContainer: '.error_messages',
        errorPlacement:
            function(error, element) {
                 var error_container = element.next('.validation_errors');
                error_container.html(error);
          },
        success: function(label) {
            $('.error_icon').css('visibility', 'hidden');
            label.removeClass("error_class").addClass("valid_class").text("   Thank you!")
        },
        validClass: 'valid_class'

    });

 /*   $.validator.addMethod(
        "regex",
        function(value, element, regexp) {
            var check = false;
            return this.optional(element) || regexp.test(value);
        },
        "Please check your input."
    );

    $("#search_email").rules("add", { regex: new RegExp([a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:[A-Z]{2}|com|org|net|edu|gov|mil|biz|info|mobi|name|aero|asia|jobs|museum) })
*/

    /*   $( "#new_search" ).validate({
           rules: {
                pay_amount: {
                   required: function(element) {
                       return $("#search_buy_amount").val() == null;
                   }
               },
               buy_amount: {
                   required: function(element) {
                       return $("#search_pay_amount").val() == null;
                   }
               }
           }
       });
   */



})