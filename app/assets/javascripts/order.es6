//
// Order lifecycle
//


$('body').on('click tap','[data-action=order]', (function (e)  {  // Warning: not to use arrow function: it changes $this
    let $this = $(this);
    order($this.closest('[data-pane]'), currentExchange());
}));


order = function($scope, exchange) {

    if (!noOtherOrderExists()) return;

    fetch('/orders', {
        method: 'POST',
        headers: new Headers({
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify(
            {
                order: {
                    exchange_id:        exchange.id,
                    search_id:          searchId, // TODO: add the order form,
                    pay_amount:         $('form.selection [data-field=pay_amount]').val(),
                    pay_currency:       $('form.selection [data-field=pay_currency]').val(),
                    buy_amount:         $('form.selection [data-field=buy_amount]').val(),
                    buy_currency:       $('form.selection [data-field=buy_currency]').val(),
                    service_type:       value_of('service_type'),
                    payment_method:     value_of('payment_method')
                }
            }
        )
    })
        .then(checkStatus)
        .then(response => response.json())
        .then((order) => {

            populateOrder($scope, order);
            setPage({pane1:"order", id1:"curr"});
            report('Order', 'Exchange', exchange);

            if (order.service_type == 'pickup') snack('Exchange notified and waiting', {timeout: 3000, icon: 'notifications_active'});
            if (orderConfirmationRequired() && !orderConfirmationRequested()) requestOrderConfirmation();

            sessionStorage.order_exchange_id = exchange.id;
            sessionStorage.order_id = order.id;
            sessionStorage.order_voucher = order.voucher;
            sessionStorage.order_status = order.status;

            $('.ecard[data-exchange-id=' + exchange.id + ']').addClass('ordered');
            $('.selection button[data-ajax=searches]').removeAttr('data-ajax').addClass('to_order').attr({'data-href-pane': 'order', 'data-href-id': value_of('order_exchange_id')});

            hideCards(exchange.id);
            disableSwiping();

        })
        .catch((error) => {console.log('Error creating order:', error)});

};

requestOrderConfirmation = function() {
    sessionStorage.order_status = 'confirmationRequested';
    $('.ordered.ecard').addClass('confirmationRequested');
    snack('Click <strong>CONFIRM</strong> when deal is done', {upEl: $('.swiper-container'), icon: 'assignment_turned_in', timeout: 3000});
};

orderConfirmationRequired = function() {
    var order_status = value_of('order_status');
    return order_status && order_status != 'confirmed';
};

orderConfirmationRequested = function() {
    return value_of('order_status') == 'confirmationRequested'
};

orderConfirm = function() {
    $('.ordered.ecard').removeClass('confirmationRequested').addClass('confirmed');
    sessionStorage.order_status = 'confirmed';
    orderUpdate({status: 'confirmed'});
};

orderUpdate = function(update) {

    var order_id = value_of('order_id');
    if (!order_id) return;

    fetch('/orders/' + order_id, {
        method: 'PUT',
        headers: new Headers({
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify(
            {
                order: update
            }
        )
    })
        .then(checkStatus)
        .then(() => console.log('Order updated successfully'))
        .catch((error) => console.warn('Order update failed:', error))

};

orderUpdateUserDelivery = function() {

    return new Promise(function(resolve, reject) {

        function postData() {
            let order_id = value_of('order_id');
            if (!order_id) {
                reject('orderUser: No order id');
                return;
            }
            return fetch('/orders/' + order_id + '/user', {
                method: 'post',
                body: new URLSearchParams($('form.registration').serialize())
            })
        }

        function checkData(data) {
            if (data.errors) {
                let length = data.errors.length;
                snack(`${data.errors[0]} (1/${length})`, {klass: 'oops', timeout: 7000});
            } else {
                if (data.message) snack(data.message, {timeout: 3000});
                resolve(data)
            }
        }

        function report(error) {
            snack(`Server says: ${error}`, {klass: 'oops', timeout: 7000});
        }

        postData()
            .then(checkStatus)
            .then(parseJson)
            .then(checkData)
            .catch((error) => {report(error)})

    })

};

orderExists = function() {
    return sessionStorage.getItem("order_id") !== null
};

unorder = function() {
    exchange_id = value_of('order_exchange_id');
    if (!exchange_id) return;
    $('.ecard [data-exchange-id=' + exchange_id + ']').removeClass('ordered');
    sessionStorage.removeItem('order_exchange_id')
};

orderedAlready = () => !!value_of('order_id');


noOtherOrderExists = function() {

    console.log('noOtherOrderExists called');
    var orderred_already = !!value_of('order_id');
    if (orderred_already) {
        var order_exchange_id = value_of('order_exchange_id');
        var ordered_exchange = exchangeHash[order_exchange_id];
        var current_exchange = currentExchange();
        var text = 'You have';
        if (order_exchange_id == current_exchange.id) {
            text += ' ordered already from that exchange'
        } else {
            text += ` another order from ${ordered_exchange.name}`
        }
        console.warn(text);
        snack(text, {klass: 'oops', timeout: 7000});
    }
    return !orderred_already || order_exchange_id == current_exchange.id;  //in the latter case: allow passthrough to order page, just warn user that he ordered already
};