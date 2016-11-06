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
};

progress = function(verb) {
    animation($('.progress'), verb)
};

show = function(verb) {

    if (verb == 'start') {
        radar('start');
        progress('start');
        openning = true;
    } else

    if (verb == 'stop') {
        radar('stop');
        progress('stop');
        openning = false;
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

