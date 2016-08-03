var media = window.matchMedia('(max-width: 767px)').matches ? 'mobile' : 'desktop';
var mobile = media == 'mobile';
var desktop = media == 'desktop';
var isAndroid = /(android)/i.test(navigator.userAgent);
var isIos = (navigator.platform.indexOf("iPhone") != -1) || (navigator.platform.indexOf("iPod") != -1) || (navigator.platform.indexOf("iPad") != -1);
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
var exchanges_by_price = [];
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
var location_settings;
var def;
var set_variables;
var variables_set = false;
var findExchange;
var findMarker;
var exchange_el;
var closeInfowindows;
var zoom_changed_by_user = true;
var map_initial_zoom = 17;
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
var inform;
var updateMarkers;
var marker_highlighted = false;
var highlight;
var unhighlight;
var mapPan;
var clear;
var make_url;
var break_url;
var google_api_key = 'AIzaSyBjqKHd8skkCMWYd_uG7QMEmCGunJ2Q3Us';
var photo_width;
var photo_height;
var defaults;
var expiry;
var watchId;
var gcm_apikey = 'AIzaSyBjqKHd8skkCMWYd_uG7QMEmCGunJ2Q3Us';
var search;
var mySwiper;

var iOS = /iPad|iPhone|iPod/.test(navigator.platform);

var Safari = !!navigator.userAgent.match(/Version\/[\d\.]+.*Safari/);

sessionStorage.videoStopped = null;


toggleOrder = function($el) {

    var order       = $el.attr('data-order');
    var toggledOrder    = order == 'asc' ? 'desc' : 'asc';
    $el.attr('data-order', toggledOrder);
    return $el;
};

def_vals = function() {

    var def = {};

    def['pay_amount']       = null;
    def['pay_currency']     = 'USD';
    def['buy_amount']       = 1000;
    def['buy_currency']     = 'EUR';
    def['sort']             = 'price';
    def['location_lat']     = '51.51574678520366';
    def['location_lng']     = '-0.16346305847173426';
    def['location']         = 'London, UK';
    def['location_short']   = 'London';
    def['location_type']    = 'default';
    def['location_default'] = '88 Edgware Rd, London W2, UK';

    return def;

};

// returns null if no default is defined for the given key
def = function(key) {
    if (typeof defaults === 'undefined') defaults = def_vals();  //invoke def_vals() once only
    return (typeof defaults[key] !== 'undefined') ? defaults[key] : null;
};

var searchParams = [
    'pay_amount',
    'pay_currency',
    'buy_amount',
    'buy_currency',
    'location',
    'location_short',
    'location_type',
    'location_reason',
    'location_lat',
    'location_lng',
    'location_default',
    'user_location',
    'user_lat',
    'user_lng',
    'sort'
];

searchable = function(field) {
  return searchParams.indexOf(field) > -1;
};

pluralize = function(word, count) {
  return count > 1 ? word + 's' : word
};


best = function(exchanges) {

    var best = [];
    var rest = [];
    var exchange;
    var best_at_array;
    var best_at;

    for (var i=0, len = exchanges.length; i  <  len; i++){
        if (exchanges[i].properties.best_at.length == 0) {continue}
        best_at_array = JSON.parse(JSON.stringify(exchanges[i].properties.best_at));
        for (var j=0; j  <  best_at_array.length; j++){
            exchange = JSON.parse(JSON.stringify(exchanges[i]));
            best_at = best_at_array[j];
            exchange.properties.best_at = [];
            exchange.properties.best_at.push(best_at);
            best_at == "best" ? best.push(exchange) : rest.push(exchange);
        }
    }

    return best.concat(rest);

};




make_url = function(page, id, pane) {
  var url = '/' + page;
  if (id) {url += ('/' + id)}
  if (pane) {url += ('/' + pane)}
  return url;
};

break_url = function(url) {

    var split_url = url.split('/');
    var page = split_url[1];
    if (split_url.length == 4) {
        var id = split_url[2];
        var pane = split_url[3];
    } else
    if (split_url.length == 3) {
        var id = null;
        var pane = split_url[2];
    } else
    if (split_url.length == 2) {
        var id = null;
        var pane = null;
    }

    return {
        'page'  : page,
        'id'    : id,
        'pane'  : pane
    }
};

