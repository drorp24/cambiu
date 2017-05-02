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

    swiperIntro = new Swiper ('.swiper-container-intro', {
        pagination: '.swiper-pagination-intro'
    });

    swiperSearch = new Swiper ('.swiper-container-search', {
        centeredSlides: true,
        slidesPerView: 1,
        pagination: '.swiper-pagination-search'
    });

    swiperTry = new Swiper ('.swiper-container-try', {
     });


};


slideChange = function() {

    map.data.revertStyle();
    if (directionsDisplay) clearDirections();
    $('.ecard').removeClass('selected');
    highlightCurrentMarker();
    prev_distance_from_exchange = null;
};

slideNext = function() {
    var currentIndex = currIndex();
    console.log('slideNext. currentIndex: ' + currentIndex);
    var advanceIndex = currentIndex + resultsPerPage -1;
    if (advanceIndex < offers.length) {
        console.log('adding slide ' + advanceIndex);
        addSlide(advanceIndex);
    }
};
slidePrev = function() {
};

addSlide = function(index) {
    if (!slidesAdded.includes(index)) {
        console.log('addSlide ' + index);
        addOffer(offers[index].properties, index)
    } else {
        console.log('addSlide not needed - slide ' + index + ' already exists');
    }
};

// Card interaction

currIndex = function() {return swiperH.activeIndex};

currentCard = function() {return $('.swiper-slide-active')};
