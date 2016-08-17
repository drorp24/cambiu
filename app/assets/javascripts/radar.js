$(function() {

    var $rad = $('#rad'),
        $obj = $('.obj'),
        deg = 0,
        rad = 160.5; //   = 321/2

    $obj.each(function(){
        var data = $(this).data(),
            pos = {X:data.x, Y:data.y},
            getAtan = Math.atan2(pos.X-rad, pos.Y-rad),
            getDeg = ~~(-getAtan/(Math.PI/180) + 180);
        $(this).css({left:pos.X, top:pos.Y}).attr('data-atDeg', getDeg);
    });

    (function rotate() {
        $rad.css({transform: 'rotate('+ deg +'deg)'});
        $('[data-atDeg='+deg+']').stop().fadeTo(1000,1).fadeTo(1000,0.15);

        // LOOP
        setTimeout(function() {
            deg = ++deg%360;
            rotate();
        }, 6);

    })();
});

radarFade = function() {
    $('#radar').fadeTo(5000, 0)
};
