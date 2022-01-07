var express = require("express");
var router = express.Router();
const { ObjectId } = require("mongodb");
const authController = require("./authController");
const loggedInUserGuard = require("../../middlewares/loggedInUserGuard");
const cartService = require("../cart/cartService");

router.get("/login", authController.login);

router.post("/login", authController.authentication);

router.get("/logout", authController.logout);
router.post("/register", authController.register);

router.get("/account", loggedInUserGuard, (req, res) => {
  res.render("auth/views/account");
});
router.post("/account", authController.editAccount);
router.post("/account/password", authController.changePassword);

router.get("/activate", authController.activate);
router.post("/resendEmail", authController.resendEmail)

module.exports = router;
