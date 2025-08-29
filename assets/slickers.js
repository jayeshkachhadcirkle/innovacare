function newCartRecoSlider(){
  if(document.getElementsByClassName('cart-reco-container-row-main')[0]){
    $(".cart-reco-container-row-main:not(.slick-initialized)").slick({
      autoplay: false,
      centerMode: false,
      slidesToShow: 5,
      slidesToScroll: 2,
      arrows: true,
      dots: false,
      buttons: false,
      responsive: [
        {
          breakpoint: 1200,
          settings: {
            slidesToShow: 4,
          },
        },
        {
          breakpoint: 991,
          settings: {
            slidesToShow: 3,
          },
        },
        {
          breakpoint: 767,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 1,
          },
        },
        {
          breakpoint: 480,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
          },
        },
      ],
    });
  }
  if(document.getElementsByClassName('cart-reco-container-row-drawer')[0]){
    $(".cart-reco-container-row-drawer:not(.slick-initialized)").slick({
      autoplay: false,
      centerMode: false,
      slidesToShow: 2,
      slidesToScroll: 2,
      arrows: true,
      dots: false,
      buttons: false,
      responsive: [
        {
          breakpoint: 1200,
          settings: {
            slidesToShow: 2,
          },
        },
        {
          breakpoint: 991,
          settings: {
            slidesToShow: 2,
          },
        },
        {
          breakpoint: 767,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 1,
          },
        },
        {
          breakpoint: 480,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
          },
        },
      ],
    });
  }
}

function bestSellerSlider(){
  $(".best-seller-slider").slick({
    autoplay: false,
    centerMode: false,
    slidesToShow: 5,
    slidesToScroll: 2,
    arrows: true,
    dots: false,
    buttons: false,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 4,
        },
      },
      {
        breakpoint: 991,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 767,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  });
}

function subscribeSlider(){
  $(".slider-subscribe").slick({
    dots: false,
    infinite: false,
    arrows: false,
    speed: 600,
    slidesToShow: 6,
    slidesToScroll: 3,
    responsive: [
      {
        breakpoint: 1025,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 767,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  });
}

function applySliderToCardReco(){
  $(".cart-reco-container-row:not(.slick-initialized)").slick({
    autoplay: false,
    centerMode: false,
    slidesToShow: 2,
    slidesToScroll: 2,
    arrows: true,
    dots: false,
    buttons: false,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 991,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 767,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  });

  }

function applySliderToCardRecoMain(){
  // console.log(slides)
  $(".cart-reco-container-row:not(.slick-initialized)").slick({
    autoplay: false,
    centerMode: false,
    slidesToShow: 5,
    slidesToScroll: 2,
    arrows: true,
    dots: false,
    buttons: false,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 4,
        },
      },
      {
        breakpoint: 991,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 767,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  });

  }

function productMediaSlider() {

  $('.product-info-wrap').each(function(index, item){
  $(item).find(".prod-slide-row:not(.slick-initialized)").slick({
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    fade: true,
    asNavFor: ".prod-slide-nav",
    autoplay: false,
  });
  $(item).find(".prod-slide-nav:not(.slick-initialized)").slick({
    slidesToShow: 5,
    slidesToScroll: 1,
    arrows: false,
    asNavFor: ".prod-slide-row",
    dots: false,
    centerMode: true,
    focusOnSelect: true,
    infinite: true,
    vertical: true,
    centerPadding: "0px",
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 1025,
        settings: {
          vertical: false,
          slidesToShow: 5,
          arrows: true,
          centerMode: false,
        },
      },
    ],
  });

})
  
}



// initialise fancybox in product media
$(function () {
    var addToAll = true;
    var gallery = true;
    $(addToAll ? '.hg-article-body img' : '.hg-article-body img.fancybox').each(function () {
        if ($(this).parent("a").attr("href") === undefined) {
            var $this = $(this);
            var title = $this.next('.fr-inner').text();
            var src = $this.attr('data-big') || $this.attr('src');
            var a = $('<a href="#" data-fancybox data-caption="' + title + '"></a>').attr('href', src);
            $this.wrap(a);
        }
    });
    if (gallery)
        $('a[data-fancybox]').attr('data-fancybox', 'group');

    Fancybox.bind('[data-fancybox]', {
        Toolbar: {
            display: {
                left: ["infobar"],
                middle: [
                    "zoomIn",
                    "zoomOut",
                    "toggle1to1",
                    "rotateCCW",
                    "rotateCW",
                    "flipX",
                    "flipY",
                ],
                right: ["slideshow", "thumbs", "close"],
            },
        },
    });
});

