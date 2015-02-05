function exchangeService($resource, serverUrl) {
  return $resource(serverUrl + '/exchanges/:id', 
    {
      callback: "JSON_CALLBACK"
    },
    {
      query: {
        method: 'JSONP',
        isArray: true
      },
      get: {
        method: 'JSONP',
        isArray: false
      }
    });
}
