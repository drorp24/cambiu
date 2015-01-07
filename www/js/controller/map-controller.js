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
    $scope.map = maps;

    function showMarkers() {
      var bounds = map.getBounds();
      console.log(bounds);
    }

    $scope.map.event.addListener($scope.map, 'idle', showMarkers);
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

  $scope.markerClick = function(marker) {
    var exchangeId = marker.model.id;

    $scope.selectSelectedExchange(exchangeId);
  };

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
    });
  }

  scrollToCurrentLocation().then(function(position) {
    setAdjacentMarkers(position);
    setPositionWatch();
  });
}
