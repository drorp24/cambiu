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

/*
setPage = function(to) {
    var to_class = to.replace('#', '');

    $(to).show();
    $('nav.navbar').addClass(to_class);
    $('body').addClass(to_class);
 };
*/

var display = function(term) {
    switch (term) {
        case 'quote':
            return 'best prices first:';
        case 'distance':
            return 'nearest first:';
    }
};


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

    var reload_path = window.location.pathname == '/' ? 'homepage' : window.location.pathname;
    history.replaceState(null, null,   reload_path);

    homepage = $('body').hasClass('homepage');

    document.body.scrollTop = document.documentElement.scrollTop = 0;

 //    mixpanel.track("Page view");
    

    // Parameters & Form
    // 
    // Retrieve parameters from form or url and put in params objects
    // If not in form then update form
    

     if (!sessionStorage.location) getLocation();
    
/*
  // Google maps invoked from client so needs to read url params
    function getParameterByName(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }
*/

    //UI

    $('.getstarted_button').click(function(){
        if (sessionStorage.pay_amount != "null" ||sessionStorage.buy_amount != "null" ) {
            $('#new_search').submit();
        } else {
            $('#homepage input[data-field=buy_amount]').focus()
        }
     });

    $('.exchanges_search_search_title').click(function(){
        if (sessionStorage.pay_amount != "null") {
            $('#search_form input[data-field=pay_amount]').focus()
        } else {
            $('#search_form input[data-field=buy_amount]').focus()
        }
    });

    $('.page-title.navbar-brand').click(function() {  // hach
        location.reload()
    })


});