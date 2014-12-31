function mapController($scope, uiGmapGoogleMapApi, $cordovaGeolocation) {
  var posOptions = {timeout: 10000, enableHighAccuracy: false};
  $cordovaGeolocation.getCurrentPosition(posOptions).then(function(position) {
    $scope.center = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
  }, function(err) {
    // error
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

  $scope.map = { };


  uiGmapGoogleMapApi.then(function(maps) {

  });
}
