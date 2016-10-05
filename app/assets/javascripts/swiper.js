initSwipers = function() {

    swiperH = new Swiper ('.swiper-container-h', {
/*
        pagination: '.swiper-pagination',
        paginationType: 'fraction',
*/
        centeredSlides: true,
        spaceBetween: 10,
        slidesPerView: slidesPerView,
        observer: true,
        onSlideChangeStart: slideChange,
        onSlideNextEnd: slideNext,
        onSlidePrevEnd: slidePrev
    });

};


slideChange = function() {
    if (directionsDisplay) directionsDisplay.setMap(null)
};

slideNext = function() {
    var index = currentSlide + initialSlides;
    if (index < exchanges.length) {
        addSlide(index);
        currentSlide ++;
    }
};
slidePrev = function() {
    currentSlide --;
};

addSlide = function(index) {
    if (!slidesAdded.includes(index)) {
        console.log('addSlide ' + index);
        addCard(exchanges, index)
    } else {
        console.log('addSlide not needed - slide ' + index + ' exists already');
    }
};