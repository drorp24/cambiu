apigClient = apigClientFactory.newClient();

apiParams = {
    //This is where any header, path, or querystring request params go. The key is the parameter named as defined in the API
    'country': 'UK',
    'city': 'London'
};
body = {
    //This is where you define the body of the request
    'chain': '`Debenhams',
    'currency': 'ZZZ',
    'buy': 99
};
additionalParams = {
    //If there are any unmodeled query parameters or headers that need to be sent with the request you can add them here
    headers: {
        param0: '',
        param1: ''
    },
    queryParams: {
        param0: '',
        param1: ''
    }
};

exchangesGet = function() {
    apigClient.exchangesGet(apiParams, '', '')
        .then(function(result){
            console.log('exchangesGet success', result)
        }).catch( function(result){
        console.log('failure', result)
    });
};

ratesGet = function() {
    apigClient.ratesGet(apiParams, '', '')
        .then(function(result){
            console.log('ratesGet success', result)
        }).catch( function(result){
        console.log('failure', result)
    });
};

ratesPost = function() {
    apigClient.ratesPost(apiParams, body, '')
        .then(function(result){
            console.log('ratesPost success', result)
        }).catch( function(result){
        console.log('failure', result)
    });
};

//Using AWS IAM for authorization
//To initialize the SDK with AWS Credentials use the code below. Note, if you use credentials all requests to the API will be signed. This means you will have to set the appropiate CORS accept-* headers for each request.


sidekixCClient = apigClientFactory.newClient({
    accessKey: 'AKIAJWKBZ7VJ6MDB6SHA',
    secretKey: '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',
    region: 'us-west-2' // OPTIONAL: The region where the API is deployed, by default this parameter is set to us-east-1
});

ratefeedCClient = apigClientFactory.newClient({
    accessKey: 'AKIAIY6K5IKEXG7EGC6A',
    secretKey: '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',
    region: 'us-west-2' // OPTIONAL: The region where the API is deployed, by default this parameter is set to us-east-1
});

//Using API Keys
//To use an API Key with the client SDK you can pass the key as a parameter to the Factory object. Note, if you use an apiKey it will be attached as the header 'x-api-key' to all requests to the API will be signed. This means you will have to set the appropiate CORS accept-* headers for each request.


sidekixAClient = apigClientFactory.newClient({
    apiKey: 'YUFJqqGvWW51noXnbkeEn3AiTMVKJxxbagzKY8mZ'
});

ratefeedAClient = apigClientFactory.newClient({
    apiKey: 'IlHSIvEAHRawnGAJPVhVcl04C1bJNap7fUfnPxwb'
});

sidekixClient = apigClientFactory.newClient({
    accessKey: 'AKIAJWKBZ7VJ6MDB6SHA',
    secretKey: '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',
    region: 'us-west-2',
    apiKey: 'YUFJqqGvWW51noXnbkeEn3AiTMVKJxxbagzKY8mZ'
});

