let template = document.getElementsByClassName('template-name-display')[0].getAttribute('template')
let popper = document.getElementsByClassName("products-preview")[0];
let popDiv = document.getElementsByClassName("products-pop")[0];
let wishWrapper = document.getElementsByClassName('wishlister')[0]
let mediaPopper = document.getElementsByClassName("products-med-preview")[0];
let mediaPopDiv = document.getElementsByClassName("products-med-pop")[0];
let toggle_cart = document.getElementById("mini-cart");
let cart_bt = document.getElementById("cart_bt");
let cart_btn = document.getElementsByClassName("cart-btn")[0].getElementsByTagName('img')[0];
let cart_close = document.getElementById("cart_colse_icon");
let cart_overlay = document.querySelector("#cart_overlay");
// localStorage.setItem('sChargeEnabled', true)
let shippingChargeVarId = toggle_cart.dataset.shippingChargePro;
let cdspinner = document.getElementsByClassName('spin-wrapper-dr')[0]


//  ============================= Custom Element Quantity manager start =======================
class MyQtyManager extends HTMLElement {
  constructor() {
    super();
    this._isBound = false;
  }
  connectedCallback() {
    if (this._isBound) return;
    this._isBound = true;
    let minusBtn = this.querySelector('[name="minus"]');
    let plusBtn = this.querySelector('[name="plus"]');
    let removeBtn = this.querySelector('.remove-btn');
    let inputField = this.querySelector('.item-quantity');
    let varId = this.getAttribute('variant');
    let itemKey = this.getAttribute('item-key');
    let errDiv = this.querySelector(".qty-error");
    let isBundle = this.getElementsByClassName('qtyAdjust')[0].getAttribute('bundled')
    let bundleId = this.getElementsByClassName('qtyAdjust')[0].getAttribute('bundleId')

    this.addEventListener('click', (e) => {
      e.preventDefault(e);
      if (e.target === minusBtn) {
        let currentQty = parseInt(inputField.value);
        if (currentQty > 1) {
          inputField.value = currentQty - 1;
          this.dispatchEvent(new CustomEvent('qty-changed', { detail: { qty: currentQty - 1 } }));
        }
      } else if (e.target === plusBtn) {
        let currentQty = parseInt(inputField.value);
        inputField.value = currentQty + 1;
        this.dispatchEvent(new CustomEvent('qty-changed', { detail: { qty: currentQty + 1 } }));
      } else if (e.target === removeBtn) {
        console.log("Remove clicked");
        this.dispatchEvent(new CustomEvent('qty-changed', { detail: { qty: 0 } }));
        inputField.value = 0;
      }
    });

    this.addEventListener('qty-changed', (e) => {
      let newQty = e.detail.qty;
      if (isBundle) {
        bundleQtyUpdate(bundleId, newQty)
      } else {
        changeCartItemNew(itemKey, newQty, errDiv);
      }
      if (varId == shippingChargeVarId) {
        localStorage.setItem('sChargeManual', false)
      }
      newQty == 0 ? recommendationFetch() : null;
    })

  }
}
customElements.define("cart-qty-manager", MyQtyManager);
// ============================= Custom Element Quantity manager end =======================  

//  ================== Document Listener ===================================

