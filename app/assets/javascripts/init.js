var media = window.matchMedia('(max-width: 767px)').matches ? 'mobile' : 'desktop';
var development = location.hostname == 'localhost';
var mobile = media == 'mobile';
var desktop = media == 'desktop';
//var mode = development ? 'both' : (mobile ? 'mobile' : 'desktop');
var mode = 'both'; // let's see if it causes problems. The menus allow both modes currently
// if (mobile) - single-pane; true in mobile devices and iFrames narrower than 767px.  EXAMPLE: if (mobile) close pane when showing directions.   If (desktop) - side by side panes.
// if (mode == mobile) - best fit for a single-pane, though it can exists in desktop too. EXAMPLE: if (mode == mobile) create vertical list rather than horizontal cards.
var default_set = mobile ? 'cards' : 'list';
var default_set = 'cards';
//var isSafari2 = isSafari1(navigator.userAgent);
var windowWidth = $(window).width();
var windowHeight = $(window).height();
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
var map_initial_zoom = 13;
var map_current_zoom = 13;
var map_final_zoom = 17;
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
var slidesPerView = 1;
var photoAspectRatio = 1;
var photoPadding = 15;
var photoWidth;
var photoHeight;
var slidesAdded = [];
var pagesAdded = [];
var user = {};
var dfault = {};
dfault.lat = '51.51574678520366';
dfault.lng = '-0.16346305847173426';
var search = {};
search.user = {};
var ratingOptions = {
    theme: 'krajee-fa',
    filledStar: '<i class="material-icons">star_rate</i>',
    emptyStar: '<i class="material-icons">star_border</i>',
    showClear: false,
    showCaption: false,
    readonly: true
};
var map_refreshed = false;
var intro_refreshed = false;
var search_refreshed = false;
var cards_refreshed = false;
var directionsRenderedFor = null;

var iOS = /iPad|iPhone|iPod/.test(navigator.platform);

var Safari = !!navigator.userAgent.match(/Version\/[\d\.]+.*Safari/);
var swiperH;
var cardHeight = null;
var exchanges;
var inShow = true;
var currExchangeId = null;
var locationDirty = false;
var searchResult;
var searchId = null;
var prev_distance_from_exchange = null;
var features = [];
var utm_source = null;
var arrivedToExchange = false;
var page = null;
var id = null;
var pane = null;
var offers = [];
var markersShaded = false;
var nearest;
var exchangeHash = {};
var pageNum;
var resultsPerPage = 5;

var findUserLocation;
var local = {};
var calculated = null;
var verifyMapIsShown;
var inIframe = false;
var locale;
var activeSnackbars = 0;
var pendingSnack = {};
var radius = {delivery: 100, pickup: {drive: 10, walk: 0.75}};
var conveyed = {localCurrency: false};


def_vals = function() {

    var def = {};

    def['pay_amount']       = null;
    def['pay_currency']     = 'ILS';
    def['buy_amount']       = 1000;
    def['buy_currency']     = 'USD';
    def['service_type']     = 'delivery';
    def['payment_method']   = 'credit';
    def['user_lat']         = dfault.lat;
    def['user_lng']         = dfault.lng;
    def['location_type']    = 'default';
    def['radius']           = '100';
    def['change_field']     = 'fields';
    def['change_to']        = 'default values';

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
    'service_type',
    'payment_method',
    'location',
    'location_short',
    'location_type',
    'location_reason',
    'location_lat',
    'location_lng',
    'radius',
    'change_field',
    'change_to'
];

searchable = function(field) {
  return searchParams.indexOf(field) > -1;
};

pluralize = function(word, count) {
  return count > 1 ? word + 's' : word
};


/*
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
*/




make_url = function(page, id, pane, hash) {

    if (typeof hash === 'undefined') hash = null;
    var url = '/' + page;
    if (id) {url += ('/' + id)}
    if (pane) {url += ('/' + pane)}
    if(hash) {url = url + '#' + hash}
    return url;
};

