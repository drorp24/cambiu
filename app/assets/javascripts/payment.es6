$('[data-action=paymentFlow]').click(function(e) {

    e.preventDefault();

    // Create user
    let validity = userCheckValidity();
    if (!validity) return;

    // Generate xml and send it to Changeme (how? ask Saar for the JS code)

    // Obtain payment page url
    fetchPaymentUrl().then((url) => window.location = url)

});

fetchPaymentUrl = function() {

    console.log('fetchPaymentUrl...');

    return new Promise(function(resolve, reject) {

        function fetchData() {
            return fetch('/payment/url?', {
                method: 'post'/*,
                body: new URLSearchParams($( "#search_form input, #search_form select" ).serialize())*/   // pass user information (name etc) to not key again??
            })
        }

        function tell(error) {
            console.log('catch during fetchPaymentUrl!');
            reject(error)
        }

        function returnResults(data) {
            resolve(data.url)
        }

        fetchData()
            .then(checkStatus)
            .then(parseJson)
            .then(returnResults)
            .catch(tell);
    })

};