document.body.addEventListener('click', function (e) {
  let targetElement = e.target;
  if (targetElement.parentElement.matches('.viewer-eye')) {
    openProductPopUp(targetElement.parentElement)
  }
  else if (targetElement.matches('.empty-cart-bt')) {
    e.preventDefault();
    console.log("cart empty call");
    document.getElementById("mini_cart_main").innerHTML = `<div class="spin-wrapper spinner demo3"></div>`
    fetch(window.Shopify.routes.root + 'cart/clear')
      .then(response => response.text())
      .then(data => {
        // localStorage.setItem('sChargeManual', true)
        updateCartDrawer();
        return data
      });
  }
  else if (targetElement.matches('.checkout-bt-dr')) {
    let allSubs = targetElement.getAttribute('all-subs')
    let allDiscounted = targetElement.getAttribute('alldiscounted')
    localStorage.setItem("checkout-clicked", true);
    if (allSubs == "false") {
      e.preventDefault();
      document.getElementsByClassName('popup-subscribe-confirmation')[0].style.display = 'block';
    }
  }
  else if (targetElement.matches('.pro-cart')) {
    let var_id = targetElement.getAttribute('variant')
    targetElement.closest('.product-widget').getElementsByClassName('card-variant-id')[0].value = var_id;
    let formEl = targetElement.getElementsByTagName('form')[0]
    // document.getElementById("mini_cart_main").innerHTML = `<div class="spin-wrapper spinner demo3"></div>`
    sendItemToCart(var_id, 1, formEl, "")
  }
  // product page plus minus
  else if (targetElement.matches('.AddToCart')) {
    addToCartBtn(targetElement.parentElement)
  }
  else if (targetElement.matches('.minus')) {
    console.log('minus doc')
    let qtyGet = parseInt(targetElement.parentElement.getElementsByClassName('item-quantity')[0].value)
    qtyGet--
    qtyGet = qtyGet < 1 ? 1 : qtyGet;
    targetElement.parentElement.getElementsByClassName('item-quantity')[0].value = qtyGet;
  }
  else if (targetElement.matches('.plus')) {
    let qtyGet = parseInt(targetElement.parentElement.getElementsByClassName('item-quantity')[0].value)
    qtyGet++
    targetElement.parentElement.getElementsByClassName('item-quantity')[0].value = qtyGet;
  }
  else if (targetElement.parentElement.matches('.cart-btn')) {
    toggle_cart.classList.add("active");
    setTimeout(function () {
      console.log("reaching update Time");
      updateCartDrawer();
    }, 100)
  }
  else if (targetElement.matches('.cart_colse_icon')) {
    toggle_cart.classList.remove("active");
  }
  else if (targetElement.matches('.overlay')) {
    toggle_cart.classList.remove("active");
  }
  else if (targetElement.matches('.pro-pop-close')) {
    popper.classList.remove('active');
    setTimeout(() => {
      popper.classList.add('hidden');
    }, 300);
  }
  else if (targetElement.matches('.products-med-preview')) {
    mediaPopper.style.display = 'none';
  }
  else if (targetElement.matches('.pro-med-pop-close')) {
    mediaPopper.style.display = 'none';
  }
  else if (targetElement.matches('.tilli')) {
    let allVars = Array.from(targetElement.parentElement.getElementsByClassName('tilli'))
    let proWidget = targetElement.closest('.product-widget')
    allVars.forEach(function (v) {
      v.style.border = "none"
    })
    targetElement.style.border = "1px solid black"
    targetElement.parentElement.setAttribute("selected", targetElement.id)

    let allOption = Array.from(targetElement.parentElement.parentElement.getElementsByClassName('option-parent'))
    let jsonData = JSON.parse(proWidget.getElementsByClassName('card-var-json')[0].innerText)
    applyVariantCheck(proWidget, jsonData, ".option-parent", ".tilli")
    let title = "";
    allOption.forEach(function (o) {
      title = title + " / " + o.getAttribute('selected')
    })
    let title2 = title.replace(' / ', '')
    let selectedVariant = jsonData.filter(function (item) {
      return item.title == title2
    })[0]
    console.log(selectedVariant)
    let proCart = proWidget.getElementsByClassName('pro-cart')[0];
    proWidget.getElementsByClassName('selected-pro')[0].checked = false;
    let mainImage = targetElement.closest('.product-widget-top').getElementsByClassName('product-media')[0].getAttribute('first-image')
    if (selectedVariant != undefined) {
      proWidget.getElementsByClassName('var-price')[0].style.display = "block";
      proWidget.getElementsByClassName('var-price')[0].innerText = Shopify.formatMoney(selectedVariant.price) + " " + Shopify.currency.active;
      if (selectedVariant.featured_image != null) {
        proWidget.querySelector('.product-media img').setAttribute('src', selectedVariant.featured_image.src);
      } else {
        proWidget.querySelector('.product-media img').setAttribute('src', mainImage);
      }
      if (selectedVariant.available) {
        proCart.style.display = "block";
        proCart.removeAttribute('disabled');
        proCart.setAttribute('available', '1');
        if (proWidget.closest("#recommendor")) { proWidget.getElementsByClassName('selected-pro')[0].style.display = "block"; }
        proCart.setAttribute('variant', selectedVariant.id)
      } else {
        proCart.style.display = "none";
        proCart.setAttribute('disabled', 'disabled');
        proCart.setAttribute('available', '0');
        proWidget.getElementsByClassName('selected-pro')[0].style.display = "none";
      }
    } else {
      proCart.style.display = "none";
      proCart.setAttribute('disabled', 'disabled');
      proCart.setAttribute('available', '0');
      proWidget.getElementsByClassName('selected-pro')[0].style.display = "none";
      proWidget.getElementsByClassName('var-price')[0].style.display = "none";
      console.log("Not Listed")
    }
  }

  else if (targetElement.matches('#reco_submit')) {
    let recoGrid = targetElement.closest('.buy-it-section')
    let pros = Array.from(recoGrid.getElementsByClassName('product-widget'));
    let defaultBundle = recoGrid.getElementsByClassName('product-row')[0].getAttribute('bundledpro')
    let bundleId = recoGrid.getElementsByClassName('product-row')[0].getAttribute('bundleId')
    recoGrid.getElementsByClassName('product-row')[0].setAttribute('bundleId', (parseInt(bundleId) + 1))
    // console.log("BundleId: ", bundleId);
    let products = [];
    pros.forEach(function (i, index) {
      let check = i.getElementsByClassName('selected-pro')[0]
      let perId = i.getElementsByClassName('pro-cart')[0].getAttribute('variant')
      if (check.checked && i.getElementsByClassName('pro-cart')[0].getAttribute('disabled') != "disabled") {
        console.log(perId);
        products.unshift(perId);
      } else {
        console.log("Else Checked");
      }
    })

    let items = []
    products.forEach(function (i) {
      console.log(i);
      let obj = {
        'quantity': 1,
        'id': i,
        'properties': {
          '_isRecommended': true,
          '_bundleId': bundleId
        }
      }
      items.push(obj)
    })
    console.log(items);
    addMultiplePros(items)
    // cart_btn.click();
  }
  // recommendation grid checkboxes
  else if (targetElement.matches('.selected-pro')) {
    console.log('bundle slect', targetElement.checked);
    let recoGrid = targetElement.closest('.buy-it-section')
    let pros = Array.from(recoGrid.getElementsByClassName('product-widget'));
    let buttonReco = document.getElementById('reco_submit');
    let setPrice = 0;
    pros.forEach(function (i, index) {
      let check = i.getElementsByClassName('selected-pro')[0]
      let perId = i.getElementsByClassName('pro-cart')[0].getAttribute('variant')
      let availability = parseInt(i.getElementsByClassName('pro-cart')[0].getAttribute('available'))
      let price = i.getElementsByClassName('var-price')[0].innerText
      let price2 = price.replace('$', '')
      let price3 = price2.replace('USD', '')
      let priceClean = parseFloat(price3.trim())
      if (check.checked && availability) {
        console.log(perId, " price: ", priceClean);
        setPrice += priceClean
        console.log("Total : ", setPrice.toFixed(2));
        buttonReco.innerText = "BUY NOW @ " + setPrice.toFixed(2)
      } else {
      }
    })
    if (setPrice > 0) {
      buttonReco.parentElement.style.display = 'block'
    } else {
      buttonReco.parentElement.style.display = 'none'
    }

  }
  else {
    // console.log("click else")
    // console.log(targetElement);
  }
})

function bundleQtyUpdate(bundleId, upQty) {
  let allRow = Array.from(document.getElementsByClassName("all-items-cart"))
  let ups = {};
  allRow.forEach(function (i) {
    console.log(i);
    let iBundleId = i.getElementsByClassName('qtyAdjust')[0].getAttribute('bundleId')
    if (i.getElementsByClassName('qtyAdjust')[0].getAttribute('bundled') && iBundleId == bundleId) {
      i.getElementsByClassName('item-quantity')[0].value = upQty;
      let upKey = i.getElementsByClassName('item-quantity')[0].getAttribute('item-key')
      ups[upKey] = parseInt(upQty)
      if (upQty == 0) {
        i.style.display = 'none';
      }
    }
  })
  console.log(ups);
  callForUpdate(ups)
}


