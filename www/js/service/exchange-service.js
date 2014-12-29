function exchangeService() {
  return {
    query: function() {
      return [
        {
          id: 0,
          location: {
            latitude: 51.5060,
            longitude: 0.1260
          },
          templateUrl: '/template/map-info-window.html',
          details: {
            title: 'London Exchange'
          }
        },
        {
          id: 1,
          location: {
            latitude: 51.5032,
            longitude: 0.1232
          },
          templateUrl: '/template/map-info-window.html',
          details: {
            title: 'Yorkshare Exchange'
          }
        }
      ];
    },
    get: function() {
      return {
        id: 0,
        details: {
          title: 'London Exchange',
          rates: {
            USDGBP: 1.5625,
            ILSGBP: 6.11
          }
        }
      };
    }
  };
  //return $resrouce('/exchange');
}
