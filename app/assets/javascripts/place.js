fetchPlace = function(exchange) {

    return new Promise(function(resolve, reject) {

        function getPlaceId() {

            return new Promise(function(resolve, reject) {

                if (exchange.place.id) {
                    resolve(exchange.place.id)
                }

                if (!exchange.name || !exchange.latitude || !exchange.longitude) {
                    reject('exchange ' + exchange.id + ' - exchange name, lat or lng missing');
                    return
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
                                reject('exchange ' + exchange.id + ' - no place id found');
                                return
                            }
                        } else {
                            reject('exchange ' + exchange.id + ' - nearbySearch error: ' + status);
                            return
                        }

                    }
                )

            })
        }


         getPlaceDetails = function(place_id) {

               // when getPlaceDetails returns a promise, its resolve does not make fetchPlace resolve too (adopt its state)
               // as a result, populateExchanges is not invoked
               // return new Promise(function (resolve, reject) {

                 service = new google.maps.places.PlacesService(map);

                 service.getDetails(
                     {placeId: place_id},
                     function (place, status) {

                         console.log('exchange ' + exchange.id + ' - getDetailsCallback');

                         exchange.place.status.getDetails = status;
                         if (status != google.maps.places.PlacesServiceStatus.OK) {
                             reject('exchange ' + exchange.id + ' - getDetails error: ' + status);
                             return
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
                             console.log('exchange ' + exchange.id + ' - is resolved!!');
                         } else {
                             console.log('exchange ' + exchange.id + ' - place too far: ' + exchange.place.distance);
                             reject('exchange ' + exchange.id + ' - place too far: ' + exchange.place.distance);
                             return
                         }

                     });

 //            });

         };

        getPlaceId().then(getPlaceDetails)
        .catch(function(error) {console.warn(new Error(error))});

    })

};