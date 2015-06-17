//
//  M O D E L S
//
//  Get a model object and populate its values across the board  (model_populate)
//  1-way binding model -> view


    model_set = function(model, field, value) {

        var field_elements = $('[data-model=' + model + ']' + '[data-field=' + field + ']');
        if (field == 'distance') value = (value * 1000).toFixed(0);

        field_elements.each(function() {

            var $this = $(this);

            sessionStorage.setItem(model + '_' + field, value);     // update in session only used fields (if potnetially several times)
            if ($this.is('input, select')) {
                $this.val(value);
            } else {
                $this.html(value);
            }
        });

        if (field == 'id') {
            var data_elements = $('[data-model=' + model + ']' + '[data-href]');

            data_elements.each(function () {

                $(this).attr('data-href-id', value);

            })
        }
    };

    // One-way population after ajax:success (only used field)
    model_populate = function(model, obj) {
        $.each(obj, function(field, value) {
            model_set(model, field, value)
        })
    };