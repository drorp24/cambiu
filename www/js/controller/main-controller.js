function mainController($scope, $state, exchanges) {
  this.toggleMapList = function() {
    if($state.$current.name === 'home.map') {
      $state.go('home.list');
    } else {
      $state.go('home.map');
    }
  };

  $scope.center = {
    latitude: 51.5072,
    longitude: 0.1275,
  };
  $scope.zoom = 14;

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
  });

  $scope.exchanges = exchanges;
}
