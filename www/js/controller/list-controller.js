function listController($scope) {
  $scope.exchanges = [
    {
      name: 'London Exchange',
      location: {
        lon: 34,
        lat: 23
      }
    },
    {
      name: 'Yorkshare Exchange',
      location: {
        lon: 14,
        lat: 53
      }
    }
  ];
}
