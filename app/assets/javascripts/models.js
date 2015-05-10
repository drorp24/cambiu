model_set = function(model, field, value) {

    var elements = $('[data-model=' + model + ']' + '[data-field=' + field + ']');

    elements.each(function() {

        sessionStorage.setItem(model + '_' + field, value);     // update in session only used fields (if potnetially several times)
        $(this).html(value);                                    // no need for input at the moment
    })
};

// One-way population after ajax:success (only used field)
model_populate = function(model, obj) {
    $.each(obj, function(field, value) {
        model_set(model, field, value)
    })
};