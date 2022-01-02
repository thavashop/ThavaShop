var express = require("express");
var router = express.Router();
const { ObjectId } = require("mongodb");
const authController = require("./authController");
const loggedInUserGuard = require("../../middlewares/loggedInUserGuard");
const cartService = require("../cart/cartService");
const passport = require("../../passport");

router.get("/login", authController.login);

router.post("/login", function (req, res, next) {
  passport.authenticate("local", function (err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.redirect("/login?wrong-password");
    }
    if (user.status != 'activated') {
      const {email} = user;
      res.render('auth/views/activate', {email})
    } else {
      req.logIn(user, async function (err) {
        if (err) {
          return next(err);
        }

        const cartCookie = req.cookies?.cart;
        if (cartCookie) {
          //add cart from cookie to db
          console.log(cartCookie);
          //map productId in cookie cart to productId in db
          const cartInCookie = cartCookie.map((item) => {
            return {
              productId: ObjectId(item.productId),
              quantity: item.quantity,
            };
          });
          const cart = await cartService.addOrUpdateCart(user._id, cartInCookie);
          res.cookie("cartLength", cart?.products?.length ?? 0);
          //delete cookie
          res.clearCookie("cart");
        } else {
          const cart = await cartService.getCart(user._id);
          res.cookie("cartLength", cart?.products?.length ?? 0);
        }

        return res.redirect("/");
      });
    }
  })(req, res, next);
});

router.get("/logout", authController.logout);
router.post("/register", authController.register);

router.get("/account", loggedInUserGuard, (req, res) => {
  res.render("auth/views/account");
});
router.post("/account", authController.editAccount);
router.post("/account/password", authController.changePassword);

router.get("/activate", authController.activate);

module.exports = router;
