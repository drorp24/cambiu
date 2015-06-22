//
//  M O D E L S
//
//  Get a model object and populate its values across the board  (model_populate)
//  1-way binding model -> view


    model_set = function(model, field, value) {

        var field_no_model = field;
        if (field == 'id') field = model + '_id';
        var field_elements = $('[data-model=' + model + ']' + '[data-field=' + field + ']');
        if (field == 'distance') value = (value * 1000).toFixed(0);

        field_elements.each(function() {

            var $this = $(this);

            // TODO: Use model in all fields and concatenate model to field. Then change here (no special case for 'id') and in populate.
            // TODO: Then merge pages' 'populate' into model_set
            sessionStorage.setItem(model + '_' + field_no_model, value);     // update in session only used fields (if potnetially several times)
            if ($this.is('input, select')) {
                $this.val(value);
            } else {
                $this.html(value);
            }
        });

        // TODO: Replace 'href-id' and 'exchangeid' with just 'exchange_id' and save all these extra assignments. pages.js will then look for exchange_id iso href-id.
        if (field == model + '_id') {
            var data_elements = $('[data-model=' + model + ']' + '[data-href]');

            data_elements.each(function () {

                $(this).attr('data-href-id', value);
                console.log('model_set: populated ' + field + 's data-href-id attr with: ' + value)

            })
        }
    };

    // One-way population after ajax:success (only used field)
    model_populate = function(model, obj) {
        console.log('model_populate: ' + model);
        $.each(obj, function(field, value) {
            model_set(model, field, value)
        })
    };