break_url = function(url) {

    if (url[url.length - 1] == '/') url = url.substring(0, url.length - 1);
    var hash_split = url.split('#');
    url = hash_split[0];
    var hash = hash_split[1] ? hash_split[1] : null;
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
        page  : page,
        id    : id,
        pane  : pane,
        hash  : hash
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
    if (typeof period === 'undefined') period = 300;
    return new Promise(function(resolve, reject) {
        setTimeout(function() {
            resolve()
        }, period)
    })
};

// For all the 'fetch's that don't reject promises on 4xx/5xx return statuses
checkStatus = function(response) {
    if (response.status >= 200 && response.status < 300) {
        return response
    } else {
        var error = new Error(response.statusText);
        error.response = response;
        throw error
    }
};

// For all the 'fetch's that use json
parseJson = function(response) {
    return response.json()
};




$(document).ready(function() {

    locale = $('body').attr('locale');
    if (search) utm_source = new URLSearchParams(search).get('utm_source');


    $(function() {
        if (window.self != window.top) {
            $(document.body).addClass("in-iframe");
            inIframe = true;
        }
    });

    // Material Select Initialization
    $(document).ready(function() {
        $('.mdb-select').material_select();
    });


    if(!navigator.onLine) { // true|false
        snack('You are currently offline')
    }


    if (mobile) {
        $('iframe#player').remove();
    }

    $('body').addClass(media);
    production = function() {
        return $('body').hasClass('production');
    };
    spa = function() {
        return $('body').hasClass('home');
    };

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

    streetviewWidth       = mobile ? $('body').width().toFixed() : ($('body').width() / 3).toFixed();
    streetviewHeight      = mobile ? (window.innerHeight / 2).toFixed() : (streetviewWidth / 2).toFixed();


    initSwipers();


    // User messages (snackbar)

    snackHtml = function(arg) {
        var message = arg.message,
            button = typeof arg.button === 'undefined' ? null : arg.button,
            button_action = typeof arg.button_action === 'undefined' ? null : arg.button_action,
            cancel_button = typeof arg.cancel_button === 'undefined' ? null : arg.cancel_button,
            cancel_button_action = typeof arg.cancel_button_action === 'undefined' ? null : arg.cancel_button_action,
            klass = typeof arg.klass === 'undefined' ? null : arg.klass,
            link = typeof arg.link === 'undefined' ? null:  arg.link,
            icon = typeof arg.icon === 'undefined' ? null:  arg.icon;

        var $e = $('.snack.template').clone().removeClass('template').addClass('active');
        var help_topic = link && link.help ? link.help.topic : null;
        var help_content = link && link.help ? link.help.content : null;

        $e.find('.message').html(message);
        if (klass) $e.find('.snackIcon').addClass(klass);
        if (icon) $e.find('.snackIcon i').html(icon);
        if (button) $e.find('.button.ok_button').html(button);
        if (cancel_button) $e.find('.cancel_button').html(cancel_button);

        if (button && link) {
            $e.find('.button.ok_button').attr({'data-href-page': link.page, 'data-href-pane': link.pane, 'data-help-topic': help_topic, 'data-help-content': help_content});
        }
        if (button && button_action) {
            $e.find('.button').attr('onclick', button_action)
        }
        if (cancel_button && cancel_button_action) {
            $e.find('.cancel_button').attr('onclick', cancel_button_action)
        }
        return $e.html();
    };

    currentSnack = function() {
        return !!$('.snackbar-opened').length
    };

    hideAllSnacks = function() {
        $('.snackbar-opened').removeClass('snackbar-opened')
    };

    snack = function(message, options) {

        if (options && options.timing == 'later') {
            pendingSnack = {message: message, options: options};
            return;
        }

//        console.log('snack called with message: ' + message);

        activeSnackbars += 1;
//        console.log('activeSnackbars now equals: ' + activeSnackbars);
        if (typeof options === 'undefined') options = {};

        if (activeSnackbars > 1 || currentSnack()) {
//            console.log('There are ' + activeSnackbars + ' active snacks including this one. Gonna wait ' + String(2000 * activeSnackbars / 1000));
            wait(2000 * activeSnackbars).then(goOn);
        } else {
//            console.log('There is no current snack. Displaying snack' );
            goOn();
        }

        function goOn() {

//            console.log('arrived to goOn');

            var timeout =  options.timeout || 500000;

            var $snackbar = $.snackbar({
                timeout: timeout,
                htmlAllowed: true,
                content: snackHtml({
                    message: message,
                    button: options.button,
                    button_action: options.button_action,
                    cancel_button: options.cancel_button,
                    cancel_button_action: options.cancel_button_action,
                    klass: options.klass,
                    link: options.link,
                    icon: options.icon
                })
            });

            wait(2000).then(function() {
                activeSnackbars -= 1;
            });
        }

    };

    snackHide = function($downEl) {

//        console.log('snackHide');

        if (typeof $downEl === 'undefined') $downEl = null;

//        if ($downEl) $downEl.css({'position': 'fixed', 'bottom': '0'});

        $('.snackbar.snackbar-opened').snackbar("hide");
    };

    $('body#cambiu').on('click tap', '.snackbar', function() {
//        console.log('snack clicked');
        snackHide()
    });


    // Error Handling

    function errorText(error) {
        if (error) var stack   = error.stack;
        var message = error.toString();
        var text    = stack ? stack : message;
        return {
            message: message,
            text:    text
        };
    }

    logError = function(error) {
        var error_text = errorText(error);
        console.error(error_text.text);
        persistError(error_text.message, error_text.text);
    };

    showError = function(error) {
//        console.log('showError');
        logError(error);
        snack(error);
    };

    warn = function(error) {
        console.warn(error);
    };

    persistError = function(message, text) {
        if (typeof text === 'undefined') var text = '';
        $.ajax({
            type: 'POST',
            url: '/errors',
            data: {'error[message]': message, 'error[text]': text, 'error[search_id]': searchId},
            dataType: 'JSON',
            success: function (data) {
//                console.log('Error successfully updated');
            },
            error: function (data) {
                console.error('There was an error updating the error');
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
//        console.log('addEventListener. e:');
        console.error(e);
         showError(e.error);
         snack(e.error);
    });

    $('.search_section.where input#location').prop("disabled", true);
    $('input#location').attr('placeholder', '');




    // Prevent (or warn against) screen rotation

/*
    if (screen.orientation && screen.orientation.type)   {      // i.e., if screen.orientation is supported
        screen.orientation.lock('portrait')
            .then(function() {console.log('screen.orientation.lock succeeded')})
            .catch(function() {
                console.log('screen.orientation.lock didnt succeed. Calling warnWhenRotated instead');
                warnWhenRotated();
            })
    } else {
        console.log('screen.orientation API isnt supported. Calling warnWhenRotated instead');
        warnWhenRotated()
    }
*/



    function warnWhenRotated() {
        // Find matches
        var mql = window.matchMedia("(orientation: portrait)");

        // If there are matches, we're in portrait
        if(mql.matches) {
            // Portrait orientation
        } else {
            // Landscape orientation
        }

        function keyboardRaised() {
            return $('.is-focused').length
        }

        // Add a media query change listener
        mql.addListener(function(m) {

            if (desktop) return;

            if(m.matches) {             // Changed to portrait
                hideDialog();
            }
            else {                      // Changed to landscape

                if (keyboardRaised()) return;

                showDialog({
                     title:    'Woopsy!',
                     body:     'For best experience, please rotate',
                     default:  '',
                     primary:  ''
                     });
                 }
        });

    }


    $('#input_starttime').pickatime({
        twelvehour: true
    });

    $('.datepicker').pickadate();



});