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

    function showMarkers() {
      var bounds = $scope.maps.getBounds();
      console.log(bounds);
    }

    $scope.maps.event.addListener($scope.maps, 'idle', showMarkers);
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
      angular.forEach($scope.exchanges, function(exchange) {
        var amplitude = 0.003;

        exchange.options = {
          disableAutoPan: true,
          visible: false
        };
        exchange.show = true;
        exchange.location = {
          latitude: position.latitude + Math.random() * amplitude,
          longitude: position.longitude + Math.random() * amplitude,
        };
      });

      var directionsService = new $scope.maps.DirectionsService(),
          selfPosition = $scope.self.position,
          firstExchangePosition = $scope.exchanges[0].location,
          request = {
            origin: new $scope.maps.LatLng(
              selfPosition.latitude,
              selfPosition.longitude
            ),
            destination: new $scope.maps.LatLng(
              firstExchangePosition.latitude,
              firstExchangePosition.longitude
            ),
            travelMode: $scope.maps.TravelMode.WALKING,
            optimizeWaypoints: true
          };

      directionsService.route(request, function(response, status) {
        $scope.directionsPath = response.routes[0].overview_path;
        console.log('4444444444', response.routes[0].overview_path);
      });
    });
  }

  scrollToCurrentLocation().then(function(position) {
    setAdjacentMarkers(position);
    setPositionWatch();
  });
}
