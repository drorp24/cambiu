//
//  M O D E L S
//
//  Get a model object and populate its values across the board  (populate)
//  1-way binding model -> view


populateExchange = function(exchange, $el) {


    $.each(exchange, function(field, value) {
        $('[data-model=exchange][data-field=' + field + ']').html(value);
    });

    $photo = $el.find('.photo');
    if ($photo) {
        if (exchange.place.photo) {
            var src         = exchange.place.photo.getUrl({'maxWidth': photoWidth, 'maxHeight': photoHeight});
            var html        = '<img src=' + src + '>';
            $photo.html(html).find('img').css('width', '100%').css('height', height);
        } else {
            var size        = String(photoWidth) + 'x' + String(photoHeight);
            var location    = String(exchange.latitude) + ',' + String(exchange.longitude);
            var src         = 'https://maps.googleapis.com/maps/api/streetview?size=' + size + '&location=' + location + '&key=' + google_api_key;
            var html        = '<img src=' + src + '>';
            $photo.html(html);
        }
    }

    var reviews_length = exchange.place.reviews && exchange.place.reviews.length;
    if (reviews_length) {
        $el.find('[data-field=reviews]').html(reviews_length);
        $el.find('.review_word').html(pluralize('review', reviews_length));
    }

    var rating = exchange.rating || exchange.place.rating;
    if (rating && rating > 0) $el.find('[data-field=rating]').rating('update', rating);


    /// Potential other overrides from GP: opening hours, phone, website, google page?! ("more")

};

populateReviews = function(exchange, $el) {

    var review_template = $('.review.template');

    $el.find('.reviews_list').empty();

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
    bind_forms();

    paramsPopulated = true;

};


value_of = function(key) {
    var a = sessionStorage.getItem(key);
    return (a && a != "null") ? a : null;
};

// populate a field's value in ss, and in form inputs too if applicable
set = function(field, value) {
    sessionStorage.setItem(field, value);
    if (searchable(field)) {
        $('form [data-field=' + field + ']').val(value);
        if (field.indexOf('amount') > -1) {
            var clean_value = String(value).replace(/[^0-9\.]+/g,"");
            $('form #' + field + '_val').val(clean_value)
        }
        $('.navbar [data-field=' + field + ']').html(value);
    }
};


