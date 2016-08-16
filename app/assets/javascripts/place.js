populatePlace = function(exchange) {

    console.log('exchange ' + exchange.id + ' - populatePlace started');
    console.log('   exchange ' + exchange.id + ':');
    console.log(exchange);

    if (exchange.place_id) {
        getPlaceDetails(exchange.place_id, exchange)
    } else {
        getPlace(exchange)
    }

};

getPlace = function(exchange) {

    if (!exchange.name || !exchange.latitude || !exchange.longitude) {
        console.log('cannot getPlace without exchange name, lat and lng for ' + String(exchange.id));
        return
    }

    var exchange_location = new google.maps.LatLng(exchange.latitude, exchange.longitude);

    var request = {
        location: exchange_location,
        name: exchange.name,
        radius: 100/*,
        rankBy: google.maps.places.RankBy.DISTANCE*/ // Google doesn't allow to rank by distance if radius is specified and without radius specified it returns zero results
    };

    var service = new google.maps.places.PlacesService(map);

    console.log('exchange ' + exchange.id + ' - nearbySearch request:');
    console.log(request);
    console.log('   exchange lat: ' + exchange.latitude + ' lng: ' + exchange.longitude);
    console.log('   request lat: ' + request.location.lat() + ' lng: ' + request.location.lng());

    service.nearbySearch(
        request,
        function(results, status) {nearbySearchCallback(results, status, exchange)}
    );
};


nearbySearchCallback = function(results, status, exchange) {

    if (status == google.maps.places.PlacesServiceStatus.OK) {
        if (results.length >= 1) {

            var place_id = results[0].place_id;
            getPlaceDetails(place_id, exchange);

            if (results.length > 1) {
                console.log('exchange ' + exchange.id + ' - More than one place id found in Google');
                console.log('   Our name: ' + exchange.name + '. Our address: ' + exchange.address);
                console.log('   Google name: ' + results[0].name + '. Google address: ' + results[0].vicinity);
            }

         } else {
            console.log('No place id found')
         }

    } else {
        console.log('exchange ' + exchange.id + ' - nearbySearch error: ' + status);
        console.log('   Our name: ' + exchange.name + '. Our address: ' + exchange.address);
/*
        console.log('   results:');
        console.log(results);
*/
        defaultImage(exchange, status);
    }
};


getPlaceDetails = function(place_id, exchange) {

    service = new google.maps.places.PlacesService(map);

    service.getDetails(
        {placeId: place_id},
        function(place, status) {getDetailsCallback(place, status, exchange)}
    );
};


getDetailsCallback = function(place, status, exchange) {

    if (status != google.maps.places.PlacesServiceStatus.OK) {
        console.log('exchange ' + exchange.id + ' - getDetails error: ' + status);
        return
    }

    var exchange_id =       exchange.id;
    var exchange_latlng =   new google.maps.LatLng(exchange.latitude, exchange.longitude);
    var place_latlng =      place.geometry.location;
    var distance =          String(Math.round(google.maps.geometry.spherical.computeDistanceBetween(exchange_latlng, place_latlng)));


    // Don't use if too far

    if (distance > 150) {
        console.log('exchange ' + exchange.id + ' - Unusing place: ' + distance + 'm from exchange:');
        console.log('   Our name: ' + exchange.name + '. Our address: ' + exchange.address);
        console.log('   Googles unused place name: ' + place.name + '. place address: ' + place.formatted_address);
        console.log('   Our lat: ' + exchange.latitude + ' lng: ' + exchange.longitude);
        console.log('   Googles unused place lat: ' + place.geometry.location.lat() + ' lng: ' + place.geometry.location.lng());
/*
        console.log('   Unused place:');
        console.log(place);
*/
        defaultImage(exchange, distance + 'm away');
        return
    }

    // Place photo or streeview

    console.log('exchange ' + exchange.id + ' - details found');

    if (place.photos && place.photos.length > 0) {
        console.log('exchange ' + exchange.id + ' - place photo instead of streetview');
        photo(place.photos[0], exchange);
    } else {
        streetview(exchange)
    }

    /// update here: opening hours, phone, website, rating, reviews, google page?! ("more")


    // Reviews

    var reviews_length = place.reviews && place.reviews.length;
    var reviews_list = $('.reviews_list');

    reviews_list.empty();
    if (reviews_length > 0) {

        $('[data-model=exchange][data-field=reviews]').html(reviews_length);
        $('.review_word').html(pluralize('review', reviews_length));

        var review_template = $('.review.template');

        var rating_sum = 0;
        for (i = 0; i < place.reviews.length; i++) {

            var review = place.reviews[i];
            var review_el = review_template.clone().removeClass('template');

            if (review.rating) {
                review_el.find('.review_rating input')
                    .rating({
                        theme: 'krajee-fa',
                        filledStar: '<i class="fa fa-star"></i>',
                        emptyStar: '<i class="fa fa-star-o"></i>',
                        showClear: false,
                        showCaption: true,
                        size: 'xs',
                        readonly: true
                    })
                    .rating('update', review.rating);
                rating_sum += review.rating;
            }
            if (review.text)                review_el.find('.review_text').html(review.text);
            if (review.author_name)         review_el.find('.review_author').html(review.author_name);
            if (review.profile_photo_url)   review_el.find('.review_photo').html('<img class=img-circle src=' + review.profile_photo_url + '>');

            reviews_list.append(review_el);

        }

    }

    // Rating. Precedence: 1. cambiu's avg rating 2. place's rating 3. reviews' avg rating

    var rating_el       = $('[data-model=exchange][data-field=rating]');
    var cambiu_rating   = exchange_id == numeric_value_of('exchange_id') && numeric_value_of('exchange_rating');
    var rating          = 0;
    var rating_source;

    if (cambiu_rating) {
        rating = cambiu_rating;
        rating_source = 'cambiu';
    } else
    if (place.rating && place.rating > 0) {
        rating = place.rating;
        rating_source = 'place'
    } else
    if (place.reviews && place.reviews.length > 0 && rating_sum > 0) {
        rating = rating_sum / place.reviews.length;
        rating_source = 'reviews'
    } else {
        rating = 0;
        rating_source = 'none';
    }
    rating_el.rating('update', rating);
    console.log('rating source: ' + rating_source);


    // Persist place_id

    if (!exchange.place_id) {
        updateExchange(exchange_id, {'exchange[place_id]': place.place_id});
    }

};


