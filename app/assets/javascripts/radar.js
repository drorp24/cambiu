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

    if (desktop) return;

    if (verb == 'start') {
        radar('start');
//        start_search();  // needs to be when the search really takes place, or else it's a mess
        progress('start', 'below_navbar');
        inShow = true;
    } else

    if (verb == 'stop') {
        radar('stop');
//        stop_search();
        progress('stop');
        inShow = false;
    }
};

start_show = function() {show('start')};
stop_show = function() {show('stop')};

start_search = function() {
    searchSnack('start');
    progress('start', 'above_snack');
};

stop_search = function() {
    searchSnack('stop');
    progress('stop', 'above_snack');
};

show_best = function() {
    $('#best_offer').popover('show');
    var $popover = $('.popover');
    $popover.css('transform', 'initial');
    $popover.css('bottom', cardHeight + 35 + 'px');
    $popover.css('left',(windowWidth - $popover.width())/2 + 'px');
    $popover.addClass('bounce');
};

hide_best = function() {
    $('#best_offer').popover('hide');
};
