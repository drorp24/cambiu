//
//  M O D E L S
//
//  Get a model object and populate its values across the board  (populate)
//  1-way binding model -> view


populateStreetview = function(exchange) {

    var sv = new google.maps.StreetViewService();
    var panorama = new google.maps.StreetViewPanorama(document.getElementById('streetview' + exchange.id));
    sv.getPanorama({
        location: {lat: exchange.latitude, lng: exchange.longitude},
        radius: 50,
        source: google.maps.StreetViewSource.OUTDOOR
    },
        function(data, status) {
            processSVData(panorama, data, status)
    });

};

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
    }, 2000);


};

populateExchange = function(exchange, $scope, index) {

//    console.log('exchange ' + exchange.id + ' - populateExchange');

    if (index == 0) $scope.addClass('best');

    $scope.find('#streetview').attr('id', 'streetview' + exchange.id);

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
        var src         = 'https://maps.googleapis.com/maps/api/streetview?size=' + size + '&location=' + location + '&key=' + google_api_key + '&source=google.maps.StreetViewSource.OUTDOOR';
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

    if (exchange.base_rate) {
        if (index == 0) {
            $scope.find('.ranking').html('<i class="fa fa-trophy"></i>')
        } else {
            $scope.find('.ranking').html(index + 1);
        }
    } else {
        $scope.find('[data-field=edited_quote_rounded]').css('margin-top', '0');
        $scope.find('.comparison').css('display', 'none');
        $scope.find('.ranking').css('display', 'none');
        $scope.find('.norates').css('display', 'block');
        $scope.find('.quote_section').css('display', 'none');
        $scope.find('.no_quote_section').css('display', 'flex');
        $scope.addClass('norate').addClass(exchange.contract ? 'contract' : 'no_contract');
    }


    // REMOVE: a. not needed for smooth transition b. interfers with debugging
    //insert a 'height' property to the card and img tag, so that the height property can be 'transition'ed in the css3, making them 'expand' smoothly

    // Note: This and populateDuration are delayed to afford the streetview img's to load
    // This is a better, albeit less guaranteed way to wait, since the below requires setting a separate event on each and every img
    // If it's not enough just increase the waiting time
    // http://stackoverflow.com/questions/280049/javascript-callback-for-knowing-when-an-image-is-loaded
/*
    setTimeout(function(){
        if (!cardHeight) {
            cardHeight = $scope.height();
        }
        $scope.css('height', cardHeight);
        var $img = $photo.find('img');
        if ($img.height()) $img.css('height', $img.height());
    }, 2000);
*/
    $scope.find('[data-field=rating]').rating(ratingOptions).rating('update', 0);

};

populatePlace = function(exchange, $scope) {


//    console.log('exchange ' + exchange.id + ' - populatePlace');

    // User photo - currently wildcarded for 2 reasons:
    // - isn't displayed properly (isn't confined to the card, captures the entire height of the grey ribbon)
    // - sometimes returned with 403 status, leaving an ugly 'no photo' icon

/*
    $photo = $scope.find('.photo');
    if ($photo && exchange.place.photo) {
        var src         = exchange.place.photo.getUrl({'maxWidth': bodyWidth, 'maxHeight': halfBodyHeight});
        var html        = '<img src=' + src + '>';
        $photo.html(html);
     }
*/

    var reviews_length = exchange.place.reviews && exchange.place.reviews.length;
    if (reviews_length) {
        $scope.find('[data-field=reviews]').html(reviews_length);
        $scope.find('.review_word').html(pluralize('review', reviews_length));
    }

    var rating = exchange.rating || exchange.place.rating || 0;
    if (rating > 0) $scope.find('[data-field=rating]').rating('update', rating);


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
    $('.version').html(version);
    paramsPopulated = true;

};


value_of = function(key) {
    var a = sessionStorage.getItem(key);
    return (a && a != "null") ? a : null;
};

// Populate search params in search form, search bar and ss for persistency (page reloads)
set = function(field, value, trigger) {

//    console.log('set ' + field + ' to ' + value);

    $('.params [data-model=search][data-field=' + field + ']').html(value);
    value = (field.indexOf('amount') > -1) ? String(value).replace(/[^0-9\.]+/g,"") : value;

    var $formField = $('#search_form [data-model=search][data-field=' + field + ']').val(value);
    if (value !== '') {
        $formField.closest('.form-group').removeClass('is-empty').addClass('is-filled');
    } else {
        $formField.closest('.form-group').addClass('is-empty').removeClass('is-filled');
    }
     sessionStorage.setItem(field, value);

};


function processSVData(panorama, data, status) {
    if (status === 'OK') {

        panorama.setPano(data.location.pano);
        panorama.setPov({
            heading: 270,
            pitch: 0
        });
        panorama.setVisible(true);

     } else {
        console.error('Street View data not found for this location.');
    }
}
