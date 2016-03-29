//
//  M O D E L S
//
//  Get a model object and populate its values across the board  (model_populate)
//  1-way binding model -> view


    model_set = function(model, field, value) {

        // Populate data fields
        // TODO: prefix model=<modelName> and match data-X so that X is the name used in the ajax returned model obj, to save having to all these 'custom' cases

        if (field == 'distance') value = (value * 1000).toFixed(0);


        if (field == 'latitude') {
            $('[data-lat]').attr('data-lat', value);
        }

        if (field == 'longitude') {
            $('[data-lng]').attr('data-lng', value);
        }


        if (field == 'errors' && value.length > 0) {
            var text = '';
            for (var i = 0; i < value.length; i++) {
                text += '<p class=error_class>' + value[i] + '</p>'
            }
            $('.exchange_search_form_error').html(text);
        }

        if (field == 'name') {
            $('[data-model=exchange][data-exchange-name]').attr('data-exchange-name', value);
        }

        if (field == 'service_type') {
            $('[data-model=exchange][data-service-type]').attr('data-service-type', value);
        }

        var field_no_model = field;
        if (field == 'id') field = model + '_id';

        var field_elements = $('[data-model=' + model + ']' + '[data-field=' + field + ']');


        field_elements.each(function() {

            var $this = $(this);

            // TODO: Use model in all fields and concatenate model to field. Then change here (no special case for 'id') and in populate.
            // TODO: Then merge pages' 'populate' into model_set
            // TODO: sessionStorage setting should be outside the loop, else it will populate only for those fields which has html tags
            // TODO: Do it with set() and the following logic will be done by set. This is not DRY...
            sessionStorage.setItem(model + '_' + field_no_model, value);     // update in session only used fields (if potnetially several times)
            if (field == 'exchange_id') console.log('In models.js, just updated ss exchange_id to: ' + value);
            if ($this.is('input, select')) {
                $this.val(value);
            } else {
                $this.html(value);
            }
        });



/* TODO: DELETE! Exchange_id and order_id are ONLY held at SS. Order form removed.
        if (field == model + '_id') {
            console.log('field = '+ model + '_id');
            console.log('value is: ' + value);
            var data_elements = $('[data-model=' + model + ']' + '[data-href]:not([data-exchange-selection])');

            // TODO: Replace 'href-id' and 'exchangeid' with just 'exchange_id' and save all these extra assignments. pages.js will then look for exchange_id iso href-id.
            data_elements.each(function () {

                $(this).attr('data-href-id', value);
                console.log('model_set: populated ' + field + 's data-href-id attr with: ' + value)

            });

            // Now do one assignment without the [data-model=model] filter to populate foreign keys in other models (e.g., exchange_id on model=order)
            $('[data-field=' + model + '_id]').val(value);
            console.log('setting all [data-field=' + model + '_id] val() to: ' + value);
        }
*/


    };

    // One-way population after ajax:success (only used field)
    model_populate = function(model, obj) {
        console.log('model_populate: ' + model);

        // Populate input, select and html tags, one field at a time iterating over the passed obj fields
        $.each(obj, function(field, value) {
            model_set(model, field, value)
        });
    };