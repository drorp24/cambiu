// Radar & Progress bar


animation = function($e, verb) {
    if (verb == 'start') {
        $e.removeClass('fadeOut').css('display', 'block')
    } else {
        $e.addClass('fadeOut');
        setTimeout(function() {
            $e.find('#pulse3').css('animation-name', 'none');
            $e.find('#pulse4').css('animation-name', 'none');
            $e.css('display', 'none !important')
        }, 5000)
    }
};

radar = function(verb) {
    if (verb == 'remove') {
        $('#newradar').remove()
    } else {
        animation($('#newradar'), verb)
    }
/*
    if (verb == 'start') {
        $('#newradar').css('display', 'none');
        $('#map_container').addClass('scanning')
    } else {
        $('#map_container').removeClass('scanning')
    }
*/
};

progress = function(verb, position) {
    if (typeof position === 'undefined') position = 'above_snack';
    animation($('.progress').addClass(position), verb)
};

searchSnack = function(verb) {

    console.log('mainSnack');

    if (verb == 'start') {
        snack('Scanning for offers...', null, null, $('.swiper-container'))
    } else {
        snackHide($('.swiper-container'))
    }
};


show = function(verb) {

    if (verb == 'start') {
        searchSnack('start');
        radar('start');
        progress('start', 'above_snack');
        inShow = true;
    } else

    if (verb == 'stop') {
        radar('stop');
        progress('stop');
        searchSnack('stop');
        inShow = false;
    }
};

start_show = function() {show('start')};
stop_show = function() {show('stop')};













/*  authentic scanning radar
var radarLoop;

radarScan = function() {

    console.log('radarScan');

    var deg = 0;

    (function rotate() {
        $('#rad').css({transform: 'rotate('+ deg +'deg)'});
        $('.marker[data-atDeg='+deg+']').stop().fadeTo(400,1).fadeTo(1000,0.35);

        // LOOP
        radarLoop = setTimeout(function() {
            deg = ++deg%360;
            rotate();
        }, 10);

    })();
};

radarFade = function() {
    $('#radar').fadeTo(5000, 0)
};

radarStop = function() {
    $('#radar').remove();
    clearTimeout(radarLoop);
    $('.marker').stop().fadeTo(1,1);
};
*/

