var is_currency_unique;
var new_search_validator;

$(document).ready(function() {


    //
    // Prevention
    //


    // Enforce unique amount

    $('input[data-field=buy_amount]').click(function() {
        set('pay_amount', null);
    });
    $('input[data-field=pay_amount]').click(function() {
        set('buy_amount', null)
    });

    $('input[data-field=buy_amount]').keyup(function () {
        set('pay_amount', null);
    });

    $('input[data-field=pay_amount]').keyup(function () {
        set('buy_amount', null);
    });


    // Enforce unique currency

    disable_other_currency = function(this_currency) {

        var that_currency = (this_currency == 'pay_currency') ? 'buy_currency' : 'pay_currency';

        $('[data-field=' + this_currency + ']').change(function() {
            var $this = $(this);
            var $this_val = $this.val();
            var that_currency_el = $this.closest('form').find('[data-field=' + that_currency + ']');

            that_currency_el.find('option').removeAttr('disabled');
            if (that_currency_el.val() == $this_val) {
                set(that_currency, $this_val == 'USD' ? 'EUR' : 'USD')
            } else {
                that_currency_el.find('option[value=' + $this_val + ']').attr('disabled', 'disabled');
            }
        });
    };

    disable_other_currency('pay_currency');
    disable_other_currency('buy_currency');


    // Prevent form submission if invalid
    $('#new_search').submit(function() {
        return new_search_validator.form() && custom_validate($('#new_search'))
    });




    //
    // Validation
    //

    jQuery.validator.setDefaults({
        debug: true,
        errorElement: 'span',
        errorClass: 'error_class',
        errorPlacement:
            function(error, element) {
                element.closest('form').find('.validation_errors').html(error);
            },
        validClass: 'valid_class',
        success: function(label) {
            if (label.hasClass("error_class")) {
//                console.log('success and label.hasClass(error_class)')
                label.removeClass("error_class")/*.addClass("valid_class").text("Thank you!")*/
            }
        }
    });


    is_larger_than_zero = function(element) {
        $element = $(element);
        var amount = Number(String($element.val()).replace(/[^0-9\.]+/g,""));
        return amount > 0;
    };


    jQuery.validator.addMethod("larger_than_zero", function(value, element) {
        return is_larger_than_zero(element);
    }, "Please fill either amount");



    new_search_validator = $("#new_search").validate({
        focusInvalid: false,
        rules: {
            'search[buy_amount]': {
                required: function(element) {
                    return !$(element).closest('form').find('#search_pay_amount').val();
                }
            }
        },
        messages: {
            'search[buy_amount]': {
                required: "Please fill either amount"
            }
        }
     });

    new_search_validator.form();

    // required since for some reason jquery.validate only validates after reload
    custom_validate = function(form_el) {
      switch(form_el.attr('id')) {
          case 'new_search':
              var pay_amount =  form_el.find('#search_pay_amount')[0];
              var buy_amount =  form_el.find('#search_buy_amount')[0];
              var is_valid =    is_larger_than_zero(pay_amount) || is_larger_than_zero(buy_amount);
              if (is_valid) {
                  form_el.find('.validation_errors').removeClass('error_class').empty();
               } else {
                  form_el.find('.validation_errors').html('Please fill either amount').addClass('error_class');
              }
              return (is_valid);
              break;
          default:
              return true;
       }
    };


    $("#new_order").validate({
        rules: {
            'order[email]': {
                required: true,
                email: true
//                remote: '/searches/unique'
            }
        },
        messages: {
            'order[email]': {
                remote: "This email is already taken"
            }
        },
        validClass: 'empty_class',
        success: function(label) {
            label.removeClass("error_class").text("")
        }
    });


    //
    // Server errors
    //

    // Record server validations errors

    $(document).on('ajax:error', function(event, xhr, status, error) {
        var el_id = $(this).attr('id');
        var errors = $.parseJSON(xhr.responseText).errors;
        console.log(el_id + ' returned with the following errors:');
        for (i = 0; i < errors.length; i++) {
            console.log(errors[i])
        }
    });



});