// add multiple products to cart provide array of objects
function addMultiplePros(Array) {
  let formData = {
    'items': Array,
    'sections': 'cart-drawer,header,main-cart'
  };
  fetch(window.Shopify.routes.root + 'cart/add.js', {
    method: 'POST',
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData)
  })
    .then(response => {
      return response.json();
    }).then(data => {
      cartUpdateOnTheGo(data)
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}

function cartUpdateOnTheGo(JSONdata) {
  console.log("Data Given To me ", JSONdata)
  if (template != 'cart') {
    toggle_cart.classList.add("active");
  } else {
    console.log("Template Cart")
    let mainCartHtml = new DOMParser().parseFromString(JSONdata.sections['main-cart'], "text/html");
    document.getElementsByClassName('cart-tabl-section')[0].innerHTML = mainCartHtml.getElementsByClassName('cart-tabl-section')[0].innerHTML
  }
  let cartDrawerSec = JSONdata.sections['cart-drawer'];
  let html = new DOMParser().parseFromString(cartDrawerSec, "text/html");
  document.getElementById("mini_cart_main").innerHTML = html.getElementById("mini_cart_main").innerHTML;
  console.log('cart-drawer ele replace on the go')
  setTimeout(function () {
    addComplementaryProduct()
  }, 200)
  performRecommendationsOnCart();
  Array.from(document.getElementsByClassName("free-shipping-limit")).forEach(function (i) {
    i.innerHTML = html.getElementsByClassName("free-shipping-limit")[0].innerHTML;
  })
  let headerSec = JSONdata.sections['header'];
  let htmlHeader = new DOMParser().parseFromString(headerSec, "text/html");
  document.getElementById("cart_bt").innerHTML = htmlHeader.getElementById("cart_bt").innerHTML;
}

$(document).ready(function () {
  /********* START On scroll heder Sticky *********/
  $(window).scroll(function () {
    var scroll = $(window).scrollTop();
    if (scroll >= 150) {
      $("header").addClass("head-sticky");
    } else {
      $("header").removeClass("head-sticky");
    }
  });
  /*********  Header Search Popup Mobile ********/
  $(".searchlink").click(function (e) {
    e.preventDefault();
    $(".search-form").toggleClass("active");
    $(".overlay-custome").toggleClass("active");
    $("body,html").toggleClass("scrollno");
    $(".search-form").toggle();
    $("#textbox").focus();
  });
  $(".overlay-custome").click(function (e) {
    e.preventDefault();
    $(".search-form").removeClass("active");
    $(".overlay-custome").removeClass("active");
    $("body,html").removeClass("scrollno");
  });
  /*********  Header Search Popup Mobile ********/

  $(document.body).on("click", ".set > .set-title", function () {
    const $this = $(this);

    if ($this.hasClass("active")) {
      $this.removeClass("active");
      $this.siblings(".content").slideUp(200);
    } else {
      $(".set > .set-title.active").removeClass("active").siblings(".content").slideUp(200);
      $this.addClass("active");
      $this.siblings(".content").slideDown(200);
    }
  });


  /********* START MOBILE MENU ********/
  $(".hamburger").click(function (k) {
    k.preventDefault();
    $(this).toggleClass("is-active");
    $(".mega-menu").toggleClass("is-open");
    $("body,html").toggleClass("scrollno");
    var headerheight = $("header").height();
    $(".mega-menu ").css("top", headerheight);
    $(".mega-menu").css({ height: `calc(100% - ${headerheight}px)` });
  });
  //* tab js start here
  $(".filter-btn").click(function () {
    $(".skin-filter").addClass("is-open");
    $(".skin-filter-overlay").addClass("is-open");
  });
  $(".skin-filter-overlay").click(function () {
    $(".skin-filter").removeClass("is-open");
    $(".skin-filter-overlay").removeClass("is-open");
  });
  $(".mega-menu-category-block ul li").click(function () {
    var tab_id = $(this).attr("data-tab");

    $(".mega-menu-category-block ul li").removeClass("current");
    $(".mega-menu-tabs").removeClass("current");

    $(this).addClass("current");
    $("#" + tab_id).addClass("current");
  });
  //* tab js end here
  /*********  Quntity  *********/

  /*********Best seller slider *********/

  bestSellerSlider();

  subscribeSlider();
  /*Start slider product details js end here*/
  productMediaSlider();
  /*End slider product details js end here*/
  /********* Mobile Menu strat********/
  $(".mobile-menu").click(function (e) {
    e.preventDefault();
    $(".mobile-menu-button").toggleClass("on");
    $(".mobile-navbar").toggleClass("active");
    $("header").toggleClass("menu-active");
    $("body").toggleClass("no-scroll");
    $(".overlay-custome").toggleClass("active");
  });
  $(".close-menu").click(function (e) {
    e.preventDefault();
    $(".mobile-menu-button").removeClass("on");
    $(".mobile-navbar").removeClass("active");
    $("header").removeClass("menu-active");
    $("body").removeClass("no-scroll");
    $("body,html").removeClass("scrollno");
    $(".overlay-custome").removeClass("active");
  });
  $(".overlay-custome").click(function (e) {
    e.preventDefault();
    $(".mobile-menu-button").removeClass("on");
    $(".mobile-navbar").removeClass("active");
    $("header").removeClass("menu-active");
    $("body").removeClass("no-scroll");
  });
  /********* Mobile Menu end********/
  // ==========================================================================
  //  Multi-level accordion nav
  // ==========================================================================
  $(".acnav__label").click(function () {
    var label = $(this);
    var parent = label.parent(".has-children");
    var list = label.siblings(".acnav__list");
    if (parent.hasClass("is-open")) {
      list.slideUp("fast");
      parent.removeClass("is-open");
    } else {
      list.slideDown("fast");
      parent.addClass("is-open");
    }
  });
});

$(window).on("load resize orientationchange", function () {
  /*********START FOOTER SPACE *********/
  $("footer").css("height", "auto");
  var e = $("footer").outerHeight();
  $("body").css("padding-bottom", e), $("footer").css("height", e);
});

// update cart drawer body HTML element replace

async function cartCallHtml() {
  let cartCall = await fetch(window.Shopify.routes.root + "?section_id=cart-drawer")
  let cartHtml = await cartCall.text();
  return cartHtml;
}

async function updateCartDrawer(cartData = null) {
  // console.log("Data given to me for offline cart update: ", cartData);
  document.getElementById("mini_cart_main").innerHTML = `<div class="spin-wrapper spinner demo3"></div>`;
  let pDoc;
  if (!cartData) {
    cartData = await cartCallHtml(); // no "let" here
    pDoc = new DOMParser().parseFromString(cartData, "text/html");
  } else {
    pDoc = new DOMParser().parseFromString(cartData['sections']['cart-drawer'], "text/html");
  }


  document.getElementById("mini_cart_main").innerHTML =
    pDoc.getElementById("mini_cart_main").innerHTML;


  addComplementaryProduct();
  performRecommendationsOnCart();
  Array.from(document.getElementsByClassName("free-shipping-limit")).forEach(function (i) {
    i.innerHTML = pDoc.getElementsByClassName("free-shipping-limit")[0].innerHTML;
  });

  if (document.getElementsByClassName('container-cart')[0]) {
    replaceCartBody();
  }
  if (localStorage.getItem("subscribe-toggle") === "true") {
    document.querySelector("#subscribe-toggle").checked = true;
  }

  setTimeout(function () {

    let cart_total = parseInt(pDoc.getElementById('cart-subtotal-dr').dataset.total);
    console.log("HEYYEYYEYYYE", cart_total);
    let manuallyOn = localStorage.getItem("subscribe-toggle")
    if (cart_total > 100000 || (manuallyOn === "true")) {
      document.getElementsByClassName('subscribe-options')[0].style.display = 'flex';
    } else {
      document.getElementsByClassName('subscribe-options')[0].style.display = 'none';
    }

  }, 200)
}

function updateMainCartTable() {
  let cartTable = document.getElementsByClassName("cart-tabl-body")[0]
  if (cartTable) {
    cartTable.innerHTML = `<div class="spin-wrapper spinner demo3"></div>`
    fetch("/cart")
      .then((res) => res.text())
      .then((data) => {
        let doc = new DOMParser().parseFromString(data, "text/html");
        console.log(doc);
        cartTable.innerHTML = doc.getElementsByClassName("cart-tabl-body")[0].innerHTML;
      })
  }
}

function replaceCartBody() {
  document.querySelector('.container-cart').innerHTML = `<div class="spin-wrapper spinner demo3"></div>`
  fetch(window.Shopify.routes.root + "cart")
    .then((res) => res.text())
    .then((data) => {
      let doc = new DOMParser().parseFromString(data, "text/html");
      document.querySelector('.container-cart').innerHTML = doc.querySelector('.container-cart').innerHTML;
      document.querySelector('#cart_bt').innerHTML = doc.querySelector('#cart_bt').innerHTML;
      performRecommendationsOnCart();
    });
}
// ============================ Main Cart End ========================================

// ========================== Recommendation ============================
function recommendationFetch() {
  const handleIntersection = (entries, observer) => {
    if (!entries[0].isIntersecting) return;
    observer.unobserve(productRecommendationsSection);
    const url = productRecommendationsSection.dataset.url;
    performRecommendationsOnCart()
  };
  const productRecommendationsSection = document.querySelector('.product-recommendations-carter');
  const observer = new IntersectionObserver(handleIntersection, { rootMargin: '0px 0px 0px 0px' });
  observer.observe(productRecommendationsSection);
}

function performRecommendationsOnCart() {
  // let recommendor = document.getElementsByClassName('cart-reco-container')[0]
  let recommendors = Array.from(document.getElementsByClassName('cart-reco-container'))
  recommendors.forEach(function (recommendor) {

    let productRecommendationsSection = recommendor.querySelector('.product-recommendations-carter');
    let mode = recommendor.getAttribute('mode');
    if (mode == "lastadded") {
      let url = productRecommendationsSection.dataset.url;
      productRecommendationsSection.innerHTML = `<div class="spin-wrapper spinner demo3"></div>`
      fetch(url)
        .then(response => response.text())
        .then(text => {
          // console.log(text);
          let html = document.createElement('div');
          html.innerHTML = text;
          let recommendations = html.querySelector('.product-recommendations-carter');
          if (recommendations && recommendations.innerHTML.trim().length) {
            productRecommendationsSection.innerHTML = recommendations.innerHTML;
          }
          let counts = parseInt(recommendor.getElementsByClassName('cart-reco-container-row')[0].getAttribute('reco-count'))
          if (counts > 3) {
            setTimeout(function () {
              newCartRecoSlider();
            }, 200)
          }
        })
        .catch(e => {
          console.error(e);
        });
    } else {
      setTimeout(function () {
        newCartRecoSlider();
      }, 200)
    }
  })
}

// =============================== reco end ========================

// new function merged

async function cartChangeCall(id, qty) {
  let response = await fetch('/cart/change.js', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id: id,
      quantity: parseInt(qty),
      sections: "cart-drawer,header,main-cart"
    })
  })
  return await response.json();
}

