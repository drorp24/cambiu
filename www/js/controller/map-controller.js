function mapController($scope, uiGmapGoogleMapApi) {
  angular.extend($scope, {
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
