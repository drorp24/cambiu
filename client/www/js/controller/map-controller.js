function mapController($scope, uiGmapGoogleMapApi, $cordovaGeolocation, $q) {
  var defaultZoom = 16;

  function getCurrentLocation() {
    return $cordovaGeolocation.getCurrentPosition({
      maximumAge: 5000,
      timeout: 10000,
      enableHighAccuracy: false
    });
  }

  function scrollToCurrentLocation() {
    return getCurrentLocation().then(function(position) {
      $scope.center = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };

      return position.coords;
    }, function(err) {
      // error
    });
  }

  function setPositionWatch() {
    var watchOptions = {
          maximumAge: 5000,
          timeout : 3000,
          enableHighAccuracy: false // may cause errors if true
        };

    $cordovaGeolocation.watchPosition(watchOptions).then(null,
      function(err) {
        // error
      },
      function(position) {
        $scope.self.position = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
    });
  }

  function hideSearchBar() {
    $scope.searchLocation = false;
    if($scope.zoom < defaultZoom) {
      $scope.zoom = defaultZoom;
    }
  }

  uiGmapGoogleMapApi.then(function(maps) {
    $scope.maps = maps;
  });

  angular.extend($scope, {
    zoom: defaultZoom,
    options: {
      zoomControl: false,
      streetViewControl: false,
      mapTypeControl: false,
      panControl: false
    }
  });

  $scope.$watch('details', function(result) {
    if(!result) {
      return;
    }

    var location = result.geometry.location;

    $scope.center = {
      latitude: location.k,
      longitude: location.C
    };
    $scope.zoom = defaultZoom;
    hideSearchBar();
  });

  $scope.scrollToLocation = function () {
    scrollToCurrentLocation();
    hideSearchBar();
  };

  $scope.directionsPath = [];

  function setAdjacentMarkers(position) {
    $scope.self.position = position;

    $scope.exchanges.$promise.then(function(exchanges) {
      angular.forEach(exchanges, function(exchange) {
        var amplitude = 0.003;

        exchange.options = {
          disableAutoPan: true,
          visible: false
        };
        exchange.show = true;
        exchange.fit = false;
        exchange.latitude = null;
        exchange.longitude = null;
        exchange.location = {
          latitude: position.latitude + Math.random() * amplitude,
          longitude: position.longitude + Math.random() * amplitude
        }
      });

      // var directionsService = new $scope.maps.DirectionsService(),
      //     selfPosition = $scope.self.position,
      //     firstExchange = $scope.exchanges[0],
      //     request = {
      //       origin: new $scope.maps.LatLng(
      //         selfPosition.latitude,
      //         selfPosition.longitude
      //       ),
      //       destination: new $scope.maps.LatLng(
      //         firstExchange.location.latitude,
      //         firstExchange.location.longitude
      //       ),
      //       travelMode: $scope.maps.TravelMode.WALKING,
      //       optimizeWaypoints: true
      //     };

      // directionsService.route(request, function(response, status) {
      //   var route0 = response.routes[0],
      //       bounds = route0.bounds,
      //       northEast = bounds.getNorthEast(),
      //       southWest = bounds.getSouthWest(),
      //       center = bounds.getCenter();

      //   $scope.directionsPath = route0.overview_path;
      //   $scope.mapBounds = {
      //     northeast: {
      //       latitude: northEast.lat(),
      //       longitude: northEast.lng()
      //     },
      //     southwest: {
      //       latitude: southWest.lat(),
      //       longitude: southWest.lng()
      //     }
      //   };
      //   $scope.center = {
      //     latitude: center.lat(),
      //     longitude: center.lng()
      //   };
      // });
    });
  }

  scrollToCurrentLocation().then(function(position) {
    setAdjacentMarkers(position);
    // setPositionWatch();
  });
}