async function changeCartItemNew(varId, newQty, errorDiv) {
  let data = await cartChangeCall(varId, newQty)
  console.log(data);
  if (data['message']) {
    errorDiv.innerText = data['message'];
    console.log("Error On Change: ", data['message']);
  }
  else {
    updateCartStatus(data)
    // updateCartDrawer();
  }
  if (data["item_count"] == 0) {
    updateCartDrawer(data);
    // localStorage.setItem('sChargeManual', true)
  }
  if (newQty == 0) {
    updateCartDrawer(data)
    addComplementaryProduct()
  }
  // console.log("cart lenth", data['items'].length);
  // console.log("Id at 0", data['items'][0]['id']);
  if (data['items'].length == 1) {
    if (data['items'][0]['id'] == shippingChargeVarId) {
      await cartChangeCall(shippingChargeVarId, 0)
    }
  }
  updateFreeShippingBar(data)
}

function updateFreeShippingBar(cartData) {
  let cdSectionHtml = cartData.sections['cart-drawer'];
  let doc = new DOMParser().parseFromString(cdSectionHtml, "text/html");
  Array.from(document.getElementsByClassName("free-shipping-limit")).forEach(function (i) {
    i.innerHTML = doc.getElementsByClassName("free-shipping-limit")[0].innerHTML;
  })
}

//Predictive Search Call Function

async function setPredictiveSearch(term, limit, scope) {
  const url =
    "/search/suggest?q=" +
    term +
    "&section_id=predictive-search" +
    "&resources[limit]=" +
    limit +
    "&resources[limit_scope]=" +
    scope;
  try {
    document.getElementsByClassName("mini-search")[0].style.display = "block";
    document.getElementsByClassName("mini-search")[0].innerHTML = `<div class="spin-wrapper spinner demo3"></div>`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const data = await response.text();
    //   console.log(data);
    let parser = new DOMParser();
    let doc = parser.parseFromString(data, "text/html");
    // console.log(doc);
    document.getElementsByClassName("mini-search")[0].innerHTML =
      doc.getElementById("predictive-search-results").innerHTML;
    return true;
  } catch (error) {
    console.error(error.message);
  }
}

// Main Search Popup start

let timer;
const searchInput = document.querySelector(".search__input");
let searchPopUpCon = document.getElementById("limiter")
searchInput.addEventListener("input", function (event) {
  // console.log(event.target.value)
  document.getElementsByClassName("mini-search")[0].innerHTML = "";
  let sInput = event.target.value.trim();
  if (sInput.length > 0) {
    let searchPopup = (document.getElementsByClassName(
      "mini-search"
    )[0].style.display = "block");
    clearTimeout(timer);
    let limit = parseInt(
      searchPopUpCon.getAttribute("limit")
    );
    let limit_scope = searchPopUpCon.getAttribute("scope");
    timer = setTimeout(function () {
      setPredictiveSearch(event.target.value, limit, limit_scope);
    }, 700);
  } else {
    let searchPopup = (document.getElementsByClassName(
      "mini-search"
    )[0].style.display = "none");
  }
});
// hide search pop up on click of out side of it.
document.body.addEventListener('click', function (event) {
  if (searchPopUpCon.contains(event.target)) {
  } else {
    document.getElementsByClassName("mini-search")[0].style.display = "none";
  }
});


// Main Search Popup End

// ================================== mobile search popup start

const mobile_search = document.getElementsByClassName("search-mobile")[0];
let timer2;
mobile_search.addEventListener("input", function (event) {
  document.getElementsByClassName("mini-search")[0].innerHTML = "";
  let sInput = event.target.value.trim();
  if (sInput.length > 0) {
    let searchPopup = (document.getElementsByClassName("mini-search")[0].style.display = "block");
    clearTimeout(timer2);
    let limit = parseInt(
      document.getElementById("limiter").getAttribute("limit")
    );
    let limit_scope = document.getElementById("limiter").getAttribute("scope");
    timer2 = setTimeout(function () {
      let isDone = setPredictiveSearch(event.target.value, limit, limit_scope);
      let runner = setInterval(function () {  
        if (isDone) {
          let overlay = document.getElementsByClassName("overlay-custome")[0];
          overlay.innerHTML = "";
          let mini =
            document.getElementsByClassName("mini-search")[0].innerHTML;
          let mini_insert = document.createElement("div");
          mini_insert.innerHTML = mini;
          overlay.appendChild(mini_insert);
          clearInterval(runner);
        }
      }, 500);
    }, 700);  
  } else {
    let searchPopup = (document.getElementsByClassName("mini-search")[0].style.display = "none");
  }
});

