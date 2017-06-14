fetchPlace = function(exchange) {

    return new Promise(function(resolve, reject) {


        function getPlaceId() {

            console.log('exchange ' + exchange.id + ' - getPlaceId');

            return new Promise(function(resolve, reject) {

                if (exchange.place.id) {
                    resolve(exchange.place.id)
                }

                if (!exchange.name || !exchange.latitude || !exchange.longitude) {
                    warn('exchange ' + exchange.id + ' - exchange name, lat or lng missing');
                    resolve(null);
                }

                var request = {
                    location: new google.maps.LatLng(exchange.latitude, exchange.longitude),
                    name: exchange.name,
                    radius: 100/*,
                     rankBy: google.maps.places.RankBy.DISTANCE*/ // Google doesn't allow to rank by distance if radius is specified and without radius specified it returns zero results
                };

                var service = new google.maps.places.PlacesService(map);

                service.nearbySearch(
                    request,
                    function(results, status) {

                        exchange.place.status.nearbySearch = status;

                        // TODO: Only consider it a match if GP name matches the cambiu name (Google doesnt check it!)
                        if (status == google.maps.places.PlacesServiceStatus.OK) {
                            if (results.length >= 1) {
                                resolve(results[0].place_id);
                            } else {
                                warn('exchange ' + exchange.id + ' - no place id found');
                                resolve(null);
                            }
                        } else {
                            warn('exchange ' + exchange.id + ' - nearbySearch error: ' + status);
                            resolve(null)
                        }

                    }
                )

            })
        }


         getPlaceDetails = function(place_id) {

             console.log('exchange ' + exchange.id + ' - getPlaceDetails');

               // when getPlaceDetails returns a promise, its resolve does not make fetchPlace resolve too (adopt its state)
               // as a result, populateExchanges is not invoked
               // return new Promise(function (resolve, reject) {

                 if (!place_id) { //Needed since the promises are all artificially resolved(). Had the former promise rejected, this one wouldn't be called.
                     resolve(exchange);
                     return;
                 }

                 service = new google.maps.places.PlacesService(map);

                 service.getDetails(
                     {placeId: place_id},
                     function (place, status) {

                         console.log('exchange ' + exchange.id + ' - getDetailsCallback');

                         exchange.place.status.getDetails = status;
                         if (status != google.maps.places.PlacesServiceStatus.OK) {
                             warn('exchange ' + exchange.id + ' - getDetails error: ' + status);
                             resolve(exchange);
                         }

                         exchange.place.distance =       distance(new google.maps.LatLng(exchange.latitude, exchange.longitude),place.geometry.location);
                         if (exchange.place.distance < 150) {
                             exchange.place.name =          place.name;
                             exchange.place.address =       place.formatted_address;
                             exchange.place.photo =         place.photos && place.photos.length > 0 && place.photos[0];
                             exchange.place.reviews =       place.reviews;
                             exchange.place.rating =        place.rating;
                             exchange.place.opening_hours = place.opening_hours;
                             if (!exchange.place.id)     updateExchange(exchange.id, {'exchange[place_id]': place.place_id});
                             resolve(exchange);
                             console.log('exchange ' + exchange.id + ' - PlacesService.getDetails returned a place close enough to the exchange');
                         } else {
                             warn('exchange ' + exchange.id + ' - place too far: ' + exchange.place.distance);
                             resolve(exchange)
                         }

                     });

 //            });

         };

        getPlaceId().then(getPlaceDetails)
        .catch(function(error) {console.warn(new Error(error))});

    })

};