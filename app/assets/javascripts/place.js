function getPlace(exchange_id) {

    var exchange_name    = value_of('exchange_name');
    var exchange_address = value_of('exchange_address');
    var exchange_lat     = value_of('exchange_latitude');
    var exchange_lng     = value_of('exchange_longitude');

    if (!exchange_name || !exchange_address || !exchange_lat || !exchange_lng) {
        console.log('getPlace: exchange name, lat and/or lng missing from ss for exchange ' + String(exchange_id));
        return
    }

    var request = {
        location: new google.maps.LatLng(exchange_lat, exchange_lng),
        radius: '2000',
        query: /*exchange_name + ' ' + exchange_address*/ 'No 1 Currency'
    };

    var service = new google.maps.places.PlacesService(map);
    service.textSearch(request, textSearchCallback);
}

function textSearchCallback(results, status) {
    var placeId;
    if (status == google.maps.places.PlacesServiceStatus.OK) {
        if (results.length >= 1) {

            service = new google.maps.places.PlacesService(map);
            for (var i=0; i  <  results.length; i++){
                placeId = results[i].place_id;
                service.getDetails({placeId: placeId}, getDetailsCallback);
            }


            /// SAVE IT IN THE DATABASE
            /// dont call this at all if in the database

            if (results.length > 1) {console.log('More than one place id found')}

         } else {
            console.log('No place id found')
         }

    } else {
        console.log('Google Places API textSearch error: ' + status);
    }
}

function getDetailsCallback(place, status) {

    if (status == google.maps.places.PlacesServiceStatus.OK) {

        console.log('Place found. Here it is:');
        console.log(place);

        /// update here: opening hours, phone, websaite, rating, reviews, google page ("more")


        if (place.photos && place.photos.length > 0) {
            console.log('Place has a photo:');
            console.log(place.photos[0].getUrl())


        }

    } else {
        console.log('Google Places API getDetails error: ' + status);
    }

}
