function mapController($scope, $ionicHistory) {
  angular.extend($scope, {
    options: {
      zoomControl: false,
      streetViewControl: false,
      mapTypeControl: false,
      panControl: false
    }
  });

  $scope.map = { };
}