// =========================== mobile search popup End

function addToCartBtn(btn) {
  let wrap = btn.parentElement.parentElement.parentElement.parentElement;
  let id = wrap.getElementsByClassName('qtyAdjust')[0].getElementsByClassName('item-quantity')[0].getAttribute('id')
  let qty = wrap.getElementsByClassName('qtyAdjust')[0].getElementsByClassName('item-quantity')[0].value
  let form = wrap.getElementsByClassName('shopify-product-form')[0]
  // btn.preventDefault();
  let errDiv = wrap.getElementsByClassName('qty-error-pdp')[0]
  sendItemToCart(id, qty, form, errDiv)
}

// ========================== Add to cart ============================


async function addToCartCall(formData) {
  let id = formData.get("id");
  let cartTitle = document.getElementsByClassName("mini_cart_title")[0];
  let incarts = cartTitle.getAttribute("data-in-cart-vars");
  let shippingChargeOn = toggle_cart.dataset.shippingCharge;
  let chargeSet = toggle_cart.dataset.autoCharge == 'true' && (toggle_cart.dataset.shippingChargePro.length > 1)
  document.getElementById("mini_cart_main").innerHTML = `<div class="spin-wrapper spinner demo3"></div>`
  formData.append('sections', 'cart-drawer,header,main-cart');
  toggle_cart.classList.add('active');
  let response = await fetch(window.Shopify.routes.root + "cart/add.js", {
    method: "POST",
    body: formData,
  });
  if (response.ok) {
    // console.log("charge set: ",chargeSet);    
    if (shippingChargeOn) {
      if (chargeSet) {
        let incartsVar = incarts.split(",");
        if (incarts != null && incartsVar.includes(shippingChargeVarId)) {
          // console.log("Already", incartsVar);
        } else {
          console.log("Performing");
          let manual = localStorage.getItem("sChargeManual");
          if (manual == null || manual == "true") {
            let myData = {
              id: shippingChargeVarId,
              quantity: 1,
            };
            let fd = new FormData();
            for (let key in myData) {
              fd.append(key, myData[key]);
            }
            fd.append('sections', 'cart-drawer,header,main-cart');
            let res2 = await fetch(window.Shopify.routes.root + "cart/add.js", {
              method: "POST",
              body: fd,
            });
            updateCartDrawer();
          }
        }
      }
    }
  }
  return await response.json();
}


async function sendItemToCart(var_id, quantity, formElement, errDiv) {
  event.preventDefault();
  if (formElement.reportValidity()) {
    let formDataAdd = new FormData(formElement)
    let data = await addToCartCall(formDataAdd)
    console.log(data);
    cartUpdateOnTheGo(data)
    if (data['message']) {
      errDiv.innerText = data['message'];
      cart_close.click();
    } else {
      // formElement.reset();
    }

  } else {
    for (let element of formElement.elements) {
      if (element.validationMessage) {
        element.style.border = "1px solid red";
        console.log(`${element.name} error: ${element.validationMessage}`);
      }
    }
    toggle_cart.classList.remove("active");
  }
}


async function updateCartStatus(cartJSON) {
  let count = parseInt(cartJSON.item_count)
  if (count == 0) {
    let cartDom = await cartCallHtml();
    let pDoc = new DOMParser().parseFromString(cartDom, "text/html");
    document.getElementById("mini-cart").innerHTML =
      pDoc.getElementById("mini-cart").innerHTML;
  }
  let totalPrice = parseInt(cartJSON.total_price)
  let countElement = document.getElementById('cart-count');
  if (countElement) { if (count > 0) { countElement.innerText = count; countElement.style.display = 'block'; } else { countElement.innerText = count; countElement.style.display = 'none'; } };
  if (document.getElementById('cart-items')) { document.getElementById('cart-items').innerText = count + ' Items' };
  if (document.getElementById('cart-subtotal')) { document.getElementById('cart-subtotal').innerText = Shopify.formatMoney(cartJSON['items_subtotal_price']) };
  if (document.getElementById('total-price')) { document.getElementById('total-price').innerText = Shopify.formatMoney(cartJSON['total_price']) };
  if (document.getElementById('original-total-cart')) { document.getElementById('original-total-cart').innerText = Shopify.formatMoney(cartJSON['original_total_price']) };
  if (document.getElementById("cart-subtotal-dr")) { document.getElementById("cart-subtotal-dr").innerText = Shopify.formatMoney(cartJSON["items_subtotal_price"]) };
}

// == Product Quick View Eye ===================================================

function openProductPopUp(eye) {
  popDiv.innerHTML = `<div class="spin-wrapper spinner demo3"></div>`;
  popper.style.display = "flex";
  popper.classList.remove('hidden');
  popper.classList.add('active');
  let handle = eye.getAttribute("pro-handle");
  fetch("/products/" + handle)
    .then((response) => response.text())
    .then((data) => {
      let doc = new DOMParser().parseFromString(data, "text/html");
      popDiv.innerHTML = doc.getElementsByClassName("product-info-sec")[0].outerHTML;
      popDiv.innerHTML += `<span class="pro-pop-close"> X </span>`;
      manualVariantListeners();
      productMediaSlider();
    });
}


// == Variants code Start =================================================================

