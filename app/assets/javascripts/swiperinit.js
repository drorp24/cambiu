$(document).ready(function() {
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
     });
    swiperV = new Swiper ('.swiper-container-v', {
        direction: 'vertical',
        slidesOffsetBefore: 150,
        freeMode: true,
        nextButton: '.swiper-button-next-v'//        nested: true
    });

    console.log('initialized Swiper');
});
