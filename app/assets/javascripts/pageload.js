var media = window.matchMedia('(max-width: 767px)').matches ? 'mobile' : 'desktop';
var mobile = media == 'mobile';
var desktop = media == 'desktop';
var production = $('body').hasClass('production');
var homepage;
var params = {};
var pacContainerInitialized = false;
var searchBoxes = [];
var map;
var center;
var geocoder;
var directionsDisplay;
var markers = [];
var exchanges = [];
var infowindows = [];
var exchanges_by_quote = [];
var exchanges_by_distance = [];
var drawMap;
var clearExchanges;
var updateExchanges;
var sort_by;
var sort_ui;
var set;
var order = {};
var model_set;
var model_populate;
var pageSwitch;
var beforeSubmit;
var startLoader;
var updatePage;
var display;
var bind_currency_to_autonumeric;
var current_url;
var def_pay_amount      = null;
var def_pay_currency    = "GBP";
var def_buy_amount      = 1000;
var def_buy_currency    = "EUR";
var def_sort            = 'quote';
var value_of;
var set_defaults;
var current_url;
var current_hash;
var new_search_validator;
var is_currency_unique;
var disable_other_currency;
var link;
var is_larger_than_zero;
var custom_validate;




// intended to base on session values rather than window.location
current_url = function() {
    var url;

    url = sessionStorage.page;
    if (sessionStorage.id != "null") url += ('/' + sessionStorage.id);
    if (sessionStorage.pane != "null") url += ('/' + sessionStorage.pane);
    return url;
};

current_hash = function() {
    var hash = value_of('hash');
    if (hash && hash.length > 1) hash = hash.slice(1);
    return hash;
};


display = function(term) {
    switch (term) {
        case 'quote':
            return 'best prices first:';
        case 'distance':
            return 'nearest first:';
    }
};

// make the mobile navbar collapse when a link is clicked
$(document).on('click','.navbar-collapse.in',function(e) {
    if( $(e.target).is('a') && $(e.target).attr('class') != 'dropdown-toggle' ) {
        $(this).collapse('hide');
    }
});

$(document).ready(function() {

//    document.body.scrollTop = document.documentElement.scrollTop = 0;
    if (!sessionStorage.location) getLocation();



    /*   trying to understand what changes the data-href-id on the #email_form when button is clicked
     $('#email_form').on('ajax:before', function(event, data, status, xhr) {
     alert('email form ajax before. value of session id: ' + sessionStorage.id + ' data-href-id now: ' + $('#email_form .email_submit').data('href-id'))
     })


     window.addEventListener("storage", function(event) {
     var key = event.key;
     var newValue = event.newValue;
     var oldValue = event.oldValue;
     var url = event.url;
     var storageArea = event.storageArea;

     alert(key + ' was cahnged from ' + oldValue + ' to ' + newValue + ' in ' + url)

     // handle the event
     });
     */

});