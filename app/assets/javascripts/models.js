//
//  M O D E L S
//
//  Get a model object and populate its values across the board  (populate)
//  1-way binding model -> view


populate = function(model, obj) {

    console.log('populate: ' + model);

    if (model == 'exchange') {
        streetview(obj);
        place_populate(obj.id);
    }

    $.each(obj, function(field, value) {

        if (field == 'id' || field == 'delivery_tracking') {
            $('[data-' + model + '-' + field + ']').attr('data-' + model + '-' + field, String(value));
        } else {
             $('[data-model=' + model + '][data-field=' + field + ']').html(value);
        }

        sessionStorage.setItem(model + '_' + field, value);

    });

    sessionStorage.setItem(model + '_populated', obj.id);

};

clear = function(model) {

    if (model == 'exchange') {
        $('[data-model=exchange][data-exchange-id]').attr('data-exchange-id', 'null');
        $('[data-model=exchange][data-exchange-delivery_tracking]').attr('data-exchange-delivery_tracking', 'null');
    }

    for (var i=0, len = sessionStorage.length; i  <  len; i++){
        var key     = sessionStorage.key(i);
        var value   = sessionStorage.getItem(key);
        if  (key && key.indexOf(model + '_') > -1)  {
            sessionStorage.setItem(key, null)
        }
    }
};

populated = function(exchange_id) {

    var exchange_populated = value_of('exchange_populated');

    if (exchange_populated && exchange_populated == exchange_id) {
        console.log('exchange ' + exchange_id + ' is populated already');
        return true;
    } else {
        console.log('exchange ' + exchange_id + ' is not populated already');
        return false;
    }
};