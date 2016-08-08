//
//  M O D E L S
//
//  Get a model object and populate its values across the board  (populate)
//  1-way binding model -> view


value_of = function(key) {
    var a = sessionStorage.getItem(key);
    return (a && a != "null") ? a : null;
};

// populate a field's value in ss, and in form inputs too if applicable
set = function(field, value) {
    sessionStorage.setItem(field, value);
    if (searchable(field)) {
        var clean_value = (field.indexOf('amount') > -1)  ? String(value).replace(/[^0-9\.]+/g,"")  : value;
        $('form [data-field=' + field + ']').val(value);
        $('.navbar [data-field=' + field + ']').html(clean_value);
    }
};


populate = function(model, obj) {

    console.log('populate: ' + model);

    if (model == 'exchange') {
        var exchange = obj;
        populatePlace(exchange);
        populateDirections(exchange);
    } else
    if (model == 'order') {
        var order = obj;
        renderQr(order);
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

renderQr = function(order) {
    var url = window.location.host + '/orders/' + order.id + '/confirm';
    $('.qrcode').empty().qrcode({size: photoHeight - 20, text: url})
};

populateDirections = function(exchange) {

// http://stackoverflow.com/questions/18739436/how-to-create-a-link-for-all-mobile-devices-that-opens-google-maps-with-a-route

    var current_address = sessionStorage.location_type == 'default' ? sessionStorage.location_default : sessionStorage.location;
    current_address = encodeURI(current_address);

    var href = 'maps://maps.apple.com/?';
    href += 'saddr=' + current_address + '&';
    href += 'daddr=' + encodeURI(exchange.address);
    href += '&dirflg=w';
    $('.applemaps').attr('href', href);

    var href = 'http://maps.apple.com/?';
    href += 'saddr=' + current_address + '&';
    href += 'daddr=' + encodeURI(exchange.address);
    href += '&dirflg=w';
    $('.httpsapple').attr('href', href);

    var href = 'comgooglemaps://?';
    href += 'saddr=' + sessionStorage.location_lat + ',' + sessionStorage.location_lng + '&';
    href += 'daddr=' + exchange.latitude + ',' + exchange.longitude + '&';
    href += 'directionsmode=walking';
    $('.comgooglemaps').attr('href', href);

    var href = 'http://maps.google.com/?';
    href += 'saddr=' + sessionStorage.location_lat + ',' + sessionStorage.location_lng + '&';
    href += 'daddr=' + exchange.latitude + ',' + exchange.longitude;
    $('.httpsgoogle').attr('href', href);

    var href = 'geo:';
    href += exchange.latitude + ',' + exchange.longitude;
    $('.geo').attr('href', href);

    $('.device').html(isAndroid ? 'Android ' : 'iOs ' + 'device').css('font-weight', 'bold').css('color', '#000');


};

restore = function() {

    console.log('restore');

    var exchange = {};
    var order = {};
    var value_of_pay_amount = value_of('pay_amount');
    var value_of_buy_amount = value_of('buy_amount');
    var def = def_vals();

    searchParams.forEach(function(key) {

        if (key == 'buy_amount') {
            set('buy_amount',   value_of_buy_amount || (value_of_pay_amount ? null : def['buy_amount']))
        } else
        if (key == 'pay_amount') {
            set('pay_amount',   value_of_pay_amount || (value_of_buy_amount ? null : def['pay_amount']))
        } else {
            set(key,            value_of(key)       || def[key])
        }

    });

    for (var i = 0; i < sessionStorage.length; i++) {

        var key = sessionStorage.key(i);
        var value = sessionStorage.getItem(key);  if (value == "null") value = null;

        if (key && key.indexOf('exchange_') > -1) {

            exchange[key.slice(9)] = value;

        } else if (key && key.indexOf('order_') > -1) {

            order[key.slice(6)] = value;

        }
    }

    populate('exchange', exchange);
    populate('order', order);

    bind_currency_to_autonumeric();
    bind_forms();
};


