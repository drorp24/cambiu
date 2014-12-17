function mapController($scope, $ionicHistory) {
  angular.extend($scope, {
    center: {
      latitude: 51.5072,
      longitude: 0.1275,
    },
    zoom:14,
    options: {
      zoomControl: false,
      streetViewControl: false,
      mapTypeControl: false,
      panControl: true
    }
  });

  $scope.map = { };
}
