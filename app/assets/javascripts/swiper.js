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
    var advanceIndex = currentSlide + initialSlides;
    if (advanceIndex < exchanges.length) {
        addSlide(advanceIndex);
    }
    currentSlide ++;
    handleCurrentSlide();
};
slidePrev = function() {
    currentSlide --;
    handleCurrentSlide();
};

function handleCurrentSlide() {
    var exchange_id = currExchange().id;
    console.log('exchange ' + exchange_id + ' - handleCurrentSlide');
    map.data.overrideStyle(map.data.getFeatureById(exchange_id), {icon: '/pricest.png'});
}

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