function variantPerform(wrap) { 
  setTimeout(function () {
    let secId = wrap.getAttribute('section');
    let options = parseInt(wrap.getElementsByClassName('option-size')[0].getAttribute('option-size'))
    let handle = wrap.getAttribute('handle')
    let varriantSelected;
    let formData = new FormData(wrap.getElementsByClassName('shopify-product-form')[0]);
    let data = {};
    let atc = wrap.getElementsByClassName('AddToCart')[0]
    let proVarsData = JSON.parse(wrap.getElementsByClassName('var-json')[0].innerText)
    applyVariantCheck(wrap, proVarsData, ".radio_container", '.color_radio')
    formData.forEach((value, key) => {
      data[key] = value;
    });
    let option1Data = proVarsData.filter(function (item) {
      return item.option1 == data[`${secId}-Option1`]
    })
    let option2Data = option1Data.filter(function (item) {
      return item.option2 == data[`${secId}-Option2`]
    })
    if (options == 1) {
      varriantSelected = (data[`${secId}-Option1`])
    }
    if (options == 2) {
      varriantSelected = (data[`${secId}-Option1`] + " / " + data[`${secId}-Option2`])
    }
    if (options == 3) {
      varriantSelected = (data[`${secId}-Option1`] + " / " + data[`${secId}-Option2`] + " / " + data[`${secId}-Option3`])
    }
    let selectedVarObj = proVarsData.filter(function (item) {
      return item.title == varriantSelected
    })
    if (selectedVarObj.length == 1) {
      let varQTY = JSON.parse(wrap.getElementsByClassName('variants-json')[0].innerText).filter(function (item) {
        return item.id == selectedVarObj[0]['id']
      })
      wrap.getElementsByClassName('form-var-id')[0].value = selectedVarObj[0]['id']
      // console.log("Variant Qty = ", varQTY[0]['qty'])
      let policy = varQTY[0]['invpolicy']
      if (varQTY[0]['available'] == 'true') {
        if (varQTY[0]['qty'] != '0') {
          wrap.getElementsByClassName('available-qty')[0].innerText = "Available Qty: (" + varQTY[0]['qty'] + ")"
        } else {
          if (atc.dataset.isPreOrder && policy == 'continue' && varQTY[0]['qty'] <= 0) {
            wrap.getElementsByClassName('available-qty')[0].innerText = "Pre Order Available"
          } else {
            wrap.getElementsByClassName('available-qty')[0].innerText = "In Stock"
          }
        }
      } else {
        wrap.getElementsByClassName('available-qty')[0].innerText = "Out Of Stock!"
      }
      wrap.getElementsByClassName('pro-name')[0].innerText = selectedVarObj[0]['name'];
      wrap.getElementsByClassName('variant-price')[0].innerText = (parseInt(selectedVarObj[0]['price']) / 100).toFixed(2);
      wrap.getElementsByClassName('price-div')[0].style.display = 'block';
      let newUrl = `${Shopify.routes.root}products/${handle}?variant=${selectedVarObj[0]['id']}`
      let imgGrouped = wrap.getElementsByClassName('is-images-group')[0].getAttribute('is-images-group');
      if (selectedVarObj[0]['available']) {
        if (atc.dataset.isPreOrder && policy == 'continue' && varQTY[0]['qty'] <= 0) {
          atc.getElementsByTagName('span')[0].innerText = 'Pre Order'
        } else {
          // if (selectedVarObj[0]['selling_plan_allocations'].length > 0) {
          //   atc.getElementsByTagName('span')[0].innerText = 'Subscribe'
          // } else {
          //   atc.getElementsByTagName('span')[0].innerText = 'Add To Cart'
          // }
        }
        atc.disabled = false;
        window.history.replaceState({}, `${selectedVarObj[0]['name']}`, newUrl)
        fetch(`${newUrl}&section=main-product`).then(response => response.text()).then(data => {
          let doc = new DOMParser().parseFromString(data, "text/html");
          try { wrap.getElementsByClassName('sub-custom-con')[0].innerHTML = doc.getElementsByClassName('sub-custom-con')[0].innerHTML } catch { }
          if (imgGrouped == 'true') {
            wrap.getElementsByClassName('prod-img-slider-col')[0].replaceWith(doc.getElementsByClassName('prod-img-slider-col')[0]);
            productMediaSlider();
          }
        })
      } else {
        atc.getElementsByTagName('span')[0].innerText = 'Sold Out'
        atc.disabled = true;
        window.history.replaceState({}, `${selectedVarObj[0]['name']}`, newUrl)
        fetch(`${newUrl}&section=main-product`).then(response => response.text()).then(data => {
          let doc = new DOMParser().parseFromString(data, "text/html");
          if (imgGrouped == 'true') {
            wrap.getElementsByClassName('prod-img-slider-col')[0].replaceWith(doc.getElementsByClassName('prod-img-slider-col')[0]);
            productMediaSlider();
          }
        })

      }
      let imageSrc = 'https:' + selectedVarObj[0]['featured_image']['src'];
      try {
        wrap.getElementsByClassName('prod-slide-row')[0].querySelectorAll('img').forEach(function (i, index) {
          let normalUrl = i.src.replace("_1000x1000", "");
          if (normalUrl == imageSrc) {
            $('.prod-slide-row').slick('slickGoTo', index);
          }
        })
      } catch {
        // console.log('Image Not Available')
      }
    } else {
      //console.log("Got Else here")
      wrap.getElementsByClassName('pro-name')[0].innerText = wrap.dataset.title;
      wrap.getElementsByClassName('price-div')[0].style.display = 'none';
      atc.getElementsByTagName('span')[0].innerText = "Unavailable";
      atc.disabled = true;
    }
  }, 100)
}

function manualVariantListeners() {
  Array.from(document.getElementsByClassName("product-info-wrap")).forEach(
    function (wrap, index) {
      let vardata = JSON.parse(wrap.getElementsByClassName('var-json')[0].innerText)
      applyVariantCheck(wrap, vardata, ".radio_container", ".color_radio")
      Array.from(wrap.getElementsByClassName('var-input-radio')).forEach(function (inp) {
        inp.addEventListener("change", function (e) {
          variantPerform(wrap)
          // console.log(e.target.closest('input'));
          e.target.closest('.radio_container').setAttribute("selected", e.target.closest('input').value);
          e.target.parentElement.querySelectorAll('input').forEach(function (i) {
            i.removeAttribute("checked")
          })
          e.target.closest('input').setAttribute("checked", "checked");
        })
      });
      // for DropDown select
      Array.from(wrap.getElementsByClassName('option_select')).forEach(function (inp) {
        inp.addEventListener("change", function (e) {
          variantPerform(wrap)
        })
      });
    }
  );
}

manualVariantListeners();

function applyVariantCheck(element, Data, opParent, op) {
  let optionParents = element.querySelectorAll(opParent);
  let opSelected = [];
  let dataFiltered = [];
  dataFiltered[0] = Data;
  optionParents.forEach(function (parent, index) {
    opSelected[index] = parent.getAttribute("selected")
    dataFiltered[index + 1] = dataFiltered[index].filter(function (i) {
      return i[`option${index + 1}`] == opSelected[index];
    })
  })
  optionParents.forEach(function (parent, index) {
    parent.querySelectorAll(op).forEach(function (cell) {
      let opGot = cell.dataset.variant;
      // console.log(opGot);
      let opsData = dataFiltered[index].filter(function (v) {
        return v[`option${index + 1}`] == opGot;
      });
      let isAvailable = (opsData.filter(function (av) {
        return av.available == true;
      })).length;
      if (!isAvailable) {
        cell.classList.add("variant-disabled");
      } else {
        cell.classList.remove("variant-disabled");
      }
    });
  })
}

// =====Variants code End ==========================================================================

// =====Filters & Sorting code Start ==========================================================================

