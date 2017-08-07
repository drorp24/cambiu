$('[data-action=paymentFlow]').click(function(e) {

    e.preventDefault();

    // Create user
    if (!userCheckValidity()) return;

    // Generate xml and send it to Changeme (how? ask Saar for the JS code)

    // Obtain payment page url
    fetchPaymentUrl()
        .then((data) => window.location = data.url)
        .catch((error) => console.log('Not redirecting due to this error'))


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
            if (data.success) {
                resolve(data)
            } else {
                let cg_error = `${data.message} - ${data.additionInfo}`;
                console.error(cg_error);
                snack(`Payment server says ${data.message} - call for assistance`, {klass: 'oops', timeout: 7000});
                reject(cg_error)
            }
        }

        fetchData()
            .then(checkStatus)
            .then(parseJson)
            .then(returnResults)
            .catch(tell);
    })

};

