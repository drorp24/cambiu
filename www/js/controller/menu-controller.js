function menuController($scope, $ionicHistory) {
  this.goBack = function() {
    // console.log('22222222222222', $ionicHistory.viewHistory().backView);
    // if($ionicHistory.backView()) {
      $ionicHistory.goBack();
    // } else {
    //
    // }
  };
}
