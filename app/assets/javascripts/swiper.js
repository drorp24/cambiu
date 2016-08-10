initSwipers = function() {

    swiperH = new Swiper ('.swiper-container-h', {
/*
        pagination: '.swiper-pagination',
        paginationType: 'fraction',
*/
        centeredSlides: true,
        spaceBetween: 15,
        slidesPerView: slidesPerView,
        observer: true,
        onSlideChangeStart: slideChange,
        onSlideNextEnd: slideNext,
        onSlidePrevEnd: slidePrev
    });

    initSwiperV();
};

initSwiperV = function() {      // for swiperH, 'observer: true' is enough to make every added slide behave like a swiper; swiperV requires re-initializing
    swiperV = new Swiper ('.swiper-container-v', {
        direction: 'vertical',
        slidesOffsetBefore: 150,
        observer: true,
        observeParents: true,
        freeMode: true
    });
};

slideChange = function() {
//    alert('slide change')
};

slideNext = function() {
    addSlide(currentSlide + initialSlides);
    currentSlide ++;
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