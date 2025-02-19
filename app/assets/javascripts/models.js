//
//  M O D E L S
//
//  Get a model object and populate its values across the board  (model_populate)
//  1-way binding model -> view


    model_set = function(model, field, value) {

        // Populate data fields
        // TODO: prefix model=<modelName> and match data-X so that X is the name used in the ajax returned model obj, to save having to all these 'custom' cases

       if (field == 'delivery_tracking' && value) {
         $('[data-delivery-tracking]').attr('data-delivery-tracking', value)
       }

       if (field == 'logo') {
            if (value) {
                $('[data-field=logo]').attr('src', value);
                $('img#exchange_logo').css('display', 'block');
            } else {
                $('[data-field=logo]').attr('src', value);
                $('img#exchange_logo').css('display', 'none');
            }
            return
        }

        if (field == 'distance') value = (value * 1000).toFixed(0);

        if (field == 'real_rates') {
            $('.subject_to_change').html(value ? '' : 'This rate is subject to change and is regularly updated by our staff');
            return
        }

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
            if ($this.is('input, select')) {
                $this.val(value);
            } else {
                $this.html(value);
            }
        });



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

        if (field == 'delivery_tracking') {
            sessionStorage.setItem('exchange_delivery_tracking', value)
            if (!value) {
                $('button[data-service-type=delivery]').attr('disabled', 'disabled');
//                $('.delivery_method.delivery').attr('data-content', 'Sorry, no delivery');
            } else {
                $('button[data-service-type=delivery]').removeAttr('disabled');
//                $('.delivery_method.delivery').removeAttr('data-content');
            }
        }

    };

    // One-way population after ajax:success (only used field)
    model_populate = function(model, obj) {
        console.log('model_populate: ' + model);

        // Populate input, select and html tags, one field at a time iterating over the passed obj fields
        $.each(obj, function(field, value) {
            model_set(model, field, value)
        });
        if (obj.rounded) {
            text = '<p class=info_class>You may pay ' + obj.pay_rounded + ' and get ' + obj.get_rounded + ' to round</p>'
            $('.exchange_search_form_error').html(text);
        }

    };