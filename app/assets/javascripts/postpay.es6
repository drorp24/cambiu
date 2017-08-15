// For all the 'fetch's that don't reject promises on 4xx/5xx return statuses
checkStatus = function(response) {
    if (response.status >= 200 && response.status < 300) {
        return response
    } else {
        var error = new Error(response.statusText);
        error.response = response;
        throw error
    }
};

// For all the 'fetch's that use json
parseJson = function(response) {
    return response.json()
};

$(document).ready(() => {

    let order_id = location.pathname.split('/')[2];
    let $scope = $('.orderPane').css('display', 'block');

    orderGet(order_id).then((order) => {
        $('body').addClass(`${order.payment_method} ${order.service_type}`);
        populateOrder($scope, order)
    });
});