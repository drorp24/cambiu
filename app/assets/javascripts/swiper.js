initSwipers = function() {
    swiperH = new Swiper ('.swiper-container-h', {
        /*
         pagination: '.swiper-pagination',
         paginationType: 'fraction',
         nextButton: '.swiper-button-next',
         prevButton: '.swiper-button-prev',
         */

        centeredSlides: true,
        spaceBetween: 15,
        slidesPerView: 1.3
/*
        onSlideChangeStart: function () {
            alert('H slide change start');
        }
*/
    });
    swiperV = new Swiper ('.swiper-container-v', {
        direction: 'vertical',
        slidesOffsetBefore: 150,
        freeMode: true
/*
        onSlideChangeStart: function () {
            alert('V slide change start');
        }
*/
    });

    console.log('initialized Swiper');

};
/*
$('.swiper-container-h').bind('touchstart mousedown', function(e){
    alert('touchstart detected')
    preventDefault();
});*/
