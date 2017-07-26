$('[data-action=createUser]').click(function(e) {

//    e.preventDefault();

});

userInputValid = function() {

    var emptyMsg = $('form.registration').attr('data-t-empty');

    function valid($e) {
        $e.removeClass('invalid').addClass('valid');
    }

    function invalid($e, msg=null) {
        let error = msg || $e.attr('data-t-error');
        $e.removeClass('valid').addClass('invalid');
        $e.siblings('label').attr('data-error', error);
    }

    function checkIfFull($e) {
        let inputValid = !!$e.val().length;
        if (!inputValid) invalid($e, emptyMsg);
        return inputValid;
    }


    $('form.registration input').removeClass('invalid');
    var formValid = true;

    $('form.registration input').each(function()  {
        let full = checkIfFull($(this));
        console.log('full:', "d");
        formValid = formValid && full;
    });

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
