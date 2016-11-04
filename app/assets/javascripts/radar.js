/*
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
