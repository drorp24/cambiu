var media = window.matchMedia('(max-width: 767px)').matches ? 'mobile' : 'desktop';
var mobile = media == 'mobile';
var desktop = media == 'desktop';
var windowWidth = $(window).width();
var windowHeight = $(window).height();
var centerX = windowWidth / 2;
var centerY = windowHeight / 2;
var centerXpx = String(centerX - 30) + 'px';
var centerYpx = String(centerY - 30) + 'px';
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
var map_current_zoom = 13;
var map_final_zoom = 19;
var map_center_changed = false;
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
var defaults;
var expiry;
var watchId;
var gcm_apikey = 'AIzaSyBjqKHd8skkCMWYd_uG7QMEmCGunJ2Q3Us';
var slidesPerView = 1.3;
var photoAspectRatio = 1;
var photoPadding = 15;
var photoWidth;
var photoHeight;
var slidesAdded = [];
var initialSlides = 3;
var user = {};
var dfault = {};
dfault.lat = '51.51574678520366';
dfault.lng = '-0.16346305847173426';
var search = {};
search.location = {};
search.user = {};
var ratingOptions = {
    theme: 'krajee-fa',
    filledStar: '<i class="fa fa-star"></i>',
    emptyStar: '<i class="fa fa-star-o"></i>',
    showClear: false,
    showCaption: false,
    size: 'xs',
    readonly: true
};
var map_refreshed = false;
var intro_refreshed = false;
var search_refreshed = false;
var directionsRenderedFor = null;

var iOS = /iPad|iPhone|iPod/.test(navigator.platform);

var Safari = !!navigator.userAgent.match(/Version\/[\d\.]+.*Safari/);
var swiperH;
var cardHeight = null;
var cardXoffset = null;
var exchanges;
var inShow = true;
var currExchangeId = null;
var currentSnack = null;
var locationDirty = false;
var searchResult;
var searchId = null;
var prev_distance_from_exchange = null;
var prev_distance_from_initial_location = null;
var features = [];
var markers = [];

sessionStorage.videoStopped = null;


gaEvent = function(category, action) {

    var currExchange = currentExchange();
    var name = currExchange && currExchange.name ? currExchange.name : "";
    var id = currExchange && currExchange.id ? currExchange.id : "";
    ga('send', 'event', category, action, name, {id: id});

};

gaTiming = function(category, variable, value) {
    ga('send', 'timing', category,  variable, value);
};

