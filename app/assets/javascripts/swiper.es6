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
        onlyExternal: true
    });


     swiperI.on('SlideNextStart', function() {

        setPage({pane1: 'isearch', hash: swiperIactiveSlide().data('hash')});
        let can = swiperIgatekeeper();
        can.pass ? swiperI.unlockSwipeToNext() : swiperI.lockSwipeToNext();

    });

    swiperI.on('SlideChangeStart', function() {

        progressBar();
        navigationArrows();
        if (swiperIactiveSlide().data('offer') == 'real') {
            set('bias', '');
            set_change('bias', 'default', '');
            fetchAndPopulateLocaloffers();
        }

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
    if (swiperI.isEnd || swiperIactiveSlide().data('slideto') == 'end') {
        $('.iformsprogressbar .navigation').addClass('end');
    } else {
        $('.iformsprogressbar .navigation').removeClass('beginning end');
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


    swiperIslideTo = (hash, timing=null) => {
        let index = $('[data-hash]').index($(`[data-hash=${hash}]`));
        timing == 'delay' ? wait(250).then(()=> {swiperI.slideTo(index)}) : swiperI.slideTo(index);
    };

    swiperIslideForward = ($e, timing=null) => {
        swiperI.unlockSwipeToNext();
        var hash = $e.data('nooffer') && noOffer() ? $e.data('nooffer') : $e.data('slideto');
        if (hash == 'paymentFlow') {
            paymentFlow();
        } else if (hash !== 'end') {
            swiperIslideTo(hash, timing);
        }
    };

    $('.swiper-slide.branch [data-slideto]').on('click tap', function() {

        let $this       = $(this);
        let property    = $this.data('property');
        if (property == 'none') {swiperIslideForward($this); return}
        let old_value   = value_of(property);
        let value       = $this.data('value');

//      console.log(`changed ${property} from ${old_value} to ${value}`);
        set_change(property, old_value, value);
        set(property, value, 'manual');
        if (!($this.is('[data-offer]') && $this.data('offer') == 'none')) {
            fetchAndPopulateLocaloffers()
                .then(() => {swiperIslideForward($this, 'delay')})
                .catch((error) => {console.error(error)})
        } else {
            swiperIslideForward($this)
        }

    });

    $('.iformsprogressbar .navigation .next').on('click tap', function() {
        let can = swiperIgatekeeper();
        (can.pass) ? swiperIslideForward(swiperIactiveSlide()) : snack(t(can.reason), {klass: 'oops', timeout: 1500})
    });


    $('.swiper-container-i .ok.btn').on('tap click', function(e) {

        e.preventDefault();
        let $slide = $(this).closest('.swiper-slide');
        if (!$slide.hasClass('missing')) {
            swiperIslideForward($slide);
            if ($slide.hasClass('okay_required')) wait(200).then(() => {$slide.addClass('okayed');});
        }

    });

    $('.iformsprogressbar .navigation .prev').on('click tap', function() {
        if (!swiperI.isBeginning) window.history.back();
    });

    isFilled = ($slide) => !$slide.find('.invalid, .empty').length;

    lock = ($slide) => {
        $slide.addClass('missing');
        $slide.find('.ok.btn').prop('disabled', true);
        swiperI.lockSwipeToNext();
    };

    unlock = ($slide) => {
        $slide.removeClass('missing');
        $slide.find('.ok.btn').prop('disabled', false);
        swiperI.unlockSwipeToNext();
    };

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
        } else
        if ($slide.data('slideto') && $slide.data('slideto') == 'end') {
            reason = 'end'
        }
        else {
            pass = true
        }

        return {
            pass: pass,
            reason: reason
        }

    };


});
