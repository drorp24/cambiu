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

    $('#markerLayer div').removeClass('bounce');
    map.data.revertStyle();
    if (directionsDisplay) clearDirections();
    $('.ecard').removeClass('selected');
    map.setZoom(map_initial_zoom);
    highlightCurrentMarker()
};

slideNext = function() {
    var advanceIndex = currentSlide + initialSlides;
    if (advanceIndex < exchanges.length) {
        addSlide(advanceIndex);
    }
    currentSlide ++;
};
slidePrev = function() {
    currentSlide --;
};

addSlide = function(index) {
    if (!slidesAdded.includes(index)) {
        console.log('addSlide ' + index);
        addCard(exchanges[index].properties, index)
    } else {
        console.log('addSlide not needed - slide ' + index + ' already exists');
    }
};

// Card interaction

currIndex = function() {return swiperH.activeIndex};

currCard = function() {return $('.swiper-slide-active')};

currExchange = function() {

    var length = exchanges.length;
    var index = currIndex();

    if (exchanges && length > 0) {
        if (index < length) {
            return exchanges[index].properties
        } else {
            throw new Error('index > exchanges length');
        }
    } else {
        throw new Error('exchanges is empty');
    }
};

