const { ObjectId } = require("mongodb");
const cartService = require("./cartService");
const productService = require("../products/productService");
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY)

exports.getCart = async (req, res) => {
  const customer = res.locals?.user;
  if (!customer) {
    //get cart from cookie
    const cart = req.cookies?.cart;
    if (cart) {
      //map productIds list to products list
      const productIds = cart.map((item) => item.productId);
      const products = await productService.getProductsByIds(productIds);
      const cartProducts = cart.map((item) => {
        const product = products.find(
          (product) => product._id == item.productId
        );
        return {
          ...item,
          productId: product,
        };
      });

      //calc total price
      const total = cartProducts.reduce((acc, el) => {
        return acc + el.productId.price * el.quantity;
      }, 0);

      res.render("cart/views/cart.hbs", {
        products: cartProducts,
        total: total.toFixed(2),
        itemsInCart: cartProducts.length,
      });
    } else {
      res.render("cart/views/cart.hbs", {
        products: [],
        total: 0,
        itemsInCart: 0,
      });
    }
  } else {
    const cart = await cartService.getCart(res.locals?.user._id);

    if (!cart) {
      return res.render("cart/views/cart.hbs", {
        products: [],
        total: 0,
        itemsInCart: 0,
      });
    }

    const { products } = cart;
    const itemsInCart = products.length;
    const total = products.reduce((acc, product) => {
      return acc + product.productId.price * product.quantity;
    }, 0);

    res.render("cart/views/cart.hbs", {
      products,
      total: total.toFixed(2),
      itemsInCart,
    });
  }
};

exports.addToCart = async (req, res) => {
  const { productId } = req.body;
  let { quantity } = req.body;
  //cast quantity to number
  quantity = Number(quantity ?? 1);

  if (res.locals?.user) {
    const cart = await cartService.addOrUpdateCart(res.locals.user._id, {
      productId,
      quantity,
    });
    console.log(cart.products.length);
    res.cookie("cartLength", cart.products.length);
  } else {
    //creat cart array if it doesn't exist
    const initCart = [...(req.cookies?.cart || [])];
    const cartLength = req.cookie?.cartLength ?? 0;

    //check if product already exists in cart
    const productExists = initCart.some(
      (product) => product.productId.toString() === productId.toString()
    );
    if (productExists) {
      //update quantity
      const updatedCart = initCart.map((product) => {
        if (product.productId.toString() === productId.toString()) {
          return {
            productId: product.productId,
            quantity: product.quantity + (quantity ?? 1),
          };
        } else {
          return product;
        }
      });
      res.cookie("cart", updatedCart);
      res.cookie("cartLength", updatedCart.length);
    } else {
      //add product to cart
      const updatedCart = [
        ...initCart,
        {
          productId: productId,
          quantity: quantity ?? 1,
        },
      ];
      res.cookie("cart", updatedCart);
      res.cookie("cartLength", updatedCart.length);
    }
  }

  res.redirect("/category");
};

exports.removeFromCart = async (req, res) => {
  const { productId } = req.body;

  if (res.locals?.user) {
    const cart = await cartService.removeFromCart(
      res.locals.user._id,
      productId
    );

    res.cookie("cartLength", cart.products.length);
  } else {
    const cart = req.cookies?.cart.filter(
      (item) => item.productId.toString() !== productId.toString()
    );
    res.cookie("cart", cart);
    res.cookie("cartLength", cart.products.length);
  }
  res.redirect("/cart");
};

exports.checkout = async (req, res) => {
  const customer = res.locals?.user;
  let products = null
  if (!customer) {
    const cart = req.cookies?.cart;
    if (cart) {
      req.flash('error', 'You must login before checkout')
      res.cookie('redirectAfterLogin', '/cart')
      return res.redirect('/login#login')
    }
  } else {
    const cart = await cartService.getCart(res.locals?.user._id);
    if (cart) products = cart.products;
  }

  // exception
  if (products == null) {
    req.flash('error', 'You do not have anything in cart to checkout')
    return res.redirect("/cart");
  }

  // create checkout session
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      payment_intent_data: { metadata: { userId: customer._id } },
      line_items: products.map(entry => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: entry.productId.name,
            images: [entry.productId.image],
            description: entry.productId.description,
            metadata: { id: `${entry.productId._id}` },
          },
          unit_amount: Math.ceil(entry.productId.price * 100)
        },
        quantity: entry.quantity,
      })),
      success_url: `${process.env.DOMAIN_NAME}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.DOMAIN_NAME}/cart`,
      customer_email: customer.email
    })

    res.redirect(session.url)
  } catch (error) {
    console.log(error);
  }
}