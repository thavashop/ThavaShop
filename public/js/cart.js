//convert cookie data to an array
const cookieData = $.cookie("cart");
const cartLength = $.cookie("cartLength");
let cart;

//set timeout to debounce the function
let timeout;
if (cookieData) {
  cart = JSON.parse(cookieData.slice(2));
}

const inputQuantity = $(".table-responsive input[type='number']");
const beforeQuantity =
  Number(inputQuantity.val()) < 0 ? 0 : Number(inputQuantity.val());

//assign cookie cart length to cart length
$("#basket-overview")
  .find("span")
  .text(cartLength ?? 0);

inputQuantity.bind("input", function () {
  const self = this;
  const productId = $(self).attr("data-id");

  //assign the value of the input to the quantity variable
  $(`.table-responsive #${productId}`).text(
    "$" + (inputQuantity.val() * inputQuantity.attr("data-price")).toFixed(2)
  );

  clearTimeout(timeout);
  timeout = setTimeout(function () {
    let afterQuantity = Number($(self).val()) < 0 ? 0 : Number($(self).val());

    if (afterQuantity < beforeQuantity) {
      afterQuantity = (beforeQuantity - afterQuantity) * -1;
    } else {
      afterQuantity = afterQuantity - beforeQuantity;
    }

    updateCart(productId, afterQuantity);
  }, 1000);
});

const updateCart = (productId, quantity) => {
  $.ajax({
    type: "POST",
    url: "/cart",
    data: { productId, quantity },
    success: function (data) {},
    error: function (xhr, status, err) {
      console.log(err);
    },
  });
};