function applyFilter(query) {
  let sortBy = document.getElementById('SortBy').value;
  let url = window.location.pathname + query
  setTimeout(function () {
    window.history.replaceState({}, `Filter`, `${window.location.pathname}${query}`)
    fetch(url).then(response => response.text()).then(data => {
      let doc = new DOMParser().parseFromString(data, "text/html")
      console.log(doc)
      if (document.getElementsByClassName("AjaxinateContainer")[0]) { document.getElementsByClassName("AjaxinateContainer")[0].setAttribute('hasmore', 1) }
      document.getElementsByClassName('pro-grid-wrapper')[0].innerHTML = doc.getElementsByClassName('pro-grid-wrapper')[0].innerHTML
      document.getElementsByClassName('product-count__text')[0].innerHTML = doc.getElementsByClassName('product-count__text')[0].innerHTML
      document.getElementsByClassName('active-facets')[0].innerHTML = doc.getElementsByClassName('active-facets')[0].innerHTML
      try {
        document.getElementsByClassName('AjaxinateContainer')[0].innerHTML = doc.getElementsByClassName('AjaxinateContainer')[0].innerHTML
      } catch {
        console.log("Got Catch ajaxi 1")
      }
      try {
        document.getElementsByClassName('AjaxinatePagination')[0].innerHTML = doc.getElementsByClassName('AjaxinatePagination')[0].innerHTML
      } catch {
        console.log("Got Catch ajaxi 2")
      }
      try {
        document.getElementsByClassName('pagination-wrapper')[0].innerHTML = doc.getElementsByClassName('pagination-wrapper')[0].innerHTML
      } catch {
        console.log("Got Catch pagi")
        try {
          document.getElementsByClassName('pagination-wrapper')[0].innerHTML = ""
        } catch { }
      }
    })
  }, 100)
}

// =====Filters & Sorting code End ==========================================================================

function callForUpdate(updates) {
  fetch(window.Shopify.routes.root + 'cart/update.js', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(
      {
        updates: updates,
        sections: "cart-drawer"
      }
    )
  })
    .then(response => response.json())
    .then(data => {
      console.log(data);
      updateCartStatus(data)
      updateFreeShippingBar(data)
      if (data.item_count == 0) {
        replaceCartBody()
      }
      return data;
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}

// function for complementary product
async function addComplementaryProduct() {
  let offerOn = document.querySelector("#cart_bt").getAttribute("offer");
  if (offerOn == "true") {
    let oCollection = document
      .querySelector("#cart_bt")
      .getAttribute("offer-collection");
    let oProduct = document
      .querySelector("#cart_bt")
      .getAttribute("offer-product-id");
    let colString = "";
    let inCartVars = new Set();
    document.querySelectorAll(".mini_cart_item").forEach(function (i) {
      let eachCollection = i.getAttribute("collection");
      colString += eachCollection;
      inCartVars.add(
        i.querySelector(".qtyAdjust input").getAttribute("variant")
      );
    });
    // console.log(inCartVars);
    let uniqueCols = new Set();
    let colArray = colString.split(",");
    colArray.forEach(function (c) {
      uniqueCols.add(c);
    });
    // console.log("Unique Has: ", uniqueCols.has(oCollection))
    if (uniqueCols.has(oCollection)) {
      if (inCartVars.has(oProduct)) {
        // console.log("Already Added");
      } else {
        let myData = {
          id: oProduct,
          quantity: 1,
        };
        let formData = new FormData();
        for (let key in myData) {
          formData.append(key, myData[key]);
        }
        formData.append('sections', 'cart-drawer,header,main-cart')
        const res2 = await addToCartCall(formData);
        let cd = await res2.json();
        updateCartDrawer(cd);
        fetch("/cart.js")
          .then((response2) => response2.json())
          .then((dataCart) => {
            updateCartStatus(dataCart);
          });
      }
    } else {
      if (inCartVars.has(oProduct)) {
        let data = await changeCartItemNew(oProduct, 0, "");
        let parsedData = await data.json()
        cartUpdateOnTheGo(parsedData)

      }
    }
  }
}

// ========================== Custom tillies Working ============================

class MyVarSwatcher extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    let wid = this.closest(".product-widget")
    let data = JSON.parse(wid.querySelector(".card-var-json").innerText)
    applyVariantCheck(wid, data, ".option-parent", ".tilli")
  }
}
customElements.define("my-ops", MyVarSwatcher);


// ================ Shipping Extra

document.body.addEventListener("change", async function (e) {
  // console.log(e.target);
  if (e.target.matches("#shipping-plus")) {
    let inGet = e.target;
    let shippingPlusForm = document.getElementById("shipping-plus-form");
    let check = inGet.checked;
    // console.log(inGet);
    if (check) {
      inGet.setAttribute("checked", "checked");
      localStorage.setItem("sChargeManual", true);
      let myData = {
        id: shippingChargeVarId,
        quantity: 1,
      };
      let formData = new FormData();
      for (let key in myData) {
        formData.append(key, myData[key]);
      }
      let data = await fetch(window.Shopify.routes.root + "cart/add.js", {
        method: "POST",
        body: formData,
      });
      updateCartDrawer();
    } else {
      let data = await cartChangeCall(shippingChargeVarId, 0);
      localStorage.setItem("sChargeManual", false);
      updateCartDrawer();
    }
  }
});

// ========================== Compare Products ==========================
function productAddedToCompare(handle) {
  let x = localStorage.getItem("compares");
  if (x == null) {
    let pros = [];
    pros.push(handle);
    localStorage.setItem("compares", pros);
  } else {
    let y = localStorage.getItem("compares").split(",");
    y.push(handle);
    let newPros = new Set();
    y.forEach(function (s) {
      newPros.add(s);
    });
    newPros = Array.from(newPros);
    if (newPros.length == 4) {
      newPros.shift();
    }
    localStorage.setItem("compares", newPros);
  }
}

document.body.addEventListener('click', function (e) {
  if (e.target.matches('.pro-compare')) {
    let handle = e.target.getAttribute('handle');
    console.log("Handle : ", handle);
    productAddedToCompare(handle)
    createCompareBox();
  } else if (e.target.matches('.open-compare')) {
    if (document.getElementsByClassName('compare-container')[0].checkVisibility()) {
      document.getElementsByClassName('compare-container')[0].style.display = 'none'
      e.target.style.transform = "rotate(0deg)"
    } else {
      document.getElementsByClassName('compare-container')[0].style.display = 'block'
      e.target.style.transform = "rotate(90deg)"
      createCompareBox()
    }
  } else if (e.target.matches('.remove-compare')) {
    let handle = e.target.getAttribute('handle')
    let pros = localStorage.getItem("compares").split(",");
    let i = pros.findIndex(item => item === handle)
    pros.splice(i, 1)
    localStorage.setItem("compares", pros)
    createCompareBox();
  } else if (e.target.matches('.pdp-compare')) {
    let handle = e.target.closest('.prod-content-wrp').getAttribute('handle');
    console.log("Handle : ", handle);
    productAddedToCompare(handle)
    createCompareBox();
  } else if (e.target.matches('.clear-compare')) {
    localStorage.removeItem("compares");
    createCompareBox();
  }
})

function createCompareBox() {
  let box = document.getElementsByClassName('compare-box')[0];
  let compareData = localStorage.getItem("compares")
  if (compareData != null) {
    let pros = compareData.split(",");
    box.innerHTML = ""
    for (let i = 0; i < pros.length; i++) {
      let handle = pros[i];
      console.log(handle);
      let newTile = document.createElement('div');
      box.appendChild(newTile)
      fetch(window.Shopify.routes.root + 'products/' + handle + '.js')
        .then(response => response.json())
        .then(product => {
          console.log(product);
          let price = Shopify.formatMoney(product['price'])
          newTile.classList.add('smally')
          newTile.innerHTML = `
        <img class="smally-img" src="${product['featured_image']}">
        <div class="smally-data">
        <h4>${product['title']}</h4>
        <h5>${price}</h5>
        </div>
        <span style="cursor:pointer;" class="remove-compare" handle="${product['handle']}"> X </span>
        `
        });
    }
  } else {
    box.innerHTML = "<br><br><h5> Add Products To Compare.</h5>"
  }
}
// ========================== Compare End ============================

