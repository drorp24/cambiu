function exchangeService($resource, serverUrl, apiUrl) {
  return $resource(serverUrl + apiUrl + '/exchanges/:id', 
    {
      callback: "JSON_CALLBACK"
    },
    {
      query: {
        method: 'JSONP',
        isArray: true
      }
    });
}
