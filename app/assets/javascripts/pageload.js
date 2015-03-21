function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}
         
var location_search =   getParameterByName('location_search');
var latitude =          getParameterByName('latitude') || 51.507351;
var longitude =         getParameterByName('longitude') || -0.127758;
var geocoded_location = getParameterByName('geocoded_location');
var distance =          getParameterByName('distance');
var pay_currency =      getParameterByName('pay_currency');
var buy_currency =      getParameterByName('buy_currency');
var pay_amount =        getParameterByName('pay_amount');
var sort =              getParameterByName('sort');
var searched_location = (location_search ? location_search : ((latitude && longitude) ? "nearby" : "London"));


function updateParamsDisplay() {
    $('#pay_amount_display').html(pay_amount.replace(/\s+/g, ''));
//    $('#pay_currency_display').html(pay_currency);
    $('#buy_currency_display').html("to " + String(buy_currency));
    $('#searched_location_display').html((searched_location == "nearby") ? "nearby" : "in " + searched_location);
}

function input_currency(pay_el, currency_el) {
  
    function set_pay_symbol(pay_el, currency_el) {
        pay_el.autoNumeric('update', {aSign: currency_el.find('option:selected').attr('data-symbol')}); 
    }

    set_pay_symbol(pay_el, currency_el);

    currency_el.change(function() {
        set_pay_symbol(pay_el, currency_el);
    });       
}


$(document).ready(function() {
    
    // Prefix input elements with the respective selected currency 


    // Link analyses
    mixpanel.track_links("a", "link", function(ele) { 
    return { clicked: $(ele).attr('data-link') };
    });


    // Change analyses
    $("[data-analyze='change']").change(function() {

        var activity = $(this).attr('data-activity');
        var key1 = $(this).attr('data-key1');
        var val1 = $(this).attr('data-val1');
        var key2 = $(this).attr('data-key2');
        var val2 = $(this).attr('data-val2');
        var key3 = $(this).attr('data-key3');
        var val3 = $(this).val();
        
        var aa = {};
        aa[key1] = val1;
        aa[key2] = val2;
        aa[key3] = val3;

        ga('send', 'event', activity, val1, val2, val3);
        mixpanel.track(activity, aa);
    });


    // Google maps invoked from client so needs to read url params
    function getParameterByName(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }


    // hide address bar - not working
    window.addEventListener("load",function() {
    // Set a timeout...
    setTimeout(function(){
        // Hide the address bar!
        window.scrollTo(0, 1);
    }, 0);
    });


});