mapPan = function() {
    map.panBy(-0.17 * screen.width, -0.05 * screen.height)
};

highlight = function(id) {

    var iw_content  =   $('.exchange_window_sum[data-id=' + id + ']');
    var big_parent  =   iw_content.parent().parent().parent();
    var o_z_index   =   big_parent.css('z-index');

    big_parent.find('[style*="background-color: rgb(255, 255, 255)"]').css('background-color', '#ddd').addClass('highlight_bg');
    big_parent.attr('data-o-z-index', o_z_index).css('z-index', '1000');
//    big_parent.find('.exchange_window_best_at').css('background-color', '#555');
//    iw_content.css('color', '#fff')/*.css('text-shadow', '0px 1px 0px rgba(0, 0, 0, 1)')*/;

};

unhighlight = function(id) {

    if (id == 'all') {
        $('.highlight_bg').css('background-color', 'rgb(255, 255, 255)');
        return
    }

    var iw_content  =   $('.exchange_window_sum[data-id=' + id + ']');
    var big_parent  =   iw_content.parent().parent().parent();
    var o_z_index   =   big_parent.data('o-z-index');

    big_parent.find('.highlight_bg').css('background-color', 'rgb(255, 255, 255)').removeClass('highlight_bg');
    big_parent.css('z-index', o_z_index);
    iw_content.css('color', '#444').css('text-shadow', 'none');

};

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
        var results = $.grep(exchanges, function(e){ return e.properties.id == id; });
        if (results[0]) {
            console.log('exchange with id ' + id + ' was found in exchanges array');
            var exchange = results[0];
            return exchange.properties;
        } else {
            console.log('exchange with this id was not found in exchanges array');
            // bring it from the server
            return null
        }
    } else {
        console.log('exchanges is empty');
        return null
    }
};

homepage = function() {
  return $('body').hasClass('homepage') || window.location.pathname == '/homepage' || window.location.pathname == '/'
};

numeric_value_of = function(key) {
    return Number(value_of(key));
};


display = function(term) {
    switch (term) {
        case 'price':
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
    exchange_el = function(feature) {

        var exchange_el  = $('.exchange_window.template').clone().removeClass('template');
        var best_at_el = exchange_el.find('.exchange_window_best_at');

        var id              = feature.getProperty('id');
        var name_s          = feature.getProperty('name_s');
        var address         = feature.getProperty('address');
        var edited_quote    = feature.getProperty('edited_quote');
        var best_at_array   = feature.getProperty('best_at');
        var best_at         = best_at_array.length == 0 ? '' : (best_at_array.indexOf('best') > -1 ? 'best' : best_at_array[0]);

        if (best_at != '') {
            best_at_el.html(' ');
            best_at_el.addClass('show').addClass(best_at);
        } else {
            best_at_el.addClass('hide');
        }

        exchange_el.find('.exchange_window_name').html(name_s);
        exchange_el.find('.exchange_window_address').html(address);
        exchange_el.find('.exchange_window_quote').html(edited_quote);
        exchange_el.find('.exchange_window_det').attr('data-href-id', id).attr('data-exchange-id', id);

        return {
            sum: exchange_el.find('.exchange_window_sum'),
            det: exchange_el.find('.exchange_window_det')
        };
    };


$(document).ready(function() {
    if (mobile) {
        $('iframe#player').remove();
        $('.desktop_only#map_container').remove();
        $('#exchange_params_change').removeClass('in');
    } else
    if (desktop) {
        $('.mobile_only#map_container').remove();
    }
    $('body').addClass(media);
    production = function() {
        return $('body').hasClass('production');
    };
    spa = function() {
        return $('body').hasClass('home');
    };

    $(function () {
        $("body").tooltip({ selector: '[data-toggle=tooltip]' });
        if (desktop) $("body").popover({ selector: '[data-toggle=popover]' });
    });

    if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log("Installable app!");
    }

    listen_to_file_input();

    mySwiper = new Swiper ('.swiper-container', {
        pagination: '.swiper-pagination',
        paginationType: 'fraction',
        nextButton: '.swiper-button-next',
        prevButton: '.swiper-button-prev',
        centeredSlides: true,
        freeMode: true,
        freeModeSticky: true,
        spaceBetween: 15,
        slidesPerView: 1.3
     })
});