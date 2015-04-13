$(document).ready(function() {
        

    // hide address bar - not working as of iOS7
    window.addEventListener("load",function() {
    // Set a timeout...
    setTimeout(function(){
        // Hide the address bar!
        window.scrollTo(0, 1);
    }, 0);
    });



    // rails' jquery_ujs remote by hand
    $('#new_user').submit(function() { 
        email = $('#email').val(); 
        dataLayer.push({'email': email});
        var valuesToSubmit = $(this).serialize();
        $.ajax({
            type: "POST",
            url: $(this).attr('action'), 
            data: valuesToSubmit,
            dataType: "JSON",
        }).success(function(json){
            //act on result.
        });
        return false; // prevents normal behaviour
    });

    // Analyses & Flow
    $('#mobile_input_trigger input').click(function() {
//      ga('send', 'event', 'button', 'click', 'First mobile click');
        mixpanel.track('First mobile click');
        $('#mobile_input_trigger').css('display', 'none');
        $('.form-group:not(#mobile_input_trigger, .email_group)').css('display', 'block');
        $('#buy_amount').focus();
    });

    $('#pay_amount, #pay_currency, #buy_currency').change(function() {
//      ga('send', 'event', 'button', 'click', 'Populating rates');
        mixpanel.track('Checking rates');
    });

    $('#search_button').click(function() {
//      ga('send', 'event', 'button', 'click', 'Clicking search');
        mixpanel.track("Search button");

        var pay_cents =    $('#pay_amount').val().replace(',', '').replace('.', '');
        var pay_currency = $('#pay_currency').val();
        var buy_currency = $('#buy_currency').val();

        $.get('/currencies/exchange', {
            pay_cents: pay_cents,
            pay_currency: pay_currency,
            buy_currency: buy_currency
        }
        ).done(function(data) {
            if (data == null) {
                location.reload();              
            } else {                console.log(data.offer);
                $('.form-group:not(.email_group)').css('display', 'none');
                $('.email_group').css('display', 'block');
                $('#message_header').html('<We can offer you ' + data.offer.replace(/['"]+/g, ''));
                $('#message_remainder').html('Your gain: ' + data.gain.replace(/['"]+/g, ''));
            }
        });
    });

    $('#email_button').click(function() {
//      ga('send', 'event', 'button', 'click', 'Leaving email');
        mixpanel.track("Email button");
        $('#message_header').html('Thank you for your interest!');
        if ($('#email').val()) {
            $('#message_remainder').html('We launch soon!');         
        }
    });

});