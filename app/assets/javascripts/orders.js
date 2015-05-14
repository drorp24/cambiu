/* TODO: use of ajaxForm not needed. rails' ujs is better
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
 */

/* TODO: This is where it should be not in exchanges.js but doesnt work here
// Maybe rails stops propagation of 'ajax:success' and then it can't be used in delegation
$('#exchanges').on('ajax:success', '#new_order', (function(evt, data, status, xhr) {
    alert('ajax success');
    console.log(data)
}))*/
