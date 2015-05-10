var form_el  = $('#new_order');

function setMode() {
    console.log('setMode')
    if (sessionStorage.order_id)  {
        var method = 'patch';
        var action = form_el.attr('action') + "/" +sessionStorage.order_id;
    }
}

function updateOrder(order) {
    console.log('updateOrder    ')
    // TODO: Replace with set
    sessionStorage.order_id = order.id;
    sessionStorage.expiry = order.expiry;
    $('[data-field=order_id]').val(order.id);
    $('[data-field=order_expiry]').val(order.expiry);
}

$('#new_order').ajaxForm({
    dataType:       'json',
    beforeSubmit:   setMode,
    success:        updateOrder
});
