(function($) {

    "use strict";
    
    const cfg = {
                scrollDuration : 800,
                mailChimpURL   : ''
                };



    const ssPreloader = function() {

        const preloader = document.querySelector('#preloader');
        if (!preloader) return;

        document.querySelector('html').classList.add('ss-preload');
        
        window.addEventListener('load', function() {
            
            document.querySelector('html').classList.remove('ss-preload');
            document.querySelector('html').classList.add('ss-loaded');

            preloader.addEventListener('transitionend', function(e) {
                if (e.target.matches("#preloader")) {
                    this.style.display = 'none';
                }
            });
        });


    };


    const ssMobileMenu = function() {

        const $navWrap = $('.s-header__nav-wrap');
        const $closeNavWrap = $navWrap.find('.s-header__overlay-close');
        const $menuToggle = $('.s-header__toggle-menu');
        const $siteBody = $('body');
        
        $menuToggle.on('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            $siteBody.addClass('nav-wrap-is-visible');
        });

        $closeNavWrap.on('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
        
            if($siteBody.hasClass('nav-wrap-is-visible')) {
                $siteBody.removeClass('nav-wrap-is-visible');
            }
        });

        $('.s-header__nav .has-children').children('a').on('click', function (e) {
            e.preventDefault();

            if ($(".close-mobile-menu").is(":visible") == true) {

                $(this).toggleClass('sub-menu-is-open')
                    .next('ul')
                    .slideToggle(200)
                    .end()
                    .parent('.has-children')
                    .siblings('.has-children')
                    .children('a')
                    .removeClass('sub-menu-is-open')
                    .next('ul')
                    .slideUp(200);

            }
        });

    };


    const ssSearch = function() {

        const searchWrap = document.querySelector('.s-header__search');
        const searchTrigger = document.querySelector('.s-header__search-trigger');

        if (!(searchWrap && searchTrigger)) return;

        const searchField = searchWrap.querySelector('.s-header__search-field');
        const closeSearch = searchWrap.querySelector('.s-header__overlay-close');
        const siteBody = document.querySelector('body');

        searchTrigger.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            siteBody.classList.add('search-is-visible');
            setTimeout(function(){
                searchWrap.querySelector('.s-header__search-field').focus();
            }, 100);
        });

        closeSearch.addEventListener('click', function(e) {
            e.stopPropagation();

            if(siteBody.classList.contains('search-is-visible')) {
                siteBody.classList.remove('search-is-visible');
                setTimeout(function(){
                    searchWrap.querySelector('.s-header__search-field').blur();
                }, 100);
            }
        });

        searchWrap.addEventListener('click', function(e) {
            if( !(e.target.matches('.s-header__search-inner')) ) {
                closeSearch.dispatchEvent(new Event('click'));
            }
        });

        searchField.addEventListener('click', function(e) {
            e.stopPropagation();
        })

        searchField.setAttribute('placeholder', 'Search for...');
        searchField.setAttribute('autocomplete', 'off');

    };


    const ssMasonry = function() {
        const containerBricks = document.querySelector('.bricks-wrapper');
        if (!containerBricks) return;

        imagesLoaded(containerBricks, function() {

            const msnry = new Masonry(containerBricks, {
                itemSelector: '.entry',
                columnWidth: '.grid-sizer',
                percentPosition: true,
                resize: true
            });

        });

    };


    const ssSlickSlider = function() {

        const $animateEl = $('.animate-this');
        const $heroSlider = $('.s-hero__slider');

        $heroSlider.on('init', function(event, slick){
            setTimeout(function() {
                $animateEl.first().addClass('animated');
            }, 500);
        });

        $heroSlider.slick({
            arrows: false,
            dots: true,
            speed: 1000,
            fade: true,
            cssEase: 'linear',
            autoplay: false,
            autoplaySpeed: 5000,
            pauseOnHover: false
        });

        $heroSlider.on('beforeChange', function(event, slick, currentSlide){
            $animateEl.removeClass('animated');
        });    
        $heroSlider.on('afterChange', function(event, slick, currentSlide){
            $animateEl.addClass('animated');
        });

        $('.s-hero__arrow-prev').on('click', function() {
            $heroSlider.slick('slickPrev');
        });

        $('.s-hero__arrow-next').on('click', function() {
            $heroSlider.slick('slickNext');
        });

    };


    const ssAOS = function() {
        
        AOS.init( {
            offset: 100,
            duration: 800,
            easing: 'ease-in-out',
            delay: 400,
            once: true,
            disable: 'mobile'
        });

    };


    const ssAlertBoxes = function() {

        const boxes = document.querySelectorAll('.alert-box');

        boxes.forEach(function(box) {

            box.addEventListener('click', function(e){
                if (e.target.matches(".alert-box__close")) {
                    e.stopPropagation();
                    e.target.parentElement.classList.add("hideit");

                    setTimeout(function() {
                        box.style.display = "none";
                    }, 500)
                }    
            });

        })

    };


    const ssSmoothScroll = function() {
        
        $('.smoothscroll').on('click', function (e) {
            const target = this.hash;
            const $target = $(target);
            
            e.preventDefault();
            e.stopPropagation();

            $('html, body').stop().animate({
                'scrollTop': $target.offset().top
            }, cfg.scrollDuration, 'swing').promise().done(function () {
                window.location.hash = target;
            });
        });

    };


    const ssBackToTop = function() {

        const pxShow = 900;
        const goTopButton = document.querySelector(".ss-go-top");

        if (!goTopButton) return;

        if (window.scrollY >= pxShow) goTopButton.classList.add("link-is-visible");

        window.addEventListener('scroll', function() {
            if (window.scrollY >= pxShow) {
                if(!goTopButton.classList.contains('link-is-visible')) goTopButton.classList.add("link-is-visible")
            } else {
                goTopButton.classList.remove("link-is-visible")
            }
        });

    };



    (function ssInit() {

        ssPreloader();
        ssMobileMenu();
        ssSearch();
        ssMasonry();
        ssSlickSlider();
        ssAOS();
        ssAlertBoxes();
        ssSmoothScroll();
        ssBackToTop();

    })();

})(jQuery);