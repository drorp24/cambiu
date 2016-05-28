//
//  M O D E L S
//
//  Get a model object and populate its values across the board  (model_populate)
//  1-way binding model -> view


model_populate = function(model, obj) {

    console.log('model_populate: ' + model);

    $.each(obj, function(field, value) {

        if (field == 'id') {
            $('[data-' + model + '-id]').attr('data-' + model + '-id', value);
        } else {
            $('[data-model=' + model + '][data-field=' + field + ']').html(value);
        }
        sessionStorage.setItem(model + '_' + field, value);
    });

    sessionStorage.setItem('exchange_populated', obj.id);

};
