fetchPlace = function(exchange) {

    if (exchange.place.id) {
        getPlaceDetails(exchange.place.id, exchange)
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

    service.nearbySearch(
        request,
        function(results, status) {nearbySearchCallback(results, status, exchange)}
    );
};


nearbySearchCallback = function(results, status, exchange) {

    exchange.place.status.nearbySearch = status;

    if (status == google.maps.places.PlacesServiceStatus.OK) {
        if (results.length >= 1) {

            var place_id = results[0].place_id;
            getPlaceDetails(place_id, exchange);

            if (results.length > 1) {
            }

         } else {
            console.log('No place id found')
         }

    } else {
        console.log('exchange ' + exchange.id + ' - nearbySearch error: ' + status);
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

    exchange.place.status.getDetails = status;
    if (status != google.maps.places.PlacesServiceStatus.OK) {
        console.log('exchange ' + exchange.id + ' - getDetails error: ' + status);
        return
    }

    exchange.place.name =       place.name;
    exchange.place.address =    place.formatted_address;
    exchange.place.distance =   distance(new google.maps.LatLng(exchange.latitude, exchange.longitude),place.geometry.location);
    exchange.place.used =       exchange.place.distance < 150;

    if (!exchange.place.used)   return;

    exchange.place.photo =      place.photos && place.photos.length > 0 && place.photos[0];
    exchange.place.reviews =    place.reviews;
    exchange.place.rating =     place.rating;

    if (!exchange.place.id)     updateExchange(exchange.id, {'exchange[place_id]': place.place_id});

};