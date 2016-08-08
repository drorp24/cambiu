initSwipers = function() {
    swiperH = new Swiper ('.swiper-container-h', {
        pagination: '.swiper-pagination',
        paginationType: 'fraction',
        centeredSlides: true,
        spaceBetween: 15,
        slidesPerView: slidesPerView/*,
        onSlideChangeStart: slideChange*/
    });
    swiperV = new Swiper ('.swiper-container-v', {
        direction: 'vertical',
        slidesOffsetBefore: 150,
        freeMode: true
    });

    console.log('initialized Swiper');

};

slideChange = function() {
//    alert('slide change')
};