// ========================== Sunscribe ============================

class MySubscribe extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    let wrap = this.closest('.product-info-wrap')
    let opsDiv = this.getElementsByClassName('purchase-ops')[0]
    let formId = this.closest('.product-info-wrap').getAttribute('section')
    this.addEventListener('change', function (e) {
      if (e.target.matches('.ops-select')) {
        let si = e.target.selectedIndex
        let price = e.target.options[si].dataset.lessPrice
        e.target.closest('.rad-con').querySelector('.subscribe-inp').click();
        e.target.closest('.rad-con').querySelector('.pricer span').innerText = price;
      }
      if (single.checked) {
        wrap.querySelector('.AddToCart span').innerText = "Add To Cart";
        // wrap.querySelector('.ops-select').disabled = true;
      } else {
        wrap.querySelector('.AddToCart span').innerText = "Subscribe";
        // wrap.querySelector('.ops-select').disabled = false;
      }

    })

    this.addEventListener('click', function (e) {
      if (e.target.matches('.ops-select')) {
        // wrap.querySelector('.ops-select').disabled = false;
        this.setButtons(e.target)
        e.target.setAttribute('form', formId)
      }
      else if (e.target.matches('.subscribe-radio')) {
        this.setButtons(e.target)
        if (e.target.closest('.rad-con').querySelector('.ops-select')) {
          e.target.closest('.rad-con').querySelector('.ops-select').setAttribute('form', formId)
        }
      }
    })

  }

  setButtons(target) {
    let wrap = target.closest('.product-info-wrap')
    wrap.querySelectorAll('.subscribe-radio').forEach(function (radio) {
      radio.checked = false;
    })
    wrap.querySelectorAll('.ops-select').forEach(function (ops) {
      ops.removeAttribute('form');
    })
    target.closest('.rad-con').querySelector('.subscribe-radio').checked = true;
    wrap.querySelector('.AddToCart span').innerText = "Subscribe";
  }

}
customElements.define("subscribe-jk", MySubscribe);

// ========================== Wishlist Start ============================
document.getElementById('wish-count').innerText = localStorage.getItem("likedProducts") && JSON.parse(localStorage.getItem("likedProducts")).length > 0 ? JSON.parse(localStorage.getItem("likedProducts")).length : '';

class MyLike extends HTMLElement {
  constructor() {
    super();
    let liked = JSON.parse(localStorage.getItem("likedProducts") || "[]");
    let handle = this.getElementsByClassName('pro-like')[0].getAttribute('handle');
    // console.log("is liked :", handle);
    this.getElementsByTagName('path')[0].setAttribute('fill', liked.includes(handle) ? 'red' : 'black');

  }
  connectedCallback() {
    let pro = this.closest('.product-widget');
    if (this._isBound) return;
    this._isBound = true;

    this.addEventListener('click', (e) => {
      const likeBtn = e.target.closest('.pro-like');
      if (!likeBtn) return;
      const handle = likeBtn.getAttribute('handle');
      let liked = JSON.parse(localStorage.getItem("likedProducts") || "[]");
      const path = likeBtn.querySelector('path');
      if (liked.includes(handle)) {
        path.setAttribute('fill', 'black');
        liked = liked.filter(h => h !== handle);
        if (template == 'page.wishlist') {
          pro.remove();
        }
      } else {
        path.setAttribute('fill', 'red');
        liked.push(handle);
      }
      document.getElementById('wish-count').innerText = liked.length || '';
      localStorage.setItem("likedProducts", JSON.stringify(liked));
      window.dispatchEvent(new Event("wishlist-updated"));
    });

    window.addEventListener("wishlist-updated", () => {
      this.refreshLikeStatus();
    });
    // listner for localStorage Change
    window.addEventListener("storage", (e) => {
      if (e.key === "likedProducts") {
        this.refreshLikeStatus();
        let liked = JSON.parse(localStorage.getItem("likedProducts") || "[]");
        document.getElementById('wish-count').innerText = liked.length || '';

      }
    });
  }
  refreshLikeStatus() {
    let liked = JSON.parse(localStorage.getItem("likedProducts") || "[]");
    const likeBtn = this.querySelector('.pro-like');
    const handle = likeBtn?.getAttribute('handle');
    const path = likeBtn?.querySelector('path');

    if (handle && path) {
      this.getElementsByTagName('path')[0].setAttribute('fill', liked.includes(handle) ? 'red' : 'black');
    }
  }
}
customElements.define("like-button", MyLike);

// ========================== Wishlist End ============================


//================= apply  selling plan  on cart ==========================

localStorage.setItem("checkout-clicked", false);
async function applySellingPlanToCart(planId) {
  try {
    let itemsInput = document.querySelectorAll('#Cart-DrawerForm [name="updates[]"]')
    console.log(itemsInput)
    document.getElementById("mini_cart_main").innerHTML = `<div class="spin-wrapper spinner demo3"></div>`;

    for (let item of itemsInput) {
      console.log("bjfgdsh", item)
      let isDiscounted = item.dataset.discounted === "true";
      let sellingPlan;
      if (planId == null) {
        sellingPlan = null;
      } else {
        sellingPlan = isDiscounted ? planId.split(",")[1] : planId.split(",")[0];
      }

      await fetch('/cart/change.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: item.getAttribute('item-key'),
          quantity: item.value,
          selling_plan: sellingPlan
        })
      }).then(res => res.json());   
    }

    updateCartDrawer();

    let checkoutClicked = localStorage.getItem("checkout-clicked");
    if (checkoutClicked === "true") {
      window.location.href = '/checkout';
    }
  } catch (error) {
    console.error("Error updating cart:", error);
  }
}


document.addEventListener('change', function (e) {
  if (e.target.matches('.sub_select')) {
    let planId = e.target.value;
    console.log("Selected Selling Plan ID:", planId);
    document.getElementById('subscribe-toggle').checked = true;
    localStorage.setItem("subscribe-toggle", true);
    applySellingPlanToCart(planId);
  }
})
// check if subscribe-toggle is true in localStorage

document.body.addEventListener("change", async function (e) {
  if (e.target.matches("#subscribe-toggle")) {
    if (e.target.checked) {
      console.log("On");
      localStorage.setItem("subscribe-toggle", true);
      applySellingPlanToCart("1920172170,1920336010");
    } else {
      console.log("Off");
      localStorage.setItem("subscribe-toggle", false);
      applySellingPlanToCart(null);
    }
  }
})


console.log("CLI 28082025");

 
