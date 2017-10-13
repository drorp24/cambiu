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
        hashnavWatchState: true,
        onlyExternal: true
    });


     swiperI.on('SlideNextStart', function() {
        let can = swiperIgatekeeper();
        can.pass ? swiperI.unlockSwipeToNext() : swiperI.lockSwipeToNext();

    });

    swiperI.on('SlideChangeStart', function() {

        progressBar();
        navigationArrows();
        hashReport();

    });

    swiperI.on('SlideChangeEnd', function() {
        let can = swiperIgatekeeper();
        can.pass ? swiperI.unlockSwipeToNext() : swiperI.lockSwipeToNext();
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

    swiperIactiveSlide = () => $('.swiper-container-i .swiper-slide-active');


    swiperIslideForward = ($e, timing=null) => {

        swiperI.unlockSwipeToNext();
        var hash = $e.data('slideto');
        if (!hash) {console.error('swiperIslideForward: no data-slideto found on element'); return}
        let index = $('[data-hash]').index($(`[data-hash=${hash}]`));
        timing == 'instant' ? swiperI.slideTo(index) : wait(300).then(()=> {swiperI.slideTo(index)});

    };

    $('.swiper-slide.branch [data-slideto]').on('click tap', function() {

        let $this       = $(this);
        let property    = $this.data('property');
        let old_value   = value_of(property);
        let value       = $this.data('value');
//      console.log(`changed ${property} from ${old_value} to ${value}`);


        // set(property...) prepares it for the 'fetchAnd...'' call that follows; But an instant later, its value may be overridden if the result is different than user requested
        // that's why the only way to remember what user originally requested is with the 'user_' fields
        // in fact the property parameter may already not represent what the user requested:
        // e.g., user asks for delivery, systems returns pickup; the next search will get 'pickup' as service_type param though the user requested differently (and it's ok)
        set_change(property, old_value, value);
        set(property, value, 'manual');
        fetchAndPopulateLocaloffers();
        swiperIslideForward($this)

    });

    $('.iformsprogressbar .navigation .next').on('click tap', function() {
        let can = swiperIgatekeeper();
        (can.pass) ? swiperIslideForward(swiperIactiveSlide(), 'instant') : snack(t(can.reason), {klass: 'oops', timeout: 1500})
    });


    $('.swiper-container-i .ok.btn').on('tap click', function(e) {

        e.preventDefault();
        let $slide = $(this).closest('.swiper-slide');
        if (!$slide.hasClass('missing')) {
            swiperIslideForward($slide);
            wait(200).then(() => {$slide.addClass('okayed');});
        }

    });

    $('.iformsprogressbar .navigation .prev').on('click tap', function() {
        if (!swiperI.isBeginning) window.history.back();
    });

    swiperIgatekeeper = function() {

        let $slide = swiperIactiveSlide();
        let pass = false;
        let reason = null;

        if ($slide.hasClass('missing')) {
            reason = 'specifyValue'
        } else
        if ($slide.hasClass('okay_required') && !$slide.hasClass('okayed')) {
            reason = 'okayRequired'
        } else
        if ($slide.hasClass('branch')) {
            reason = 'select'
        } else {
            pass = true
        }

        return {
            pass: pass,
            reason: reason
        }

    };


});
