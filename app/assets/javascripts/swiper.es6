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

    swiperI = new Swiper ('.swiper-container-i', {
        direction: 'vertical',
        slidesPerView: 1,
        hashnav: true,
        hashnavWatchState: true
    });

    swiperI.on('SlideChangeStart', function() {

        progressBar();
        navigationArrows();
        hashReport();

    });

    swiperI.on('SlideChangeEnd', function() {
        swiperIactiveSlide().hasClass('branch') ? swiperI.lockSwipeToNext() : swiperI.unlockSwipeToNext();
    });





};

progressBar = function() {
    var currIndex = swiperI.activeIndex;
    var fraction = currIndex / 8;
    $('.iformsprogressbar .iprogress .iprogressbar').css('transform', 'scaleX(' + fraction + ')');
};

navigationArrows = function() {
    if (swiperI.isBeginning) {
        $('.iformsprogressbar .navigation').addClass('beginning');
    } else
    if (swiperI.isEnd) {
        $('.iformsprogressbar .navigation').addClass('end');
    } else {
        $('.iformsprogressbar .navigation').removeClass('beginning end');
    }
};

swiperIactiveSlide = () => $('.swiper-container-i .swiper-slide-active');


hashReport = function() {
    var $current_slide = swiperIactiveSlide();
    if ($current_slide) {
        var hash = $current_slide.data('hash');
        if (hash) pageReport('/exchanges/isearch#' + hash);
    }
};

slideChange = function() {

    map.data.revertStyle();
    if (directionsDisplay) clearDirections();
    $('.ecard').removeClass('selected');
    if (desktop) highlightCurrentMarker();
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
    if (!slidesAdded.indexOf(index) > -1) {
        var offer = offers[index].properties;
        addOffer({offer: offer, index: index, page: null, list: false, cards: true});
    } else {
        console.log('addSlide not needed - slide ' + index + ' already exists');
    }
};

// Card interaction

currIndex = function() {return swiperH.activeIndex};

currentCard = function() {return $('.swiper-slide-active')};

disableSwiping = function() {
    $('.swiper-container-h').addClass('swiper-no-swiping');
};

enableSwiping = function() {
    $('.swiper-container-h').removeClass('swiper-no-swiping');
};

$(document).ready(function() {


    //
    // iSearch navigation
    //

    $('.iformsprogressbar .navigation .next').on('click tap', function() {
        let $slide = swiperIactiveSlide();
        if ($slide.hasClass('missing')) {
            snack(t('specifyValue'), {klass: 'oops', timeout: 1500})
        } else
        if ($slide.hasClass('branch')) {
            snack(t('select'), {klass: 'oops', timeout: 1500});
        } else {
            swiperI.slideNext();
        }
    });

    $('.iformsprogressbar .navigation .prev').on('click tap', function() {
        if (!swiperI.isBeginning) window.history.back();
    });

    $('[data-slideto]').on('click tap', function() {
        swiperI.unlockSwipeToNext();
        var $this = $(this);
        var hash = $this.data('slideto');
        console.log('target hash:', hash);
        let $target = $(`.swiper-container-i [data-hash=${hash}]`);
        if ($target.length) {
            console.log('$target: ', $target[0]);
        } else {
            console.error('Error: target not found!');
            return;
        }
        let index = $target.data('index');
        swiperI.slideTo(index);
    });

    $('.swiper-container-i .ok.btn').on('tap click', function(e) {
        e.preventDefault();
        if (!$(this).closest('.swiper-slide').hasClass('missing')) swiperI.slideNext();
    })

});
