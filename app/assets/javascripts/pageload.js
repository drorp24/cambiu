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