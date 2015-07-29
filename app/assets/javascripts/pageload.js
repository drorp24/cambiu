var media = window.matchMedia('(max-width: 767px)').matches ? 'mobile' : 'desktop';
var mobile = media == 'mobile';
var desktop = media == 'desktop';
var homepage;
var production;
var search;
var exchangePage;
var direct;
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
var bind;
var set_defaults;
var set_default_location;
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
var value_of;
var current_hash;
var new_search_validator;
var is_currency_unique;
var disable_other_currency;
var link;
var is_larger_than_zero;
var custom_validate;
var location_settings;
var def;
var set_variables;
var variables_set = false;
var findExchange;
var findMarker;
var exchange_el;
var closeInfowindows;
var zoom_changed_by_user = true;
var map_initial_zoom = 15;
var map_center_changed = false;
var updateResults;
var directionsService;
var big_marker;
var search_exchanges;
var findPosition;
var displayError;
var getLocation;
var locationCallback;
var urlParameter;
var urlParameters;
var urlId;
var isNumber;
var spa;
var exchange_list_count;

isNumber = function (obj) { return !isNaN(parseFloat(obj)) };

urlParameters = function() {
    return window.location.search.length > 0
};


urlId = function() {
    var path = window.location.pathname;
    if (!path) return null;
    var path_split = path.split('/');
    if ((path_split.length == 3 || path_split.length == 4) && path_split[1] == 'exchanges' && isNumber(path_split[2])) {
        return path_split[2]
     } else {
        return null
    }
};

urlParameter = function(sParam)
{

    if (sParam == 'exchange_id') {

        return urlId()

    } else {

        var sPageURL = window.location.search.substring(1);
        var sURLVariables = sPageURL.split('&');
        for (var i = 0; i < sURLVariables.length; i++)
        {
            var sParameterName = sURLVariables[i].split('=');
            if (sParameterName[0] == sParam)
            {
                return sParameterName[1];
            }
        }
    }

};

findExchange = function(id) {
    if (exchanges && exchanges.length > 0) {
        var results = $.grep(exchanges, function(e){ return e.id == id; });
        if (results[0]) {
            console.log('exchange with that id found in exchanges array');
            var exchange = results[0];
        } else {
            console.log('exchange with this id was not found in exchanges array');
            // bring it from the server
        }
    } else {
        console.log('exchanges is empty');
    }

    return exchange;
};

findMarker = function(id) {
    if (markers && markers.length > 0) {
        var results = $.grep(markers, function(m){ return m.exchange_id == id; });
        if (results[0]) {
            console.log('marker with that exchange_id found in markers array');
            var marker = results[0];
        } else {
            console.log('marker with this exchange_id was not found in markers array');
        }
    } else {
        console.log('markers is empty');
    }

    return marker;
};

def = function(variable) {
    var val = {
        'pay_amount'    : 300,
        'pay_currency'  : 'GBP',
        'buy_amount'    : null,
        'buy_currency'  : 'EUR',
        'sort'          : 'distance',
        'service_type'  : 'collection'
    };
    return val[variable] ? val[variable] : null
};

homepage = function() {
  return $('body').hasClass('homepage') || window.location.pathname == '/homepage' || window.location.pathname == '/'
};

value_of = function(key) {
    var a = sessionStorage.getItem(key);
    return (a && a != "null") ? a : null;
};


// intended to base on session values rather than window.location
// TODO: Remove
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
    exchange_el = function(exchange) {

        var exchange_el  = $('.exchange_window.template').clone().removeClass('template');
        exchange_el.find('.exchange_window_quote').html(exchange.edited_quote);
        exchange_el.find('.exchange_window_name').html(exchange.name);
        exchange_el.find('.exchange_window_address').html(exchange.address);
        exchange_el.find('.exchange_window_open').html(exchange.todays_hours);
        exchange_el.attr('id', 'exchange_window_' + exchange.id);

        return {
            sum: exchange_el.find('.exchange_window_sum'),
            det: exchange_el.find('.exchange_window_det')
        };
    };


$(document).ready(function() {
    if (mobile) {$('#exchange_params_change').removeClass('in');}

    $('body').addClass(media);
    production = function() {
        return $('body').hasClass('production');
    };
    spa = function() {
        return $('body').hasClass('home');
    };
    search = function() {
        return $('body').hasClass('search');
    };
    exchangePage = function() {
        return $('body').hasClass('exchange');
    };

    $(function () {
        $("body").tooltip({ selector: '[data-toggle=tooltip]' });
        $("body").popover({ selector: '[data-toggle=popover]', trigger: 'hover', placement: 'top' });
    })

    $('[data-inform-title]').click(function() {

        var $this = $(this);
        var invoked_form    = $this.data('form') ? $($this.data('form')) : null;   // e.g., getstarted_button click invokes #new_search form
        var form = invoked_form ? invoked_form : $this.closest('form');

        if (form.length > 0 && form.valid() && custom_validate(form)) {
            $("#freeow").freeow($this.attr('data-inform-title'), $this.attr('data-inform-text'), {
                classes: ["smokey", "slide"],
                autoHide: false,
                showStyle: {opacity: 1, left: 0},
                hideStyle: {opacity: 0, left: '400px'}
            });
        }
    });


});