def_vals = function() {

    var def = {};

    def['pay_amount']       = '$1,000';
    def['pay_currency']     = 'USD';
    def['buy_amount']       = null;
    def['buy_currency']     = 'GBP';
    def['user_lat']         = dfault.lat;
    def['user_lng']         = dfault.lng;
    def['location_type']    = 'default';
    def['sort']             = 'price';
    def['radius']           = '5';
    def['version']          = '0.0.0';

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
    'sort',
    'radius',
    'version'
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

wait = function(period) {
    if (typeof period === 'undefined') period = 5000;
    return new Promise(function(resolve, reject) {
        setTimeout(function() {
            resolve()
        }, period)
    })
};


$(document).ready(function() {

    if(!navigator.onLine) { // true|false
        snack('You are currently offline')
    }


    $('body').bootstrapMaterialDesign();

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

/*
    $(function () {
        $("body").tooltip({ selector: '[data-toggle=tooltip]' });
        $("body").popover({ selector: '[data-toggle=popover]' });
    });
*/

    if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log("Installable app!");
    }

    listen_to_file_input();

    photoWidth = Math.round(($('body').width() / slidesPerView / 2) - (2 * photoPadding));
    photoHeight = Math.round(photoWidth / photoAspectRatio);

/*  No rating in cambiu at the moment
    $('.ratings').on('rating.change', function(event, value, caption) {
        var exchange_id = $(this).attr('data-exchange-id');
        swal({
            title: "Saved",
            html: true,
            text: 'You gave this exchange' + ' <strong>' + value + ' stars</strong>' ,
            type: "success"
        });

        updateExchange(exchange_id, {'exchange[rating]': value});
    });
*/

    bodyWidth       = $('body').width().toFixed();
    bodyHeight      = window.innerHeight;
    halfBodyHeight  = (bodyHeight / 2).toFixed();

    var slider = document.getElementById('slider');
    var radius = document.getElementById('radius');

    noUiSlider.create(slider, {
        connect: true,
        start: Number(def('radius')),
        connect: [true, false],
        range: {
            min: 0,
            max: 10
        },
        pips: {
            mode: 'values',
            values: [0, 5, 10],
            density: 10
        },
        tooltips: [true],
        format: {
            to: function ( value ) {
                if (value < 1) {
                    return (value * 1000).toFixed() + ' m';
                } else {
                    return value.toFixed() + ' Km';
                }
            },
            from: function ( value ) {
                return value.replace(' Km', '');
            }
        }

    });

    initSwipers();


    // User messages (snackbar)

    snackHtml = function(arg) {
        var message = arg.message,
            button = typeof arg.button === 'undefined' ? null : arg.button,
            klass = typeof arg.klass === 'undefined' ? null : arg.klass,
            link = typeof arg.link === 'undefined' ? null:  arg.link;

        var $e = $('.snack.template').clone().removeClass('template').addClass('active');
        $e.find('.message').html(message);
        if (klass) $e.find('.snackIcon').addClass(klass);
        if (button) $e.find('.button').html(button);
        if (button && link) $e.find('.button').attr({'data-href-page': link.page, 'data-href-pane': link.pane});
        return $e.html();
    };

//    snack = function(message, button, timeout, $upEl, klass, link) {
    snack = function(message, options) {

        console.log('snack called with message: ' + message);

//          Suppressed since it can now also happen when switched back to 'where I'm at' while still on the (white) search page
//        if ($upEl && !inShow) $upEl.css({'position': 'absolute', 'bottom': '60px', 'transition': 'bottom 0.5s'});

        if (typeof options === 'undefined') options = {};

        if (currentSnack) currentSnack.snackbar("hide");

        currentSnack = $.snackbar({
            timeout: options.timeout || 500000,
            htmlAllowed: true,
            content: snackHtml({
                message: message,
                button: options.button,
                klass: options.klass,
                link: options.link
            })
        })
    };

    snackHide = function($downEl) {

        console.log('snackHide');

        if (typeof $downEl === 'undefined') $downEl = null;

//        if ($downEl) $downEl.css({'position': 'fixed', 'bottom': '0'});

        $('.snackbar.snackbar-opened').snackbar("hide");
        currentSnack = null;
    };

    $('body#cambiu').on('click tap', '.snackbar', function() {
        console.log('snack clicked');
        snackHide()
    });


    // Error Handling

    logError = function(error) {
        var stack = error.stack;
        var message = error.toString();
        var text = stack ? stack : message;
        console.error(text);
        persistError(message, text);
    };

    showError = function(error) {
        console.log('showError');
        logError(error);
        snack(error);

    };

    persistError = function(message, text) {
        if (typeof text === 'undefined') var text = '';
        $.ajax({
            type: 'POST',
            url: '/errors',
            data: {'error[message]': message, 'error[text]': text, 'error[search_id]': searchId},
            dataType: 'JSON',
            success: function (data) {
                console.log('Error successfully updated');
            },
            error: function (data) {
                console.log('There was an error updating the error');
            }
        });

    };

/*  Not working
    persistError = function(text) {
        fetch('/errors', {
            method: 'post',
            headers: new Headers({
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify({
                'error[text]': text
            })
        });
    };
*/

    //window.addEventListener catches every error the Promise's .catch doesn't.
    // It gets the entire 'e'vent rather than only the Error object (as in the case of Promise's catch)
    // Since log/showError serve both types of catches, it is passed here only the error object part
    window.addEventListener('error', function (e) {
        console.log('addEventListener. e:');
        console.log(e);
         showError(e.error);
         snack(e.error);
    });

    $('body').click(function(e) {
        hide_best();
    });


    $('.navbar').click(function(e) {
        hide_best();
    });

    $('.search_section.where input#location').prop("disabled", true);
    $('input#location').attr('placeholder', '')

});