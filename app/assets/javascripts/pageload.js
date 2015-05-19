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

// intended to base on session values rather than window.location
current_url = function() {
    var url;

    url = sessionStorage.page;
    if (sessionStorage.id != "null") url += ('/' + sessionStorage.id);
    if (sessionStorage.pane != "null") url += ('/' + sessionStorage.pane);
    return url;
};


display = function(term) {
    switch (term) {
        case 'quote':
            return 'best prices first:';
        case 'distance':
            return 'nearest first:';
    }
};



/*
setPage = function(to) {
    var to_class = to.replace('#', '');

    $(to).show();
    $('nav.navbar').addClass(to_class);
    $('body').addClass(to_class);
 };
*/



/*
setPage = function(new_page) {

        if (!sessionStorage.location) {     // hack
            set_default_location()
        }

        var old_page        = $('.mainpage.active').attr('id');
        var old_page_id     = '#' + old_page;
        var old_page_el     = $(old_page_id);
        var new_page_id     = '#' + new_page;
        var new_page_el     = $(new_page_id);

        $('body').removeClass(old_page);
        $('body').addClass(new_page);
        $('nav.navbar').removeClass(old_page);
        $('nav.navbar').addClass(new_page);

        old_page_el.removeClass('active');
        new_page_el.addClass('active');
        old_page_el.hide();
        new_page_el.show();

        console.log('at setPage. history.state: ' + history.state);
        if (history.state != new_page) {
            console.log('state was not set so setting it now')
            history.pushState(new_page, null, new_page);
        } else {
            console.log('state was set already. Not pushing anything')
        }
     };
*/

/*
    window.addEventListener("popstate", function(e) {
         setPage(location.pathname.replace('/', ''), false)
    });
*/

/*
var display = function(term) {
    switch (term) {
        case 'quote':
            return 'best prices first';
        case 'distance':
            return 'nearest first';
    }
};        

*/

$(document).ready(function() {
    
    console.log('pageload');


    //    mixpanel.track("Page view");
    

    // Parameters & Form
    // 
    // Retrieve parameters from form or url and put in params objects
    // If not in form then update form
    


/*
  // Google maps invoked from client so needs to read url params
    function getParameterByName(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }
*/



});