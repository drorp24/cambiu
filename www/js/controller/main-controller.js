function mainController($scope, $state, exchanges) {
  this.toggleMapList = function() {
    $scope.isMap = $state.$current.name === 'home.map';

    if($scope.isMap) {
      $state.go('home.list');
    } else {
      $state.go('home.map');
    }
  };

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

  $scope.currentExchange = {
    rate: 0.64
  };

  $scope.conversion = {
    inverse: false,
    left: {
      flag: 'us',
      value: 1.00
    },
    right: {
      flag: 'gb',
      value: $scope.currentExchange.rate
    }
  };

  $scope.switchSides = function () {
    var temp = $scope.conversion.left;

    $scope.conversion.left = $scope.conversion.right;
    $scope.conversion.right = temp;

    $scope.conversion.left.value = 1;
    $scope.conversion.right.value = $scope.conversion.inverse ? 1/$scope.currentExchange.rate : $scope.currentExchange.rate;
    $scope.conversion.inverse = !$scope.conversion.inverse;
  };
}
