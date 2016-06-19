place_populate = function(exchange_id) {

    console.log('place_populate for exchange_id: ' + exchange_id);

    var curr_exchange_id = value_of('exchange_id');
    if (curr_exchange_id == exchange_id) {
        var place_id = value_of('exchange_place_id')
    } else {
        exchange = findExchange(exchange_id);
        if (!exchange) {
            console.log('place_populate: no exchange found for ' + String(exchange_id));
            return
        }
        var place_id = exchange.place_id
    }

    if (place_id) {
        getPlaceDetails(place_id, 0, exchange_id)
    } else {
        getPlace(exchange_id)
    }

};

getPlace = function(exchange_id) {

    console.log('getPlace for exchange_id: ' + String(exchange_id));

    if (exchange_id === undefined) {
        var exchange_id      = value_of('exchange_id');
        var exchange_name    = value_of('exchange_name');
        var exchange_address = value_of('exchange_address');
        var exchange_lat     = value_of('exchange_latitude');
        var exchange_lng     = value_of('exchange_longitude');
    } else {
        var exchange         = findExchange(exchange_id);
        if (!exchange) {
            console.log('getPlace: exchange id ' + String(exchange_id) + ' was not found in exchanges');
            return
        }
        var exchange_id      = exchange.id;
        var exchange_name    = exchange.name;
        var exchange_address = exchange.address;
        var exchange_lat     = exchange.latitude;
        var exchange_lng     = exchange.longitude;
    }

    if (!exchange_id || !exchange_name || !exchange_address || !exchange_lat || !exchange_lng) {
        console.log('getPlace: exchange id, name, address, lat and/or lng missing for ' + String(exchange_id));
        return
    }

    var request = {
        location: new google.maps.LatLng(exchange_lat, exchange_lng),
        radius: '1000',
        query: exchange_name
    };

    console.log('textSearch: ' + request['query']);
    console.log('request localtion lat: ' + request.location.lat() + ' lng: ' + request.location.lng());

    var service = new google.maps.places.PlacesService(map);
    service.textSearch(
        request,
        function(place, status) {textSearchCallback(place, status, exchange_id)}
    );
};


textSearchCallback = function(results, status, exchange_id) {

    if (status == google.maps.places.PlacesServiceStatus.OK) {
        if (results.length >= 1) {

            var place_id = results[0].place_id;
            getPlaceDetails(place_id, 0, exchange_id);

            if (results.length > 1) {
                console.log('More than one place id found');
                for(var i=1; i < results.length; i++) {
                    var place_id = results[i].place_id;
                    getPlaceDetails(place_id, i, exchange_id);
                }
            }

         } else {
            console.log('No place id found')
         }

    } else {
        console.log('Google Places API textSearch error: ' + status);
    }

};


getPlaceDetails = function(place_id, i, exchange_id) {

    console.log('getPlaceDetails for exchange_id: ' + exchange_id);

    service = new google.maps.places.PlacesService(map);
    service.getDetails(
        {placeId: place_id},
        function(place, status) {getDetailsCallback(place, status, i, exchange_id)}
    );
};


getDetailsCallback = function(place, status, i, exchange_id) {

    if (status != google.maps.places.PlacesServiceStatus.OK) {
        console.log('Google Places API getDetails error: ' + status);
        return
    }

    var exchange_latlng = new google.maps.LatLng(sessionStorage.exchange_latitude, sessionStorage.exchange_longitude);
    var place_latlng = place.geometry.location;
    var distance = Math.round(google.maps.geometry.spherical.computeDistanceBetween(exchange_latlng, place_latlng));

    // TODO: Remove eventually
    console.log(String(i) + ' - Distance from request: ' + String(distance) + ' Name: ' + place.name + ' Address: ' + place.formatted_address + ' Phone: ' + place.formatted_phone_number);
    console.log(place);

    // Update only by the first result, and only if place returned is close to the exchange's DB latlng
    if (i != 0) return;
    if (distance > 100) {alert('Returned place too far: ' + String(distance)); return}

    if (place.photos && place.photos.length > 0) {
        console.log('replacing streetview with photo');
        photo(place.photos[0]);
    }

    /// update here: reviews, opening hours, phone, website, rating, reviews, google page ("more")


    // Reviews

    var reviews_length = place.reviews && place.reviews.length;
    if (reviews_length > 0) {

        $('[data-model=exchange][data-field=reviews]').html(reviews_length);
        $('.review_word').html(pluralize('review', reviews_length));

        var reviews_list = $('.reviews_list');
        var review_template = $('.review.template');

        reviews_list.empty();
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


    updateExchange(exchange_id, {'exchange[place_id]': place.place_id});

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


streetview = function(exchange) {

    var size        = String(photoWidth()) + 'x' + String(photoHeight());
    var location    = String(exchange.latitude) + ',' + String(exchange.longitude);
    var src         = 'https://maps.googleapis.com/maps/api/streetview?size=' + size + '&location=' + location + '&key=' + google_api_key;
    var html        = '<img src=' + src + '>';

    $('.photo').html(html);

};

photo = function(photo) {
    var width       = photoWidth();
    var height      = photoHeight();
    var src         = photo.getUrl({'maxWidth': width, 'maxHeight': height});
    var html        = '<img src=' + src + '>';

    $('.photo').html(html).find('img').css('width', '100%').css('height', height);
};

photoWidth = function() {
    if (photo_width) return photo_width;

    photo_width = Math.round($('.active.pane').outerWidth());
    return photo_width;
};

photoHeight = function() {
    if (photo_height) return photo_height;
    var ar = 2;
    if (photo_width) {
        photo_height = Math.round(photo_width / ar);
    } else {
        photo_height = Math.round(photoWidth() / ar);
    }
    return photo_height;
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
        alert('Thank you for your input!');
        updateExchange(exchange_id, {'exchange[rating]': value});
    });


});

