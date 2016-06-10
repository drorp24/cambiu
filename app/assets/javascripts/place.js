place_populate = function(exchange_id) {

    console.log('place_populate');

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
        getPlaceDetails(place_id)
    } else {
        getPlace(exchange_id)
    }

};

getPlace = function(exchange_id) {

    console.log('getPlace for ' + String(exchange_id));

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
            getPlaceDetails(place_id, 0);
            updateExchange(exchange_id, place_id);

            if (results.length > 1) {
                console.log('More than one place id found');
                for(var i=1; i < results.length; i++) {
                    var place_id = results[i].place_id;
                    getPlaceDetails(place_id, i);
                }
            }

         } else {
            console.log('No place id found')
         }

    } else {
        console.log('Google Places API textSearch error: ' + status);
    }

};


getPlaceDetails = function(place_id, i) {

    console.log('getPlaceDetails');

    service = new google.maps.places.PlacesService(map);
    service.getDetails(
        {placeId: place_id},
        function(place, status) {getDetailsCallback(place, status, i)}
    );
};


getDetailsCallback = function(place, status, i) {

    if (status == google.maps.places.PlacesServiceStatus.OK) {

        var exchange_latlng = new google.maps.LatLng(sessionStorage.exchange_latitude, sessionStorage.exchange_longitude);
        var place_latlng = place.geometry.location;
        var distance = Math.round(google.maps.geometry.spherical.computeDistanceBetween(exchange_latlng, place_latlng));
        if (i == 0 && distance > 100) {alert('distance > 100m')}

        if (i == 0) {console.log('This is the place selected')}
        console.log('Distance from request: ' + String(distance) + ' Name: ' + place.name + ' Address: ' + place.formatted_address + ' Phone: ' + place.formatted_phone_number);
        console.log(place);

        /// update here: opening hours, phone, website, rating, reviews, google page ("more")


        if (i == 0 && place.photos && place.photos.length > 0) {
            console.log('replacing streetview with photo');
            photo(place.photos[0]);
        }

    } else {
        console.log('Google Places API getDetails error: ' + status);
    }

};


updateExchange = function(exchange_id, place_id) {
    $.ajax({
        type: 'PUT',
        url: '/exchanges/' + exchange_id,
        data: {
            'exchange[place_id]': place_id
        },
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

