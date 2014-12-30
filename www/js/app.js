var dependencies = [
  'ionic',
  'ui.router',
  'uiGmapgoogle-maps',
  'ngAutocomplete',
  'ngResource',
  'ngMockE2E',
  'ngFlag'
];

angular.module('currency-net-mvp', dependencies)

.controller({
  mainController: ['$scope', '$state', 'exchanges', mainController],
  mapController: ['$scope', '$state', mapController],
  listController: ['$scope', listController],
  menuController: ['$scope', '$ionicHistory',  menuController]
})

.directive({
  locationSearch: locationSearch
})

.factory({
  exchange: exchangeService
})

.config(['$stateProvider', '$urlRouterProvider', '$locationProvider',
  function($stateProvider, $urlRouterProvider, $locationProvider) {
    $urlRouterProvider.otherwise('/map');

    $stateProvider
      .state('home', {
        url: '/',
        abstract: true,
        templateUrl: '/template/home.html',
        controller: 'mainController as main',
        resolve: {
          exchanges: function(exchange, $httpBackend) {
            $httpBackend.whenGET('/exchange').respond(backend.mock.exchanges['/exchange']);
            return exchange.query();
          }
        }
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

    //$locationProvider.html5Mode(true).hashPrefix('!');
  }
])

.run(function($ionicPlatform, $httpBackend) {
  $httpBackend.whenGET(/template\/.*/).passThrough();

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
