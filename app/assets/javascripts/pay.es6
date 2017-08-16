$('[data-action=paymentFlow]').click(function(e) {

    e.preventDefault();

    // Create user
    if (!userCheckValidity()) return;

    orderUpdateUserDelivery()
        .then(fetchPaymentUrl)
        .then((data) => window.location = data.url)
        .catch((error) => {console.log('Not redirecting to payment page due to above error')})

});

fetchPaymentUrl = function(order) {

    console.log('fetchPaymentUrl. The order object received:', order);

    return new Promise(function(resolve, reject) {

        function fetchData() {
            return fetch(`/payments/url?locale=${locale}`, {
                method: 'post',
                headers: new Headers({
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }),
                body: JSON.stringify(order)
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

