var media = window.matchMedia('(max-width: 767px)').matches ? 'mobile' : 'desktop';
var mobile = media == 'mobile';
var desktop = media == 'desktop';
var production = $('body').hasClass('production');
var params;
var pacContainerInitialized = false;


var display = function(term) {
    switch (term) {
        case 'quote':
            return 'best prices first:';
        case 'distance':
            return 'nearest first:';
    }
};        

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}


// Prefix input elements with the respective selected currency 
var bind_currency_to_autonumeric = function() {
  
    $('[data-autonumeric]').each(function() {
        if ($(this).val() > 0) {
            console('val: ' + String($(this).val()))
            update_currency_symbol($(this));
        }
    });

    $('.currency_select').change(function() {
        console.log('changed')
        update_currency_symbol($('#' + $(this).attr('data-symboltarget')));
    });

    function update_currency_symbol(el) {
        currency_select_el = $('#' + el.attr('data-symbolsource'));
        console.log('currency_select_el ' + '#' + el.attr('data-symbolsource'))
        $('[data-autonumeric]').autoNumeric('update', {aSign: currency_select_el.find('option:selected').attr('data-symbol')}); 
        alert('stop')
    }

};

$(document).ready(function() {
    
    console.log('pageload');
    
//    bind_currency_to_autonumeric();
    
 //    mixpanel.track("Page view");
    

    // Parameters & Form
    // 
    // Retrieve parameters from form or url and put in params objects
    // If not in form then update form
    

    // Populate location and form decoding fields first
    getLocation();
    
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