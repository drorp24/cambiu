//
//  M O D E L S
//
//  Get a model object and populate its values across the board  (model_populate)
//  1-way binding model -> view


model_populate = function(model, obj) {

    console.log('model_populate: ' + model);

    if (model == 'exchange') {
        streetview(obj);
        place_populate(obj.id);
    }

    $.each(obj, function(field, value) {

        if (value === null) return true;

        if (field == 'id') {
            $('[data-' + model + '-id]').attr('data-' + model + '-id', value);
        } else
        if (field == 'rating') {
            $('[data-model=' + model + '][data-field=' + field + ']').rating('update', value);
        } else {
            $('[data-model=' + model + '][data-field=' + field + ']').html(value);
        }

        sessionStorage.setItem(model + '_' + field, value);

    });

    sessionStorage.setItem(model + '_populated', obj.id);

};

clear = function(entity) {
    for (var i=0, len = sessionStorage.length; i  <  len; i++){
        var key     = sessionStorage.key(i);
        var value   = sessionStorage.getItem(key);
        if  (key && key.indexOf(entity + '_') > -1)  {
            sessionStorage.setItem(key, null)
        }
    }
};