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

    function checkPasswords($e) {
        let inputValid = ($e.val() == $e.closest('#registration_form').find('#user_password').val());
        inputValid ? valid($e) : invalid($e, "Should match password");
        return inputValid;
    }


    $('form.registration input').removeClass('invalid');
    var formValid = true;

    $('form.registration input').each(function()  {

        let $this = $(this);

        let fieldIsFull = checkIfFull($this);
        formValid = formValid && fieldIsFull;
        if (!fieldIsFull) return true;

        if ($this.is('#user_password_repeat')) {
            let fieldValid = checkPasswords($this);
            formValid = formValid && fieldValid;
            if (!fieldValid) return true;
        }

        // and so on

    });


    return formValid;
};
