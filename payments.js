function ctrls(parent) {
  var _this = this;

  this.counter = 0;
  this.els = {
    decrement: parent.querySelector(".ctrl__button--decrement"),
    counter: {
      container: parent.querySelector(".ctrl__counter"),
      num: parent.querySelector(".ctrl__counter-num"),
      input: parent.querySelector(".ctrl__counter-input"),
    },
    increment: parent.querySelector(".ctrl__button--increment"),
  };

  this.decrement = function () {
    var counter = _this.getCounter();
    var nextCounter = _this.counter > 0 ? --counter : counter;
    _this.setCounter(nextCounter);
  };

  this.increment = function () {
    var counter = _this.getCounter();
    var nextCounter = counter < 9999999999 ? ++counter : counter;
    _this.setCounter(nextCounter);
  };

  this.getCounter = () => _this.counter;

  this.setCounter = (nextCounter) => {
    _this.counter = nextCounter;
    _this.els.counter.num.dataset.num = nextCounter;
  };

  this.debounce = (callback) => setTimeout(callback, 100);

  this.render = function (hideClassName, visibleClassName) {
    _this.els.counter.num.classList.add(hideClassName);

    setTimeout(function () {
      _this.els.counter.num.innerText = _this.getCounter();
      _this.els.counter.input.value = _this.getCounter();
      _this.els.counter.num.classList.add(visibleClassName);
    }, 100);

    setTimeout(function () {
      _this.els.counter.num.classList.remove(hideClassName);
      _this.els.counter.num.classList.remove(visibleClassName);
    }, 200);
  };

  this.ready = function () {
    _this.els.decrement.addEventListener("click", function () {
      _this.debounce(function () {
        _this.decrement();
        _this.render("is-decrement-hide", "is-decrement-visible");
      });
    });

    _this.els.increment.addEventListener("click", function () {
      _this.debounce(function () {
        _this.increment();
        _this.render("is-increment-hide", "is-increment-visible");
      });
    });

    _this.els.counter.input.addEventListener("input", function (e) {
      var parseValue = parseInt(e.target.value);
      if (!isNaN(parseValue) && parseValue >= 0) {
        _this.setCounter(parseValue);
        _this.render();
      }
    });

    _this.els.counter.input.addEventListener("focus", function (e) {
      _this.els.counter.container.classList.add("is-input");
    });

    _this.els.counter.input.addEventListener("blur", function (e) {
      _this.els.counter.container.classList.remove("is-input");
      _this.render();
    });
  };
}

// init
document.querySelectorAll(".drink.cocktail").forEach((el) => {
  console.log(`setting up spinner for ${el.innerText}`);
  var controls = new ctrls(el);
  document.addEventListener("DOMContentLoaded", controls.ready);
});

// stripe stuff

(function () {
  //   var stripe = Stripe(
  //     "pk_test_51HHzmuGt8noXRi1M0vCnMphSTEXckl6Iv5xhIwwFvnD6l8NWrZBYeHUIBehJJWv2gHKq1g68XpZZrguUjnZFTQIy00cZkSLPBH"
  //   );
  var stripe = Stripe(
    "pk_live_51HHzmuGt8noXRi1MPLP0MThkckQTBCwHe0ndksR88Xf9HSIs63PTdw89k0tCSNIIuOsko8pIvPWmY1RgPh5vyaXt00bmxKNDUU"
  );

  var checkoutButton = document.getElementById("checkout-button");
  checkoutButton.addEventListener("click", function () {
    // When the customer clicks on the button, redirect
    // them to Checkout.
    let cart = [];
    document.querySelectorAll(".drink.cocktail").forEach((el) => {
      const quantity = parseInt(
        el.querySelector(".ctrl__counter-num").dataset.num,
        10
      );
      if (quantity > 0) {
        cart.push({ price: el.dataset.stripeid, quantity: quantity });
      }
    });
    console.log(cart);
    if (cart.length === 0) {
      alert(
        "I'm sure you're very virtuous, by not drinking, but if you " +
          "want us to deliver you cocktails, you'll have to tell us " +
          "what you want"
      );
    } else {
      stripe
        .redirectToCheckout({
          shippingAddressCollection: {
            allowedCountries: ["AU"],
          },
          lineItems: cart,
          mode: "payment",
          // Do not rely on the redirect to the successUrl for fulfilling
          // purchases, customers may not always reach the success_url after
          // a successful payment.
          // Instead use one of the strategies described in
          // https://stripe.com/docs/payments/checkout/fulfillment
          successUrl: "https://mixmaison.club/thanks",
          cancelUrl: "https://mixmaison.club/",
        })
        .then(function (result) {
          if (result.error) {
            // If `redirectToCheckout` fails due to a browser or network
            // error, display the localized error message to your customer.
            var displayError = document.getElementById("error-message");
            displayError.textContent = result.error.message;
          }
        });
    }
  });
})();
