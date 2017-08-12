// THIS IS A TEMPLATE FOR HOW TO CHECK FORMS...
// Both html5 and own validations are applied,
// leaving the headache (e.g., email format checking) to html5
// and applying the easy ones (e.g., blank lines) myself, to display such errors all at once (html5 doesn't do that)
userCheckValidity = function() {

    var emptyMsg = $('form.registration').attr('data-t-empty');

    function valid($e) {
        $e.removeClass('invalid');
    }

    function invalid($e, msg=null) {
        let error = msg || $e.attr('data-t-error');
        $e.removeClass('valid').addClass('invalid');
        $e.siblings('label').attr('data-error', error);
        console.warn(`invalid field (${String(msg)})`, $e[0]);
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

        // Own checks 

        let fieldIsFull = checkIfFull($this);
        formValid = formValid && fieldIsFull;
        if (!fieldIsFull) return true;   // return true is jQuery's break. A field with a problem requires no further checks.

        if ($this.is('#user_password_confirmation')) {
            let fieldValid = checkPasswords($this);
            formValid = formValid && fieldValid;
            if (!fieldValid) return true;
        }

        // html5 checks

        let $this0 = $this[0];
        if ($this0.willValidate && !$this0.validity.valid) {
            invalid($this, 'Invalid format');
            formValid = false;
            return true;
        }
    });


    return formValid;
};
