//convert cookie data to an array
const cookieData = $.cookie("cart");
const cartLength = $.cookie("cartLength");
let cart;
let total = 0;

//set timeout to debounce the function
let timeout;
if (cookieData) {
  cart = JSON.parse(cookieData.slice(2));
}

const inputNumEl = $(".table-responsive input[type='number']");

//assign cookie cart length to cart length
$("#basket-overview")
  .find("span")
  .text(cartLength ?? 0);

inputNumEl.bind("input", function () {
  const self = this;
  const productId = $(self).attr("data-id");
  const beforeQuantity = this.getAttribute("data-quantity");

  //assign the value of the input to the quantity variable
  $('.table-responsive #${productId}').text(
    "$" + (self["value"] * self.getAttribute("data-price")).toFixed(2)
  );

  $(".table-responsive .totalEach").each(function (index, el) {
    total += Number($(el).text().split("$")[1]);
  });

  $(".table-responsive #total").text("$" + total.toFixed(2));

  //tao muốn chơi game
  total = 0;

  clearTimeout(timeout);
  timeout = setTimeout(function () {
    let afterQuantity = Number($(self).val()) < 0 ? 0 : Number($(self).val());

    if (afterQuantity < beforeQuantity) {
      afterQuantity = (beforeQuantity - afterQuantity) * -1;
    } else {
      afterQuantity = afterQuantity - beforeQuantity;
    }

    updateCart(productId, afterQuantity);
    self.setAttribute(
      "data-quantity",
      Number($(self).val()) < 0 ? 0 : Number($(self).val())
    );
  }, 1000);
});

const updateCart = (productId, quantity) => {
  $.ajax({
    type: "POST",
    url: "/cart",
    data: {
      productId,
      quantity
    },
    success: function (data) {
      console.log("Post cart");
    },
    error: function (xhr, status, err) {
      console.log(err);
    },
  });
};