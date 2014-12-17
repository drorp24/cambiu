var dependencies = [
  'ionic',
  'ui.router',
  'google-maps',
  'ngAutocomplete'
];

angular.module('currency-net-mvp', dependencies)

.controller({
  mainController: ['$scope', '$state', mainController],
  mapController: ['$scope', '$state', mapController],
  listController: ['$scope', listController],
  menuController: ['$scope', '$ionicHistory',  menuController]
})

.directive({
  locationSearch: locationSearch
})

.config(['$stateProvider', '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/map');

    $stateProvider
      .state('home', {
        url: '/',
        abstract: true,
        templateUrl: '/template/home.html',
        controller: 'mainController as main'
      })
        .state('home.map', {
          url: 'map',
          controller: 'mapController as map',
          templateUrl: '/template/map.html'
        })
        .state('home.list', {
          url: 'list',
          controller: 'listController as list',
          templateUrl: '/template/list.html'
        })
      .state('menu', {
        url: 'menu',
        controller: 'menuController as menu',
        templateUrl: '/template/menu.html'
      });
  }
])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
});
