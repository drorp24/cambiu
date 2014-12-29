function mainController($scope, $state) {
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

  $scope.exchanges = [
    {
      id: 0,
      name: 'London Exchange',
      location: {
        latitude: 51.5060,
        longitude: 0.1260
      },
      options: {
        title: 'London Exchange'
      }
    },
    {
      id: 1,
      name: 'Yorkshare Exchange',
      location: {
        latitude: 51.5032,
        longitude: 0.1232
      },
      options: {
        title: 'Yorkshare Exchange'
      }
    }
  ];
}
