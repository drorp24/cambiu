var media = window.matchMedia('(max-width: 767px)').matches ? 'mobile' : 'desktop';
var mobile = media == 'mobile';
var desktop = media == 'desktop';
var production = $('body').hasClass('production');
var params;
var pacContainerInitialized = false;
var searchBox;
var map;
var markers;
var center;
var geocoder;
var directionsDisplay;
var markers = [];
var exchanges = [];
var infowindows = [];
var exchanges_array = [];
var exchanges_by_quote = [];
var exchanges_by_distance = []; 


// Initialize Google map with London
/*
function initialize() {
  var mapOptions = {
    zoom: 8,
    center: new google.maps.LatLng(51.50169, -0.16030)
  };

  map = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);
}

function loadScript() {
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp' +
      '&signed_in=true&callback=initialize';
  document.body.appendChild(script);
}

window.onload = loadScript;
*/



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
 
    $('[data-autonumeric]').autoNumeric('init'); 
 
    $('[data-autonumeric]').each(function() {
        update_currency_symbol($(this));
    });

    $('.currency_select').change(function() {
       update_currency_symbol($('#' + $(this).attr('data-symboltarget')));
    });

    function update_currency_symbol(el) {
        currency_select_el = $('#' + el.attr('data-symbolsource'));
        symbol = currency_select_el.find('option:selected').attr('data-symbol');
        el.attr('data-a-sign', symbol); 
        el.autoNumeric('update', {aSign: symbol});
    }

};

$(document).ready(function() {
    
    console.log('pageload');
    
    bind_currency_to_autonumeric();
    
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


});