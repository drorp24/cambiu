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

setPage = function(to) {
    var to_class = to.replace('#', '');

    $(to).show();
    $('nav.navbar').addClass(to_class);
    $('body').addClass(to_class);
 };

changePage = function(from, to) {

    var from_class = from.replace('#', '');
    var to_class = to.replace('#', '');

    if (!sessionStorage.location) {
        set_default_location()
    }

    $(from).hide();
    $(to).show();
    $('nav.navbar').removeClass(from_class);
    $('nav.navbar').addClass(to_class);
    $('body').removeClass(from_class);
    $('body').addClass(to_class);
    window.location.hash = to;
    // push to html5 history;
 };

var display = function(term) {
    switch (term) {
        case 'quote':
            return 'best prices first';
        case 'distance':
            return 'nearest first';
    }
};        


$(document).ready(function() {
    
    console.log('pageload');
    document.body.scrollTop = document.documentElement.scrollTop = 0;

    homepage = $('body').hasClass('homepage');

    if(window.location.hash) {
        changePage('#homepage', window.location.hash);
    } else {
        setPage('#homepage')
    }


 //    mixpanel.track("Page view");
    

    // Parameters & Form
    // 
    // Retrieve parameters from form or url and put in params objects
    // If not in form then update form
    

     if (!sessionStorage.location) getLocation();
    
  // Google maps invoked from client so needs to read url params
    function getParameterByName(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }

    //UI

    $('.getstarted_button').click(function(){
        if (sessionStorage.pay_amount != "null") {
            $('#homepage input[data-field=pay_amount]').focus()
        } else {
            $('#homepage input[data-field=buy_amount]').focus()
        }
        $('#homepage input[data-field=buy_amount]').focus()
    });

    $('.exchanges_search_search_title').click(function(){
        if (sessionStorage.pay_amount != "null") {
            $('#search_form input[data-field=pay_amount]').focus()
        } else {
            $('#search_form input[data-field=buy_amount]').focus()
        }
    });

    $('.page-title.navbar-brand').click(function() {
        location.reload()
    })


});