function mainController($scope, $state) {
  this.toggleMapList = function() {
    if($state.$current.name === 'home.map') {
      $state.go('home.list');
    } else {
      $state.go('home.map');
    }
  };

  $scope.details = '';
}
