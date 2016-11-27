initSwipers = function() {

    swiperH = new Swiper ('.swiper-container-h', {
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
    if (directionsDisplay) clearDirections();
    $('.ecard').removeClass('selected');

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
