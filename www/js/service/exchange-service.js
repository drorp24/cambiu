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
          details: {
            title: 'Yorkshare Exchange'
          }
        }
      ];
    }
  };
  //return $resrouce('/exchange');
}
