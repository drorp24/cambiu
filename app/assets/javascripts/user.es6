userCheckValidity = function() {

    var emptyMsg = $('form.registration').attr('data-t-empty');

    function valid($e) {
        $e.removeClass('invalid');
    }

    function invalid($e, msg=null) {
        let error = msg || $e.attr('data-t-error');
        $e.removeClass('valid').addClass('invalid');
        $e.siblings('label').attr('data-error', error);
    }

    function checkIfFull($e) {
        let inputValid = !!$e.val().length;
        inputValid ? valid($e) : invalid($e, emptyMsg);
        return inputValid;
    }


    $('form.registration input').removeClass('invalid');
    var formValid = true;

    $('form.registration input').each(function()  {
        let full = checkIfFull($(this));
        formValid = formValid && full;
    });


    // the html5 validity status: $('form.registration')[0].checkValidity() (boolean)
    // if I want to use html5 validations I can return the data-href only after the above returns true
    // but it doesnt check phone nor email so not sure i want it, plus: IT WARNS ONE FIELD AT A TIME... mine warns about all
    // NO SUPPORT OF HEBREW UNLIKE ME
/*
     var $email = $('#user_email');
     var emailValid = !!$email.val().length;  // & it's format is valid
     emailValid ? valid($email) : invalid($email);
     formValid = formValid && emailValid;

     var $password = $('#user_password');
     var passwordValid = !!$password.val().length;  // & it's format is valid
     passwordValid ? valid($password) : invalid($password);
     formValid = formValid && passwordValid;
     */

    return formValid;
};
