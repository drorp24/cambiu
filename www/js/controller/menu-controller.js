function menuController($scope, $ionicHistory) {
  this.goBack = function() {
      $ionicHistory.goBack();
  };
}
