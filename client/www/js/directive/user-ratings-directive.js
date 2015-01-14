function userRatings() {
  return {
    template: '<span>{{ratings}}</span><span class="ion-star"></span>',
    link: function(scope, element, attrs) {
      console.log(attrs);
      scope.watch()
      scope.ratings = parseFloat(attrs.ratings);
    }
  };
}
