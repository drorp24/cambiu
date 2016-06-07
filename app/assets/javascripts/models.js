//
//  M O D E L S
//
//  Get a model object and populate its values across the board  (model_populate)
//  1-way binding model -> view


model_populate = function(model, obj) {

    console.log('model_populate: ' + model);

    $.each(obj, function(field, value) {

        if (!value) return true;

        if (field == 'id') {
            $('[data-' + model + '-id]').attr('data-' + model + '-id', value);
        } else {
            $('[data-model=' + model + '][data-field=' + field + ']').html(value);
        }
        sessionStorage.setItem(model + '_' + field, value);
    });

    sessionStorage.setItem('exchange_populated', obj.id);

    streetview(obj);

};

streetview = function(exchange) {

    console.log('in streetview');

    var size        = String(Math.round(screen.width)) + 'x' + String(Math.round(screen.height/2.7));
    var location    = String(exchange.latitude) + ',' + String(exchange.longitude);
    var src         = 'https://maps.googleapis.com/maps/api/streetview?size=' + size + '&location=' + location + '&key=' + google_api_key;
    var html        = '<img src=' + src + '>';

    $('.streetview').html(html);

};
