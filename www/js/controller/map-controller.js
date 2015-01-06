function mapController($scope, uiGmapGoogleMapApi, $cordovaGeolocation, $q) {
  var posOptions = {
        timeout: 10000,
        enableHighAccuracy: false
      },
      watchOptions = {
        frequency : 3000,
        timeout : 3000,
        enableHighAccuracy: false // may cause errors if true
      };

  $scope.scrollToCurrentLocation = function () {
    return $cordovaGeolocation.getCurrentPosition(posOptions).then(function(position) {
      $scope.center = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };
      // setPositionWatch();

      return position.coords;
    }, function(err) {
      // error
    });
  };

  uiGmapGoogleMapApi.then(function(maps) {
    $scope.map = maps;

    function showMarkers() {
      var bounds = map.getBounds();
      console.log(bounds);
    }

    $scope.map.event.addListener($scope.map, 'idle', showMarkers);
  });

  angular.extend($scope, {
    zoom: 14,
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
    $scope.zoom = 14;
    $scope.hideSearchBar();
  });

  $scope.hideSearchBar = function () {
    $scope.searchLocation = false;
    if($scope.zoom < 14) {
      $scope.zoom = 14;
    }
  };

  this.scrollToLocation = function () {
    $scope.scrollToCurrentLocation();
    $scope.hideSearchBar();
  };

  $scope.scrollToCurrentLocation().then(function(position) {
    setAdjacentMarkers(position);
  });

  $scope.markerClick = function(marker) {
    var exchangeId = marker.model.id;

    $scope.selectSelectedExchange(exchangeId)
  };

  function setAdjacentMarkers(position) {
    $scope.exchanges.$promise.then(function(exchanges) {
      angular.forEach($scope.exchanges, function(exchange) {
        exchange.options = {disableAutoPan: true};
        exchange.show = true;
        exchange.location = {
          latitude: position.latitude + Math.random() * 0.011,
          longitude: position.longitude + Math.random() * 0.011,
        };
      });
    });
  }

  function setPositionWatch() {
    $cordovaGeolocation.watchPosition(watchOptions).then(null,
      function(err) {
        // error
      },
      function(position) {
        console.log('location tick');
        $scope.center = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
    });
  }
}
