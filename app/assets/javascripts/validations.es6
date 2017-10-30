// THIS IS A TEMPLATE FOR HOW TO CHECK FORMS...
// Both html5 and own validations are applied,
// leaving the headache (e.g., email format checking) to html5
// and applying the easy ones (e.g., blank lines) myself, to display such errors all at once (html5 doesn't do that)


function valid($e) {
    $e.removeClass('invalid');
}

function invalid($e, msg=null) {

    let error = msg || $e.attr('data-t-error');

    $e.removeClass('valid').addClass('invalid');
    $e.siblings('label').attr('data-error', error);
//    console.warn(`invalid field (${String(msg)})`, $e[0]);

}

// $slide-level validation + class updating. Used to clear-out a page partly/fully filled by autocomplete rather than manual keying
// Unlike keyup (search.es6), autocomplete doesn't clear-out the 'empty'/'invalid'/'missing' classes
iSlideValid = ($slide) => {

    if (!$slide.hasClass('missing')) return true;
    var answer = true;

    $slide.find('input').each(function() {

        let $this = $(this);
        console.log('$this: ', $this[0]);
        if (!$this.is('.empty, .invalid')) {console.log('$this is not empty nor invalid'); return true;}

        let selfValidate = $this.is('[data-validate]');
        let selfValid = !selfValidate || window[$this.data('validate')]($this);
        let fieldIsValid = $this[0].validity.valid && selfValid;
        if (fieldIsValid) {
            console.log('fieldIsValid');
            valid($this)
        } else {
            console.log('fieldIs not Valid');
            invalid($this);
            answer = false;
            return false;
        }
    });

    answer ? $slide.removeClass('missing') : $slide.addClass('missing');
    return answer;

};

// Not used. Checking per keystroke: as soon as there are no .empty/.invalid fields, slide is unlocked
isearchValid = () => {
    let $buy_amount = $('#buy_amount');
    let buy_amount_valid = clean($buy_amount.val());

    buy_amount_valid ? valid($buy_amount) : invalid($buy_amount);
    return buy_amount_valid;
};

userCheckValidity = function() {

    var emptyMsg = $('form.registration').attr('data-t-empty');


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

        if ($this[0].hasAttribute('required')) {
            let fieldIsFull = checkIfFull($this);
            formValid = formValid && fieldIsFull;
            if (!fieldIsFull) return true;   // return true is jQuery's break. A field with a problem requires no further checks.
        }

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

fullName = ($e) => $e.val().includes(' ');
