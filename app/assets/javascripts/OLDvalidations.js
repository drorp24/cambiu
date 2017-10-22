var is_currency_unique;

$(document).ready(function() {


    //
    // Prevention
    //


    // Enforce unique amount

    $('input[data-field=buy_amount]:not([data-single=false])').click(function() {
        set('pay_amount', null);
    });
    $('input[data-field=pay_amount]:not([data-single=false])').click(function() {
        set('buy_amount', null)
    });

    $('input[data-field=buy_amount]:not([data-single=false])').keyup(function () {
        set('pay_amount', null);
    });

    $('input[data-field=pay_amount]:not([data-single=false])').keyup(function () {
        set('buy_amount', null);
    });


    // Enforce unique currency in one-sided forms

    disable_other_currency = function(this_currency) {

        var that_currency = (this_currency == 'pay_currency') ? 'buy_currency' : 'pay_currency';

        $('[data-field=' + this_currency + ']:not([data-single=false])').change(function() {
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



    // required since for some reason jquery.validate only validates after reload
 /*   custom_validate = function(form_el) {
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
*/
    jQuery.validator.addMethod('phoneUK', function(phone_number, element) {
         return this.optional(element) || phone_number.length > 9 &&
            phone_number.match(/^(((\+44)? ?(\(0\))? ?)|(0))( ?[0-9]{3,4}){3}$/);
    }, 'Please specify a valid phone number');

    jQuery.validator.addMethod('email_for_real', function(email, element) {
        console.log('checking...')
        return this.optional(element) ||
            email.match(/^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i);
    }, 'Please enter a valid email address');

    $("form.new_order").validate({
        rules: {
            'order[email]': {
//                 email_for_real: true
//                remote: '/searches/unique'
            }
        },
        messages: {
/*
            'order[email]': {
                remote: "This email is already taken"
            },
*/
 /*           'order[phone]': {
                phoneUK: "bla bla"
            }
*/        }
 /*       validClass: 'empty_class',
*//*
        success: function(label) {
            label.removeClass("error_class").text("")
        }
*/
    });

    $('form.new_order').submit(function() {
        var $this = $(this);
        if (!$this.valid()) {
            return false
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