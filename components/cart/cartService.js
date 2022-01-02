const Cart = require("../../models/Cart");
exports.getCart = (customer) => {
  return Cart.findOne({ customer: customer })
    .populate("products.productId")
    .lean();
};

exports.addOrUpdateCart = (customer, basket) => {
  return Cart.findOne({ customer: customer }).then((cart) => {
    if (cart) {
      //if basket is an array
      if (Array.isArray(basket)) {
        //get productId list in basket
        const productIds = basket.map((basketItem) => {
          return basketItem.productId.toString();
        });
        //find product in cart
        const productInCart = cart.products.filter((product) => {
          return productIds.includes(product.productId.toString());
        });
        //update quantity
        productInCart.forEach((product) => {
          const productIndex = cart.products.findIndex(
            (productInCart) =>
              productInCart.productId.toString() ===
              product.productId.toString()
          );
          const { quantity } = basket.find(
            (basketItem) =>
              basketItem.productId.toString() === product.productId.toString()
          );
          //old quantity in cart db
          const oldQuantity = cart.products[productIndex].quantity;
          //new quantity
          const newQuantity = oldQuantity + quantity;
          //update quantity
          cart.products[productIndex].quantity = newQuantity;
        });
        // //add new product
        basket.forEach((basketItem) => {
          const productIndex = cart.products.findIndex(
            (productInCart) =>
              productInCart.productId.toString() ===
              basketItem.productId.toString()
          );
          if (productIndex === -1) {
            cart.products.push({
              productId: basketItem.productId,
              quantity: basketItem.quantity,
            });
          }
        });
        return cart.save();
      } else {
        const productIndex = cart.products.findIndex(
          (product) =>
            product.productId.toString() === basket.productId.toString()
        );
        const product = cart.products[productIndex];
        const { quantity } = basket;
        if (product) {
          const { quantity: oldQuantity } = product;
          product.quantity = oldQuantity + quantity;
          cart.products[productIndex] = product;
        } else {
          cart.products.push(basket);
        }
        return cart.save();
      }
    } else {
      const cart = new Cart({
        customer,
        products: basket,
      });
      return cart.save();
    }
  });
};

exports.removeFromCart = (customer, productId) => {
  return Cart.findOne({ customer: customer }).then((cart) => {
    if (cart) {
      return Cart.findOneAndUpdate(
        { customer: customer },
        {
          $pull: {
            products: {
              productId: productId,
            },
          },
        },
        { new: true }
      );
    }
  });
};

exports.clear = (customer) => Cart.deleteMany({customer: customer})