streetview = function(exchange) {

    var size        = String(photoWidth) + 'x' + String(photoHeight);
    var location    = String(exchange.latitude) + ',' + String(exchange.longitude);
    var src         = 'https://maps.googleapis.com/maps/api/streetview?size=' + size + '&location=' + location + '&key=' + google_api_key;
    var html        = '<img src=' + src + '>';

    $('[data-exchange_id='+ exchange.id +'] .photo').html(html);

};

photo = function(photo, exchange) {
    var width       = photoWidth;
    var height      = photoHeight;
    var src         = photo.getUrl({'maxWidth': width, 'maxHeight': height});
    var html        = '<img src=' + src + '>';

    $('[data-exchange_id='+ exchange.id +'] .photo').html(html).find('img').css('width', '100%').css('height', height);
};

logo = function(exchange) {

    var height      = photoHeight;
    var src         = '../apple-touch-icon.jpg';
    var html        = '<img src=' + src + '>';

    $('[data-exchange_id='+ exchange.id +'] .photo').html(html).find('img').css('width', '100%').css('height', height);
};

missing = function(exchange) {
    var height      = photoHeight;
    var html = '<div class=missing>Exchange missing in Google</div>';
    $('[data-exchange_id='+ exchange.id +'] .photo').html(html).find('div').css('width', '100%').css('height', height);
};

defaultImage = function(exchange, reason) {
    console.log('   exchange ' + exchange.id + ' - default image placed. Reason: ' + reason);
    missing(exchange);
};

updateExchange = function(exchange_id, data) {
    $.ajax({
        type: 'PUT',
        url: '/exchanges/' + exchange_id,
        data: data,
        dataType: 'JSON',
        success: function (data) {
            console.log('Exchange successfully updated');
        },
        error: function (data) {
            console.log('There was an error updating the exchange');
        }
    });
};

getExchange = function(exchange_id, property) {
    $.ajax({
        type: 'GET',
        url: '/exchanges/' + exchange_id + '/get',
        data: 'property=' + property,
        dataType: 'JSON',
        success: function (data) {
            console.log('Exchange successfully returned value');
            console.log(data)
        },
        error: function (data) {
            console.log('There was an error getting value from the exchange');
        }
    });
};


$(document).ready(function() {
    $('.ratings').rating({
        theme: 'krajee-fa',
        filledStar: '<i class="fa fa-star"></i>',
        emptyStar: '<i class="fa fa-star-o"></i>',
        showClear: false,
        showCaption: false,
        size: 'xs'
    });

    $('.ratings').on('rating.change', function(event, value, caption) {
        var exchange_id = $(this).attr('data-exchange-id');
        swal({
                title: "Saved",
                html: true,
                text: 'You gave ' + value_of('exchange_name') + ' <strong>' + value + ' stars</strong>' ,
                type: "success"
             });

        updateExchange(exchange_id, {'exchange[rating]': value});
    });


});

