// Radar & Progress bar


animation = function($e, verb) {
    if (verb == 'start') {
        $e.removeClass('fadeOut');
        $e.addClass('pulsating');
    } else {
        $e.addClass('fadeOut');
        setTimeout(function() {
            $e.removeClass('pulsating')
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

show = function(verb) {

    if (desktop) return;

    if (verb == 'start') {
        radar('start');
        progress('start', 'below_navbar');
        inShow = true;
    } else

    if (verb == 'stop') {
        radar('stop');
        progress('stop');
        inShow = false;
    }
};

start_show = function() {show('start')};
stop_show = function() {show('stop')};

show_best = function() {
    if (exchanges.length == 0) return;
    $('.ranking').first().addClass('bounce');
};