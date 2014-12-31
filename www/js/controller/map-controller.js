function mapController($scope, uiGmapGoogleMapApi, $cordovaGeolocation) {
  $scope.scrollToCurrentLocation = function () {
    var posOptions = {timeout: 10000, enableHighAccuracy: false};

    $cordovaGeolocation.getCurrentPosition(posOptions).then(function(position) {
      $scope.center = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
    }, function(err) {
      // error
    });
  };

  angular.extend($scope, {
    zoom: 14,
    options: {
      zoomControl: false,
      streetViewControl: false,
      mapTypeControl: false,
      panControl: false
    }
  });

  $scope.map = { };

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

  $scope.scrollToCurrentLocation();
}
