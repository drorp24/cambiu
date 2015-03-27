var media = window.matchMedia('(max-width: 767px)').matches ? 'mobile' : 'desktop';
var mobile = media == 'mobile';
var desktop = media == 'desktop';


// TODP: remove. Page 1 will pass parameters thru ajas formSubmit. No rul params
/*
var location_search =   getParameterByName('location_search');
var latitude =          getParameterByName('latitude');
var longitude =         getParameterByName('longitude');
var geocoded_location = getParameterByName('geocoded_location');
var distance =          getParameterByName('distance');
var pay_currency =      getParameterByName('pay_currency');
var buy_currency =      getParameterByName('buy_currency');
var pay_amount =        getParameterByName('pay_amount');
var sort =              getParameterByName('sort');
var searched_location = (location_search ? location_search : ((latitude && longitude) ? "nearby" : "London"));
*/

// Global functions

var display = function(term) {
    switch (term) {
        case 'quote':
            return 'best prices first:';
        case 'distance':
            return 'nearest first:';
    }
};        

/*
// extract form parameters
function params() {        
    form_el = '#search_form';
    var values = {};
    $.each($(form_el).serializeArray(), function(i, field) {
        values[field.name] = field.value;
    });
    values['sort'] = $('#sort_switch').bootstrapSwitch('state') ? 'quote' : 'distance';
//    values['edited_pay_amount'] = $('#pay_amount').val().replace(/\s+/g, '');
    return values;    
};
*/

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}


// Prefix input elements with the respective selected currency 
var bind_currency_to_autonumeric = function() {
  
    update_currency_symbol();

    $('.currency_select').change(function() {
        update_currency_symbol();
    });

    function update_currency_symbol() {
        $('[data-autonumeric]').autoNumeric('update', {aSign: $('.currency_select').find('option:selected').attr('data-symbol')}); 
    }

};

$(document).ready(function() {
    
    console.log('pageload');
    
    // Get user location and store in gloval vars and hidden form fields
    
    bind_currency_to_autonumeric();
    
    // Fix google autocomplete z-index dynamically
    var pacContainerInitialized = false;
    $('.location.search').keypress(function() {
        if (!pacContainerInitialized) {
        $('.pac-container').css('z-index', 
        '9999');
        pacContainerInitialized = true;
        }
    });
    
    // Initialize bootstrap-switch
    $('.make-switch').bootstrapSwitch();    


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