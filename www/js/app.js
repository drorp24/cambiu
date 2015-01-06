var dependencies = [
  'ionic',
  'ui.router',
  'uiGmapgoogle-maps',
  'ngAutocomplete',
  'ngResource',
  'ngMockE2E',
  'ngFlag',
  'ngCordova'
];

angular.module('currency-net-mvp', dependencies)

.controller({
  mainController: ['$scope', '$state', 'exchangeService', 'exchanges', mainController],
  mapController: ['$scope', 'uiGmapGoogleMapApi', '$cordovaGeolocation', '$q', mapController],
  listController: ['$scope', listController],
  menuController: ['$scope', '$ionicHistory', menuController],
  exchangeController: ['$scope', '$ionicHistory', exchangeController]
})

.directive({
  locationSearch: locationSearch,
  selectExchange: selectExchange,
  userRatings: userRatings
})

.factory({
  exchangeService: exchangeService
})

.config(['$stateProvider', '$urlRouterProvider', 'uiGmapGoogleMapApiProvider', '$compileProvider',
  function($stateProvider, $urlRouterProvider, uiGmapGoogleMapApiProvider, $compileProvider) {
    $compileProvider.debugInfoEnabled(false);

    $urlRouterProvider.otherwise('/map');

    $stateProvider
      .state('home', {
        abstract: true,
        url: '/',
        templateUrl: 'template/home.html',
        controller: 'mainController as main',
        resolve: {
          exchanges: function(exchangeService, $cordovaGeolocation, $httpBackend, $q) {
            var deferred = $q.defer();

            function getCurrentPosition() {
              $cordovaGeolocation.getCurrentPosition({
                  timeout: 1000,
                  enableHighAccuracy: false
                }).then(function(position) {
                  exchangeService.query({
                    location: {
                      latitude: position.coords.latitude,
                      longitude: position.coords.longitude
                    },
                    'sort-by': 'distance'
                  }).$promise.then(function(exchanges) {
                    deferred.resolve(exchanges);
                  });
              }, function(err) {
                // error
                getCurrentPosition();
              });

            }

            getCurrentPosition();

            return deferred.promise;
          }
        }
      })
        .state('home.map', {
          url: 'map',
          controller: 'mapController as map',
          templateUrl: 'template/map.html'
        })
        .state('home.list', {
          url: 'list',
          controller: 'listController as list',
          templateUrl: 'template/list.html'
        })
      .state('menu', {
        url: '/menu',
        templateUrl: 'template/menu.html',
        controller: 'menuController as menu'
      })
      .state('exchange', {
        url: '/exchange',
        controller: 'exchangeController as exchange',
        templateUrl: 'template/exchange.html'
      });

      uiGmapGoogleMapApiProvider.configure({
          //    key: 'your api key',
          v: '3.17',
          libraries: 'places,visualization'
      });
  }
])

.run(function($ionicPlatform, $httpBackend) {
  $httpBackend.whenGET(/template\/.*/).passThrough();
  $httpBackend.whenGET(/\/exchange(\?|\&)([^=]+)\=([^&]+)/).respond(backend.mock.exchanges['/exchange']);
  $httpBackend.whenGET('/exchange/0').respond(backend.mock.exchanges['/exchange/0']);
  $httpBackend.whenGET('/exchange/1').respond(backend.mock.exchanges['/exchange/1']);

  //window.screen.lockOrientation('portrait');

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
