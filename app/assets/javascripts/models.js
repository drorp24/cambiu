//
//  M O D E L S
//
//  Get a model object and populate its values across the board  (populate)
//  1-way binding model -> view


populateDuration = function(exchange, $scope) {

    console.log('exchange ' + exchange.id + ' - populateDuration');

    setTimeout(function(){
        var $img = $scope.find('img');
        var bottom = (cardHeight - $img.height()) / 2;
        var left = $img.position().left;
        var width = $img.width();
        var $duration = $scope.find('.duration');
        $duration.find('[data-model=exchange][data-field=duration]').html(exchange.matrix.duration);
        $duration.css({'bottom': bottom + 'px', 'left': left + 'px', width: width + 'px'});
        console.log('imgHeight: '+ $img.height());
    }, 500);


};

populateExchange = function(exchange, $scope) {

//    console.log('exchange ' + exchange.id + ' - populateExchange');

    $scope.find('[data-model=exchange][data-field]').each(function() {
        var $this = $(this);
        var field = $this.data('field');
        var value = exchange[field];
        $this.html(value);
    });

    var $photo = $scope.find('.photo');
    if ($photo.length > 0) {
        var size        = String(bodyWidth) + 'x' + String(halfBodyHeight);
        var location    = String(exchange.latitude) + ',' + String(exchange.longitude);
        var src         = 'https://maps.googleapis.com/maps/api/streetview?size=' + size + '&location=' + location + '&key=' + google_api_key;
        var html        = '<img src=' + src + '>';
        $photo.html(html);
    }

    if (!exchange.gain_percent) {
        $scope.find('.comparison').css('visibility', 'hidden');
        $scope.find('.comparison_text').css('visibility', 'hidden');
    }

    var $phone_link = $scope.find('.phone_icon a');
    if (exchange.phone) {
        $phone_link.attr('href', 'tel:' + exchange.phone)
    } else {
        $phone_link.css('visibility', 'hidden')
    }
};

populatePlace = function(exchange, $scope) {


//    console.log('exchange ' + exchange.id + ' - populatePlace');

    $photo = $scope.find('.photo');
    if ($photo && exchange.place.photo) {
        var src         = exchange.place.photo.getUrl({'maxWidth': bodyWidth, 'maxHeight': halfBodyHeight});
        var html        = '<img src=' + src + '>';
        $photo.html(html);
     }

    var reviews_length = exchange.place.reviews && exchange.place.reviews.length;
    if (reviews_length) {
        $scope.find('[data-field=reviews]').html(reviews_length);
        $scope.find('.review_word').html(pluralize('review', reviews_length));
    }

    var rating = exchange.rating || exchange.place.rating;
    if (rating && rating > 0) $scope.find('[data-field=rating]').rating('update', rating);


    /// Potential other overrides from GP: opening hours, phone, website, google page?! ("more")

};

populateReviews = function(exchange, $scope) {

    var review_template = $('.review.template');
    var reviews_list = $scope.find('.reviews_list').empty();

    exchange.place.reviews.forEach(function(review) {

        var review_el = review_template.clone().removeClass('template');

        if (review.rating) {
            review_el.find('.review_rating input')
                .rating(ratingOptions)
                .rating('update', review.rating);
        }
        if (review.text)                review_el.find('.review_text').html(review.text);
        if (review.author_name)         review_el.find('.review_author').html(review.author_name);
        if (review.profile_photo_url)   review_el.find('.review_photo').html('<img class=img-circle src=' + review.profile_photo_url + '>');

        reviews_list.append(review_el);

    });

};


// populate search params in search form and navbar
// values are either defaults or taken from ss is this is refresh
// part of what used to be restore()
populateParams = function() {

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

    bind_currency_to_autonumeric();

    paramsPopulated = true;

};


value_of = function(key) {
    var a = sessionStorage.getItem(key);
    return (a && a != "null") ? a : null;
};

// Populate search params in search form, search bar and ss for persistency (page reloads)
set = function(field, value, trigger) {

    console.log('set ' + field + ' to ' + value);

    $('.params [data-model=search][data-field=' + field + ']').html(value);
    value = (field.indexOf('amount') > -1) ? String(value).replace(/[^0-9\.]+/g,"") : value;

    // .trigger('change') is needed to trigger setting or removing the '.is-empty'
    // select fields can't use it however since they have a 'change' event which in turn calls 'set' again resulting in an endless loop
    var $formField = $('form [data-model=search][data-field=' + field + ']').val(value);
    if ($formField.is('select')) {
        $formField.closest('.form-group').removeClass('is-empty');
    } else {
        $formField.trigger('change');
    }
    sessionStorage.setItem(field, value);

};


