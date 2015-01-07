function mainController($scope, $state, exchangeService, $rootScope, exchanges) {
  this.toggleMapList = function() {
    $scope.isMap = $state.$current.name === 'home.map';

    if($scope.isMap) {
      $state.go('home.list');
    } else {
      $state.go('home.map');
    }
  };

  $scope.exchanges = exchanges;

  $scope.benchmarkExchange = {
    rate: 0.64
  };

  $rootScope.setSelectedExchange = function(exchangeId) {
    exchangeService.get({id: exchangeId}).$promise.then(function (exchange) {
      $rootScope.currentExchange = exchange;
    });
  };

  $scope.conversion = {
    inverse: false,
    left: {
      flag: 'us',
      value: 1.00
    },
    right: {
      flag: 'gb',
      value: $scope.benchmarkExchange.rate
    }
  };

  $scope.self = {
    id: 'self',
    iconUrl: 'http://www.google.es/mapmaker/mapfiles/sv_icon.png'
  };

  $scope.switchSides = function () {
    var temp = $scope.conversion.left;

    $scope.conversion.left = $scope.conversion.right;
    $scope.conversion.right = temp;

    $scope.conversion.left.value = 1;
    $scope.conversion.right.value = $scope.conversion.inverse ? 1/$scope.benchmarkExchange.rate : $scope.benchmarkExchange.rate;
    $scope.conversion.inverse = !$scope.conversion.inverse;
  };
}
