$(document).ready(function() {
    mySwiper = new Swiper ('.swiper-container', {
        pagination: '.swiper-pagination',
        paginationType: 'fraction',
        nextButton: '.swiper-button-next',
        prevButton: '.swiper-button-prev',
        centeredSlides: true,
        /*
         freeMode: true,
         freeModeSticky: true,
         */
        spaceBetween: 15,
        slidesPerView: 1.3
//        effect: 'coverflow'
    });
    console.log('initialized Swiper');
});
